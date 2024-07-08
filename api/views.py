from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, login, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from .models import Company, Department, Employee, Role, BulkUpload, UserProfile, EmployeeHistory
from .serializers import CompanySerializer, DepartmentSerializer, EmployeeSerializer, RoleSerializer, UserSerializer
from .forms import UserRegistrationForm, EmployeeForm, EmployeeHistoryForm
import pandas as pd
import json

User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Handle company_name separately
        company_name = request.data.get('company_name')
        if company_name:
            company, created = Company.objects.get_or_create(name=company_name)
            UserProfile.objects.filter(user=user).update(company=company)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        employees = Employee.objects.filter(name__icontains=query)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all()

    def get_queryset(self):
        company_id = self.kwargs.get('company_id')
        if company_id:
            return Department.objects.filter(company_id=company_id)
        return Department.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        company_id = self.kwargs.get('company_id')
        if company_id and not serializer.validated_data.get('company'):
            company = Company.objects.get(id=company_id)
            serializer.save(company=company)
        else:
            serializer.save()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        company_id = self.kwargs.get('company_id')
        if company_id:
            context['company_id'] = company_id
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['GET'])
    def department_detail(self, request, company_id=None, pk=None):
        department = self.get_object()
        serializer = self.get_serializer(department)
        return Response(serializer.data)
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        employees = self.queryset.filter(name__icontains=query)
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def bulk_upload(self, request):
        if not request.user.is_authenticated or not request.user.is_superuser:
            return Response({'error': 'Only superusers can perform bulk uploads'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        company_id = request.POST.get('company')
        if not file or not company_id:
            return Response({'error': 'File and company ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({'error': 'Invalid company ID'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file.name.endswith('.json'):
                file_content = file.read().decode('utf-8')
                data = json.loads(file_content)
                df = pd.DataFrame(data)
            elif file.name.endswith('.txt'):
                df = pd.read_csv(file, sep=',', header=None, names=[
                    'user', 'employee_id', 'name', 'company', 'department', 'role',
                    'start_date', 'end_date', 'phone_number', 'email', 'position'
                ])
            elif file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith('.xlsx'):
                df = pd.read_excel(file)
            else:
                return Response({'error': 'Unsupported file format'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        user, created = User.objects.get_or_create(
                            email=row['email'],
                            defaults={
                                'username': row['email'],
                                'first_name': row.get('first_name', ''),
                                'last_name': row.get('last_name', '')
                            }
                        )

                        department, _ = Department.objects.get_or_create(
                            name=row['department'],
                            company=company
                        )

                        employee, created = Employee.objects.update_or_create(
                            user=user,
                            company=company,
                            _employee_id=row['employee_id'],
                            defaults={
                                'name': f"{row.get('first_name', '')} {row.get('last_name', '')}".strip(),
                                'department': department.name,
                                'role': row.get('role', ''),
                                'start_date': row.get('start_date'),
                                'end_date': row.get('end_date'),
                                'phone_number': row.get('phone_number'),
                                'email': row.get('email'),
                                'position': row.get('position')
                            }
                        )

                        Role.objects.create(
                            employee=employee,
                            title=row['role'],
                            start_date=row['start_date'],
                            duties=row.get('duties', '')
                        )
                    except Exception as e:
                        return Response({'error': f'Error processing row {index}: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'message': 'Bulk upload completed successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@login_required
def add_employee(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            user = form.cleaned_data.get('user')
            company = request.user.userprofile.company
            employee_id = form.cleaned_data.get('employee_id')
            if Employee.objects.filter(user=user, company=company, _employee_id=employee_id).exists():
                messages.error(request, "An employee with this ID already exists for this user in this company.")
                return render(request, 'add_employee.html', {'form': form})
            employee = form.save(commit=False)
            employee.company = company
            employee.save()
            return redirect('employee_list')
    else:
        form = EmployeeForm()
    return render(request, 'add_employee.html', {'form': form})

@login_required
def employee_list(request):
    employees = Employee.objects.filter(current_company=request.user.userprofile.company)
    return render(request, 'employee_list.html', {'employees': employees})

@login_required
def employee_detail(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id, current_company=request.user.userprofile.company)
    history = EmployeeHistory.objects.filter(employee=employee)
    return render(request, 'employee_detail.html', {'employee': employee, 'history': history})

@login_required
def add_employee_history(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id, current_company=request.user.userprofile.company)
    if request.method == 'POST':
        form = EmployeeHistoryForm(request.POST)
        if form.is_valid():
            history = form.save(commit=False)
            history.employee = employee
            history.save()
            return redirect('employee_detail', employee_id=employee.id)
    else:
        form = EmployeeHistoryForm()
    return render(request, 'add_employee_history.html', {'form': form, 'employee': employee})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_role_history(request, id):
    try:
        employee = Employee.objects.get(id=id)
    except Employee.DoesNotExist:
        raise NotFound('Employee not found')
    
    roles = Role.objects.filter(employee=employee).order_by('-start_date')
    serializer = RoleSerializer(roles, many=True)
    return Response(serializer.data)

class EmployeeHistoryViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]

    def create(self, request, employee_id=None):
        employee = get_object_or_404(Employee, id=employee_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=employee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Company, Department,UserProfile, Employee, Role, BulkUpload
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name', 'company_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', None)
        user = User.objects.create_user(**validated_data)
        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), required=False)

    class Meta:
        model = Department
        fields = ['id', 'name', 'company']
        read_only_fields = ['id']

    def create(self, validated_data):
        company = validated_data.get('company')
        if not company:
            request = self.context.get('request')
            if request:
                company_id = request.parser_context['kwargs'].get('company_id')
                if company_id:
                    company = Company.objects.get(id=company_id)
        
        if not company:
            raise serializers.ValidationError({"company": "This field is required."})
        
        validated_data['company'] = company
        return super().create(validated_data)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class EmployeeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())
    department = serializers.CharField()
    employee_id = serializers.CharField(required=False) 

    class Meta:
        model = Employee
        fields =  ['id', 'user', 'name', 'company', 'department', 'employee_id', 'role', 'start_date','end_date', 'phone_number', 'email', 'position']
        read_only_fields = ['id']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        if not user and 'user' not in validated_data:
            raise serializers.ValidationError("User must be provided or request must be authenticated.")

        validated_data['user'] = user or validated_data.get('user')

        # Handle employee_id
        employee_id = validated_data.pop('employee_id', None)

        # Set default dates if not provided
        if 'start_date' not in validated_data:
            validated_data['start_date'] = timezone.now().date()
        if 'end_date' not in validated_data:
            validated_data['end_date'] = timezone.now().date()

        employee = Employee.objects.create(**validated_data)

        if employee_id:
            employee.employee_id = employee_id
            employee.save()

        return employee

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if isinstance(instance, dict):
            if self.context['request'].user.is_superuser:
                representation['employee_id'] = instance.get('employee_id', '')
        elif self.context['request'].user.is_superuser:
            representation['employee_id'] = instance.employee_id
        return representation

class BulkUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkUpload
        fields = '__all__'
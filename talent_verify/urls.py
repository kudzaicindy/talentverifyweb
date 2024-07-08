# talent_verify/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    CompanyViewSet, DepartmentViewSet, EmployeeViewSet, RoleViewSet,
    register, login_view, employee_list, add_employee, employee_detail, add_employee_history
)
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', (admin.site.urls)),
    path('api/', include('api.urls')),
    path('admin/login/', LoginView.as_view(template_name='admin/login.html'), name='admin_login'),
    path('admin/logout/', LogoutView.as_view(next_page='admin_login'), name='admin_logout'),
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('employees/', employee_list, name='employee_list'),
    path('employees/add/', add_employee, name='add_employee'),
    path('employees/<int:employee_id>/', employee_detail, name='employee_detail'),
    path('employees/<int:employee_id>/add_history/', add_employee_history, name='add_employee_history'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),  # Using Django's built-in LogoutView

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
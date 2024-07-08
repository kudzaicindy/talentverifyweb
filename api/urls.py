from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DepartmentViewSet, EmployeeViewSet, RoleViewSet, EmployeeSearchView, login_view, get_csrf_token, register, add_employee, employee_role_history
from .import views

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')  # Use basename to specify a unique name
router.register(r'departments', DepartmentViewSet ,basename='department')
router.register(r'employees', EmployeeViewSet)
router.register(r'roles', RoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('csrf/', get_csrf_token, name='get_csrf_token'),
    path('register/', views.register, name='register'),
    path('employees/add/', add_employee, name='add_employee'),
    path('employees/<int:employee_id>/roles/', RoleViewSet.as_view({'post': 'create'}), name='employee-role-create'),
    path('companies/<int:company_id>/', include(router.urls)),
    path('companies/<int:company_id>/departments/', DepartmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='department-list-create'),
    path('companies/<int:company_id>/departments/<int:pk>/', DepartmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='department-detail'),
    path('employees/<int:id>/role-history/', employee_role_history, name='employee_role_history'),
    path('employees/bulk_upload/', EmployeeViewSet.as_view({'post': 'bulk_upload'}), name='employee-bulk-upload'),
    path('employees/search/', EmployeeSearchView.as_view(), name='employee_search'),
    path('api/companies/<int:company_id>/departments/', DepartmentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('api/companies/<int:company_id>/departments/<int:pk>/', DepartmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('api/login/', login_view, name='api_login'),
    path('api-auth/', include('rest_framework.urls')),
]

from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'department', 'get_employee_id', 'role', 'start_date', 'end_date', 'phone_number', 'email', 'position')

    def get_employee_id(self, obj):
        try:
            return obj.employee_id
        except Exception as e:
            return f"Error: {str(e)}"
    get_employee_id.short_description = 'Employee ID'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        for employee in queryset:
            try:
                employee.employee_id  # This will trigger the property
            except Exception as e:
                # Log the error or handle it as needed
                pass
        return queryset

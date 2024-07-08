from django import forms
from .models import Employee, EmployeeHistory
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['name', 'company', 'department', 'role', 'start_date','end_date', 'phone_number', 'email', 'position']

from django import forms
from .models import EmployeeHistory

class EmployeeHistoryForm(forms.ModelForm):
    class Meta:
        model = EmployeeHistory
        fields = ['employee_id', 'company', 'department', 'role', 'start_date', 'end_date', 'duties', 'position', 'reason_for_leaving']

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2",)

    def save(self, commit=True):
        user = super(UserRegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user
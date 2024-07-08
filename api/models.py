from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils.crypto import get_random_string
from cryptography.fernet import Fernet,InvalidToken
from django.conf import settings
from django.core.exceptions import ValidationError
import base64
from django.db.models.signals import post_save
from django.dispatch import receiver


def encrypt_data(data):
    f = Fernet(settings.ENCRYPTION_KEY)
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data):
    f = Fernet(settings.ENCRYPTION_KEY)
    return f.decrypt(encrypted_data.encode()).decode()

class EncryptedCharField(models.CharField):
     def from_db_value(self,value,expression,connection):
         if value is None:
             return value
         return decrypt_data(value)
     
     
     def to_python(self,value):
         if value is None:
             return value
         return decrypt_data(value)
     def get_prep_value(self,value):
         if value is None:
             return value
         return encrypt_data(value)
    

class Company(models.Model):
    name = models.CharField(max_length=255)
    registration_date = models.DateField()
    registration_number = models.CharField(max_length=100, null=True)
    address = models.TextField()
    contact_person = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=20)
    email = models.EmailField()
    

    def __str__(self):
        return self.name

class Department(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.company.name} - {self.name}"


class Employee(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employees')
    _employee_id = models.TextField(db_column='employee_id')  # Renamed to _employee_id
    name = models.CharField(max_length=100, default='Unknown')
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['user', 'company', '_employee_id']

    def __str__(self):
        return self.name
    

    @property
    def employee_id(self):
        if not self._employee_id:
            return None
        try:
            f = Fernet(settings.ENCRYPTION_KEY)
            return f.decrypt(self._employee_id.encode('utf-8')).decode('utf-8')
        except (InvalidToken, UnicodeDecodeError, base64.binascii.Error) as e:
            return f"Decryption error: {self._employee_id[:10]}... (truncated)"

    @employee_id.setter
    def employee_id(self, value):
        if value is None:
            self._employee_id = None
        else:
            f = Fernet(settings.ENCRYPTION_KEY)
            self._employee_id = f.encrypt(value.encode('utf-8')).decode('utf-8')
class EmployeeHistory(models.Model):
    employee_id = models.ForeignKey(Employee, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE) 
    role = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    duties = models.TextField()
    position = models.CharField(max_length=100)  # New field
    reason_for_leaving = models.TextField()  



class Role(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='roles')
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    duties = models.TextField()

    def __str__(self):
        return f"{self.employee.user.username} - {self.title}"

class BulkUpload(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/', validators=[FileExtensionValidator(allowed_extensions=['csv', 'xlsx', 'txt'])])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.company.name} - {self.uploaded_at}"

def generate_api_key():
    return get_random_string(length=32)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.ForeignKey('Company', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()

class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=32, default=generate_api_key, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"
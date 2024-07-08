from django.core.management.base import BaseCommand
from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken
from api.models import Employee
import base64

class Command(BaseCommand):
    help = 'Fix corrupted employee_id data'

    def handle(self, *args, **options):
        try:
            f = Fernet(settings.ENCRYPTION_KEY)
            self.stdout.write(self.style.SUCCESS(f"ENCRYPTION_KEY is valid"))
        except (TypeError, ValueError) as e:
            self.stdout.write(self.style.ERROR(f'Invalid ENCRYPTION_KEY in settings: {str(e)}'))
            return

        for employee in Employee.objects.all():
            self.stdout.write(f"Processing Employee {employee.id}")
            if employee._employee_id:
                try:
                    # Try to decrypt
                    decrypted = f.decrypt(employee._employee_id.encode('utf-8')).decode('utf-8')
                    self.stdout.write(self.style.SUCCESS(f"Employee {employee.id}: Successfully decrypted: {decrypted}"))
                except (InvalidToken, UnicodeDecodeError, base64.binascii.Error) as e:
                    # If decryption fails, set a placeholder value
                    placeholder = f"PLACEHOLDER_{employee.id}"
                    employee._employee_id = f.encrypt(placeholder.encode('utf-8')).decode('utf-8')
                    employee.save()
                    self.stdout.write(self.style.WARNING(f"Employee {employee.id}: Set placeholder value. Original value: {employee._employee_id}. Error: {str(e)}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Employee {employee.id}: Unexpected error - {str(e)}"))
            else:
                self.stdout.write(self.style.WARNING(f"Employee {employee.id}: No employee_id set"))

        self.stdout.write(self.style.SUCCESS('Finished processing all employees'))
from django.db import models
from django.contrib.auth.models import AbstractUser

# Перенести в Backend/accounts/models.py
class User(AbstractUser):
    """Временная модель пользователя - будет вынесена в приложение accounts"""
    USER_TYPE_CHOICES = [
        ('applicant', 'Соискатель'),
        ('employer', 'Работодатель'),
        ('admin', 'Администратор'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='applicant')
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)

# Перенести в Backend/vacancies/models.py
class Vacancy(models.Model):
    """Временная модель вакансии - будет вынесена в приложение vacancies"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# Перенести в Backend/companies/models.py
class Company(models.Model):
    """Временная модель компании - будет вынесена в приложение companies"""
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# Остальные модели будут добавляться по мере разработки...
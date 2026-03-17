from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()

# Перенести в Backend/accounts/forms.py
class RegistrationForm(UserCreationForm):
    """Временная форма регистрации - будет вынесена в приложение accounts"""
    email = forms.EmailField(required=True)
    phone = forms.CharField(required=False, max_length=20)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password1', 'password2')
    
    # Добавить валидацию уникальности email
    # Добавить валидацию формата телефона

class LoginForm(forms.Form):
    """Временная форма входа - будет вынесена в приложение accounts"""
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    
    # Добавить очистку данных
    # Добавить remember_me поле

# TODO: Перенести в Backend/vacancies/forms.py
class VacancyForm(forms.Form):
    """Временная форма вакансии - будет вынесена в приложение vacancies"""
    title = forms.CharField(max_length=255)
    description = forms.CharField(widget=forms.Textarea)
    salary_from = forms.IntegerField(required=False)
    salary_to = forms.IntegerField(required=False)
    
    # Добавить поля: город, тип занятости, опыт

# Остальные формы будут добавляться по мере разработки...
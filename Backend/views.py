from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout

# Перенести в Backend/accounts/views.py
def register_view(request):
    """Временная заглушка регистрации - будет вынесена в приложение accounts"""
    # TODO: Реализовать форму регистрации
    # TODO: Добавить валидацию email, пароля
    # TODO: Отправить приветственное email
    return render(request, 'accounts/register.html')

def login_view(request):
    """Временная заглушка входа - будет вынесена в приложение accounts"""
    # TODO: Реализовать форму входа
    # TODO: Добавить JWT токены
    return render(request, 'accounts/login.html')

# Перенести в Backend/vacancies/views.py
def vacancy_list_view(request):
    """Временная заглушка списка вакансий - будет вынесена в приложение vacancies"""
    # TODO: Добавить фильтрацию (город, зарплата, опыт)
    # TODO: Добавить пагинацию
    # TODO: Добавить поиск по ключевым словам
    return render(request, 'vacancies/list.html')

# Остальные представления будут добавляться по мере разработки...
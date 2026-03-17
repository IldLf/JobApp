from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

# Перенести в Backend/accounts/tests.py
class TestAccountRegistration(TestCase):
    """Временные тесты регистрации - будут вынесены в приложение accounts"""
    
    def setUp(self):
        self.client = Client()
    
    def test_registration_page_exists(self):
        """Тест: страница регистрации доступна"""
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)
    
    def test_user_creation(self):
        """Тест: создание пользователя"""
        # Реализовать тест создания пользователя
        # Проверить валидацию email
        # Проверить хеширование пароля
        pass

# Перенести в Backend/vacancies/tests.py
class TestVacancies(TestCase):
    """Временные тесты вакансий - будут вынесены в приложение vacancies"""
    
    def test_vacancy_list_page(self):
        """Тест: страница списка вакансий"""
        # Реализовать тест
        pass
    
    def test_vacancy_response(self):
        """Тест: отклик на вакансию"""
        # Реализовать тест
        # Проверить статусы откликов
        pass

# Остальные тесты по мере разработки...
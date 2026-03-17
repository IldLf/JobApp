"""
Django management command to load initial data from JSON fixture.
Запуск: python manage.py load_initial_data
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
import os

class Command(BaseCommand):
    help = 'Загружает начальные данные из Data/initial_data.json'

    def handle(self, *args, **options):
        # Путь к JSON файлу относительно корня проекта
        fixture_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'Data', 'initial_data.json')
        
        if not os.path.exists(fixture_path):
            self.stderr.write(self.style.ERROR(f'Fixture файл не найден: {Data_path}'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Загрузка данных из {Data_path}...'))
        
        try:
            call_command('loaddata', fixture_path, verbosity=2)
            self.stdout.write(self.style.SUCCESS(' Данные успешно загружены!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f' Ошибка при загрузке: {str(e)}'))
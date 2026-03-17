"""
WSGI config for JobApp project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

# Указываем путь к настройкам. 
# Так как папка называется Backend, модуль будет 'Backend.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

application = get_wsgi_application()
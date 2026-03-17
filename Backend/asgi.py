"""
ASGI config for JobApp project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# Получаем стандартное Django приложение
django_asgi_app = get_asgi_application()

# Здесь в будущем будет подключение роутинга для WebSocket (чата)
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# import chat.routing

application = django_asgi_app

# Пример будущей структуры для чата (сейчас закомментировано, чтобы не было ошибок без установки channels):
# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             chat.routing.websocket_urlpatterns
#         )
#     ),
# })
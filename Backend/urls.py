"""
URL configuration for JobApp project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

# Заглушка для главной страницы, пока нет views
def home_placeholder(request):
    return HttpResponse("""
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1>JobApp Backend is Running!</h1>
        <p>Статус: Заглушка (Dev Mode)</p>
        <p>Перейдите в <a href="/admin/">Админ-панель</a> для управления данными.</p>
        <hr>
        <p>Frontend прототип находится в папке <code>Frontend/pages</code>.</p>
    </div>
    """)

urlpatterns = [
    # Админка Django
    path('admin/', admin.site.urls),
    
    # Главная страница (заглушка)
    path('', home_placeholder, name='home'),
    
    # TODO: Подключить приложения по мере разработки
    # path('api/auth/', include('Backend.accounts.urls')),
    # path('api/vacancies/', include('Backend.vacancies.urls')),
    # path('api/resumes/', include('Backend.resumes.urls')),
    # path('api/companies/', include('Backend.companies.urls')),
    
    # TODO: Подключить API документацию (Swagger/Redoc) в будущем
    # path('api/schema/', SpectacularView.as_view(), name='schema'),
]

# Настройка раздачи медиа-файлов в режиме отладки (логотипы компаний, аватарки)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Если вы будете отдавать статику через Django в dev режиме
    # urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
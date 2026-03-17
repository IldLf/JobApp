"""
Альтернатива: Автоматическая генерация миграций
Вместо ручного написания 0001_initial.py, можно:
# 1. Создать модели в models.py
# 2. Сгенерировать миграции автоматически
python manage.py makemigrations
# 3. Экспортировать данные в JSON
python manage.py dumpdata Backend --indent 2 > fixtures/initial_data.json
# 4. Загрузить данные
python manage.py loaddata fixtures/initial_data.json

"""

"""
Migration 0001: Initial schema for JobApp
Создаёт все таблицы на основе JobAppDatabase.sql
"""

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # ==================== users ====================
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(max_length=255, unique=True)),
                ('first_name', models.CharField(blank=True, max_length=100, null=True)),
                ('last_name', models.CharField(blank=True, max_length=100, null=True)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('user_type', models.CharField(choices=[('applicant', 'Соискатель'), ('employer', 'Работодатель'), ('admin', 'Администратор')], max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'users',
            },
        ),

        # ==================== professions ====================
        migrations.CreateModel(
            name='Profession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'professions',
            },
        ),

        # ==================== applicants ====================
        migrations.CreateModel(
            name='Applicant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('birth_date', models.DateField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('about', models.TextField(blank=True, null=True)),
                ('expected_salary', models.IntegerField(blank=True, null=True)),
                ('experience_years', models.IntegerField(blank=True, null=True)),
                ('education', models.CharField(blank=True, max_length=255, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('profession', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='Backend.profession')),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Backend.user')),
            ],
            options={
                'db_table': 'applicants',
            },
        ),

        # ==================== companies ====================
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('logo_url', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Backend.user')),
            ],
            options={
                'db_table': 'companies',
            },
        ),

        # ==================== resumes ====================
        migrations.CreateModel(
            name='Resume',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('salary', models.IntegerField(blank=True, null=True)),
                ('experience', models.TextField(blank=True, null=True)),
                ('about', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('applicant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Backend.applicant')),
                ('profession', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='Backend.profession')),
            ],
            options={
                'db_table': 'resumes',
            },
        ),

        # ==================== vacancies ====================
        migrations.CreateModel(
            name='Vacancy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('salary_from', models.IntegerField(blank=True, null=True)),
                ('salary_to', models.IntegerField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('employment_type', models.CharField(blank=True, max_length=50, null=True)),
                ('experience_required', models.CharField(blank=True, max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Backend.company')),
                ('profession', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='Backend.profession')),
            ],
            options={
                'db_table': 'vacancies',
            },
        ),

        # ==================== vacancy_responses ====================
        migrations.CreateModel(
            name='VacancyResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cover_letter', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('pending', 'На рассмотрении'), ('viewed', 'Просмотрено'), ('accepted', 'Принято'), ('rejected', 'Отказ')], default='pending', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vacancy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Backend.vacancy')),
                ('applicant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Backend.applicant')),
            ],
            options={
                'db_table': 'vacancy_responses',
                'unique_together': {('vacancy', 'applicant')},
            },
        ),

        # ==================== resume_responses ====================
        migrations.CreateModel(
            name='ResumeResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('pending', 'На рассмотрении'), ('viewed', 'Просмотрено'), ('accepted', 'Принято'), ('rejected', 'Отказ')], default='pending', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('resume', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Backend.resume')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Backend.company')),
            ],
            options={
                'db_table': 'resume_responses',
                'unique_together': {('resume', 'company')},
            },
        ),

        # ==================== Добавление прав доступа ====================
        migrations.AddPermission(
            model_name='user',
            permission=models.Permission(
                codename='can_moderate',
                name='Может модерировать контент',
            ),
        ),
    ]
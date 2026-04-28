#  Документация по тестированию JobApp

##  Структура папки Tests
Tests/
├── AutoTests/ # Автотесты (Jest + Supertest)
│ ├── auth.test.js # Тесты авторизации
│ ├── applicant.test.js # Тесты API соискателя
│ ├── employer.test.js # Тесты API работодателя
│ └── entities.test.js # Тесты сущностей (резюме, отклики)
├── UserTests/ # Пользовательские / ручные тесты (гайд по ручному тестированию)
│ ├── auth_manual.md
│ ├── applicant_manual.md
│ └── employer_manual.md
├── TestsDocumentation.md # Этот файл
└── package.json # Зависимости и скрипты тестов



##  Запуск автотестов

```bash
# Перейти в папку тестов
cd Tests

# Установить зависимости (один раз)
npm install

# Запустить все тесты
npm test

# Запустить с отчётом о покрытии
npm run test:coverage

# Запустить тесты конкретной группы
npm run test:auth
npm run test:applicant
npm run test:employer
npm run test:entities

# После тестов можно заново загрузить dump в базу данных для отмены всех тестовых изменений
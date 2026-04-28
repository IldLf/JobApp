/**
 * @file Тесты для аутентификации: login, register
 * @jest-environment node
 */

const request = require('supertest');
const app = require('../../App_code/server/server');

// Моки для БД (если нужно изолировать тесты)
jest.mock('../../App_code/server/src/config/db', () => ({
  query: jest.fn()
}));

describe('POST /api/auth/login', () => {
  const validCredentials = {
    email: 'ivan.ivanov@email.com',
    password: 'hash123456' 
  };

  test('✅ Успешный вход с валидными данными', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(validCredentials)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', validCredentials.email);
    expect(res.body.user).toHaveProperty('user_type');
  });

  test('❌ Вход с несуществующим email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@email.com', password: 'wrong' })
      .expect(401);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('не найден');
  });

  test('❌ Вход с неверным паролем', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validCredentials.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.error).toContain('пароль');
  });

  test('❌ Вход без email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'hash123456' })
      .expect(400);

    expect(res.body.error).toContain('email');
  });
});

describe('POST /api/auth/register', () => {
  const validApplicant = {
    email: `test${Date.now()}@email.com`,
    password: 'securePass123',
    firstName: 'Тест',
    lastName: 'Тестов',
    phone: '+79990001122',
    userType: 'applicant'
  };

  const validEmployer = {
    email: `company${Date.now()}@email.com`,
    password: 'securePass123',
    firstName: 'ООО',
    lastName: 'Компания',
    phone: '+79990003344',
    userType: 'employer',
    companyName: 'Тестовая компания',
    inn: '7701234567'
  };

  test('✅ Регистрация соискателя', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validApplicant)
      .expect(201);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validApplicant.email);
    expect(res.body.user.user_type).toBe('applicant');
  });

  test('✅ Регистрация работодателя с INN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validEmployer)
      .expect(201);

    expect(res.body.user.user_type).toBe('employer');
    expect(res.body).toHaveProperty('company');
    expect(res.body.company.inn).toBe(validEmployer.inn);
  });

  test('❌ Регистрация с уже занятным email', async () => {
    await request(app).post('/api/auth/register').send(validApplicant);
    
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validApplicant }) // тот же email
      .expect(409);

    expect(res.body.error).toContain('email');
  });

  test('❌ Регистрация без обязательных полей', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@email.com' })
      .expect(400);

    expect(res.body.error).toContain('обязатель');
  });

  test('❌ Неверный тип пользователя', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validApplicant, userType: 'invalid' })
      .expect(400);
  });
});
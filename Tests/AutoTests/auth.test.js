/**
 * @file Тесты для аутентификации: login, register
 * @jest-environment node
 */
require('dotenv').config({ path: '../App_code/server/.env' });

const request = require('supertest');
const app = require('../../App_code/server/server');

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

    expect(res.body.success).toBe(true);
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

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Неверный email или пароль');
  });

  test('❌ Вход с неверным паролем', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validCredentials.email, password: 'wrongpassword' })
        .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Неверный email или пароль');
  });

  test('❌ Вход без email', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'hash123456' })
        .expect(500);
  });
});

describe('POST /api/auth/register', () => {
  const validApplicant = {
    email: `test${Date.now()}@email.com`,
    password: 'securePass123',
    first_name: 'Тест',
    last_name: 'Тестов',
    user_type: 'applicant'
  };

  const validEmployer = {
    email: `company${Date.now()}@email.com`,
    password: 'securePass123',
    first_name: 'ООО',
    last_name: 'Компания',
    user_type: 'employer',
    company: {
      name: 'Тестовая компания',
      inn: '770123456712'
    }
  };

  test('✅ Регистрация соискателя', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send(validApplicant)
        .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validApplicant.email);
    expect(res.body.user.user_type).toBe('applicant');
  });

  test('✅ Регистрация работодателя с INN', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send(validEmployer)
        .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.user.user_type).toBe('employer');
  });

  test('❌ Регистрация с уже занятым email', async () => {
    const email = `duplicate${Date.now()}@email.com`;
    await request(app).post('/api/auth/register').send({ ...validApplicant, email });

    const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validApplicant, email })
        .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('email');
  });

  test('❌ Регистрация без обязательных полей', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@email.com' })
        .expect(500);
  });
});
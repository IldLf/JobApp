/**
 * @file Тесты для API работодателя: профиль, вакансии, отклики
 */

require('dotenv').config({ path: '../App_code/server/.env' });

const request = require('supertest');
const app = require('../../App_code/server/server');

const TEST_EMPLOYER_ID = 11; // hr@yandex.ru

describe('GET /api/employer/profile/:userId', () => {
  test('✅ Получение профиля компании', async () => {
    const res = await request(app)
      .get(`/api/employer/profile/${TEST_EMPLOYER_ID}`)
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('company');
    expect(res.body.company).toHaveProperty('name');
    expect(res.body.company.name).toBe('Яндекс');
  });

  test('❌ Запрос профиля несуществующего работодателя', async () => {
    const res = await request(app)
      .get('/api/employer/profile/99999')
      .expect(404);
  });
});

describe('GET /api/employer/vacancies/:userId', () => {
  test('✅ Список вакансий компании', async () => {
    const res = await request(app)
      .get(`/api/employer/vacancies/${TEST_EMPLOYER_ID}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('company_id', TEST_EMPLOYER_ID);
    }
  });

  test('✅ Фильтрация активных вакансий', async () => {
    const res = await request(app)
      .get(`/api/employer/vacancies/${TEST_EMPLOYER_ID}?active=1`)
      .expect(200);

    res.body.forEach(vac => {
      expect([1, true]).toContain(vac.is_active);
    });
  });
});

describe('GET /api/employer/responses/:userId', () => {
  test('✅ Получение откликов на вакансии компании', async () => {
    const res = await request(app)
      .get(`/api/employer/responses/${TEST_EMPLOYER_ID}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('applicant_name');
      expect(res.body[0]).toHaveProperty('resume_title');
      expect(res.body[0]).toHaveProperty('cover_letter');
      expect(res.body[0]).toHaveProperty('status');
    }
  });

  test('✅ Статусы в допустимом диапазоне', async () => {
    const res = await request(app)
      .get(`/api/employer/responses/${TEST_EMPLOYER_ID}`)
      .expect(200);

    const validStatuses = ['pending', 'viewed', 'accepted', 'rejected'];
    res.body.forEach(item => {
      expect(validStatuses).toContain(item.status);
    });
  });
});
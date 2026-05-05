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

    expect(res.body.success).toBe(true);
    expect(res.body.profile).toHaveProperty('user');
    expect(res.body.profile).toHaveProperty('company');
    expect(res.body.profile.company).toHaveProperty('name');
  });

  test('❌ Запрос профиля несуществующего работодателя', async () => {
    const res = await request(app)
        .get('/api/employer/profile/99999')
        .expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/employer/vacancies/:userId', () => {
  test('✅ Список вакансий компании', async () => {
    const res = await request(app)
        .get(`/api/employer/vacancies/${TEST_EMPLOYER_ID}`)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.vacancies)).toBe(true);
    if (res.body.vacancies.length > 0) {
      expect(res.body.vacancies[0]).toHaveProperty('id');
      expect(res.body.vacancies[0]).toHaveProperty('title');
    }
  });
});

describe('GET /api/employer/responses/:userId', () => {
  test('✅ Получение откликов на вакансии компании', async () => {
    const res = await request(app)
        .get(`/api/employer/responses/${TEST_EMPLOYER_ID}`)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.responses)).toBe(true);
    if (res.body.responses.length > 0) {
      expect(res.body.responses[0]).toHaveProperty('first_name');
      expect(res.body.responses[0]).toHaveProperty('last_name');
      expect(res.body.responses[0]).toHaveProperty('vacancy_title');
      expect(res.body.responses[0]).toHaveProperty('status');
    }
  });

  test('✅ Статистика откликов в ответе', async () => {
    const res = await request(app)
        .get(`/api/employer/responses/${TEST_EMPLOYER_ID}`)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty('total');
    expect(res.body.stats).toHaveProperty('pending');
    expect(res.body.stats).toHaveProperty('accepted');
    expect(res.body.stats).toHaveProperty('rejected');
    expect(res.body.stats).toHaveProperty('viewed');
  });

  test('✅ Статусы в допустимом диапазоне', async () => {
    const res = await request(app)
        .get(`/api/employer/responses/${TEST_EMPLOYER_ID}`)
        .expect(200);

    const validStatuses = ['pending', 'viewed', 'accepted', 'rejected'];
    res.body.responses.forEach(item => {
      expect(validStatuses).toContain(item.status);
    });
  });
});
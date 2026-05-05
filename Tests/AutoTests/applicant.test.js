/**
 * @file Тесты для API соискателя: профиль, резюме, отклики
 */
require('dotenv').config({ path: '../App_code/server/.env' });

const request = require('supertest');
const app = require('../../App_code/server/server');

const TEST_USER_ID = 1; // Иван Иванов из дампа БД

describe('GET /api/applicant/resumes/:userId', () => {
  test('✅ Получение списка резюме существующего пользователя', async () => {
    const res = await request(app)
        .get(`/api/applicant/resumes/${TEST_USER_ID}`)
        .expect(200)
        .expect('Content-Type', /json/);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.resumes)).toBe(true);
    if (res.body.resumes.length > 0) {
      expect(res.body.resumes[0]).toHaveProperty('id');
      expect(res.body.resumes[0]).toHaveProperty('title');
      expect(res.body.resumes[0]).toHaveProperty('profession');
    }
  });

  test('❌ Запрос резюме несуществующего пользователя', async () => {
    const res = await request(app)
        .get('/api/applicant/resumes/99999')
        .expect(200);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('не найден');
  });

  test('✅ Пустой список для пользователя без резюме', async () => {
    const res = await request(app)
        .get('/api/applicant/resumes/25')
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.resumes)).toBe(true);
    expect(res.body.resumes.length).toBe(0);
  });
});

describe('GET /api/applicant/responses/:userId', () => {
  test('✅ Получение истории откликов', async () => {
    const res = await request(app)
        .get(`/api/applicant/responses/${TEST_USER_ID}`)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.responses)).toBe(true);
    if (res.body.responses.length > 0) {
      expect(res.body.responses[0]).toHaveProperty('vacancy_title');
      expect(res.body.responses[0]).toHaveProperty('company_name');
      expect(res.body.responses[0]).toHaveProperty('status');
      expect(['pending', 'viewed', 'accepted', 'rejected']).toContain(res.body.responses[0].status);
    }
  });

  test('✅ Статистика откликов в ответе', async () => {
    const res = await request(app)
        .get(`/api/applicant/responses/${TEST_USER_ID}`)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty('total');
    expect(res.body.stats).toHaveProperty('pending');
    expect(res.body.stats).toHaveProperty('accepted');
    expect(res.body.stats).toHaveProperty('rejected');
    expect(res.body.stats).toHaveProperty('viewed');
  });
});

describe('PUT /api/applicant/profile/:userId', () => {
  const updateData = {
    first_name: 'Иван',
    last_name: 'Иванов',
    phone: '+79991234567',
    birth_date: '1995-05-15',
    city: 'Москва',
    about: 'Обновлённое описание',
    expected_salary: 160000,
    experience_years: 6,
    education: 'МГУ, магистратура',
    profession: 'Python разработчик'
  };

  test('✅ Успешное обновление профиля', async () => {
    const res = await request(app)
        .put(`/api/applicant/profile/${TEST_USER_ID}`)
        .send(updateData)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Профиль успешно обновлен');
  });

  test('❌ Обновление несуществующего пользователя', async () => {
    const res = await request(app)
        .put('/api/applicant/profile/99999')
        .send(updateData)
        .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});
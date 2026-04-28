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

    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('profession_name');
    }
  });

  test('❌ Запрос резюме несуществующего пользователя', async () => {
    const res = await request(app)
      .get('/api/applicant/resumes/99999')
      .expect(404);

    expect(res.body.error).toContain('не найден');
  });

  test('✅ Пустой список для пользователя без резюме', async () => {
    const res = await request(app)
      .get('/api/applicant/resumes/25') // user_id=25 из дампа
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/applicant/responses/:userId', () => {
  test('✅ Получение истории откликов', async () => {
    const res = await request(app)
      .get(`/api/applicant/responses/${TEST_USER_ID}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('vacancy_title');
      expect(res.body[0]).toHaveProperty('company_name');
      expect(res.body[0]).toHaveProperty('status');
      expect(['pending','viewed','accepted','rejected']).toContain(res.body[0].status);
    }
  });

  test('✅ Фильтрация по статусу (если реализовано)', async () => {
    const res = await request(app)
      .get(`/api/applicant/responses/${TEST_USER_ID}?status=accepted`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(item => {
      expect(item.status).toBe('accepted');
    });
  });
});

describe('PUT /api/applicant/profile/:userId', () => {
  const updateData = {
    firstName: 'Иван',
    lastName: 'Иванов',
    phone: '+79991234567',
    birthDate: '1995-05-15',
    city: 'Москва',
    about: 'Обновлённое описание',
    expectedSalary: 160000,
    experienceYears: 6,
    education: 'МГУ, магистратура',
    profession: 'Python разработчик'
  };

  test('✅ Успешное обновление профиля', async () => {
    const res = await request(app)
      .put(`/api/applicant/profile/${TEST_USER_ID}`)
      .send(updateData)
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user.phone).toBe(updateData.phone);
    expect(res.body.applicant).toHaveProperty('city', updateData.city);
    expect(res.body.applicant).toHaveProperty('expected_salary', updateData.expectedSalary);
  });

  test('❌ Обновление несуществующего пользователя', async () => {
    const res = await request(app)
      .put('/api/applicant/profile/99999')
      .send(updateData)
      .expect(404);
  });

  test('❌ Обновление с неверным типом данных', async () => {
    const res = await request(app)
      .put(`/api/applicant/profile/${TEST_USER_ID}`)
      .send({ ...updateData, expectedSalary: 'not-a-number' })
      .expect(400);
  });

  test('✅ Обновление только части полей (частичный update)', async () => {
    const res = await request(app)
      .put(`/api/applicant/profile/${TEST_USER_ID}`)
      .send({ city: 'Санкт-Петербург' })
      .expect(200);

    expect(res.body.applicant.city).toBe('Санкт-Петербург');
  });
});
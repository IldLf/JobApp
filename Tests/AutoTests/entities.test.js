/**
 * @file Тесты для сущностей: создание резюме и откликов
 */

require('dotenv').config({ path: '../App_code/server/.env' });

const request = require('supertest');
const app = require('../../App_code/server/server');

describe('POST /api/resumes', () => {
  const validResume = {
    applicant_id: 1,
    profession_id: 1,
    title: 'Senior Python Dev',
    salary: 200000,
    experience: '5 лет в веб-разработке',
    about: 'Создаю масштабируемые сервисы',
    is_active: 1
  };

  test('✅ Успешное создание резюме', async () => {
    const res = await request(app)
        .post('/api/resumes')
        .send(validResume)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('resume');
    expect(res.body.resume).toHaveProperty('id');
    expect(res.body.resume.title).toBe(validResume.title);
  });

  test('❌ Создание без обязательных полей', async () => {
    const res = await request(app)
        .post('/api/resumes')
        .send({ applicant_id: 1, title: 'Only title' })
        .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/vacancy-responses', () => {
  const validResponse = {
    vacancy_id: 1,
    user_id: 1,
    cover_letter: 'Заинтересован в вакансии, есть релевантный опыт',
    resume_id: 1
  };

  test('✅ Успешный отклик на вакансию', async () => {
    const res = await request(app)
        .post('/api/vacancy-responses')
        .send(validResponse)
        .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('response');
    expect(res.body.response).toHaveProperty('id');
    expect(res.body.response.status).toBe('pending');
  });

  test('❌ Дублирующий отклик', async () => {
    const uniqueResponse = {
      vacancy_id: 2,
      user_id: 1,
      cover_letter: 'Первый отклик'
    };

    await request(app).post('/api/vacancy-responses').send(uniqueResponse);

    const res = await request(app)
        .post('/api/vacancy-responses')
        .send(uniqueResponse)
        .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('уже откликались');
  });

  test('❌ Отклик на несуществующую вакансию', async () => {
    const res = await request(app)
        .post('/api/vacancy-responses')
        .send({ vacancy_id: 99999, user_id: 1 })
        .expect(404);
  });

  test('✅ Отклик без resume_id (опциональное поле)', async () => {
    const res = await request(app)
        .post('/api/vacancy-responses')
        .send({
          vacancy_id: 3,
          user_id: 2,
          cover_letter: 'Без указания конкретного резюме'
        })
        .expect(200);

    expect(res.body.success).toBe(true);
  });
});
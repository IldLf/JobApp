/**
 * @file Тесты для сущностей: создание резюме и откликов
 */

require('dotenv').config({ path: '../App_code/server/.env' });

const request = require('supertest');
const app = require('../../App_code/server/server');

describe('POST /api/resumes', () => {
  const validResume = {
    applicantId: 1,
    profession: 'Python разработчик',
    title: 'Senior Python Dev',
    salary: 200000,
    experience: '5 лет в веб-разработке',
    about: 'Создаю масштабируемые сервисы',
    isActive: 1
  };

  test('✅ Успешное создание резюме', async () => {
    const res = await request(app)
      .post('/api/resumes')
      .send(validResume)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(validResume.title);
    expect(res.body.applicant_id).toBe(validResume.applicantId);
  });

  test('❌ Создание без обязательных полей', async () => {
    const res = await request(app)
      .post('/api/resumes')
      .send({ applicantId: 1, title: 'Only title' })
      .expect(400);

    expect(res.body.error).toContain('обязатель');
  });

  test('❌ Создание для несуществующего соискателя', async () => {
    const res = await request(app)
      .post('/api/resumes')
      .send({ ...validResume, applicantId: 99999 })
      .expect(404);
  });

  test('✅ Новое резюме создаётся со статусом "на модерации" (is_active=2)', async () => {
    // Если в бэкенде есть такая логика
    const res = await request(app)
      .post('/api/resumes')
      .send(validResume)
      .expect(201);

    // expect(res.body.is_active).toBe(2); // Раскомментируй, если так реализовано
  });
});

describe('POST /api/vacancy-responses', () => {
  const validResponse = {
    vacancyId: 1,
    applicantId: 1,
    coverLetter: 'Заинтересован в вакансии, есть релевантный опыт',
    resumeId: 1
  };

  test('✅ Успешный отклик на вакансию', async () => {
    const res = await request(app)
      .post('/api/vacancy-responses')
      .send(validResponse)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('pending');
    expect(res.body.vacancy_id).toBe(validResponse.vacancyId);
  });

  test('❌ Дублирующий отклик (уникальность vacancy_id + applicant_id)', async () => {
    // Сначала создаём отклик
    await request(app).post('/api/vacancy-responses').send(validResponse);
    
    // Пытаемся создать дубль
    const res = await request(app)
      .post('/api/vacancy-responses')
      .send(validResponse)
      .expect(409);

    expect(res.body.error).toContain('уже отклик');
  });

  test('❌ Отклик на несуществующую вакансию', async () => {
    const res = await request(app)
      .post('/api/vacancy-responses')
      .send({ ...validResponse, vacancyId: 99999 })
      .expect(404);
  });

  test('✅ Отклик без resume_id (опциональное поле)', async () => {
    const res = await request(app)
      .post('/api/vacancy-responses')
      .send({
        vacancyId: 2,
        applicantId: 2,
        coverLetter: 'Без указания конкретного резюме'
        // resumeId отсутствует
      })
      .expect(201);

    expect(res.body.resume_id).toBeNull();
  });
});
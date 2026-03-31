const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Op } = require('sequelize');

dotenv.config();

const { sequelize, testConnection } = require('./src/config/database');
const User = require('./src/models/User')(sequelize);
const Profession = require('./src/models/Profession')(sequelize);
const Company = require('./src/models/Company')(sequelize);
const Applicant = require('./src/models/Applicant')(sequelize);
const Vacancy = require('./src/models/Vacancy')(sequelize);
const Resume = require('./src/models/Resume')(sequelize);
const VacancyResponse = require('./src/models/VacancyResponse')(sequelize);
const ResumeResponse = require('./src/models/ResumeResponse')(sequelize);

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ==================== НАСТРОЙКА СВЯЗЕЙ ====================

// User -> Applicant (один к одному)
User.hasOne(Applicant, { foreignKey: 'user_id' });
Applicant.belongsTo(User, { foreignKey: 'user_id' });

// User -> Company (один к одному)
User.hasOne(Company, { foreignKey: 'user_id' });
Company.belongsTo(User, { foreignKey: 'user_id' });

// Applicant -> Resume (один ко многим)
Applicant.hasMany(Resume, { foreignKey: 'applicant_id' });
Resume.belongsTo(Applicant, { foreignKey: 'applicant_id' });

// Company -> Vacancy (один ко многим)
Company.hasMany(Vacancy, { foreignKey: 'company_id' });
Vacancy.belongsTo(Company, { foreignKey: 'company_id' });

// Profession связи
Vacancy.belongsTo(Profession, { foreignKey: 'profession_id' });
Resume.belongsTo(Profession, { foreignKey: 'profession_id' });

// VacancyResponse связи
Vacancy.hasMany(VacancyResponse, { foreignKey: 'vacancy_id' });
VacancyResponse.belongsTo(Vacancy, { foreignKey: 'vacancy_id' });
Applicant.hasMany(VacancyResponse, { foreignKey: 'applicant_id' });
VacancyResponse.belongsTo(Applicant, { foreignKey: 'applicant_id' });

// ResumeResponse связи
Resume.hasMany(ResumeResponse, { foreignKey: 'resume_id' });
ResumeResponse.belongsTo(Resume, { foreignKey: 'resume_id' });
Company.hasMany(ResumeResponse, { foreignKey: 'company_id' });
ResumeResponse.belongsTo(Company, { foreignKey: 'company_id' });

// ==================== ЭНДПОИНТЫ ====================

// данные о пользователях
app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json({success: true, users});
});

// полные данные о пользователе для отображения в личном кабинете
app.get('/api/applicant/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.phone,
                u.created_at,
                a.id as applicant_id,                
                a.city,
                a.experience_years,
                a.about,
                a.expected_salary,
                a.education,
                a.birth_date,
                p.name as profession
            FROM users u
            LEFT JOIN applicants a ON u.id = a.user_id
            LEFT JOIN professions p ON p.id = a.profession_id
            WHERE u.id = ? AND u.user_type = 'applicant'
        `;
        
        const [results] = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });
        
        if (!results) {
            return res.status(404).json({
                success: false,
                error: 'Профиль не найден'
            });
        }

        const profile = {
            user: {
                id: results.id,
                email: results.email,
                first_name: results.first_name,
                last_name: results.last_name,
                phone: results.phone,
                created_at: results.created_at
            },
            applicant: {
                id: results.applicant_id,
                profession: results.profession,
                city: results.city,
                experience_years: results.experience_years,
                about: results.about,
                expected_salary: results.expected_salary,
                education: results.education,
                birth_date: results.birth_date
            }
        };
        
        res.json({
            success: true,
            profile
        });
        
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// данные о резюме пользователя
app.get('/api/applicant/resumes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const query = `
            SELECT 
                r.id,
                r.title,
                r.salary,
                r.experience,
                r.created_at,
                p.name as profession
            FROM resumes r
            JOIN applicants a ON r.applicant_id = a.id
            LEFT JOIN professions p ON r.profession_id = p.id
            WHERE a.user_id = ?
            ORDER BY r.created_at DESC
        `;
        
        const resumes = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });
        
        res.json({
            success: true,
            resumes: resumes || []
        });
        
    } catch (error) {
        console.error('Ошибка получения резюме:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// данные об откликах
app.get('/api/applicant/responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const query = `
            SELECT 
                vr.id as response_id,
                vr.status,
                vr.created_at as response_date,
                vr.cover_letter,
                v.id as vacancy_id,
                v.title as vacancy_title,
                v.salary_from,
                v.salary_to,
                v.city as vacancy_city,
                c.id as company_id,
                c.name as company_name,
                c.city as company_city,
                p.name as profession_name
            FROM vacancy_responses vr
            JOIN vacancies v ON vr.vacancy_id = v.id
            JOIN companies c ON v.company_id = c.id
            LEFT JOIN professions p ON v.profession_id = p.id
            WHERE vr.applicant_id = (
                SELECT id FROM applicants WHERE user_id = ?
            )
            ORDER BY vr.created_at DESC
        `;
        
        const results = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });
        

        const stats = {
            total: results.length,
            pending: results.filter(r => r.status === 'pending').length,
            accepted: results.filter(r => r.status === 'accepted').length,
            rejected: results.filter(r => r.status === 'rejected').length,
            viewed: results.filter(r => r.status === 'viewed').length
        };
        
        res.json({
            success: true,
            stats,
            responses: results
        });
        
    } catch (error) {
        console.error('Ошибка получения откликов:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// приглашения
app.get('/api/applicant/resume_responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const query = `
            SELECT rr.id, u.id as user_id, r.id AS resume_id, c.name, rr.message, rr.status, rr.created_at
            FROM resumes r 
            JOIN resume_responses rr ON r.id = rr.resume_id
            JOIN companies c ON c.id = rr.company_id
            JOIN applicants a ON r.applicant_id = a.id
            JOIN users u ON u.id = a.id
            WHERE u.id = ? AND u.user_type = 'applicant';
        `;
        
        const resume_responses = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });
        
        res.json({
            success: true,
            resume_responses: resume_responses || []
        });
        
    } catch (error) {
        console.error('Ошибка получения резюме:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// статистика
app.get('/api/dashboard/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Определяем тип пользователя
        const [user] = await sequelize.query(
            'SELECT user_type FROM users WHERE id = ?',
            { replacements: [userId], type: sequelize.QueryTypes.SELECT }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }
        
        let stats = {};
        
        if (user.user_type === 'applicant') {
            // Статистика для соискателя
            const [applicantStats] = await sequelize.query(`
                SELECT 
                    (SELECT COUNT(*) FROM resumes r 
                     JOIN applicants a ON r.applicant_id = a.id 
                     WHERE a.user_id = ?) as total_resumes,
                    (SELECT COUNT(*) FROM vacancy_responses vr 
                     JOIN applicants a ON vr.applicant_id = a.id 
                     WHERE a.user_id = ?) as total_responses,
                    (SELECT COUNT(*) FROM vacancy_responses vr 
                     JOIN applicants a ON vr.applicant_id = a.id 
                     WHERE a.user_id = ? AND vr.status = 'accepted') as accepted_responses,
                    (SELECT COALESCE(SUM(0), 0) FROM resumes r 
                     JOIN applicants a ON r.applicant_id = a.id 
                     LEFT JOIN vacancies v ON 1=1
                     WHERE a.user_id = ?) as profile_views
            `, {
                replacements: [userId, userId, userId, userId],
                type: sequelize.QueryTypes.SELECT
            });
            
            stats = applicantStats[0];
            
        } else {
            // Статистика для работодателя
            const [employerStats] = await sequelize.query(`
                SELECT 
                    (SELECT COUNT(*) FROM vacancies v 
                     JOIN companies c ON v.company_id = c.id 
                     WHERE c.user_id = ?) as total_vacancies,
                    (SELECT COUNT(*) FROM vacancy_responses vr 
                     JOIN vacancies v ON vr.vacancy_id = v.id 
                     JOIN companies c ON v.company_id = c.id 
                     WHERE c.user_id = ?) as total_responses,
                    (SELECT COUNT(*) FROM vacancy_responses vr 
                     JOIN vacancies v ON vr.vacancy_id = v.id 
                     JOIN companies c ON v.company_id = c.id 
                     WHERE c.user_id = ? AND vr.status = 'pending') as pending_responses,
                    (SELECT COALESCE(SUM(v.views), 0) FROM vacancies v 
                     JOIN companies c ON v.company_id = c.id 
                     WHERE c.user_id = ?) as total_views
            `, {
                replacements: [userId, userId, userId, userId],
                type: sequelize.QueryTypes.SELECT
            });
            
            stats = employerStats[0];
        }
        
        res.json({
            success: true,
            user_type: user.user_type,
            stats
        });
        
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// проверка работы backend
app.get('/api/health', async (req, res) => {
    await sequelize.authenticate();
    res.json({ status: 'OK' });
});

// для входа
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({
            where: { email: email },
            attributes: ['id', 'email', 'first_name', 'last_name', 'password_hash', 'user_type']
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Неверный email или пароль'
            });
        }
        
        if (password !== user.password_hash) {
            return res.status(401).json({
                success: false,
                error: 'Неверный email или пароль'
            });
        }
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                user_type: user.user_type,
                full_name: `${user.first_name} ${user.last_name}`.trim()
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера'
        });
    }
});

// регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, first_name, last_name, user_type } = req.body;   
        
        const existingUser = await User.findOne({
            where: { email: email }
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Пользователь с таким email уже существует'
            });
        }
        
        const newUser = await User.create({
            email: email,
            password_hash: password,
            first_name: first_name || null,
            last_name: last_name || null,
            user_type: user_type || 'applicant'
        });
        
        
        res.status(201).json({
            success: true,
            message: 'Регистрация прошла успешно',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                user_type: newUser.user_type,
                full_name: `${newUser.first_name} ${newUser.last_name}`.trim()
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при регистрации'
        });
    }
});

// Получение списка профессий для фильтров
app.get('/api/professions', async (req, res) => {
    try {
        const professions = await Profession.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.json({ success: true, professions });
    } catch (error) {
        console.error('Ошибка получения профессий:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Получение списка городов для фильтров (уникальные из вакансий и резюме)
// Получение городов для вакансий
app.get('/api/vacancy-cities', async (req, res) => {
    try {
        const cities = await Vacancy.findAll({
            attributes: ['city'],
            where: {
                is_active: true,
                city: { [Op.ne]: null }
            },
            group: ['city']
        });

        const cityList = cities
            .map(c => c.city)
            .filter(city => city && city !== '')
            .sort();

        res.json({ success: true, cities: cityList });
    } catch (error) {
        console.error('Ошибка получения городов для вакансий:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Эндпоинт для городов резюме больше не нужен, так как у резюме нет города
app.get('/api/resume-cities', async (req, res) => {
    // У резюме нет города, возвращаем пустой массив
    res.json({ success: true, cities: [] });
});

// Получение вакансий с фильтрацией и пагинацией
app.get('/api/vacancies', async (req, res) => {
    try {
        const {
            profession_id,
            city,
            experience,
            salary_from,
            salary_to,
            employment_type,
            page = 1,
            limit = 5
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = { is_active: true };
        const includeClause = [
            { model: Company, attributes: ['id', 'name', 'city', 'logo_url'] },
            { model: Profession, attributes: ['id', 'name'] }
        ];

        // Фильтр по профессии
        if (profession_id && profession_id !== 'all' && profession_id !== '') {
            whereClause.profession_id = parseInt(profession_id);
        }

        // Фильтр по городу
        if (city && city !== 'all' && city !== '') {
            whereClause.city = city;
        }

        // Фильтр по опыту
        if (experience && experience !== 'all' && experience !== '') {
            whereClause.experience_required = experience;
        }

        // Фильтр по типу занятости
        if (employment_type && employment_type !== 'all' && employment_type !== '') {
            whereClause.employment_type = employment_type;
        }

        // Фильтр по зарплате
        if (salary_from && salary_from !== '' && parseInt(salary_from) > 0) {
            whereClause.salary_to = { [Op.gte]: parseInt(salary_from) };
        }

        if (salary_to && salary_to !== '' && parseInt(salary_to) > 0) {
            whereClause.salary_from = { [Op.lte]: parseInt(salary_to) };
        }

        // Получаем общее количество
        const total = await Vacancy.count({ where: whereClause });

        // Получаем вакансии с пагинацией
        const vacancies = await Vacancy.findAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            vacancies,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Ошибка получения вакансий:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Получение одной вакансии по ID
app.get('/api/vacancies/:id', async (req, res) => {
  try {
    const vacancyId = req.params.id;
    
    const vacancy = await Vacancy.findOne({
      where: { 
        id: vacancyId,
        is_active: true 
      },
      include: [
        { 
          model: Company, 
          attributes: ['id', 'name', 'city', 'logo_url'] 
        },
        { 
          model: Profession, 
          attributes: ['id', 'name'] 
        }
      ]
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: 'Вакансия не найдена'
      });
    }

    // Можно будет сделать счётчик просмотров вакансии, но для этого надо обновлять бд
    // await vacancy.increment('views');

    res.json({
      success: true,
      vacancy
    });
    
  } catch (error) {
    console.error('Ошибка получения вакансии:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получение резюме с фильтрацией и пагинацией
app.get('/api/resumes', async (req, res) => {
    try {
        const {
            profession_id,
            experience,
            salary_from,
            salary_to,
            page = 1,
            limit = 5
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = { is_active: true };
        const includeClause = [
            {
                model: Applicant,
                where: { is_active: true },
                include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }]
            },
            { model: Profession, attributes: ['id', 'name'] }
        ];

        // Фильтр по профессии
        if (profession_id && profession_id !== 'all' && profession_id !== '') {
            whereClause.profession_id = parseInt(profession_id);
        }

        // Фильтр по опыту
        if (experience && experience !== 'all' && experience !== '') {
            whereClause.experience = { [Op.like]: `%${experience}%` };
        }

        // Фильтр по зарплате
        if (salary_from && salary_from !== '' && parseInt(salary_from) > 0) {
            whereClause.salary = { [Op.gte]: parseInt(salary_from) };
        }

        if (salary_to && salary_to !== '' && parseInt(salary_to) > 0) {
            if (whereClause.salary) {
                whereClause.salary = { ...whereClause.salary, [Op.lte]: parseInt(salary_to) };
            } else {
                whereClause.salary = { [Op.lte]: parseInt(salary_to) };
            }
        }

        // Получаем общее количество
        const total = await Resume.count({ where: whereClause });

        // Получаем резюме с пагинацией
        const resumes = await Resume.findAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // Форматируем данные для отправки
        const formattedResumes = resumes.map(resume => ({
            id: resume.id,
            title: resume.title,
            salary: resume.salary,
            experience: resume.experience,
            about: resume.about,
            is_active: resume.is_active,
            Profession: resume.Profession,
            Applicant: {
                ...resume.Applicant.toJSON(),
                User: resume.Applicant.User
            }
        }));

        res.json({
            success: true,
            resumes: formattedResumes,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Ошибка получения резюме:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Создание отклика на вакансию
app.post('/api/vacancy-responses', async (req, res) => {
    try {
        const { vacancy_id, user_id, cover_letter } = req.body;

        // Находим applicant по user_id
        const applicant = await Applicant.findOne({
            where: { user_id: user_id }
        });

        if (!applicant) {
            return res.status(404).json({
                success: false,
                error: 'Профиль соискателя не найден'
            });
        }

        // Проверяем, не откликался ли уже
        const existing = await VacancyResponse.findOne({
            where: { vacancy_id, applicant_id: applicant.id }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Вы уже откликались на эту вакансию'
            });
        }

        const response = await VacancyResponse.create({
            vacancy_id,
            applicant_id: applicant.id,
            cover_letter,
            status: 'pending'
        });

        res.json({
            success: true,
            message: 'Отклик успешно отправлен',
            response
        });
    } catch (error) {
        console.error('Ошибка создания отклика:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Создание отклика на резюме (для работодателей)
app.post('/api/resume-responses', async (req, res) => {
    try {
        const { resume_id, user_id, message } = req.body;

        // Находим company по user_id
        const company = await Company.findOne({
            where: { user_id: user_id }
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Профиль компании не найден'
            });
        }

        // Проверяем, не отправляли ли уже приглашение
        const existing = await ResumeResponse.findOne({
            where: { resume_id, company_id: company.id }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Вы уже отправляли приглашение этому кандидату'
            });
        }

        const response = await ResumeResponse.create({
            resume_id,
            company_id: company.id,
            message,
            status: 'pending'
        });

        res.json({
            success: true,
            message: 'Приглашение успешно отправлено',
            response
        });
    } catch (error) {
        console.error('Ошибка создания приглашения:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});


// ==================== ЗАПУСК СЕРВЕРА ====================

// проверка
async function startServer() {
    console.log('\nЗапуск\n');
    
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('Невозможно продолжить без подключения к базе данных');
        process.exit(1);
    }
    
    try {
        await sequelize.sync({ alter: false });
        console.log('Модели синхронизированы\n');
    } catch (error) {
        console.warn('Ошибка синхронизации моделей:', error.message);
    }
    
    app.listen(PORT, () => {
        console.log(`Сервер успешно запущен!\n`);
        console.log(`Адрес: http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('Фатальная ошибка:', error);
    process.exit(1);
});
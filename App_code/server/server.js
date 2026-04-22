const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {Op} = require('sequelize');

dotenv.config();

const {sequelize, testConnection} = require('./src/config/database');
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
app.use(express.urlencoded({extended: true}));

// ==================== НАСТРОЙКА СВЯЗЕЙ ====================

// User -> Applicant (один к одному)
User.hasOne(Applicant, {foreignKey: 'user_id'});
Applicant.belongsTo(User, {foreignKey: 'user_id'});

// User -> Company (один к одному)
User.hasOne(Company, {foreignKey: 'user_id'});
Company.belongsTo(User, {foreignKey: 'user_id'});

// Applicant -> Resume (один ко многим)
Applicant.hasMany(Resume, {foreignKey: 'applicant_id'});
Resume.belongsTo(Applicant, {foreignKey: 'applicant_id'});

// Company -> Vacancy (один ко многим)
Company.hasMany(Vacancy, {foreignKey: 'company_id'});
Vacancy.belongsTo(Company, {foreignKey: 'company_id'});

// Profession связи
Vacancy.belongsTo(Profession, {foreignKey: 'profession_id'});
Resume.belongsTo(Profession, {foreignKey: 'profession_id'});

// VacancyResponse связи
Vacancy.hasMany(VacancyResponse, {foreignKey: 'vacancy_id'});
VacancyResponse.belongsTo(Vacancy, {foreignKey: 'vacancy_id'});
Applicant.hasMany(VacancyResponse, {foreignKey: 'applicant_id'});
VacancyResponse.belongsTo(Applicant, {foreignKey: 'applicant_id'});

// ResumeResponse связи
Resume.hasMany(ResumeResponse, {foreignKey: 'resume_id'});
ResumeResponse.belongsTo(Resume, {foreignKey: 'resume_id'});
Company.hasMany(ResumeResponse, {foreignKey: 'company_id'});
ResumeResponse.belongsTo(Company, {foreignKey: 'company_id'});

// Resume -> VacancyResponse (один ко многим)
Resume.hasMany(VacancyResponse, {foreignKey: 'resume_id'});
VacancyResponse.belongsTo(Resume, {foreignKey: 'resume_id'});

// ==================== ЭНДПОИНТЫ ====================

// данные о пользователях
app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json({success: true, users});
});

// Получение резюме пользователя по user_id (для отклика)
app.get('/api/user/resumes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT r.id,
                   r.title,
                   r.is_active
            FROM resumes r
                     JOIN applicants a ON r.applicant_id = a.id
            WHERE a.user_id = ?
              AND r.is_active = 1
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
        console.error('Ошибка получения резюме пользователя:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// полные данные о пользователе для отображения в личном кабинете
app.get('/api/applicant/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT u.id,
                   u.email,
                   u.first_name,
                   u.last_name,
                   u.phone,
                   u.created_at,
                   a.id   as applicant_id,
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
            WHERE u.id = ?
              AND u.user_type = 'applicant'
              AND u.is_active = 1
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

// обновление данных пользователя при нажатии на кнопку Сохранить изменения в личном кабинете
app.put('/api/applicant/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const {
            first_name,
            last_name,
            phone,
            city,
            profession,
            experience_years,
            about,
            expected_salary,
            education,
            birth_date
        } = req.body;

        await User.update(
            {first_name, last_name, phone},
            {where: {id: userId}}
        );

        const applicant = await Applicant.findOne({where: {user_id: userId}});

        if (!applicant) {
            return res.status(404).json({
                success: false,
                error: 'Профиль соискателя не найден'
            });
        }

        let professionId = null;
        if (profession) {
            const professionRecord = await Profession.findOne({
                where: {name: profession}
            });
            if (professionRecord) {
                professionId = professionRecord.id;
            }
        }

        await Applicant.update(
            {
                city,
                profession_id: professionId,
                experience_years,
                about,
                expected_salary,
                education,
                birth_date
            },
            {where: {user_id: userId}}
        );

        res.json({
            success: true,
            message: 'Профиль успешно обновлен'
        });

    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// обновление пароля пользователя при нажатии на кнопку обновить пароль
app.put('/api/user/password/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const {current_password, new_password} = req.body;

        // Находим пользователя
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        // Проверяем текущий пароль
        if (user.password_hash !== current_password) {
            return res.status(401).json({
                success: false,
                error: 'Неверный текущий пароль'
            });
        }

        // Обновляем пароль
        await User.update(
            {password_hash: new_password},
            {where: {id: userId}}
        );

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });

    } catch (error) {
        console.error('Ошибка обновления пароля:', error);
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
            SELECT r.id,
                   r.title,
                   r.salary,
                   r.experience,
                   r.created_at,
                   r.is_active,
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
            SELECT vr.id         as response_id,
                   vr.status,
                   vr.created_at as response_date,
                   vr.cover_letter,
                   v.id          as vacancy_id,
                   v.title       as vacancy_title,
                   v.salary_from,
                   v.salary_to,
                   v.city        as vacancy_city,
                   c.id          as company_id,
                   c.name        as company_name,
                   c.city        as company_city,
                   p.name        as profession_name
            FROM vacancy_responses vr
                     JOIN vacancies v ON vr.vacancy_id = v.id
                     JOIN companies c ON v.company_id = c.id
                     LEFT JOIN professions p ON v.profession_id = p.id
            WHERE vr.applicant_id = (SELECT id
                                     FROM applicants
                                     WHERE user_id = ?)
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

// Получение отправленных приглашений (resume_responses)
app.get('/api/applicant/resume_responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT rr.id,
                   u.id as user_id,
                   r.id AS resume_id,
                   r.title AS resume_title,
                   c.name,
                   rr.message,
                   rr.status,
                   rr.created_at
            FROM resumes r
                     JOIN resume_responses rr ON r.id = rr.resume_id
                     JOIN companies c ON c.id = rr.company_id
                     JOIN applicants a ON r.applicant_id = a.id
                     JOIN users u ON u.id = a.user_id
            WHERE u.id = ?
              AND u.user_type = 'applicant'
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
        console.error('Ошибка получения приглашений:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Обновление статуса приглашения (resume_response)
app.patch('/api/resume-responses/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Проверка допустимого статуса
        if (!['pending', 'viewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Недопустимый статус'
            });
        }

        const existing = await ResumeResponse.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Приглашение не найдено'
            });
        }

        await existing.update({ status });

        res.json({
            success: true,
            message: 'Статус приглашения обновлен',
            resume_response: existing
        });
    } catch (error) {
        console.error('Ошибка обновления статуса приглашения:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// проверка работы backend
app.get('/api/health', async (req, res) => {
    await sequelize.authenticate();
    res.json({status: 'OK'});
});

// для входа
app.post('/api/auth/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({
            where: {email: email, is_active: {[Op.ne]: 0}},
            attributes: ['id', 'email', 'first_name', 'last_name', 'password_hash', 'user_type', 'is_active']
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
                is_active: user.is_active,
                full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
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
        const {email, password, first_name, last_name, user_type, company} = req.body;

        const existingUser = await User.findOne({
            where: {email: email}
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Пользователь с таким email уже существует'
            });
        }

        // Для employer устанавливаем is_active = 2 (ожидает верификации)
        const isActive = user_type === 'employer' ? 2 : 1;

        // Создаем пользователя
        const newUser = await User.create({
            email: email,
            password_hash: password,
            first_name: first_name || null,
            last_name: last_name || null,
            user_type: user_type || 'applicant',
            is_active: isActive
        });

        let profileData = null;

        if (user_type === 'applicant') {
            const newApplicant = await Applicant.create({
                user_id: newUser.id
            });
            profileData = {
                id: newApplicant.id,
                type: 'applicant'
            };
        } else if (user_type === 'employer') {
            if (company && company.inn) {
                const existingInn = await Company.findOne({where: {inn: company.inn}});
                if (existingInn) {
                    await User.destroy({where: {id: newUser.id}});
                    return res.status(400).json({success: false, error: 'Компания с таким ИНН уже зарегистрирована'});
                }
            }
            const newCompany = await Company.create({
                user_id: newUser.id,
                name: company?.name || `${first_name} ${last_name}`,
                description: company?.description || null,
                city: company?.city || null,
                inn: company?.inn || null
            });
            profileData = {
                id: newCompany.id,
                name: newCompany.name,
                type: 'employer'
            };
        }

        res.status(201).json({
            success: true,
            message: user_type === 'employer' ? 'Регистрация прошла успешно. Ожидайте подтверждения администратора.' : 'Регистрация прошла успешно',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                user_type: newUser.user_type,
                is_active: newUser.is_active,
                full_name: `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim() || email.split('@')[0],
                profile: profileData
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
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
        res.json({success: true, professions});
    } catch (error) {
        console.error('Ошибка получения профессий:', error);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});

// Получение городов для вакансий
app.get('/api/vacancy-cities', async (req, res) => {
    try {
        const cities = await Vacancy.findAll({
            attributes: ['city'],
            where: {
                is_active: 1,
                city: {[Op.ne]: null}
            },
            group: ['city']
        });

        const cityList = cities
            .map(c => c.city)
            .filter(city => city && city !== '')
            .sort();

        res.json({success: true, cities: cityList});
    } catch (error) {
        console.error('Ошибка получения городов для вакансий:', error);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});

// Эндпоинт для городов резюме больше не нужен, так как у резюме нет города
app.get('/api/resume-cities', async (req, res) => {
    res.json({success: true, cities: []});
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
            limit = 5,
            search = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {is_active: 1};
        const includeClause = [
            {model: Company, attributes: ['id', 'name', 'city', 'logo_url']},
            {model: Profession, attributes: ['id', 'name']}
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

        // Фильтр по типу занятости - МАППИНГ
        if (employment_type && employment_type !== 'all' && employment_type !== '') {
            const employmentTypeMap = {
                'Полная занятость': 'full-time',
                'Частичная занятость': 'part-time',
                'Проектная работа': 'project',
                'Стажировка': 'train'
            };
            whereClause.employment_type = employmentTypeMap[employment_type] || employment_type;
        }

        // Фильтр по зарплате
        if (salary_from && salary_from !== '' && parseInt(salary_from) > 0) {
            whereClause.salary_to = {[Op.gte]: parseInt(salary_from)};
        }

        if (salary_to && salary_to !== '' && parseInt(salary_to) > 0) {
            whereClause.salary_from = {[Op.lte]: parseInt(salary_to)};
        }

        // Поиск по регулярному выражению (остается без изменений)
        let searchCondition = null;
        if (search && search.trim() !== '') {
            const searchTerms = search.trim().toLowerCase().split(/\s+/);
            const termConditions = searchTerms.map(term => ({
                [Op.or]: [
                    {title: {[Op.like]: `%${term}%`}},
                    {description: {[Op.like]: `%${term}%`}},
                    {experience_required: {[Op.like]: `%${term}%`}},
                    {employment_type: {[Op.like]: `%${term}%`}},
                    {city: {[Op.like]: `%${term}%`}},
                    {'$Company.name$': {[Op.like]: `%${term}%`}},
                    {'$Profession.name$': {[Op.like]: `%${term}%`}}
                ]
            }));
            searchCondition = {[Op.and]: termConditions};
        }

        let finalWhereClause = {...whereClause};
        if (searchCondition) {
            finalWhereClause = {[Op.and]: [whereClause, searchCondition]};
        }

        const total = await Vacancy.count({
            where: finalWhereClause,
            include: includeClause,
            distinct: true
        });

        const vacancies = await Vacancy.findAll({
            where: finalWhereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

        // Преобразуем employment_type обратно для отображения
        const employmentTypeReverseMap = {
            'full-time': 'Полная занятость',
            'part-time': 'Частичная занятость',
            'project': 'Проектная работа',
            'train': 'Стажировка'
        };

        const vacanciesWithDisplayType = vacancies.map(vac => ({
            ...vac.toJSON(),
            employment_type_display: employmentTypeReverseMap[vac.employment_type] || vac.employment_type
        }));

        res.json({
            success: true,
            vacancies: vacanciesWithDisplayType,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Ошибка получения вакансий:', error);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});
// Получение одной вакансии по ID
app.get('/api/vacancies/:id', async (req, res) => {
    try {
        const vacancyId = req.params.id;

        const vacancy = await Vacancy.findOne({
            where: {
                id: vacancyId,
                is_active: 1
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
            limit = 5,
            search = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {is_active: 1};
        const includeClause = [
            {
                model: Applicant,
                include: [{model: User, attributes: ['id', 'first_name', 'last_name', 'email']}]
            },
            {model: Profession, attributes: ['id', 'name']}
        ];

        // Фильтр по профессии
        if (profession_id && profession_id !== 'all' && profession_id !== '') {
            whereClause.profession_id = parseInt(profession_id);
        }

        // Фильтр по опыту
        if (experience && experience !== 'all' && experience !== '') {
            whereClause.experience = {[Op.like]: `%${experience}%`};
        }

        // Фильтр по зарплате
        if (salary_from && salary_from !== '' && parseInt(salary_from) > 0) {
            whereClause.salary = {[Op.gte]: parseInt(salary_from)};
        }

        if (salary_to && salary_to !== '' && parseInt(salary_to) > 0) {
            if (whereClause.salary) {
                whereClause.salary = {...whereClause.salary, [Op.lte]: parseInt(salary_to)};
            } else {
                whereClause.salary = {[Op.lte]: parseInt(salary_to)};
            }
        }

        // Поиск по регулярному выражению
        let searchCondition = null;
        if (search && search.trim() !== '') {
            const searchTerms = search.trim().toLowerCase().split(/\s+/);

            const termConditions = searchTerms.map(term => ({
                [Op.or]: [
                    {title: {[Op.like]: `%${term}%`}},
                    {about: {[Op.like]: `%${term}%`}},
                    {experience: {[Op.like]: `%${term}%`}},
                    {'$Profession.name$': {[Op.like]: `%${term}%`}},
                    {'$Applicant.User.first_name$': {[Op.like]: `%${term}%`}},
                    {'$Applicant.User.last_name$': {[Op.like]: `%${term}%`}}
                ]
            }));

            searchCondition = {[Op.and]: termConditions};
        }

        let finalWhereClause = {...whereClause};
        if (searchCondition) {
            finalWhereClause = {[Op.and]: [whereClause, searchCondition]};
        }

        const total = await Resume.count({
            where: finalWhereClause,
            include: includeClause,
            distinct: true
        });

        const resumes = await Resume.findAll({
            where: finalWhereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

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
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});

// ПОЛУЧЕНИЕ РЕЗЮМЕ ПО ID 
app.get('/api/resumes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Получаем резюме
    const resumeResult = await sequelize.query(
      'SELECT * FROM resumes WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (resumeResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Резюме не найдено'
      });
    }

    const resume = resumeResult[0];

    // 2. Получаем данные пользователя
    let userInfo = null;
    if (resume.applicant_id) {
      const userResult = await sequelize.query(
        'SELECT first_name, last_name, email FROM users WHERE id = ?',
        {
          replacements: [resume.applicant_id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      if (userResult.length > 0) {
        const user = userResult[0];
        userInfo = {
          username: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Не указано',
          email: user.email
        };
      }
    }

    // 3. Получаем профессию
    let professionInfo = null;
    if (resume.profession_id) {
      const profResult = await sequelize.query(
        'SELECT name FROM professions WHERE id = ?',
        {
          replacements: [resume.profession_id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      if (profResult.length > 0) {
        professionInfo = { name: profResult[0].name };
      }
    }

    // 4. Формируем ответ с правильной структурой
    res.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        salary: resume.salary,
        salary_from: resume.salary, 
        salary_to: resume.salary,    
        experience: resume.experience,
        description: resume.about,
        about: resume.about,
        is_active: resume.is_active,
        applicant_id: resume.applicant_id,
        profession_id: resume.profession_id,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
        User: userInfo,
        Profession: professionInfo
      }
    });
  } catch (error) {
    console.error('Ошибка получения резюме:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Создание отклика на вакансию (с выбором резюме)
app.post('/api/vacancy-responses', async (req, res) => {
    try {
        const {vacancy_id, user_id, resume_id, cover_letter} = req.body;

        const applicant = await Applicant.findOne({
            where: {user_id: user_id}
        });

        if (!applicant) {
            return res.status(404).json({
                success: false,
                error: 'Профиль соискателя не найден'
            });
        }

        // Проверяем, не откликался ли уже
        const existing = await VacancyResponse.findOne({
            where: {vacancy_id, applicant_id: applicant.id}
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
            resume_id: resume_id || null,
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
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});

// Обновление статуса отклика на вакансию (vacancy_response)
app.patch('/api/vacancy-responses/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Проверка допустимого статуса
        if (!['pending', 'viewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Недопустимый статус'
            });
        }

        const existing = await VacancyResponse.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Отклик не найден'
            });
        }

        await existing.update({ status });

        res.json({
            success: true,
            message: `Статус отклика изменен на ${status}`,
            vacancy_response: existing
        });
    } catch (error) {
        console.error('Ошибка обновления статуса отклика:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Удаление отклика на вакансию (vacancy_response)
app.delete('/api/vacancy-responses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await VacancyResponse.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Отклик не найден'
            });
        }

        await existing.destroy();

        res.json({
            success: true,
            message: 'Отклик удален'
        });
    } catch (error) {
        console.error('Ошибка удаления отклика:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Создание отклика на резюме (для работодателей)
app.post('/api/resume-responses', async (req, res) => {
    try {
        const {resume_id, user_id, message} = req.body;

        const company = await Company.findOne({
            where: {user_id: user_id}
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Профиль компании не найден'
            });
        }

        const existing = await ResumeResponse.findOne({
            where: {resume_id, company_id: company.id}
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
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
});

// ==================== ДОПОЛНИТЕЛЬНЫЕ ЭНДПОИНТЫ ДЛЯ ПРОФИЛЯ ====================

// Получить applicant по user_id (вспомогательный)
app.get('/api/applicants/by-user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const applicant = await sequelize.query(
            'SELECT id, user_id, city, about, created_at FROM applicants WHERE user_id = ? LIMIT 1',
            {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!applicant || applicant.length === 0) {
            return res.status(404).json({success: false, error: 'Профиль соискателя не найден'});
        }

        res.json({
            success: true,
            applicant: applicant[0]
        });
    } catch (error) {
        console.error('Ошибка получения профиля соискателя:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Создать резюме
app.post('/api/resumes', async (req, res) => {
    try {
        const {applicant_id, profession_id, title, salary, experience, about, is_active} = req.body;

        if (!title) {
            return res.status(400).json({success: false, error: 'Укажите желаемую должность'});
        }

        // При создании резюме is_active = 2 (ожидает верификации)
        const result = await sequelize.query(
            `INSERT INTO resumes (applicant_id, profession_id, title, salary, experience, about, is_active, created_at,
                                  updated_at)
             VALUES (:applicant_id, :profession_id, :title, :salary, :experience, :about, 2, NOW(), NOW())`,
            {
                replacements: {
                    applicant_id,
                    profession_id: profession_id || null,
                    title,
                    salary: salary || null,
                    experience: experience || '',
                    about: about || ''
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        const newId = result[0];

        const newResume = await sequelize.query(
            `SELECT r.*, p.name as profession_name
             FROM resumes r
                      LEFT JOIN professions p ON r.profession_id = p.id
             WHERE r.id = :id`,
            {
                replacements: {id: newId},
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            message: 'Резюме создано и отправлено на модерацию',
            resume: newResume[0]
        });
    } catch (error) {
        console.error('Ошибка создания резюме:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Обновить резюме
app.put('/api/resumes/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {profession_id, title, salary, experience, about} = req.body; // Убрали is_active

        const existing = await sequelize.query(
            'SELECT id FROM resumes WHERE id = ? LIMIT 1',
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existing || existing.length === 0) {
            return res.status(404).json({success: false, error: 'Резюме не найдено'});
        }

        await sequelize.query(
            `UPDATE resumes
             SET profession_id = :profession_id,
                 title         = :title,
                 salary        = :salary,
                 experience    = :experience,
                 about         = :about,
                 updated_at    = NOW()
             WHERE id = :id`,
            {
                replacements: {
                    id,
                    profession_id: profession_id || null,
                    title,
                    salary: salary || null,
                    experience: experience || '',
                    about: about || ''
                },
                type: sequelize.QueryTypes.UPDATE
            }
        );

        const updatedResume = await sequelize.query(
            `SELECT r.*, p.name as profession_name
             FROM resumes r
                      LEFT JOIN professions p ON r.profession_id = p.id
             WHERE r.id = :id`,
            {
                replacements: {id},
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            message: 'Резюме обновлено',
            updatedResume: updatedResume[0]
        });
    } catch (error) {
        console.error('Ошибка обновления резюме:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Обновить статус резюме (активно/неактивно)
app.patch('/api/resumes/:id/status', async (req, res) => {
    try {
        const {id} = req.params;
        const {is_active} = req.body;

        const existing = await sequelize.query(
            'SELECT id FROM resumes WHERE id = ? LIMIT 1',
            {replacements: [id], type: sequelize.QueryTypes.SELECT}
        );

        if (!existing || existing.length === 0) {
            return res.status(404).json({success: false, error: 'Резюме не найдено'});
        }

        await sequelize.query(
            'UPDATE resumes SET is_active = :is_active, updated_at = NOW() WHERE id = :id',
            {
                replacements: {id, is_active: is_active ? 1 : 0},
                type: sequelize.QueryTypes.UPDATE
            }
        );

        const updatedResume = await sequelize.query(
            `SELECT r.*, p.name as profession_name
             FROM resumes r
                      LEFT JOIN professions p ON r.profession_id = p.id
             WHERE r.id = :id`,
            {replacements: {id}, type: sequelize.QueryTypes.SELECT}
        );

        res.json({
            success: true,
            message: `Резюме ${is_active ? 'активировано' : 'деактивировано'}`,
            resume: updatedResume[0]
        });
    } catch (error) {
        console.error('Ошибка обновления статуса резюме:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// ==================== ЭНДПОИНТЫ ДЛЯ РАБОТОДАТЕЛЯ ====================

// Получение профиля компании и пользователя-работодателя
app.get('/api/employer/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT u.id,
                   u.email,
                   u.first_name,
                   u.last_name,
                   u.phone,
                   u.created_at,
                   c.id          as company_id,
                   c.name        as company_name,
                   c.description as company_description,
                   c.city        as company_city,
                   c.logo_url,
                   c.inn
            FROM users u
                     LEFT JOIN companies c ON u.id = c.user_id
            WHERE u.id = ?
              AND u.user_type = 'employer'
              AND u.is_active IN (1, 2, 3)
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
            company: {
                id: results.company_id,
                name: results.company_name,
                description: results.company_description,
                city: results.company_city,
                logo_url: results.logo_url,
                inn: results.inn
            }
        };

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Ошибка получения профиля работодателя:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Обновление профиля работодателя
app.put('/api/employer/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const {
            first_name,
            last_name,
            phone,
            company_name,
            company_description,
            company_city,
            logo_url,
            inn
        } = req.body;

        await User.update(
            {first_name, last_name, phone},
            {where: {id: userId}}
        );

        const company = await Company.findOne({where: {user_id: userId}});

        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Профиль компании не найден'
            });
        }

        await Company.update(
            {
                name: company_name,
                description: company_description,
                city: company_city,
                logo_url: logo_url,
                inn: inn
            },
            {where: {user_id: userId}}
        );

        res.json({
            success: true,
            message: 'Профиль успешно обновлен'
        });

    } catch (error) {
        console.error('Ошибка обновления профиля работодателя:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Получение вакансий компании
app.get('/api/employer/vacancies/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT v.id,
                   v.title,
                   v.description,
                   v.salary_from,
                   v.salary_to,
                   v.city,
                   v.employment_type,
                   v.experience_required,
                   v.is_active,
                   v.created_at,
                   p.name as profession_name
            FROM vacancies v
                     JOIN companies c ON v.company_id = c.id
                     LEFT JOIN professions p ON v.profession_id = p.id
            WHERE c.user_id = ?
            ORDER BY v.created_at DESC
        `;

        const vacancies = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            vacancies: vacancies || []
        });

    } catch (error) {
        console.error('Ошибка получения вакансий:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Получение откликов на вакансии компании
app.get('/api/employer/responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT vr.id         as response_id,
                   vr.resume_id,
                   vr.status,
                   vr.created_at as response_date,
                   vr.cover_letter,
                   v.id          as vacancy_id,
                   v.title       as vacancy_title,
                   v.salary_from,
                   v.salary_to,
                   v.city        as vacancy_city,
                   a.id          as applicant_id,
                   u.first_name,
                   u.last_name,
                   u.email,
                   u.phone,
                   a.expected_salary,
                   a.experience_years,
                   p.name        as profession_name
            FROM vacancy_responses vr
                     JOIN vacancies v ON vr.vacancy_id = v.id
                     JOIN companies c ON v.company_id = c.id
                     JOIN applicants a ON vr.applicant_id = a.id
                     JOIN users u ON a.user_id = u.id
                     LEFT JOIN professions p ON a.profession_id = p.id
            WHERE c.user_id = ?
            ORDER BY vr.created_at DESC
        `;

        const responses = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });

        const stats = {
            total: responses.length,
            pending: responses.filter(r => r.status === 'pending').length,
            accepted: responses.filter(r => r.status === 'accepted').length,
            rejected: responses.filter(r => r.status === 'rejected').length,
            viewed: responses.filter(r => r.status === 'viewed').length
        };

        res.json({
            success: true,
            stats,
            responses
        });

    } catch (error) {
        console.error('Ошибка получения откликов:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Получение отправленных приглашений (resume_responses)
app.get('/api/employer/resume-responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT rr.id,
                   rr.message,
                   rr.status,
                   rr.created_at,
                   r.id     as resume_id,
                   r.title  as resume_title,
                   r.salary as expected_salary,
                   a.id     as applicant_id,
                   u.first_name,
                   u.last_name,
                   u.email,
                   u.phone,
                   p.name   as profession_name
            FROM resume_responses rr
                     JOIN companies c ON rr.company_id = c.id
                     JOIN resumes r ON rr.resume_id = r.id
                     JOIN applicants a ON r.applicant_id = a.id
                     JOIN users u ON a.user_id = u.id
                     LEFT JOIN professions p ON r.profession_id = p.id
            WHERE c.user_id = ?
            ORDER BY rr.created_at DESC
        `;

        const resumeResponses = await sequelize.query(query, {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            resume_responses: resumeResponses || []
        });

    } catch (error) {
        console.error('Ошибка получения отправленных приглашений:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Удаление приглашения (resume_response)
app.delete('/api/resume-responses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await ResumeResponse.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Приглашение не найдено'
            });
        }

        await existing.destroy();

        res.json({
            success: true,
            message: 'Приглашение удалено'
        });
    } catch (error) {
        console.error('Ошибка удаления приглашения:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== ЭНДПОИНТЫ ДЛЯ ВАКАНСИЙ ====================

// Создать вакансию
app.post('/api/vacancies', async (req, res) => {
    try {
        const {
            company_id,
            profession_id,
            title,
            description,
            salary_from,
            salary_to,
            city,
            employment_type,
            experience_required,
            is_active
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Название и описание обязательны'
            });
        }

        // При создании вакансии is_active = 2 (ожидает верификации)
        const result = await sequelize.query(
            `INSERT INTO vacancies (company_id, profession_id, title, description,
                                    salary_from, salary_to, city, employment_type,
                                    experience_required, is_active, created_at, updated_at)
             VALUES (:company_id, :profession_id, :title, :description,
                     :salary_from, :salary_to, :city, :employment_type,
                     :experience_required, 2, NOW(), NOW())`,
            {
                replacements: {
                    company_id,
                    profession_id: profession_id || null,
                    title,
                    description,
                    salary_from: salary_from || null,
                    salary_to: salary_to || null,
                    city: city || null,
                    employment_type: employment_type || null,
                    experience_required: experience_required || null
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        const newId = result[0];

        const newVacancy = await sequelize.query(
            `SELECT v.*,
                    c.name as company_name,
                    p.name as profession_name
             FROM vacancies v
                      LEFT JOIN companies c ON v.company_id = c.id
                      LEFT JOIN professions p ON v.profession_id = p.id
             WHERE v.id = :id`,
            {
                replacements: {id: newId},
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            message: 'Вакансия создана и отправлена на модерацию',
            vacancy: newVacancy[0]
        });
    } catch (error) {
        console.error('Ошибка создания вакансии:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Обновить вакансию
app.put('/api/vacancies/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {
            profession_id,
            title,
            description,
            salary_from,
            salary_to,
            city,
            employment_type,
            experience_required
        } = req.body; // Убрали is_active

        // Проверяем существование
        const existing = await sequelize.query(
            'SELECT id FROM vacancies WHERE id = ? LIMIT 1',
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existing || existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Вакансия не найдена'
            });
        }

        await sequelize.query(
            `UPDATE vacancies
             SET profession_id       = :profession_id,
                 title               = :title,
                 description         = :description,
                 salary_from         = :salary_from,
                 salary_to           = :salary_to,
                 city                = :city,
                 employment_type     = :employment_type,
                 experience_required = :experience_required,
                 updated_at          = NOW()
             WHERE id = :id`,
            {
                replacements: {
                    id,
                    profession_id: profession_id || null,
                    title,
                    description,
                    salary_from: salary_from || null,
                    salary_to: salary_to || null,
                    city: city || null,
                    employment_type: employment_type || null,
                    experience_required: experience_required || null
                },
                type: sequelize.QueryTypes.UPDATE
            }
        );

        // Получаем обновленную вакансию
        const updatedVacancy = await sequelize.query(
            `SELECT v.*,
                    c.name as company_name,
                    p.name as profession_name
             FROM vacancies v
                      LEFT JOIN companies c ON v.company_id = c.id
                      LEFT JOIN professions p ON v.profession_id = p.id
             WHERE v.id = :id`,
            {
                replacements: {id},
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            message: 'Вакансия обновлена',
            updatedVacancy: updatedVacancy[0]
        });
    } catch (error) {
        console.error('Ошибка обновления вакансии:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Обновить статус вакансии (активно/неактивно)
app.patch('/api/vacancies/:id/status', async (req, res) => {
    try {
        const {id} = req.params;
        const {is_active} = req.body;

        const existing = await sequelize.query(
            'SELECT id FROM vacancies WHERE id = ? LIMIT 1',
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existing || existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Вакансия не найдена'
            });
        }

        await sequelize.query(
            'UPDATE vacancies SET is_active = :is_active, updated_at = NOW() WHERE id = :id',
            {
                replacements: {
                    id,
                    is_active: is_active ? 1 : 0
                },
                type: sequelize.QueryTypes.UPDATE
            }
        );

        const updatedVacancy = await sequelize.query(
            `SELECT v.*,
                    c.name as company_name,
                    p.name as profession_name
             FROM vacancies v
                      LEFT JOIN companies c ON v.company_id = c.id
                      LEFT JOIN professions p ON v.profession_id = p.id
             WHERE v.id = :id`,
            {
                replacements: {id},
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            message: `Вакансия ${is_active ? 'активирована' : 'деактивирована'}`,
            vacancy: updatedVacancy[0]
        });
    } catch (error) {
        console.error('Ошибка обновления статуса вакансии:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== АДМИН-ПАНЕЛЬ ====================

// Получение пользователей для админ-панели
// Получение пользователей для админ-панели (с пагинацией)
app.get('/api/admin/users', async (req, res) => {
    try {
        const { search = '', verification_mode = 'false', page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};

        if (verification_mode === 'true') {
            whereClause.is_active = { [Op.in]: [2, 3] };
        } else {
            whereClause.is_active = { [Op.in]: [0, 1] };
        }

        // Поиск по полям
        if (search && search.trim() !== '') {
            const searchTerms = search.trim().toLowerCase().split(/\s+/);
            const searchConditions = searchTerms.map(term => ({
                [Op.or]: [
                    { email: { [Op.like]: `%${term}%` } },
                    { first_name: { [Op.like]: `%${term}%` } },
                    { last_name: { [Op.like]: `%${term}%` } },
                    { phone: { [Op.like]: `%${term}%` } }
                ]
            }));
            whereClause[Op.and] = searchConditions;
        }

        const total = await User.count({ where: whereClause });

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'user_type', 'is_active', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Обновление статуса пользователя (блокировка/разблокировка/верификация)
app.put('/api/admin/users/:userId/status', async (req, res) => {
    try {
        const {userId} = req.params;
        const {is_active} = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({success: false, error: 'Пользователь не найден'});
        }

        await user.update({is_active});

        res.json({success: true, message: 'Статус пользователя обновлен'});
    } catch (error) {
        console.error('Ошибка обновления статуса пользователя:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Получение вакансий для админ-панели
app.get('/api/admin/vacancies', async (req, res) => {
    try {
        const {search = '', verification_mode = 'false', page = 1, limit = 10} = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};

        if (verification_mode === 'true') {
            whereClause.is_active = {[Op.in]: [2, 3]};
        } else {
            whereClause.is_active = {[Op.in]: [0, 1]};
        }

        if (search && search.trim() !== '') {
            const searchTerms = search.trim().toLowerCase().split(/\s+/);
            const searchConditions = searchTerms.map(term => ({
                [Op.or]: [
                    {title: {[Op.like]: `%${term}%`}},
                    {description: {[Op.like]: `%${term}%`}},
                    {city: {[Op.like]: `%${term}%`}},
                    {employment_type: {[Op.like]: `%${term}%`}},
                    {experience_required: {[Op.like]: `%${term}%`}},
                    {'$Company.name$': {[Op.like]: `%${term}%`}},
                    {'$Profession.name$': {[Op.like]: `%${term}%`}}
                ]
            }));
            whereClause[Op.and] = searchConditions;
        }

        const includeClause = [
            {model: Company, attributes: ['id', 'name']},
            {model: Profession, attributes: ['id', 'name']}
        ];

        const total = await Vacancy.count({where: whereClause, include: includeClause, distinct: true});

        const vacancies = await Vacancy.findAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

        res.json({
            success: true,
            vacancies,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Ошибка получения вакансий для админ-панели:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Обновление статуса вакансии для админ-панели
app.put('/api/admin/vacancies/:vacancyId/status', async (req, res) => {
    try {
        const {vacancyId} = req.params;
        const {is_active} = req.body;

        const vacancy = await Vacancy.findByPk(vacancyId);
        if (!vacancy) {
            return res.status(404).json({success: false, error: 'Вакансия не найдена'});
        }

        await vacancy.update({is_active});

        res.json({success: true, message: 'Статус вакансии обновлен'});
    } catch (error) {
        console.error('Ошибка обновления статуса вакансии:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Получение резюме для админ-панели
app.get('/api/admin/resumes', async (req, res) => {
    try {
        const {search = '', verification_mode = 'false', page = 1, limit = 10} = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};

        if (verification_mode === 'true') {
            whereClause.is_active = {[Op.in]: [2, 3]};
        } else {
            whereClause.is_active = {[Op.in]: [0, 1]};
        }

        if (search && search.trim() !== '') {
            const searchTerms = search.trim().toLowerCase().split(/\s+/);
            const searchConditions = searchTerms.map(term => ({
                [Op.or]: [
                    {title: {[Op.like]: `%${term}%`}},
                    {about: {[Op.like]: `%${term}%`}},
                    {experience: {[Op.like]: `%${term}%`}},
                    {'$Profession.name$': {[Op.like]: `%${term}%`}},
                    {'$Applicant.User.first_name$': {[Op.like]: `%${term}%`}},
                    {'$Applicant.User.last_name$': {[Op.like]: `%${term}%`}}
                ]
            }));
            whereClause[Op.and] = searchConditions;
        }

        const includeClause = [
            {
                model: Applicant,
                include: [{model: User, attributes: ['id', 'first_name', 'last_name', 'email']}]
            },
            {model: Profession, attributes: ['id', 'name']}
        ];

        const total = await Resume.count({where: whereClause, include: includeClause, distinct: true});

        const resumes = await Resume.findAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

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
        console.error('Ошибка получения резюме для админ-панели:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Обновление статуса резюме для админ-панели
app.put('/api/admin/resumes/:resumeId/status', async (req, res) => {
    try {
        const {resumeId} = req.params;
        const {is_active} = req.body;

        const resume = await Resume.findByPk(resumeId);
        if (!resume) {
            return res.status(404).json({success: false, error: 'Резюме не найдено'});
        }

        await resume.update({is_active});

        res.json({success: true, message: 'Статус резюме обновлен'});
    } catch (error) {
        console.error('Ошибка обновления статуса резюме:', error);
        res.status(500).json({success: false, error: error.message});
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================

async function startServer() {
    console.log('\nЗапуск\n');

    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('Невозможно продолжить без подключения к базе данных');
        process.exit(1);
    }

    try {
        await sequelize.sync({alter: false});
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
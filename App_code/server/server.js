const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, testConnection } = require('./src/config/database');
const User = require('./src/models/User')(sequelize);

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.get('/api/applicant/resume_responses/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const query = `
            SELECT u.id as user_id, r.id AS resume_id, c.name, rr.message, rr.status, rr.created_at
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
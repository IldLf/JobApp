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
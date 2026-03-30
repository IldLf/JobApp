const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('\nПодключение к MySQL успешно!');
        return true;
    } catch (error) {
        console.error('\nОшибка подключения к MySQL:');
        console.error(`   ${error.message}`);
        return false;
    }
};

module.exports = { sequelize, testConnection };
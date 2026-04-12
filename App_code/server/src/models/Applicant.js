const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Applicant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        profession_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'professions',
                key: 'id'
            }
        },
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        expected_salary: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        experience_years: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        education: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'applicants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true
    });
};
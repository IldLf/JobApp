const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Vacancy', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        salary_from: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        salary_to: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        employment_type: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        experience_required: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        is_active: {
            type: DataTypes.SMALLINT,
            defaultValue: 1
        }
    }, {
        tableName: 'vacancies',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });
};
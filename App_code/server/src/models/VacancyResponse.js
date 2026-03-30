const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('VacancyResponse', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vacancy_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'vacancies',
                key: 'id'
            }
        },
        applicant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'applicants',
                key: 'id'
            }
        },
        cover_letter: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'viewed', 'accepted', 'rejected']]
            }
        }
    }, {
        tableName: 'vacancy_responses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['vacancy_id', 'applicant_id']
            }
        ]
    });
};
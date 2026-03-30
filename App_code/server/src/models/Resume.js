const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Resume', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        applicant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'applicants',
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
        salary: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        experience: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'resumes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ResumeResponse', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        resume_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'resumes',
                key: 'id'
            }
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        message: {
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
        tableName: 'resume_responses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['resume_id', 'company_id']
            }
        ]
    });
};
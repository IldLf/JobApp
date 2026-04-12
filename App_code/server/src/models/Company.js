const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Company', {
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        logo_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        inn: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true
        }
    }, {
        tableName: 'companies',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true
    });
};
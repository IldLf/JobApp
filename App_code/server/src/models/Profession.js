const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Profession', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'professions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true
    });
};
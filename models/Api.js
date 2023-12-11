const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Api = db.define('api', {
    licensed: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    api: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    query: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    
});

module.exports = Api;



const { DataTypes } = require("sequelize");
const db = require("../db/conn");

const Api = db.define("api", {
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  service: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  api: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  query: {
    type: DataTypes.INTEGER,
    defaultValue: 20000,
    allowNull: false,
  },
});

module.exports = Api;

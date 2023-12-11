const { DataTypes } = require("sequelize");
const db = require("../db/conn");

const Users = db.define("Users", {
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  uid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    allowNull: false,
  },
  role: {
    type: DataTypes.TEXT,
    defaultValue: "user",
    allowNull: false,
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Users;

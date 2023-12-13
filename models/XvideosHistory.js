const { DataTypes } = require("sequelize");
const db = require("../db/conn");

const XvideoHistory = db.define("xvideo_history", {
  api: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = XvideoHistory;

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "railway",
  "root",
  "cb5cGFc1261F56HcEbE164GGg6EggDf2",
  {
    host: "monorail.proxy.rlwy.net",
    port: 44590,
    dialect: "mysql",
  }
);

try {
  sequelize.authenticate();
  console.log("conectado");
} catch (error) {
  console.log(error);
}

module.exports = sequelize;

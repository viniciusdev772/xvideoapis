const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "vdev_hosts", // nome do banco de dados
  "vdev_hosts", // nome de usuário
  "vdev_hosts", // senha
  {
    host: "localhost", // host local
    dialect: "mysql", // dialeto MySQL
    timezone: "-03:00", // fuso horário
  }
);

try {
  sequelize.authenticate();
  console.log("conectado");
} catch (error) {
  console.log(error);
}

module.exports = sequelize;

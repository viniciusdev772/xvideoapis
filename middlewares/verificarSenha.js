const bcrypt = require("bcrypt");

const verificarSenha = (senha, hash, callback) => {
  bcrypt.compare(senha, hash, (erro, match) => {
    if (erro) {
      console.error("Erro ao verificar a senha:", erro);
      callback(erro, null);
      return;
    }
    callback(null, match);
  });
};

module.exports = verificarSenha;

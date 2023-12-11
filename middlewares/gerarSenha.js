const bcrypt = require("bcrypt");

const gerarHashSenha = (senha, callback) => {
  bcrypt.hash(senha, 10, (erro, hash) => {
    if (erro) {
      console.error("Erro ao criptografar a senha:", erro);
      callback(erro, null);
      return;
    }
    callback(null, hash);
  });
};
module.exports = gerarHashSenha;

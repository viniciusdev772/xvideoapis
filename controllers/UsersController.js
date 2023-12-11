const UsersModel = require("../models/Users");
const verificarSenha = require("../middlewares/verificarSenha");
const gerarHashSenha = require("../middlewares/gerarSenha");
const jwt = require("jsonwebtoken");
module.exports = class Users {
  static CriarUsuario(req, res) {
    res.render("users/criar");
  }

  static LoginUsuario(req, res) {
    res.render("users/login");
  }

  static NovoUser(req, res) {
    const { fullName, email, password } = req.body;

    gerarHashSenha(password, (erro, hash) => {
      if (erro) {
        res.send({ message: "Erro ao criar usuário." });
        return;
      }

      const novoUsuario = {
        username: fullName,
        email: email,
        role: "user",
        password: hash,
      };

      UsersModel.findOne({ where: { email: novoUsuario.email } })
        .then((usuarioExistente) => {
          if (usuarioExistente) {
            res.send({
              message: "Conflito ao criar este usuário, talvez ele já exista.",
            });
          } else {
            UsersModel.create(novoUsuario)
              .then((usuarioCriado) => {
                res.send({
                  message:
                    "Usuário Criado com Sucesso, agora você tem acesso ao Dashboard.",
                });
                console.log("Novo usuário criado:", usuarioCriado.get());
              })
              .catch((erro) => {
                console.error("Erro ao criar usuário:", erro);
                res.send({ message: "Erro ao criar usuário." });
              });
          }
        })
        .catch((erro) => {
          console.error("Erro ao verificar usuário existente:", erro);
          res.send({ message: "Erro ao verificar usuário existente." });
        });
    });
  }
  static Login(req, res) {
    const { email, password } = req.body;

    UsersModel.findOne({ where: { email: email } })
      .then((usuario) => {
        if (!usuario) {
          res.send({ message: "Usuário não encontrado." });
          return;
        }

        verificarSenha(password, usuario.password, (erro, match) => {
          if (erro || !match) {
            res.send({ message: "Credenciais inválidas.", password });
            return;
          }

          // Se as credenciais estiverem corretas, pode prosseguir com a autenticação
          // Neste ponto, você pode gerar um token de autenticação, por exemplo, usando JWT

          const chaveSecreta =
            "71f584c04e4c682ba7887689a83e96c73841e740147670ac05e315684d18101a";

          const userAgent = req.get("user-agent");
          const token = jwt.sign(
            {
              userId: usuario.id,
              userEmail: usuario.email,
              userAgent: userAgent,
            },
            chaveSecreta,
            { expiresIn: "1h" }
          );

          res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
          res.send({
            message: "Login bem-sucedido.",
            token: token,
          });
        });
      })
      .catch((erro) => {
        console.error("Erro ao realizar o login:", erro);
        res.send({ message: "Erro ao realizar o login." });
      });
  }
};

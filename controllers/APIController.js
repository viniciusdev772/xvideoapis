const APIModel = require("../models/Api");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verificarSenha = require("../middlewares/verificarSenha");

const verificaSobrecarga = require("../middlewares/Sobrecarga");

const UsersController = require("./UsersController");
const UsersModel = require("../models/Users");

function decodificarToken(token) {
  const segredo =
    "71f584c04e4c682ba7887689a83e96c73841e740147670ac05e315684d18101a";

  try {
    const decoded = jwt.verify(token, segredo);
    return decoded;
  } catch (err) {
    console.error("Erro ao decodificar o token:", err.message);
    return null;
  }
}

const gerarHashSenha = async (senha) => {
  try {
    const hash = await bcrypt.hash(senha, 10);
    return hash;
  } catch (erro) {
    console.error("Erro ao criptografar a senha:", erro);
    throw erro;
  }
};

module.exports = class API {
  static async APICriar(req, res) {
    verificaSobrecarga(req, res, async () => {
      const { data } = req.body; // Obtendo o serviço da requisição
      const tokenCookie = req.cookies.token;

      if (tokenCookie) {
        const decodedData = decodificarToken(tokenCookie);

        if (decodedData) {
          const userEmail = decodedData.userEmail;

          try {
            // Verificar se já existe uma API do mesmo serviço relacionada ao email
            const apiExistente = await APIModel.findOne({
              where: {
                email: userEmail,
                service: data,
              },
            });

            if (apiExistente) {
              // Se já existe, retornar um erro ou outra resposta apropriada
              res.status(200).json({
                api: "Falha,Já existe uma API para este serviço e e-mail.",
              });
            } else {
              const novoRegistro = await APIModel.create({
                email: userEmail,
                service: data,
              });

              const respostaRegistro = novoRegistro.toJSON();
              console.log("Novo registro criado:", respostaRegistro);
              const apiFieldValue = respostaRegistro.api;

              // Retornando o valor sem as aspas
              res
                .status(201)
                .json({ api: apiFieldValue.replace(/^"|"$/g, "") });
            }

            // Se não existe, criar a nova API
          } catch (error) {
            console.error("Erro ao criar ou verificar API:", error.message);
            res.status(500).json({ mensagem: "Erro interno do servidor" });
          }
        } else {
          console.log("Erro ao decodificar o token.");
          res.status(401).json({ mensagem: "Token inválido" });
        }
      } else {
        console.log("O cookie token não está presente na requisição.");
        res.status(401).json({ mensagem: "Token não fornecido" });
      }
    });
  }

  static async dashboard(req, res) {
    verificaSobrecarga(req, res, async () => {
      const tokenCookie = req.cookies.token;
      const decodedData = decodificarToken(tokenCookie);
      const userEmail = decodedData.userEmail;

      try {
        // Consultar o banco de dados para registros relacionados ao email
        const registrosRelacionados = await APIModel.findAll({
          where: {
            email: userEmail,
          },
          raw: true,
        });

        res.render("dashboard/dash", { registros: registrosRelacionados });
      } catch (error) {
        console.error("Erro ao consultar o banco de dados:", error.message);
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    });
  }

  static async byjwt(req, res) {
    const chaveSecreta =
      "71f584c04e4c682ba7887689a83e96c73841e740147670ac05e315684d18101a";
    const myjwt_key = "seu_secret_jwt";
    const token = req.body.token;
    const decoded = jwt.verify(token, myjwt_key);

    const email = decoded.email;
    const nome = decoded.nome;
    const hash = await gerarHashSenha(decoded.email);

    const novoUsuario = {
      username: nome,
      email: email,
      role: "user",
      password: hash,
    };

    UsersModel.findOne({ where: { email: novoUsuario.email } })
      .then((usuarioExistente) => {
        if (usuarioExistente) {
          const userAgent = req.get("user-agent");
          const token = jwt.sign(
            {
              userId: usuarioExistente.id,
              userEmail: usuarioExistente.email,
              userAgent: userAgent,
            },
            chaveSecreta,
            { expiresIn: "148h" }
          );
          const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
          const seteDiasEmMilissegundos = 7 * umDiaEmMilissegundos;

          const opcoesCookie = {
            httpOnly: true,
            maxAge: seteDiasEmMilissegundos,
          };

          res.cookie("token", token, opcoesCookie);
          res.send({
            message: "Login bem-sucedido.",
            token: token,
            sucesso: true,
          });
        } else {
          UsersModel.create(novoUsuario)
            .then((usuarioCriado) => {
              res.send({
                message:
                  "Usuário Criado com Sucesso, agora você tem acesso ao Dashboard.",
                sucesso: true,
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
        res.send({
          message: "Erro ao verificar usuário existente.",
          sucesso: false,
        });
      });

    //verificar se o email existe

    console.log(decoded);
  }
  //retornar em json os registros
  static async dashboardJson(req, res) {
    verificaSobrecarga(req, res, async () => {
      const tokenCookie = req.body.token;
      const decodedData = decodificarToken(tokenCookie);
      const userEmail = decodedData.userEmail;

      try {
        // Consultar o banco de dados para registros relacionados ao email
        const registrosRelacionados = await APIModel.findAll({
          where: {
            email: userEmail,
          },
          raw: true,
        });

        res.json(registrosRelacionados);
      } catch (error) {
        console.error("Erro ao consultar o banco de dados:", error.message);
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    });
  }
};

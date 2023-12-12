const APIModel = require("../models/Api");
const jwt = require("jsonwebtoken");

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

module.exports = class API {
  static APICriar(req, res) {
    const { data } = req.body;
    const tokenCookie = req.cookies.token;

    if (tokenCookie) {
      const decodedData = decodificarToken(tokenCookie);

      if (decodedData) {
        const userEmail = decodedData.userEmail;

        // Aqui você pode usar o modelo APIModel para criar um novo registro
        APIModel.create({
          email: userEmail,
          service: data,
        })
          .then((novoRegistro) => {
            const respostaRegistro = novoRegistro.toJSON();
            console.log("Novo registro criado:", respostaRegistro);
            const apiFieldValue = respostaRegistro.api;

            // Retornando o valor sem as aspas
            res.status(201).json({ api: apiFieldValue.replace(/^"|"$/g, "") });
          })
          .catch((error) => {
            console.error("Erro ao criar novo registro:", error.message);
            res.status(500).json({ mensagem: "Erro interno do servidor" });
          });
      } else {
        console.log("Erro ao decodificar o token.");
        res.status(401).json({ mensagem: "Token inválido" });
      }
    } else {
      console.log("O cookie token não está presente na requisição.");
      res.status(401).json({ mensagem: "Token não fornecido" });
    }
  }

  static async dashboard(req, res) {
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
  }
};

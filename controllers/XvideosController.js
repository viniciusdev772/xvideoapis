const APIModel = require("../models/Api");
const verificarSenha = require("../middlewares/verificarSenha");
const gerarHashSenha = require("../middlewares/gerarSenha");
const jwt = require("jsonwebtoken");

const { XVDL } = require("../xvdl");

const serviceId = "xvideos";

function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();

  // Lista de padrões de URLs do Xvideos
  const xvideosPatterns = ["www.xvideos.com", "xvideos.com"];

  // Verifica se a URL contém algum padrão do Xvideos
  const isXvideos = xvideosPatterns.some((pattern) =>
    lowercaseUrl.includes(pattern)
  );

  // Retorna verdadeiro se a URL corresponder a um padrão do Xvideos, caso contrário, retorna falso
  return isXvideos;
}

// Classe XvideoApi para manipulação de vídeos
module.exports = class XvideoApi {
  // Método para manipular requisições GET
  static async videoget(req, res) {
    try {
      // Verificar se a chave de API foi fornecida
      const chaveApi = req.query.apiKey;
      if (!chaveApi) {
        return res.status(400).json({ error: "Chave de API ausente" });
      }

      // Verificar se a chave de API é válida usando Sequelize
      const apiValida = await APIModel.findOne({
        where: {
          api: chaveApi,
          service: "xvideos",
        },
      });

      if (apiValida) {
      }

      if (!apiValida) {
        return res.status(401).json({
          error:
            "Erro, Chave de Api Inexistente, Verifique no seu Painel se ela pertence a rota /xvideos a qual você está tentando acessar",
        });
      }
      const linkVideo = req.query.link;
      const targetLink = req.query.link;
      if (!linkVideo) {
        return res.status(400).json({ error: "Link do vídeo ausente" });
      }
      if (apiValida) {
        const valorQuery = apiValida.query;
        const serv = apiValida.service;
        console.log(valorQuery);
        if (valorQuery !== undefined && valorQuery <= 0) {
          return res.status(429).json({
            error:
              "Limite de consultas atingido para esta Chave de API, considere adquirir mais limite",
          });
        } else {
          await APIModel.decrement("query", {
            by: 1,
            where: { api: chaveApi },
          });
          XVDL.getInfo(targetLink).then((inf) => {
            const jsonResponse = {
              statusCode: 200,
              status: "sucesso",
              thumb: inf.thumbnail,
              titulo: inf.title,
              link: inf.streams.hq,
            };
            res.json(jsonResponse);
          });
        }
      } else {
        return res.status(404).json({
          error:
            "Chave de Api não encontrada, tenha certeza que essa chave pertence a rota /xvideos ou do serviço xvideos",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};

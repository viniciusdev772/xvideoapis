const APIModel = require("../models/Api");
const XvideoHistory = require("../models/XvideosHistory");
const verificarSenha = require("../middlewares/verificarSenha");
const gerarHashSenha = require("../middlewares/gerarSenha");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");

const { XVDL } = require("../xvdl");

const serviceId = "xvideos";
/*
cron.schedule("0 0 15 * *", async () => {
  try {
    // Atualize todas as linhas da tabela, definindo a coluna 'query' para 100
    await APIModel.update({ query: 100 }, { where: {} });

    console.log(
      'A coluna "query" foi atualizada para 100 em todas as linhas com sucesso!'
    );
  } catch (error) {
    console.error('Ocorreu um erro ao atualizar a coluna "query":', error);
  }
});
*/

console.log("Cron job agendado para rodar no dia 15 de cada mês.");

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

  static async history(req, res) {
    const chaveApi = req.query.apiKey;

    if (!chaveApi) {
      return res.status(400).json({ error: "Chave de API ausente" });
    }

    const historyData = await XvideoHistory.findAll({
      where: {
        api: chaveApi,
      },
    });
    if (!historyData || historyData.length === 0) {
      return res.status(404).json({
        error: "Tenha Certeza que essa Api é do serviço Xvideos.",
      });
    }
    // Retorna os dados encontrados
    return res.status(200).json(historyData);
  }

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
          await XvideoHistory.create({
            api: chaveApi,
            url: targetLink,
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

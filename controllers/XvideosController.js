const APIModel = require("../models/Api");
const XvideoHistory = require("../models/XvideosHistory");
const verificarSenha = require("../middlewares/verificarSenha");
const gerarHashSenha = require("../middlewares/gerarSenha");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const verificaSobrecarga = require("../middlewares/Sobrecarga"); // Importe o middleware de verificação de sobrecarga

const { XVDL } = require("../xvdl");

const serviceId = "xvideos";

console.log("Cron job agendado para rodar no dia 15 de cada mês.");

function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();

  const xvideosPatterns = ["www.xvideos.com", "xvideos.com"];

  return xvideosPatterns.some((pattern) => lowercaseUrl.includes(pattern));
}

module.exports = class XvideoApi {
  static async history(req, res) {
    verificaSobrecarga(req, res, async () => {
      // Adicione a verificação de sobrecarga aqui
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
      return res.status(200).json(historyData);
    });
  }

  static async videoget(req, res) {
    verificaSobrecarga(req, res, async () => {
      // Adicione a verificação de sobrecarga aqui
      try {
        const chaveApi = req.query.apiKey;
        if (!chaveApi) {
          return res.status(400).json({ error: "Chave de API ausente" });
        }

        const apiValida = await APIModel.findOne({
          where: {
            api: chaveApi,
            service: "xvideos",
          },
        });

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
            XVDL.getInfo(targetLink)
              .then((inf) => {
                if (
                  !inf.thumbnail ||
                  !inf.title ||
                  !inf.streams ||
                  !inf.streams.hq
                ) {
                  throw new Error(
                    "Algumas informações necessárias estão ausentes"
                  );
                }

                const jsonResponse = {
                  statusCode: 200,
                  status: "sucesso",
                  thumb: inf.thumbnail,
                  titulo: inf.title,
                  link: inf.streams.hq,
                };
                res.json(jsonResponse);
              })
              .catch((error) => {
                console.error("Erro ao processar informações:", error);
                res.status(500).json({
                  statusCode: 500,
                  status: "erro",
                  message: "Erro ao processar informações",
                });
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
    });
  }
};

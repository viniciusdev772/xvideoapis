const requestCount = new Map(); // Estrutura de dados para armazenar o contador de solicitações por IP

const axios = require("axios");
async function bloquearIP(ip) {
  try {
    const apiKey = "90e00f1267f6aaf54ac9b8004419932946eb5";
    const email = "lojasketchware@gmail.com";
    const zoneId = "03d4696d2e0843efdf1de3423731f3e7";

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/firewall/access_rules/rules`;

    const headers = {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey,
      "Content-Type": "application/json",
    };

    const data = {
      mode: "block",
      configuration: {
        target: "ip",
        value: ip,
      },
    };

    const response = await axios.post(url, data, { headers });

    console.log("IP bloqueado com sucesso:", response.data.result);
  } catch (error) {
    console.error("Erro ao bloquear o IP:", error.response.data);
  }
}
async function desbloquearIP(ip) {
  try {
    const apiKey = "90e00f1267f6aaf54ac9b8004419932946eb5";
    const email = "lojasketchware@gmail.com";
    const zoneId = "03d4696d2e0843efdf1de3423731f3e7";

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/firewall/access_rules/rules`;

    const headers = {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey,
      "Content-Type": "application/json",
    };

    const data = {
      mode: "block",
      configuration: {
        target: "ip",
        value: ip,
      },
    };

    const response = await axios.delete(url, { data, headers });

    console.log("IP desbloqueado com sucesso:", response.data.result);
  } catch (error) {
    console.error("Erro ao desbloquear o IP:", error.response.data);
  }
}
function verificaSobrecarga(req, res, next) {
  const RATE_LIMIT_INTERVAL = 60000; // 60 segundos
  const MAX_REQUESTS_PER_INTERVAL = 10; // 10 solicitações por intervalo de 60 segundos

  const ip = req.headers["cf-connecting-ip"] || req.ip; // Usa o IP original do cliente, se disponível
  const currentTime = Date.now();
  let count = requestCount.get(ip) || { timestamp: currentTime, count: 0 };

  console.log(`IP da solicitação: ${ip}`);
  console.log(`Contagem atual: ${count.count}`);

  if (currentTime - count.timestamp < RATE_LIMIT_INTERVAL) {
    count.count++;
  } else {
    count = { timestamp: currentTime, count: 1 };
  }

  console.log(`Nova contagem: ${count.count}`);

  requestCount.set(ip, count);

  if (count.count > MAX_REQUESTS_PER_INTERVAL) {
    bloquearIP(ip);
    console.log("Limite de solicitações excedido para este IP.");
    const tentativas = count.count;
    const horaAtual = new Date().toLocaleTimeString();
    const mensagem = `Excesso de Requests para ESTE IP. Foram feitas ${tentativas} tentativas até o momento (${horaAtual}). Caso persista, o IP será bloqueado permanentemente.`;

    return res.status(429).send(mensagem);
  } else {
    desbloquearIP(ip);
  }

  console.log("Próxima solicitação permitida.");

  next();
}

module.exports = verificaSobrecarga;

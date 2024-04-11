const requestCount = new Map(); // Esta é a estrutura de dados para armazenar o contador de solicitações por IP

function verificaSobrecarga(req, res, next) {
  const RATE_LIMIT_INTERVAL = 60000; // 60 segundos
  const MAX_REQUESTS_PER_INTERVAL = 10; // 10 solicitações por intervalo de 60 segundos

  let ip = req.headers["cf-connecting-ip"] || req.ip; // Usa o IP original do cliente se disponível
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
    console.log("Limite de solicitações excedido para este IP.");
    return res
      .status(429)
      .json({ mensagem: "Muitas solicitações. Tente novamente mais tarde." });
  }

  console.log("Próxima solicitação permitida.");

  next();
}

module.exports = verificaSobrecarga;

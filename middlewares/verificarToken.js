const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

// Certifique-se de usar o cookieParser antes de seus middlewares
// Exemplo: app.use(cookieParser());

const verificarToken = (req, res, next) => {
  const token = req.cookies.token; // Obtemos o token do cookie chamado 'token'

  if (!token) {
    res
      .status(401)
      .sendFile(path.join(__dirname, "../public/html/tokenerrado.html"));
  }

  jwt.verify(
    token,
    "71f584c04e4c682ba7887689a83e96c73841e740147670ac05e315684d18101a",
    (err, decoded) => {
      if (err) {
        res
          .status(401)
          .sendFile(path.join(__dirname, "../public/html/tokenerrado.html"));
      } else {
        next();
      }

      console.log("Autenticado com token ", token);
    }
  );
};

module.exports = verificarToken;

const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cors = require("cors");
app.use(cors());
const port = 3090;
const conn = require("./db/conn");

const APIModel = require("./models/Api");
const XvideoHistory = require("./models/XvideosHistory");

const cookieParser = require("cookie-parser");

const verificarToken = require("./middlewares/verificarToken");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const Users = require("./models/Users");
const UsersRoutes = require("./routes/usersRoutes");
const ApisRoutes = require("./routes/ApisRoutes");
const Xvideos = require("./routes/xvideos_router");
app.use("/usuario", UsersRoutes);
app.use("/api", ApisRoutes);
app.use("/xvideos", Xvideos);
const translate = require("translate-google");

const hbs = exphbs.create({});

app.get("/tradutor", async (req, res) => {
  try {
    const { apiKey, texto, de, para } = req.query;

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    const chaveApi = apiKey;

    const apiValida = await APIModel.findOne({
      where: {
        api: chaveApi,
        service: "tradutor",
      },
    });

    if (!apiValida) {
      return res.status(401).json({
        error:
          "Invalid API key. Make sure the API key belongs to the /tradutor route.",
      });
    }

    if (apiValida.query !== undefined && apiValida.query <= 0) {
      return res.status(429).json({
        error:
          "Query limit reached for this API key. Consider acquiring more quota.",
      });
    }

    await APIModel.decrement("query", {
      by: 1,
      where: { api: chaveApi },
    });

    if (!texto) {
      return res.status(400).json({ error: "Text to translate is required" });
    }

    await XvideoHistory.create({
      api: chaveApi,
      url: "de " + de + " para " + para + " " + texto,
    });

    translate(texto, { from: de, to: para })
      .then((translation) => {
        res.json({ translation });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Translation failed" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.use("/", verificarToken, ApisRoutes);
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

const { XVDL } = require("./xvdl/index");

conn
  .sync()
  .then(() => {
    app.listen(port, () =>
      console.log(`MVC RUNS ON PORT: http://localhost:${port}`)
    );
  })
  .catch((err) => console.log(err));

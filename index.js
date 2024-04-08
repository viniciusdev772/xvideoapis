const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cors = require("cors");
app.use(cors());
const port = 3090;
const conn = require("./db/conn");

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
app.use("/", verificarToken, ApisRoutes);
const hbs = exphbs.create({});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

const { XVDL } = require("./xvdl/index");

conn
  .sync()
  .then(() => {
    app.listen(port, "0.0.0.0", () =>
      console.log(`MVC RUNS ON PORT: http://localhost:${port}`)
    );
  })
  .catch((err) => console.log(err));

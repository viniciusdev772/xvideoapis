const express = require("express");
const router = express.Router();
const APIController = require("../controllers/APIController");

router.get("/", APIController.dashboard);
router.post("/create", APIController.APICriar);
router.post("/json", APIController.dashboardJson);

router.get("/myip", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  res.send(ip);
});

router.post("/byjwt", APIController.byjwt);

module.exports = router;

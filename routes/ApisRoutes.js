const express = require("express");
const router = express.Router();
const APIController = require("../controllers/APIController");

router.get("/", APIController.dashboard);
router.post("/create", APIController.APICriar);
router.post("/json", APIController.dashboardJson);

router.get("/myip", async (req, res) => {
  const ipAddr = req.headers["x-forwarded-for"];
  const ip = ipAddr ? ipAddr.split(",").pop() : req.socket.remoteAddress;
  res.send(ip);
});

router.post("/byjwt", APIController.byjwt);

module.exports = router;

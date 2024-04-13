const express = require("express");
const router = express.Router();
const APIController = require("../controllers/APIController");

router.get("/", APIController.dashboard);
router.post("/create", APIController.APICriar);
router.post("/json", APIController.dashboardJson);

router.post("/byjwt", APIController.byjwt);

module.exports = router;

const express = require("express");
const router = express.Router();
const APIController = require("../controllers/XvideosController");

router.get("/", APIController.videoget);
router.get("/history", APIController.history);


module.exports = router;

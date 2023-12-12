const express = require("express");
const router = express.Router();
const APIController = require("../controllers/XvideosController");

router.get("/", APIController.videoget);


module.exports = router;

const express = require('express')
const router = express.Router()
const APIController  = require('../controllers/APIController');


router.get('/',APIController.dashboard);

module.exports = router


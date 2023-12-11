const express = require('express')
const router = express.Router()
const UsersController  = require('../controllers/UsersController');

router.get('/novo', UsersController.CriarUsuario);
router.get('/login', UsersController.LoginUsuario);

router.post('/create', UsersController.NovoUser);
router.post('/sign', UsersController.Login);

module.exports = router


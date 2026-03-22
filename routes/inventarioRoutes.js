const express = require('express')
const codigosController = require('../controllers/appController.js')
const router = express.Router()

router.post('/guardarRegistro',codigosController.guardarArticuloInventario)


module.exports = router

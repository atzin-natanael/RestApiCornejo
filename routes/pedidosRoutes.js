const express = require('express')
const codigosController = require('../controllers/appController.js')
const router = express.Router()

router.post('/guardar', codigosController.guardarPedido)
router.get('/:CLIENTE_ID', codigosController.mostrarPedidos)


module.exports = router

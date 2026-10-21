const express = require('express')
const codigosController = require('../controllers/appControllerC.js')
const router = express.Router()

router.post('/guardar', codigosController.guardarPedido)
router.get('/:CLIENTE_ID', codigosController.mostrarPedidos)


module.exports = router

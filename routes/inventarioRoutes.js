const express = require('express')
const codigosController = require('../controllers/appController.js')
const router = express.Router()

router.post('/guardarRegistro',codigosController.guardarArticuloInventario)
router.get('/mostrarTabla/:id', codigosController.mostrarArticulosInventario)
router.get('/colectores', codigosController.mostrarColectores)

module.exports = router

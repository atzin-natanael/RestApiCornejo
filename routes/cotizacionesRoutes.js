const express = require('express')
const codigosController = require('../controllers/appController.js')
const router = express.Router()

router.post('/guardar', codigosController.guardarCotizacionCompleta)
router.post('/guardar-editando', codigosController.actualizarCotizacionEditando)


module.exports = router

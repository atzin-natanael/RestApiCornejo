const express = require('express')
const codigosController = require('../controllers/appController.js')
const router = express.Router()

router.post('/guardarRegistro',codigosController.guardarArticuloInventario)
router.post('/eliminar-articulo/:id', codigosController.eliminarRegistro);
router.get('/mostrarTabla/:id', codigosController.mostrarArticulosInventario)
router.get('/colectores', codigosController.mostrarColectores)
router.get('/colectores/:id', codigosController.mostrarColectoresById)
router.get('/zonas', codigosController.mostrarZonas)
router.get('/zonas/:id', codigosController.mostrarZonasById)
router.get('/mostrarRegistros', codigosController.mostrarRegistros)



module.exports = router

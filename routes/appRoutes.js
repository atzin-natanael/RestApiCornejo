const express= require('express')
const codigosController = require('../controllers/appController.js')
const router= express.Router()

module.exports = function(){
    //Agrega nuevos codigos via POST
    // router.post('/codigos', codigosController.nuevoCodigo)
    // router.get('/codigos', codigosController.mostrarCodigos)

    //mostrar codigo en especifico
    router.get('/', codigosController.Start)
    router.get('/codigos/:idCodigo', codigosController.mostrarCodigo)
    router.get('/codigobyclave/:idCodigo', codigosController.mostrarCodigoByClave)
    router.get('/codigobyclaveCornejo/:idCodigo', codigosController.mostrarCodigoByClaveCornejo)
    router.get('/codigos', codigosController.mostrarCodigosFull)
    router.get('/cotizaciones/:CLIENTE_ID', codigosController.mostrarCotizaciones)
    router.get('/cotizaciones/edit/:COTIZACION_ID', codigosController.mostrarCotizacion)
    router.get('/cotizaciones/det/:COTIZACION_ID', codigosController.mostrarArticulos)
    router.post('/cotizaciones/cancelar/:COTIZACION_ID', codigosController.cancelarCotizacion)
    
    //router.post('/cotizaciones', codigosController.guardarCotizacionCompleta)
    //actualizar todo el registro
    // router.put('/codigos/:idCodigo', codigosController.actualizarCodigo)
    // //eliminarCodigo
    // router.delete('/codigos/:idCodigo', codigosController.eliminarCodigo)
    return router
}


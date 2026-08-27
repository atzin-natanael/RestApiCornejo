const express= require('express')
const codigosController = require('../controllers/appControllerC.js')
const router= express.Router()

module.exports = function(){
    router.get('/codigos', codigosController.mostrarCodigosFull)
    return router
}
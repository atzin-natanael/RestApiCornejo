const express = require('express')
const routes = require('./routes/appRoutes.js')
const cotizacionRoutes = require('./routes/cotizacionesRoutes.js')
const cors = require('cors');
//const mongoose = require('mongoose')
const bodyParser = require('body-parser')
//conectar mongo
// mongoose.Promise = global.Promise
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/restapi')
//   .then(() => console.log('✅ Mongo conectado'))
//   .catch(err => console.error('❌ Error Mongo:', err))

//servidor
const app = express()
//habilitar Body parser
// Estos dos son los "traductores"
// 2. Configura el permiso ANTES de las rutas
app.use(cors({
    origin: 'http://localhost:3001', // El origen de tu página web
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true
}));
app.use(cors({
    origin: 'http://localhost:8000', // El origen de tu página web
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true
}));
app.use(express.json()); // 👈 Este es el que falta para entender el JSON de fetch
app.use(express.urlencoded({ extended: true }));
//rutas de la app
app.use('/', routes())
app.use('/cotizacion', cotizacionRoutes)
//puerto
const port = 3000
app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});
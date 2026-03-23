const express = require('express')
const routes = require('./routes/appRoutes.js')
const cotizacionRoutes = require('./routes/cotizacionesRoutes.js')
const inventarioRoutes = require('./routes/inventarioRoutes.js')
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
const whitelist = [
    'http://localhost:3001', 
    'http://localhost:8000', 
    'https://paginainventariofisico.onrender.com' // Agrega tu URL de producción aquí
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o Server-to-Server)
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true
}));
app.use(express.json()); // 👈 Este es el que falta para entender el JSON de fetch
app.use(express.urlencoded({ extended: true }));
//rutas de la app
app.use('/', routes())
app.use('/cotizacion', cotizacionRoutes)
app.use('/inventario', inventarioRoutes)

//puerto
const port = 3000
app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});
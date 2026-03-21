const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config({path: '.env'})
const db = mysql.createPool({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASS,
    database: process.env.BD_NOMBRE
})
module.exports = db

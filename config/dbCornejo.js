const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config({ path: '.env' })

const dbCornejo = mysql.createPool({
  host: process.env.BD_CORNEJO_HOST,
  user: process.env.BD_CORNEJO_USER,
  password: process.env.BD_CORNEJO_PASS,
  database: process.env.BD_CORNEJO_NOMBRE
})

module.exports = dbCornejo
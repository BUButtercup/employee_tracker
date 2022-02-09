require('dotenv').config()
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.ACTIVE_USER,
        password: process.env.USR_PASSWORD,
        database: 'employee_db'
    },
    console.log(`Connected to the database.`)
)

module.exports = db;
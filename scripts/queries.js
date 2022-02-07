const mysql = require('mysql2');
const db = require('./connection.js')

db.query(`SELECT * FROM employee WHERE dept_id=4;`, (err, res)=>{
    if (err){ throw err }
    
})
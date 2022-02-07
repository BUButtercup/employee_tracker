const inquirer = require('inquirer');
const CTable = require('console.table');
const db = require('./scripts/connection.js')


const init = () => {
    const firstQues = inquirer.prompt({name: 'task', type: 'list', choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an Employee', 'Update an employee role'], message: 'Welcome to Department Connections! What would you like to do?'})
    .then (ans => {
        if (ans === 'View all departments'){
            db.query('SELECT * FROM department',(err, res)=>{
                if (err){ throw err }
                const values = [];
                const oneVal = [];
            return res;    
                
            })
        }
    })
}



init();
const inquirer = require('inquirer');
const CTable = require('console.table');
const db = require('./scripts/connection.js')
const util = require('util');
const ques = require('./scripts/questions')
const col = require('./scripts/utils')

const init = () => {
    console.log(col.makeGreen('Welcome to Department Connections!'))
    const whatNow = () => {
        inquirer.prompt(ques.whatNowQues)
        .then (ans => {
            if (ans.task === 'View all departments'){
                db.query('SELECT department.id AS dept_id, department.name AS dept_name, subdept.name as covered_subdept FROM department LEFT JOIN subdept ON department.id=department_id',(err, res, fields)=>{
                    if (err){ throw err }
                    console.table(res);
                    whatNow();
                })
            }
            if (ans.task === 'View all roles'){
                db.query('SELECT title AS job_title, role.id AS id, department.name AS department, salary AS pay FROM role LEFT JOIN department ON role.department_id=department.id ORDER BY department.name', (err, res, fields)=> {
                    if(err) { throw err }
                    console.table(res)
                    whatNow();
                })
            }    
            if (ans.task === 'View all employees'){
                const sortEmp = () => {
                    inquirer.prompt({name:'sort', type:'list', choices:['EID', 'Last Name', 'Job Title', 'Work Area', 'Department', 'Pay', 'Manager'], message:'How would you like to sort the results?'}).then(res => {
                        const sortInpt = res.sort;
                        let sortChoice;
                        if (sortInpt==='EID'){
                            sortChoice = 'staff_tb.id';
                        }
                        if (sortInpt==='Last Name'){
                            sortChoice = 'staff_tb.last_name';
                        }
                        if (sortInpt==='Job Title'){
                            sortChoice = 'title';
                        }
                        if (sortInpt==='Work Area'){
                            sortChoice = 'subdept.name';
                        }
                        if (sortInpt==='Department'){
                            sortChoice = 'department.name';
                        }
                        if (sortInpt==='Pay'){
                            sortChoice = 'salary';
                        }
                        if (sortInpt==='Manager'){
                            sortChoice = 'man_tb.last_name';
                        }
                        const staffName = 'staff_tb.last_name, \', \', staff_tb.first_name';
                        const manName = 'man_tb.last_name, \', \', man_tb.first_name';
                        db.query(`SELECT staff_tb.id AS EID, (CONCAT(${staffName})) AS \'Name (last, first)\', title AS \'Job Title\', IFNULL(subdept.name, \'N/A\') AS \'Work Area\', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON role.department_id=department.id LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id ORDER BY ${sortChoice} ASC;`, (err, res, fields)=>{
                            if (err) { throw err }
                            const notifyUser = (res) => {
                                console.table(res)
                                console.log(`${`The table above is sorted by "${sortInpt}"`.bold} \n${col.important('NOTE: Employee pay is displayed as yearly salary for those in salaried positions, and pay per hour for those who are not')}`)
                                console.log(col.makeGreen('******************************************************************************************************************'));
                            }
                            notifyUser(res);
                            whatNow();
                        })
                    })
                }
                sortEmp();
               
            }
            if (ans.task==='Add a department'){
                inquirer.prompt({name:'add', type:'input', message:'What is the new department\'s name?'}).then(ans =>{
                    db.query(`SELECT name FROM department WHERE name="${ans.add}"`, (err, res, fields)=>{
                        if(!res[0]){
                            db.query(`INSERT INTO department (name) VALUES (?)`, [ans.add], (err, result)=>{
                                if(err){throw err}
                            })
                            db.query('SELECT id AS \'Dept ID\', name AS \'Dept Name\' FROM department', (err, res, fields)=>{
                                if(err){throw err}
                                console.table(res);
                                console.log(`"${ans.add}" department has been added.`);
                                ques.deptChoices.push(ans.add);
                                whatNow();
                            })
                        } else {
                            console.log(`${col.oops(`"${ans.add}" could not be added. It already exists in the database.`)}`)
                            whatNow();
                        } 
                    })
                })  
            }
            if (ans.task==="Add a role"){
                inquirer.prompt(ques.roleQues).then(ans=>{
                    db.query(`SELECT title FROM role WHERE title="${ans.title}"`, (err, res, fields)=>{
                        if(err){throw err}
                        if(!res[0]){
                            console.log('you\'re in!')
                            db.query(`SELECT id FROM department WHERE name="${ans.dept}"`, (err, res, fields)=>{
                                if(err){throw err}
                                db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [ans.title, ans.salary, res[0].id], (err, result)=>{
                                    if(err){throw err}
                                });
                                db.query(`SELECT title AS \'Job Title\', salary AS Pay, department.name AS Department FROM role JOIN department ON department_id=department.id;`, (err, res, fields)=>{
                                    console.table(res);
                                    console.log(`Job of "${ans.title}" has been added.`.bold);
                                    ques.roleChoices.push(ans.title)
                                    whatNow();
                                })
                            });
                        } else {
                            console.log(`${col.oops(`"${ans.title}" could not be added. It already exists in the database.`)}`);
                            whatNow();
                        }
                    })    
                })
            }
            if(ans.task==='Add a new employee'){
                inquirer.prompt(ques.newEmpQues).then(ans=>{
                    db.query(`SELECT last_name, first_name FROM role WHERE last_name="${ans.title}"`, (err, res, fields)=>{
                

                        // {
                        //     name: 'subdept',
                        //     type: 'list',
                        //     choices: areaChoices,
                        //     message: 'What work area will the employee be in?'
                     
                    })   // }
                })
            }
        })
    }
    whatNow();
}



init();
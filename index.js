const inquirer = require('inquirer');
const CTable = require('console.table');
const db = require('./scripts/connection.js')
const util = require('util');
const ques = require('./scripts/questions')
const col = require('./scripts/utils');
const { resolve } = require('path');
const { constants } = require('buffer');

const spQuery = util.promisify(db.query).bind(db);

const init = () => {
    console.log(col.makeGreen('Welcome to Department Connections!'))
    console.log('For the best viewing experience, please widen your window to fit the line below.'.bold)
    col.addDivide();
    const whatNow = () => {
        inquirer.prompt(ques.whatNowQues)
        .then (ans => {
            if (ans.task === 'View all departments'){
                db.query('SELECT department.id AS \'Department ID\', department.name AS \'Department Name\', IFNULL(subdept.name, \'N/A\') AS \'Work Area\' FROM department LEFT JOIN subdept ON department.id=department_id',(err, res, fields)=>{
                    if (err){ throw err }
                    console.table(res);
                    whatNow();
                })
            }
            if (ans.task === 'View all roles'){
                db.query('SELECT title AS \'Role Title\', role.id AS \'Role ID\', department.name AS Department, salary AS Pay FROM role LEFT JOIN department ON role.department_id=department.id ORDER BY department.name', (err, res, fields)=> {
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
                               col.addDivide();
                            }
                            notifyUser(res);
                            whatNow();
                        })
                    })
                }
                sortEmp();
               
            }
            if (ans.task==='Add a department'){

                inquirer.prompt(ques.newDeptQues).then(ans =>{
                    db.query(`SELECT name FROM department WHERE name="${ans.add}"`, (err, res, fields)=>{
                        if(!res[0]){
                            db.query(`INSERT INTO department (name) VALUES (?)`, [ans.add], (err, re)=>{
                                if(err){throw err}
                            })
                            let deptID;
                            db.query(`SELECT id FROM department WHERE name="${ans.add}"`, (err, re)=>{
                                deptID = re[0].id;
                                // console.log(re[0])
                                // console.log(deptID);
                            })
                            const dispDept = () => {
                                db.query('SELECT department.id AS \'Dept ID\', department.name AS \'Dept Name\', IFNULL(subdept.name, \'N/A\') AS \'Assoc. Work Area(s)\' FROM department LEFT JOIN subdept ON department.id=department_id;', (err, result) => {
                                    if (err) { throw err; }
                                    console.table(result);
                                    console.log(col.important(`"${ans.add}" department has been added. See table above.`));
                                    ques.deptChoices.push(ans.add);
                                    // console.log(ques.deptChoices);
                                })
                            }
                            if(!ans.coverage){
                                dispDept()
                                setTimeout(()=>{ 
                                    whatNow();
                                }, 1000);
                            } else {
                                const createSD = () => {
                                    inquirer.prompt(ques.newSDQues).then(res=>{
                                        db.query(`SELECT name FROM subdept WHERE name="${res.subDeptName}"`, (err, response, fields)=>{
                                            if(!response[0]){
                                                db.query(`INSERT INTO subdept (name, department_id) VALUES (?, ?)`, [res.subDeptName, deptID], (err, result)=>{
                                                    if(err){throw err}
                                                    ques.subDeptChoices.push(res.subDeptName);
                                                    console.log(ques.subDeptChoices);
                                                    // console.log(important(`${res.subDeptName} has been added and assigned to the ${ans.add} department.`))
                                                    if(res.another){
                                                        console.log(col.important(`${res.subDeptName} has been added and assigned to the ${ans.add} department.`))
                                                        createSD();
                                                    } else {
                                                        console.log(col.important(`${res.subDeptName} has been added and assigned to the ${ans.add} department.`))
                                                        inquirer.prompt({name:'another', type:'list', choices:['Reassign', 'Create', 'Done'], message:'Are you done adding work areas?'}).then(ans=>{
                                                            if(ans.another==='Reassign'){
                                                                reassignSD();
                                                            }
                                                            if(ans.another==='Create'){
                                                                createSD();
                                                            }
                                                            if(ans.another==='Done'){
                                                                dispDept()
                                                                setTimeout(()=>{ 
                                                                    whatNow();
                                                                }, 1000);
                                                            }
                                                        })        
                                                    }
                                                })
                                            } else{
                                                console.log(`${col.oops(`"${res.subDeptName}" could not be added. It already exists in the database.`)}`);
                                                inquirer.prompt({name:'another', type:'list', choices:['Reassign', 'Create', 'Done'], message:'Do you need to reassign or create any more work areas?'}).then(ans=>{
                                                    if(ans.another==='Reassign'){
                                                        reassignSD();
                                                    }
                                                    if(ans.another==='Create'){
                                                        createSD();
                                                    }
                                                    if(ans.another==='Done'){
                                                        dispDept()
                                                        setTimeout(()=>{ 
                                                            whatNow();
                                                        }, 1000);
                                                    }
                                                })  
                                            }
                                        })
                                    })
                                }
                                const reassignSD = () => {
                                    inquirer.prompt(ques.reassignSDQues).then(answer=>{
                                        if(answer.whichSD==='Exit the question'){
                                            inquirer.prompt({name: 'which', type: 'list', choices: ['Reassign a work area','Create a new work area', 'Do not need to assign work areas'], message: 'What do you need to do?'}).then(ans=>{
                                                if (ans.which==='Reassign a work area'){
                                                    reassignSD();
                                                }
                                                if (ans.which==='Create a new work area'){
                                                    createSD();
                                                }
                                                if (ans.which==='Do not need to assign work areas'){
                                                    dispDept()
                                                    setTimeout(()=>{ 
                                                        whatNow();
                                                    }, 1000);
                                                }
                                            })
                                        } else {
                                            db.query(`UPDATE subdept SET department_id=${deptID} WHERE name="${answer.whichSD}";`, (err, res)=>{
                                                if(err){throw err}
                                            })
                                            db.query(`UPDATE role SET department_id=${deptID} WHERE subdept="${answer.whichSD}";`, (err, res)=>{
                                                if(err){throw err}
                                            })
                                            console.log(col.important(`${answer.whichSD} has been reassigned to the ${ans.add} department.`))
                                            inquirer.prompt({name:'another', type:'list', choices:['Reassign', 'Create', 'Done'], message:'Do you need to reassign or create any more work areas?'}).then(ans=>{
                                                if(ans.another==='Reassign'){
                                                    reassignSD();
                                                }
                                                if(ans.another==='Create'){
                                                    createSD();
                                                }
                                                if(ans.another==='Done'){
                                                    dispDept()
                                                    setTimeout(()=>{ 
                                                        whatNow();
                                                    }, 1000);
                                                }
                                            })                                     
                                        }
                                    })
                                }
                                if(ans.choice==='Reassign existing work area'){
                                    reassignSD();
                                }
                                if(ans.choice==='Create new work area(s)'){
                                    createSD();
                                }
                            }
                            
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
                                const deptID = res[0].id;
                                if((ans.subdeptCov==='This role has no particular work area')||(ans.subdeptCov==='This role could be assigned to multiple work areas')){
                                    db.query(`INSERT INTO role (title, salary, department_id, subdept) VALUES (?, ?, ?, ?)`, [ans.title, ans.salary, deptID, null], (err, result)=>{
                                        if(err){throw err}
                                    });
                                    ques.roleChoices.push(ans.title)
                                    if(ans.subdeptCov==='This role has no particular work area'){
                                        ques.noSDRoles.push(ans.title)
                                    }
                                    if(ans.subdeptCov==='This role could be assigned to multiple work areas'){
                                        ques.multSDRoles.push(ans.title)
                                    }
                                }
                                if(ans.subdeptCov==='This role is only assigned to one work area'){
                                    inquirer.prompt({name:'whichSD', type:'list', choices: [...ques.subDeptChoices], message: 'Which work area should this role always be assigned to?'}).then(response=>{
                                        db.query(`INSERT INTO role (title, salary, department_id, subdept) VALUES (?, ?, ?, ?)`, [ans.title, ans.salary, deptID, response.whichSD], (err, result)=>{
                                            if(err){throw err}
                                            db.query(`SELECT title AS \'Job Title\', salary AS Pay, department.name AS Department FROM role JOIN department ON department_id=department.id;`, (err, res, fields)=>{
                                                console.table(res);
                                                console.log(`Job of "${ans.title}" has been added.`.bold);
                                                ques.roleChoices.push(ans.title)
                                                whatNow();
                                            })
                                        });
                                        ques.singleSDRoles.push(ans.title);
                                    })
                                }
                      
                            
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
                    db.query(`SELECT last_name, first_name FROM employee WHERE last_name="${ans.lastName}"`, (err, res, fields)=>{
                        // console.log(`res: ${res[0].first_name} ${res[0].last_name}`)
                        if(res[0]){
                            if (`${res[0].first_name} ${res[0].last_name}`===`${ans.firstName} ${ans.lastName}`){
                                console.log(`${col.oops(`There is already an employee named "${ans.firstName} ${ans.lastName}" in the database. \nIf you intend to add a second employee who has the same name, \nplease try entering the employee again and INCLUDE MIDDLE INITIAL WHEN ENTERING FIRST NAME, \ne.g. first: Barbara D. last: Smithe.`)}`);
                                whatNow();
                            }
                        } else{
                            console.log('single',(ques.singleSDRoles.filter(role=>role===ans.nERole)).length);
                            if((ques.singleSDRoles.filter(role=>role===ans.nERole)).length>0){
                                console.log('its in there');
                                console.log(ans.nERole)
                                let roleID;
                                let subdeptID;
                                let managerID;
                                db.query(`SELECT id, subdept FROM role WHERE title="${ans.nERole}"`, (err, res)=>{
                                    console.log('Res',res)
                                    if(err){throw err}
                                    roleID=res[0].id;
                                    console.log('roleID',roleID)
                                    db.query(`SELECT id FROM subdept WHERE name="${res[0].subdept}"`, (err, result)=>{
                                        subdeptID=result[0].id;
                                        console.log('subdeptID', subdeptID);
                                       
                                        db.query(`SELECT id FROM employee WHERE role_id=3 AND subdept_id="${subdeptID}"`, (err, response)=>{
                                            if(err){throw err}
                                            managerID=response[0].id;
                                            console.log('managerID',managerID);
                                            db.query(`INSERT INTO employee (first_name, last_name, role_id, subdept_id, manager_id) VALUES (?, ?, ?, ?, ?)`, [ans.firstName, ans.lastName, roleID, subdeptID, managerID], (err, result)=>{
                                                if(err){throw err}
                                                const staffName2 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                                const manName2 = 'man_tb.last_name, \', \', man_tb.first_name';
                                                db.query(`SELECT staff_tb.id AS EID, (CONCAT(${staffName2})) AS \'Name (last, first)\', title AS \'Job Title\', IFNULL(subdept.name, \'N/A\') AS \'Work Area\', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName2}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id ORDER BY staff_tb.last_name ASC;`, (err, res, fields)=>{
                                                    console.table(res);
                                                    console.log(`${ans.firstName} ${ans.lastName} has been added.`.bold);
                                                    whatNow();
                                                })

                                            })
                                        })
                                    })
                                   
                                })
                            }
                            console.log('multi',(ques.multSDRoles.filter(role=>role===ans.nERole)).length)
                            if((ques.multSDRoles.filter(role=>role===ans.nERole)).length>0){
                                console.log('youre in the multi');
                                db.query(`SELECT id FROM role WHERE title="${ans.nERole}"`, (err, res)=>{
                                    if(err){throw err}
                                    const roleID= res[0].id;
                                    inquirer.prompt({name:'whichSD', type:'list', choices: [...ques.subDeptChoices], message:'Which work area will this employee be working in?'}).then(answer=>{
                                        db.query(`SELECT id FROM subdept WHERE name="${answer.whichSD}";`, (err, res)=>{
                                            if (err){throw err}
                                            const sdID=res[0].id;
                                            db.query(`SELECT id FROM employee WHERE role_id=3 AND subdept_id="${sdID}"`, (err, response)=>{
                                                if(err){throw err}
                                                const manID = response[0].id;
                                                db.query(`INSERT INTO employee (first_name, last_name, role_id, subdept_id, manager_id) VALUES (?, ?, ?, ?, ?)`, [ans.firstName, ans.lastName, roleID, sdID, manID], (err, result)=>{
                                                    if(err){throw err}
                                                    const staffName2 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                                    const manName2 = 'man_tb.last_name, \', \', man_tb.first_name';
                                                    db.query(`SELECT staff_tb.id AS EID, (CONCAT(${staffName2})) AS \'Name (last, first)\', title AS \'Job Title\', IFNULL(subdept.name, \'N/A\') AS \'Work Area\', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName2}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id ORDER BY staff_tb.last_name ASC;`, (err, res, fields)=>{
                                                        console.table(res);
                                                        console.log(`${ans.firstName} ${ans.lastName} has been added.`.bold);
                                                        whatNow();
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            
                              
                      
                                
                            }
                            if((ques.noSDRoles.filter(role=>role===ans.nERole)).length>0){
                                const firstName=ans.firstName;
                                const lastName=ans.lastName
                                db.query(`SELECT id FROM role WHERE title="${ans.nERole}";`, (err, res)=>{
                                    if(err){throw err}
                                    const roleID=res[0].id;
                                    db.query(`INSERT INTO employee (first_name, last_name, role_id, subdept_id, manager_id) VALUES (?, ?, ?, ?, ?)`, [firstName, lastName, roleID, null, 1], (err, result)=>{
                                        if(err){throw err}
                                        const staffName2 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                        const manName2 = 'man_tb.last_name, \', \', man_tb.first_name';
                                        db.query(`SELECT staff_tb.id AS EID, (CONCAT(${staffName2})) AS \'Name (last, first)\', title AS \'Job Title\', IFNULL(subdept.name, \'N/A\') AS \'Work Area\', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName2}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id ORDER BY staff_tb.last_name ASC;`, (err, res, fields)=>{
                                            console.table(res);
                                            console.log(`${firstName} ${lastName} has been added.`.bold);
                                            whatNow();
                                        })

                                    })
                                })
                            }
                        }
                        // if ((ans.newERole='Manager')||(ans.newERole='Horticulturist')||(ans.newERole='Manager')){

                            // db.query(`INSERT INTO employee (first_name, last_name) VALUES (?, ?)`, [ans.firstName, ans.lastName], (err, result)=>{
                            //     if(err){throw err}
                            //     db.query(`SELECT * FROM employee`, (err, res, fields)=>{
                            //         console.table(res);
                            //     })
                            // })
                        // }
                        // {
                        //     name: 'subdept',
                        //     type: 'list',
                        //     choices: areaChoices,
                        //     message: 'What work area will the employee be in?'
                     
                    })   // }
                })
            }
            if (ans.task==='Update an employee'){
                const changeEmployee = eid =>{
                    const EID = eid;
                    inquirer.prompt(ques.editEmpQCont).then(response => {
                        if(response.whichInfo==='Name'){
                            inquirer.prompt({name:'whichName', type:'list', choices:['First', 'Last'], message: 'Which name do you need to change?'}).then(result=>{
                                if(result.whichName==='First'){
                                    inquirer.prompt({name:'newFirst', type:'input', message: 'What is their new first name?'}).then(data=>{
                                        db.query(`UPDATE employee SET first_name=? WHERE id=${EID}`, [data.newFirst], (err, answer)=>{
                                            if(err){throw err}
                                            db.query(`SELECT (CONCAT(last_name, \', \', first_name)) AS Name, id FROM employee WHERE id="${EID}";`, (err, re)=>{
                                                if(err){throw err}
                                                console.table(re);
                                                console.log(`The employee's first name has been updated.`.bold);
                                                whatNow();
                                            });
                                        });

                                    })
                                }
                                if(result.whichName==='Last'){
                                    inquirer.prompt({name:'newLast', type:'input', message: 'What is their new last name?'}).then(data=>{
                                        db.query(`UPDATE employee SET last_name=? WHERE id=${EID}`, [data.newLast], (err, answer)=>{
                                            if(err){throw err}
                                            db.query(`SELECT (CONCAT(last_name, \', \', first_name)) AS Name, id FROM employee WHERE id="${EID}";`, (err, re)=>{
                                                if(err){throw err}
                                                console.table(re);
                                                console.log(`The employee's last name has been updated.`.bold);
                                                whatNow();
                                            })
                                        })
                                    })
                                }
                            })
                        }
                        if(response.whichInfo==='Role'){
                            inquirer.prompt({name:'newRole', type:'list', choices:[...ques.roleChoices], message:'Which role would you like to assign the employee?'}).then(ans=>{
                                const newRole = ans.newRole;
                                if ((ques.multSDRoles.filter(role=>role===ans.newRole)).length>0){
                                    inquirer.prompt({name: 'whichSD', type: 'list', choices: [...ques.subDeptChoices], message: 'Which work area will this employee\'s new role report to?'}).then(ans=>{
                                        db.query(`SELECT id FROM subdept WHERE name="${ans.whichSD}"`, (err, response)=>{
                                            if(err){throw err}
                                            const subDID = response[0].id;
                                            db.query(`SELECT id FROM employee WHERE role_id=3 AND subdept_id=${subDID}`, (err, result)=>{
                                                if(err){throw err}
                                                const manID = result[0].id;
                                                db.query(`SELECT id FROM role WHERE title="${newRole}"`, (err, res)=>{
                                                    if(err){throw err}
                                                    const roleID2 = res[0].id;
                                                    db.query(`UPDATE employee SET role_id=?, subdept_id=?, manager_id=? WHERE id=${EID}`, [roleID2, subDID, manID],(err, answer)=>{
                                                        if(err){throw err}
                                                        const staffName3 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                                        const manName3 = 'man_tb.last_name, \', \', man_tb.first_name';
                                                        db.query(`SELECT (CONCAT(${staffName3})) AS Name, staff_tb.id, role.title AS Role, subdept.name AS 'Work Area', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName3}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id WHERE staff_tb.id="${EID}";`, (err, re)=>{
                                                            if(err){throw err}
                                                            console.table(re);
                                                            console.log(`The employee's role, work area, department, salary, and manager have been updated.`.bold);
                                                            whatNow();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    })
                                } else if((ques.singleSDRoles.filter(role=>role===ans.newRole)).length>0){
                                    db.query(`SELECT subdept FROM role WHERE title="${ans.newRole}"`, (err, res)=>{
                                        if(err){throw err}
                                        db.query(`SELECT id FROM subdept WHERE name="${res[0].subdept}"`, (err, response)=>{
                                            if(err){throw err}
                                            const subDID = response[0].id;
                                            db.query(`SELECT id FROM employee WHERE role_id=3 AND subdept_id=${subDID}`, (err, result)=>{
                                                if(err){throw err}
                                                const manID = result[0].id;
                                                db.query(`SELECT id FROM role WHERE title="${ans.newRole}"`, (err, res)=>{
                                                    if(err){throw err}
                                                    const roleID = res[0].id;
                                                    db.query(`UPDATE employee SET role_id=?, subdept_id=?, manager_id=? WHERE id=${EID}`, [roleID,subDID, manID], (err, answer)=>{
                                                        if(err){throw err}
                                                        const staffName3 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                                        const manName3 = 'man_tb.last_name, \', \', man_tb.first_name';
                                                        db.query(`SELECT (CONCAT(${staffName3})) AS Name, staff_tb.id, role.title AS Role, subdept.name AS 'Work Area', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName3}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id WHERE staff_tb.id="${EID}";`, (err, re)=>{
                                                            if(err){throw err}
                                                            console.table(re);
                                                            console.log(`The employee's role, work area, department, salary, and manager have been updated.`.bold);
                                                            whatNow();
                                                        })
                                                    })
                                                })

                                            })
                                        })
                                    })
                                } else {
                                    db.query(`SELECT id FROM role WHERE title="${ans.newRole}"`, (err, res)=>{
                                        if(err){throw err}
                                        db.query(`UPDATE employee SET role_id=?, subdept_id=null, manager_id=1 WHERE id=${EID}`, [res[0].id],(err, re)=>{
                                            if(err){throw err}
                                            const staffName3 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                            const manName3 = 'man_tb.last_name, \', \', man_tb.first_name';
                                            db.query(`SELECT (CONCAT(${staffName3})) AS Name, staff_tb.id, role.title AS Role, IFNULL(subdept.name, \'N/A\') AS 'Work Area', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName3}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id WHERE staff_tb.id="${EID}";`, (err, re)=>{
                                                if(err){throw err}
                                                console.table(re);
                                                console.log(`The employee's role, work area, department, salary, and manager have been updated.`.bold);
                                                whatNow();
                                            })
                                        })
                                    })
                                }                                
                            })                                      
                        }
                        if(response.whichInfo==='Work Area'){
                            db.query(`SELECT title FROM role JOIN employee ON role.id=role_id WHERE employee.id=${EID}`, (err, res)=>{
                                if(err){throw err}
                                if((ques.multSDRoles.filter(role=>role===res[0].title)).length<1){
                                    console.log(col.oops('This employee\'s role only works in one work area. \nIf the employee\'s role has changed, please choose the \"Role\" option in the \"Update an employee\" menu.\nDuring this process, if their new role may be assigned to more than one work area, \nyou will be asked to select it then.'));
                                    whatNow();
                                } else {
                                    inquirer.prompt({name: 'newWA', type:'list', choices: [...ques.subDeptChoices],  message: 'Which work area would you like to assign this employee to?'}).then(ans=>{
                                        db.query(`SELECT subdept.id AS subdeptID, employee.id AS empID FROM subdept JOIN employee ON subdept.id=subdept_id WHERE subdept.name="${ans.newWA}" AND employee.role_id=3;`, (err, response)=>{
                                            if(err){throw err}
                                            const subDID = response[0].subdeptID;
                                            const manID = response[0].empID;
                                            db.query(`UPDATE employee SET subdept_id=?, manager_id=? WHERE id=${EID}`, [subDID, manID],(err, result)=>{
                                                if(err){throw err}
                                                const staffName3 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                                                const manName3 = 'man_tb.last_name, \', \', man_tb.first_name';
                                                db.query(`SELECT (CONCAT(${staffName3})) AS Name, staff_tb.id, role.title AS Role, subdept.name AS 'Work Area', department.name AS Department, salary AS Pay, IFNULL(CONCAT(${manName3}), \'Top Manager\') AS Manager FROM employee staff_tb LEFT JOIN role ON role_id=role.id LEFT JOIN subdept ON subdept_id=subdept.id LEFT JOIN department ON IFNULL(subdept.department_id=department.id, role.department_id=department.id) LEFT JOIN employee man_tb ON staff_tb.manager_id=man_tb.id WHERE staff_tb.id="${EID}";`, (err, re)=>{
                                                    if(err){throw err}
                                                    console.table(re);
                                                    console.log(`The employee's work area has been updated.`.bold);
                                                    whatNow();
                                                })
                                            })
                                        })
                                    })
                                }
                            })
                        }
                        if(response.whichInfo==='Exit'){
                            whatNow()
                        }
                    })
                }
                inquirer.prompt(ques.editEmpQues).then(ans=>{
                    db.query(`SELECT (CONCAT(last_name, \', \', first_name)) AS Name, id FROM employee WHERE last_name="${ans.whichEmpLast}";`, (err, res)=>{
                        if(err){throw err}
                        if(res.length<1){
                            console.log(col.oops(`You entered ${ans.whichEmpLast}. There are no employees in the database with this last name.`));
                            whatNow();
                        } else if(res.length>1){
                            for(let i=0; i<res.length; i++){
                                const emp = {
                                    name: res[i].Name,
                                    id: res[i].id
                                }
                                ques.sameLastName.push(emp);
                            }
                            console.log(ques.sameLastName);
                            if(ques.sameLastName.length>1){
                                inquirer.prompt({name: 'whichEmp', type: 'list', choices: [...ques.sameLastName], message:'which of these employees do you need to edit?'}).then(ans=>{
                                    const eidArr = ques.sameLastName.filter(obj=> {if(obj.name===ans.whichEmp){return obj.id}})
                                    const EID = eidArr[0].id
                                    console.log(`You will be editing ${ans.whichEmp}.`)
                                    console.log(`Their EID is ${EID}`)
                                    // ques.sameLastName = [];
                                    changeEmployee(EID);
                                })
                            }
                        }else{
                            const staffName4 = 'staff_tb.last_name, \', \', staff_tb.first_name';
                            db.query(`SELECT (CONCAT(${staffName4})) AS Name, id AS EDI FROM employee WHERE last_name="${ans.whichEmpLast}";`, (err, re)=>{
                                console.table(res)
                                inquirer.prompt({name: 'confEmp', type: 'confirm', message:'Is this the employee you would like to edit?'}).then(data=>{
                                    if(data.confEmp===true){
                                    changeEmployee(res[0].id)
                                    } else {whatNow()}
                                })
                            })
                        }                     
                    })
                   
                })
            }
            if (ans.task==='Exit the program'){
                console.log(col.makeGreen('Thank you for using Department Connections! Your changes have been saved.'))
                col.addDivide();
                process.exit();
            }
        })
    }
    whatNow();
}



init();
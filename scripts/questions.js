const col = require('./utils')

const deptChoices = ['Admin','Garden Shop','Nursery Center','Education'];

const roleChoices = ['Owner', 'Financial Manager', 'Manager', 'Cashier', 'Yard Crew', 'Horticulturist', 'Seasonal Nursery Staff', 'Education Coordinator'];

const whatNowQues =[{
    name: 'task', 
    type: 'list', 
    choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add a new employee', 'Update an employee role'], 
    message: 'What would you like to do?'
}]

const roleQues = [{
    name: 'title',
    type: 'input',
    message: 'What is the job title?'
},
{
    name: 'salary',
    type: 'number',
    message: `What is the pay for the position? \n ${col.important('*For Admin or Education positions, \n  please enter yearly salary. \n  For all else, please enter hourly rate:')}`
},
{
    name: 'dept',
    type: 'list',
    choices: deptChoices,
    message: `Which department will this role be covered by? \n ${col.important('*All managers, educators, and others who will \n  report directly to the owner \n  should be placed in Admin*')}:`
}];

const newEmpQues = [{
    name: 'firstName',
    type: 'input',
    message: 'What is the new employee\'s first name?'
},
{
    name: 'lastName',
    type: 'input',
    message: 'What is the new employee\'s last name?'
},
{
    name: 'nERole',
    type: 'list',
    choices: roleChoices,
    message: 'What job will the employee hold?'
}];


module.exports = {
    whatNowQues,
    roleQues,
    newEmpQues,
    deptChoices,
    roleChoices
}
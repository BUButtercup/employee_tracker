const col = require('./utils')

const deptChoices = ['Admin','Garden Shop','Nursery Center','Education'];

const subDeptChoices = ['Gift Shop','Hard Goods','Annuals/Perennials','Trees/Shrubs','Water Features/Houseplants'];

const roleChoices = ['Owner', 'Financial Manager', 'Manager', 'Cashier', 'Yard Crew', 'Horticulturist', 'Seasonal Nursery Staff', 'Education Coordinator'];

const noSDRoles = ['Owner', 'Financial Manager', 'Education Coordinator']

const multSDRoles = ['Manager', 'Horticulturist', 'Seasonal Nursery Staff'];

const singleSDRoles = ['Cashier', 'Yard Crew'];

const sameLastName = [];

const whatNowQues =[{
    name: 'task', 
    type: 'list', 
    choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add a new employee', 'Update an employee', 'Exit the program'], 
    message: 'What would you like to do?'
}]

const newDeptQues = [{
    name:'add', 
    type:'input', 
    message:'What is the new department\'s name?'
},
{
    name: 'coverage',
    type: 'confirm',
    message: 'Will the department cover specific work areas?'
},
{
    name: 'choice',
    type: 'list',
    choices: ['Reassign existing work area', 'Create new work area(s)'],
    message: 'Would you like to reassign an existing work area(s), or create a new work area(s)?',
    when: ans => {
        if(ans.coverage){
            return true;
        }
    }
}]

const reassignSDQues = [{
    name: 'whichSD',
    type: 'list',
    choices: [...subDeptChoices, 'Exit the question'],
    message: 'Which work area would you like to reassign?'
}]

const newSDQues =[{
    name: 'subDeptName',
    type: 'input',
    message: 'What is the new work area called?'
},
{
    name: 'another',
    type: 'confirm',
    message: 'Do you need to add another work area?'
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
},
{
    name: 'subdeptCov',
    type: 'list',
    choices: ['This role has no particular work area','This role could be assigned to multiple work areas','This role is only assigned to one work area'],
    message: `Which of the following applies best to this role with regards to work area assignment?`
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

const editEmpQues =[{
    name:'whichEmpLast', 
    type:'input', 
    message:'What is the last name of the employee you need to edit?'
}]

const editEmpQCont = [{
    name:'whichInfo',
    type:'list',
    choices:['Name', 'Role', 'Work Area', 'Exit']
}]

module.exports = {
    whatNowQues,
    newDeptQues,
    reassignSDQues,
    newSDQues,
    roleQues,
    newEmpQues,
    editEmpQues,
    editEmpQCont,
    deptChoices,
    subDeptChoices,
    roleChoices,
    multSDRoles,
    singleSDRoles,
    noSDRoles,
    sameLastName
}
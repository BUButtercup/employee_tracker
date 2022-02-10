const colors = require('colors');

const important = str => {
    return str.yellow.bold;
}

const oops = str => {
    return str.red.bold;
}

const makeGreen = str => {
    return str.green.bold
}

const addDivide = () => {
    console.log(makeGreen('*******************************************************************************************************************************'));
}

module.exports={
    important,
    oops,
    makeGreen,
    addDivide
}
//  4. Constants ---------------------------------------------------------------

const PONY = {};    // declare and initialize object(PONY)
PONY.color = 'blue';    // works
PONY = {color: 'blue'}; // TypeError: Assignment to constant variable.


const PC = [];  // declare and initialize Array(PC)
PC.push('Monitor'); // 
PC.push({price: '70000'});
PC = [];    // TypeError: Assignment to constant variable.
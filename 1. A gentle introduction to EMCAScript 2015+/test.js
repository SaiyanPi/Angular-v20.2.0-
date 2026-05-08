//  4. Constants ---------------------------------------------------------------
const PONY = {};                // declare and initialize object(PONY)
PONY.color = 'blue';            // works
// PONY = {color: 'blue'};      // TypeError: Assignment to constant variable.

const PC = [];                  // declare and initialize Array(PC)
PC.push('Monitor');             // works
PC.push({price: '70000'});
// PC = [];                     // TypeError: Assignment to constant variable.



//  5. Shorthands in object creation ---------------------------------------------
function createPony() {
    const name = 'Rainbow Dash';        // variable
    const color = 'blue';
    return { naam: name, rang: color }; // return object(object property has the same name as variable)
}

function createPc() {
    const name = 'Monitor';
    const company = 'Philips';
    // return { name: name, company: company}
    return {name, company};
}

function createCode() {
    return{
        run: () => {
            console.log('Angular');
        }
    };
}

function createClass() {
    return {
        run() {
            console.log('C#');
        }
    };
}


//  6. Destructuring assignment --------------------------------------------------
// ES5:
// var httpOptions = { timeout: 2000, isCache: true };
// var httpTimeout = httpOptions.timeout;
// var httpCache = httpOptions.isCache;

// ES2015:
var httpOptions = { timeout: 2000, isCache: true };
const { timeout: httpTimeout, isCache: httpCache } = httpOptions;   // we now have variable named 'httpTimeout' and 'httpCache'
// or if the variable name is same as the property
const { timeout, isCache } = httpOptions;   // we now have variable named 'timeout' and 'isCache'

// works with nested objects too
var person = { naam: 'Philip', desc: { umer: 26 } };
const { naam, desc: { umer } } = person;           // we now have a variables named 'naam' and 'umer'
console.log(naam, umer );                          // Philip 26

// works with arrays too
const timeouts = [1000, 2000, 3000];
const [shortTimeout, mediumTimeout] = timeouts;    // we now have variables 'shortTimeout' and 'mediumTimeout'
console.log(shortTimeout, mediumTimeout);          // 1000, 2000


//  9. Classes ----------------------------------------------------------------------
class Pony {
    constructor(color) {
        this.color = color;
    }

        toString() {
        return `${this.color} pony`;
        // see that? It is another cool feature of ES2015, called template literals
        // we'll talk about these quickly!
    }
}

const bluePony = new Pony('blue');
console.log(bluePony.toString()); // blue pony

class Phone {
    constructor (price) {
        this.price = price;
    }
}

class Apple extends Phone {
    constructor (price, color) {
        super(price);           // calling the base class constructor with 'super'
        this.color = color;
    }
}
const apple = new Apple(200, 'gray');
console.log(apple.price);       // 200
console.log(apple.color);       // gray


//  Promise ------------------------------------------------------------------------------
// creating promise 
let p = new Promise(function(resolve, reject) {
    let i = 1+1;
    if(i == 2){
        resolve('success')
    }
    else{
        reject('failed')        
    }
});

// using the promise
p.then(function(message) {
    console.log('This is in the then ' + message);
}).catch(function(message) {
    console.log('This is in the reject ' + message);
})


//  Aroow function --------------------------------------------------------------------
var maxFinder = {
    max: 0,
    find: function (numbers) {
        // let's iterate
        numbers.forEach(function (element) {
            // if the element is greater, set it as the max
            if (element > this.max) {
                this.max = element;
            }
        });
    }
};
maxFinder.find([2, 3, 4]);
// log the result
console.log(maxFinder.max); // expected result 4 but it doesn't work as expected

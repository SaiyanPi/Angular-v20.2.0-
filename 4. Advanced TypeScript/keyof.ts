interface PonyModel {
    name: string;
    color: string;
    speed: number;
}

// get property value function
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const pony1: PonyModel = {
    name: "Rainbow Dash",
    color: 'Blue',
    speed: 45
};

const nameValue1 = getProperty(pony1, 'name');
console.log(nameValue1); // Rainbow Dash


//-------------------------------- Mapped type ---------------------------------------------


const pony2: Partial<PonyModel> = {
    name: "Blue Bird"
}

const nameValue2 = getProperty(pony2, 'name');
console.log(nameValue2);    // Blue Bird


//-------------------------------- Readonly ------------------------------------------------


// set property value function for testing
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
    obj[key] = value;
}

const pony3: Readonly<PonyModel> = {
    name: "Yellow Pony",
    color: "Yellow",
    speed: 45
};

// calling a set function to set a new speed value
setProperty(pony3, "speed", 30);   
// ⚠️This does not give error because Readonly<T> is a compile-time type restriction only. It does NOT make
// the object actually immutable at runtime.
// pony3.speed = 30;   // But this will give error


//------------------------------------- Pick -------------------------------------------------


const pony4: Pick<PonyModel, 'name' | 'color'> = {
  name: 'Rainbow Dash',
  color: 'blue',
//   speed: 40  // This will give error
};


//-------------------------------------- Record ---------------------------------------------

 interface FormValue {
    value: string;
    valid: boolean;
}

const pony5: Record<keyof PonyModel, FormValue> = {
    name: { value: 'Black Bolt', valid: true },
    color: { value: 'Black', valid: true },
    speed: { value: '45', valid: true }
};

const nameValue5 = getProperty(pony5, 'name');
console.log(nameValue5);    // { value: 'Black Bolt', valid: true }
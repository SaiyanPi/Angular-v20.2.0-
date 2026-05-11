// get property value function
function getProperty(obj, key) {
    return obj[key];
}
var pony1 = {
    name: "Rainbow Dash",
    color: 'Blue',
    speed: 45
};
var nameValue1 = getProperty(pony1, 'name');
console.log(nameValue1); // Rainbow Dash
//-------------------------------- Mapped type ---------------------------------------------
var pony2 = {
    name: "Blue Bird"
};
var nameValue2 = getProperty(pony2, 'name');
console.log(nameValue2); // Blue Bird
//-------------------------------- Readonly ------------------------------------------------
// set property value function for testing
function setProperty(obj, key, value) {
    obj[key] = value;
}
var pony3 = {
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
var pony4 = {
    name: 'Rainbow Dash',
    color: 'blue',
    //   speed: 40  // This will give error
};
var pony5 = {
    name: { value: 'Black Bolt', valid: true },
    color: { value: 'Black', valid: true },
    speed: { value: '45', valid: true }
};
var nameValue5 = getProperty(pony5, 'name');
console.log(nameValue5);

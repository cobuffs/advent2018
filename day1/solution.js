var fs = require('fs');
var steps = fs.readFileSync('input1.txt').toString().split("\n");
var counter = 0;
var map = new Map();
map.set(counter, 1);
// (steps).forEach(step => {
//     var operator = step.charAt(0);
//     var unit = parseInt(step.substring(1));
//     if (operator === '-') counter = counter - unit;
//     if (operator === '+') counter = counter + unit;
//     //check for dupe
// });
var i = 0;
while (true) {
    var step = steps[i];
    var unit = parseInt(step.substring(1));
    var operator = step.charAt(0);
    if (operator === '-') counter = counter - unit;
    if (operator === '+') counter = counter + unit;
    if (map.get(counter) === undefined) map.set(counter, 1);
    else break;
    i = (i+1) % steps.length
}
console.log(counter);
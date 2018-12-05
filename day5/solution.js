var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var fullstring = inputs[0];
var polyarr = fullstring.split('');

var allunits = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
for(var i = 0; i < allunits.length; i++) {
    //copy the poly
    var polycopy = polyarr.slice();
    //remove all instances of the unit from the string (upper and lower) and react it
    var unitlower = allunits[i];
    var unitupper = unitlower.toUpperCase();
    while (polycopy.indexOf(unitlower) != -1){
        //remove it
        polycopy.splice(polycopy.indexOf(unitlower), 1);
    }
    while (polycopy.indexOf(unitupper) != -1) {
        //remove it
        polycopy.splice(polycopy.indexOf(unitupper), 1);
    }
    console.log(unitlower);
    reactpoly(polycopy);
}

console.log('min: ' + min);

function reactpoly(elemarr) {
    var i = 0;
    while(i < elemarr.length - 1) {
        //check current and current + 1
        var chartocheck = elemarr[i];
        var adjchartocheck = elemarr[i+1];
        var move = true;
        if (chartocheck == chartocheck.toLowerCase()){ 
            //lower
            //check for uppercase adjacenrt
            if (chartocheck.toUpperCase() == adjchartocheck) {
                //remove it
                elemarr.splice(i--,2);
                move = false;
                i = i < 0 ? 0 : i;
            }
        } else {
            //upper
            if (chartocheck.toLowerCase() == adjchartocheck) {
                //remove it
                elemarr.splice(i--,2);
                move = false;
                i = i < 0 ? 0 : i;
            }
        }
        if (move) i++;
    }
    console.log(elemarr.length);
    return elemarr;    
}

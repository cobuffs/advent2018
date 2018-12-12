var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
//parse input
var rules = new Map();
var numgen = 20;
var generations = [];
for(var i = 2; i < inputs.length; i++) {
    var inputarr = inputs[i].split(' => ');
    rules.set(inputarr[0],inputarr[1]);
}

//build gen 0
var pots = inputs[0].split(' ')[2].split('');
var activegen = [];
for (var i = 0; i < pots.length; i++) {
    activegen.push(buildpot(i,pots[i]));
}
generations.push(activegen);

//generate
for (var i = 0; i < numgen; i++) {
    var previousgen = generations[i];
    var currentgen = [];
    var numtoadd = 0;
    var fronthandled = false;


    for(var j = 0; j < previousgen.length; j++) {
        var potrule = new Array(5);
        potrule[0] = (j-2) >= 0 ? previousgen[j-2].plant : '.';
        potrule[1] = (j-1) >= 0 ? previousgen[j-1].plant : '.';
        potrule[2] = previousgen[j].plant;
        potrule[3] = (j+1) < previousgen.length ? previousgen[j+1].plant : '.';
        potrule[4] = (j+2) < previousgen.length ? previousgen[j+2].plant : '.';
        var curpot = getpotfromrulearray(previousgen[j].id, potrule);
        
        //handle the front
        if (j == 0 && potrule.join('').substr(0,4) != '....') {
            currentgen.push(buildpot(curpot.id - 2, '.'));
            currentgen.push(buildpot(curpot.id - 1, '.'));
            fronthandled = true;
        } else if (j == 1 && potrule.join('').substr(0,4) != '....' && !fronthandled) {
            //need a plant up front
            currentgen.splice(0,0,buildpot(curpot.id - 2, '.'));
        }

        currentgen.push(curpot);

        //handle the back
        if (j == previousgen.length - 2 && potrule.join('').substr(1) != '....'){
            numtoadd = 1;
        } else if (j == previousgen.length - 1 && potrule.join('').substr(1) != '....') {
            numtoadd = 2;
        }

        //#region shitty
        // if((j < 2 || (j+2) > previousgen.length) && (potrule.join('').substr(0,4) != '....' || potrule.join('').substr(1) != '....')) {
        //     if(j==0) {
        //         //need 2
        //         currentgen.splice(0,0,buildpot(curpot.id - 1, '.'));
        //         currentgenmap.set(curpot.id-1, true);
        //         currentgen.splice(0,0,buildpot(curpot.id - 2, '.'));
        //         currentgenmap.set(curpot.id-2, true);
        //     } else if(j==1 && !currentgenmap.has(curpot.id-2)) {
        //         currentgen.splice(0,0,buildpot(curpot.id - 2, '.'));
        //         currentgenmap.set(curpot.id-2, true);
        //     } 
        //     if(j == previousgen.length - 2) {
        //         numtoadd = 1;

        //     } else if(j == previousgen.length - 1) {
        //         numtoadd = 2;
        //     }
        // }
        //#endregion

    }
    for(var k = 0; k < numtoadd; k++){
        //get last id
        var lastpot = currentgen[currentgen.length-1];
        currentgen.push(buildpot(lastpot.id+1, '.'));
    }
    generations.push(currentgen);
}

var sum = 0;
var plantcount = 0;
var twenty = generations[20];
for(var i = 0; i < twenty.length; i++) {
    sum += twenty[i].plant == '#' ? twenty[i].id : 0;
    plantcount += twenty[i].plant == '#' ? 1 : 0;

}
console.log(sum);
console.log(plantcount);

function getpotfromrulearray(id, rulearr) {
    if (!rules.has(rulearr.join(''))) {
        console.log('uh oh');
        return buildpot(id, '.');
    }
    return buildpot(id, rules.get(rulearr.join('')));
}

function buildpot(id, plant) {
    var pot = {
        "id": id,
        "plant": plant
    };
    return pot
}


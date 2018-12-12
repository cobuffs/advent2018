var fs = require('fs');
var inputs = fs.readFileSync('sample.txt').toString().split("\n");
//parse input
var rules = new Map();
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

//generate!
for(var i = 0; i < 20; i++) {
    //for each pot
    var nextgen = [];
    for(var j = 0; j < activegen.length; j++) {
        var rule = [];
        if (j == 0) {
            //build -1, -2
            //build rule
            rule.push('.');
            rule.push('.');
            rule.push(activegen[j].plant);
            rule.push(activegen[j+1].plant);
            rule.push(activegen[j+2].plant);
            if (rule.join('').substr(0,4) != '....') {
                nextgen.push(buildpot(activegen[j].id - 2, '.'));
                nextgen.push(buildpot(activegen[j].id - 1, '.'));
            }
            //can never recover from '....#' or '.....' so we dont need to add any more neighbors
            nextgen.push(getpotfromrulearray(activegen[j].id,rule));
        } else if (j == 1) {
            //build -2
            rule.push('.');
            rule.push(activegen[j-1].plant)
            rule.push(activegen[j].plant);
            rule.push(activegen[j+1].plant);
            rule.push(activegen[j+2].plant);
            nextgen.push(getpotfromrulearray(activegen[j].id,rule));
        } else if (j > 1 && j < (activegen.length - 2)) {
            //regular
            rule.push(activegen[j-2].plant)
            rule.push(activegen[j-1].plant)
            rule.push(activegen[j].plant);
            rule.push(activegen[j+1].plant);
            rule.push(activegen[j+2].plant);
            nextgen.push(getpotfromrulearray(activegen[j].id,rule));

        } else if (j == (activegen.length - 2)) {
            //build +2
            rule.push(activegen[j-2].plant)
            rule.push(activegen[j-1].plant)
            rule.push(activegen[j].plant);
            rule.push(activegen[j+1].plant);
            rule.push('.');
            nextgen.push(getpotfromrulearray(activegen[j].id,rule));

        } else if (j == (activegen.length - 1)) {
            //build +1, +2
            rule.push(activegen[j-2].plant)
            rule.push(activegen[j-1].plant)
            rule.push(activegen[j].plant);
            rule.push('.');
            rule.push('.');
            nextgen.push(getpotfromrulearray(activegen[j].id,rule));
            //can never recover from #....
            if (rule.join('').substr(1,4) != '....') {
                nextgen.push(buildpot(activegen[j].id + 1, '.'));
                nextgen.push(buildpot(activegen[j].id + 2, '.'));
            }
        } else console.log("BAD LOGIC");
    }
    generations.push(nextgen);
    activegen = nextgen;
}

var sum = 0;
var twenty = generations[20];
for(var i = 0; i < twenty.length; i++) {
    sum += twenty[i].plant == '#' ? twenty[i].id : 0;
}
console.log(sum);

function getpotfromrulearray(id, rulearr) {
    if (!rules.has(rulearr.join(''))) return buildpot(id, '.');
    return buildpot(id, rules.get(rulearr.join('')));
}

function buildpot(id, plant) {
    var pot = {
        "id": id,
        "plant": plant
    };
    return pot
}


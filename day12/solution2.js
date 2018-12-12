var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
//parse input
var rules = new Map();
var numgen = 500000000;
var prevgen = new Map();
var curgen = new Map();
var metadata = [];


for(var i = 2; i < inputs.length; i++) {
    var inputarr = inputs[i].split(' => ');
    rules.set(inputarr[0],inputarr[1]);
}

//build gen 0
var pots = inputs[0].split(' ')[2].split('');
var meta = {
    "gen": 0,
    "sum": 0,
    "count": 0
};

//stub out a bunch of pots
// for(var i = 0; i < 300; i++){
//     curgen.set(i-200,buildpot(i-200,'.'));
// }

for (var i = 0; i < pots.length; i++) {
    curgen.set(i, buildpot(i, pots[i]));
    if(pots[i] == '#') {
        meta.count++;
        meta.sum += i;
    }
}
metadata.push(meta);

for(var i = 0; i < numgen; i++) {
    prevgen = curgen;
    curgen = new Map();

    var meta = {
        "gen": i+1,
        "sum": 0,
        "count": 0
    };
    prevgen.forEach(pot => {
        var potrule = new Array(5);
        potrule[0] = prevgen.has(pot.id-2) ? prevgen.get(pot.id-2).plant : '.';
        potrule[1] = prevgen.has(pot.id-1) ? prevgen.get(pot.id-1).plant : '.';
        potrule[2] = pot.plant;
        potrule[3] = prevgen.has(pot.id+1) ? prevgen.get(pot.id+1).plant : '.';
        potrule[4] = prevgen.has(pot.id+2) ? prevgen.get(pot.id+2).plant : '.';
        if (potrule.join('') != '.....'){
            if (!prevgen.has(pot.id-2)) curgen.set(pot.id-2, buildpot(pot.id - 2, '.'));
            if (!prevgen.has(pot.id-1)) curgen.set(pot.id-1, buildpot(pot.id - 1, '.'));
        }
        if(potrule.join('') != '.....') {
            if (!prevgen.has(pot.id + 2)) {
                curgen.set(pot.id + 2, buildpot(pot.id + 2, '.'));
            }
            if (!prevgen.has(pot.id + 1)) {
                curgen.set(pot.id + 1, buildpot(pot.id + 1, '.'));
            }
        }
        var newpotstate = getpotfromrulearray(pot.id, potrule);
        if(newpotstate.plant == '#') {
            meta.sum += newpotstate.id;
            meta.count++;
        }
        curgen.set(pot.id, newpotstate);
    });
    // metadata.push(meta);
    // if(meta.sum == prevmeta.sum) {
    //     metadata.push(meta);
    //     convergecount++;
    // } else {
    //     metadata = [];
    //     convergecount = 0;
    // }
    if ((i+1) % 1000 == 0) {
        //log every 1000 and look for a pattern
        metadata.push(meta);
        console.log(meta);
    }
    //81k every 1k == 81000 every MM == 81000000 every B == 4,050,000,000 every 50B
}


function buildpot(id, plant) {
    var pot = {
        "id": id,
        "plant": plant
    };
    return pot;
}

function getpotfromrulearray(id, rulearr) {
    if (!rules.has(rulearr.join(''))) {
        console.log('uh oh');
        return buildpot(id, '.');
    }
    return buildpot(id, rules.get(rulearr.join('')));
}
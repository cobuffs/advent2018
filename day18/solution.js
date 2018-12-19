var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var map = new Array(inputs.length);
var plotid = 0;

var mastercounts = new Map();

for(var i = 0; i < inputs.length; i++) {
    var line = inputs[i].split('');
    map[i] = new Array(line.length);
    for(var j = 0; j < line.length; j++){
        //map[i][j] = buildplot(plotid++, line[j], i, j);
        map[i][j] = line[j];
    }
}

//open ground (.), trees (|), or a lumberyard (#)
for(var min = 1; min < 11; min++){
    //stub out the next round each minute
    //printboard();
    var lumberc = 0;
    var treec = 0;
    var openc = 0;
    var updatedmap = new Array(map.length);
    //generate new plots
    for(var i = 0; i < map.length; i++){
        updatedmap[i] = Array.from(map[i]);
        for(var j = 0; j < map[i].length; j++){
            //count adjacent squares
            var plotmap = new Map();
            plotmap.set('|',{"count":0});
            plotmap.set('.',{"count":0});
            plotmap.set('#',{"count":0});
            var updatedplot = updatedmap[i][j];
            //N, NE, NW
            if(i-1>=0) {
                plotmap.get(map[i-1][j]).count++;
                if(j-1>=0) plotmap.get(map[i-1][j-1]).count++;
                if(j+1<map[i].length) plotmap.get(map[i-1][j+1]).count++;
            }
            //W
            if(j-1>=0) plotmap.get(map[i][j-1]).count++;
            //S, SE, SW
            if(i+1 < map.length){
                plotmap.get(map[i+1][j]).count++;
                if(j-1>=0) plotmap.get(map[i+1][j-1]).count++;
                if(j+1<map[i].length) plotmap.get(map[i+1][j+1]).count++;
            }
            //E
            if(j+1<map[i].length) plotmap.get(map[i][j+1]).count++
            
            //An open acre will become filled with trees if three or more adjacent acres contained trees. Otherwise, nothing happens.
            if(updatedplot === '.' && plotmap.get('|').count >= 3) updatedmap[i][j] = '|';
            else if(updatedplot === '|' && plotmap.get('#').count >= 3) updatedmap[i][j] = '#';
            else if(updatedplot === '#') {
                //An acre containing a lumberyard will remain a lumberyard if it was adjacent to at least one other lumberyard and at least one acre containing trees. Otherwise, it becomes open.
                if(plotmap.get('#').count === 0 || plotmap.get('|').count === 0) updatedmap[i][j] = '.';
            }
            if (updatedmap[i][j] === '#') lumberc++;
            else if(updatedmap[i][j] === '.') openc++;
            else treec++;
        }
    }
    mastercounts.set(min,{"lumber":lumberc,"trees":treec,"open":openc});
    if(min % 1000 === 0) console.log("min %s - prod: %s", min, lumberc*treec);

    //update the copys
    map = new Array(updatedmap.length);
    for(var i = 0; i < map.length; i++){
        map[i] = new Array(updatedmap[i]);
        map[i] = Array.from(updatedmap[i]);
    }
}

var counts = mastercounts.get(10);
console.log(counts.lumber * counts.trees);
printboard();


function printboard() {
    var stringout = "\n\n";
    for(var i = 0; i < map.length; i++) {
        for(var j = 0; j < map[i].length; j++){
            stringout += map[i][j];
        }
        stringout += "\n";
    }
    console.log(stringout);
}

function buildplot(id, type, r, c) {
    var plot = {
        "r": r,
        "c": c,
        "type": type,
        "id": id
    };
    return plot
}


var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");

//array of actors (elves and gobbos) with stats
var gobbos = new Map();
var elves = new Map();

//track dead actors
var deadactors = [];
//representation of board state?
var actorcount = 0;
var spacecount = 0;
var validspacecount = 0;
//build the map
var map = new Array(inputs.length);
var mappieces = new Map();

for(var i = 0; i < inputs.length; i ++) {
    var spaces = inputs[i].split('');
    map[i] = [];
    console.log(spaces.length);
    for(var j = 0; j < spaces.length; j++) {
        var space = spaces[j];
        var mappiece = buildspace(spacecount++, (space === 'E' | space === 'G' | space === '.') ? '.' : space, j, i, null);
        //check for actor
        if(space === 'E' || space === 'G'){
            var actor = buildactor(actorcount++, space, mappiece);
            mappiece.actor = actor;
            
        }
        mappieces.set(getspacestring(mappiece), mappiece);
        map[i].push(mappiece);
        process.stdout.write(mappiece.type);
        if(mappiece.type === '.') validspacecount++;
    }
    process.stdout.write("\n");
}

//build field for all actors across the whole grid
gobbos.forEach(gobbo => {
    buildpotential(gobbo);
});

elves.forEach(elf => {
    buildpotential(elf);
});


function buildpotential(actor) {
    //go until all valid spaces have been accounted for
    //wipe it out
    actor.potentialfield = new Map();
    var space = actor.cursquare;
    //start on current space
    var queue = [];
    queue.push(space);
    actor.potentialfield.set(space.x + "," + space.y, 0);
    //seed the queue
    //if the spaces are valid, add them to the queue and to my field
    //check NSEW
    //while the queue has entries in it
    while(queue.length > 0){
        //pop it
        space = queue[0];
        queue.shift();
        var breadth = actor.potentialfield.get(space.x + "," + space.y) + 1;
        //work it
        if(space.y - 1 > 0 && mappieces.get(space.x + "," + (space.y-1)).type === "." && !actor.potentialfield.has(space.x + "," + (space.y-1))) {
            queue.push(mappieces.get(space.x + "," + (space.y-1)));
            actor.potentialfield.set(space.x + "," + (space.y-1), breadth);
        }
        if(space.y + 1 < map.length && mappieces.get(space.x + "," + (space.y+1)).type === "." && !actor.potentialfield.has(space.x + "," + (space.y+1))) {
            queue.push(mappieces.get(space.x + "," + (space.y+1)));
            actor.potentialfield.set(space.x + "," + (space.y+1), breadth);        
        }
        if((space.x + 1) < map[space.y].length && mappieces.get((space.x+1) + "," + space.y).type === "." && !actor.potentialfield.has((space.x+1) + "," + space.y)) {
            queue.push(mappieces.get((space.x+1) + "," + (space.y)));
            actor.potentialfield.set((space.x+1) + "," + (space.y), breadth);        
        }
        if((space.x - 1) > 0 && mappieces.get((space.x-1) + "," + space.y).type === "." && !actor.potentialfield.has((space.x-1) + "," + space.y)) {
            queue.push(mappieces.get((space.x-1) + "," + (space.y)));
            actor.potentialfield.set((space.x-1) + "," + (space.y), breadth);   
        }
    }
}

//start executing turns
printboard();
function printboard(){
    for(var y = 0; y < map.length; y++){
        for (var x = 0; x < map[y].length; x++){
            process.stdout.write((map[y][x].actor != null ? map[y][x].actor.type : map[y][x].type));
        }
        process.stdout.write('\n');
    }
}

function buildactor(id, type, square) {
    var actor = {
        "id": id,
        "type": type,
        "attack": 3,
        "hp": 200,
        "cursquare": square,
        "potentialfield": new Map()
    };
    if(type === "E") elves.set(actor.id, actor);
    if(type === "G") gobbos.set(actor.id, actor);
    return actor;
}

//every actor will have a potential field that it emanates
//#########
// #G123..G#
// #123....#
// #23.....#
// #G..E..G#
// #.......#
// #.......#
// #G..G..G#
// #########

function buildspace(id, type, x, y, actor) {
    var space = {
        "id": id,
        "type": type,
        "x": x,
        "y": y,
        "actor": actor
    };

    return space;
}

function getspacestring(space) {
    return space.x + ',' + space.y;
}

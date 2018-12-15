var fs = require('fs');
var inputs = fs.readFileSync('sample.txt').toString().split("\n");

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
//        process.stdout.write(mappiece.type);
        if(mappiece.type === '.') validspacecount++;
    }
//    process.stdout.write("\n");
}

//build field for all actors across the whole grid
gobbos.forEach(gobbo => {
    buildpotential(gobbo);
});

elves.forEach(elf => {
    buildpotential(elf);
});

// function buildpossiblemovestoward(actor) {
//     actor.possiblemovestoward = new Map();

//     var space = actor.cursquare;
//     //start on current space
//     var queue = [];
//     queue.push(space);
//     actor.possiblemovestoward.set(space.x + "," + space.y, 0);
//     while(queue.length > 0){
//         //pop it
//         space = queue[0];
//         queue.shift();
//         var breadth = actor.possiblemovestoward.get(space.x + "," + space.y) + 1;
//         //a space is only considered if it is unoccupied && mappieces.get(space.x + "," + (space.y+1)).actor == null
//         //work it
//         if(space.y - 1 > 0 && mappieces.get(space.x + "," + (space.y-1)).actor == null && mappieces.get(space.x + "," + (space.y-1)).type === "." && !actor.possiblemovestoward.has(space.x + "," + (space.y-1))) {
//             queue.push(mappieces.get(space.x + "," + (space.y-1)));
//             actor.possiblemovestoward.set(space.x + "," + (space.y-1), breadth);
//         }
//         if(space.y + 1 < map.length && mappieces.get(space.x + "," + (space.y-1)).actor == null && mappieces.get(space.x + "," + (space.y+1)).type === "." && !actor.possiblemovestoward.has(space.x + "," + (space.y+1))) {
//             queue.push(mappieces.get(space.x + "," + (space.y+1)));
//             actor.potentialfield.set(space.x + "," + (space.y+1), breadth);        
//         }
//         if((space.x + 1) < map[space.y].length && mappieces.get((space.x+1) + "," + (space.y)).actor == null &&  mappieces.get((space.x+1) + "," + space.y).type === "." && !actor.possiblemovestoward.has((space.x+1) + "," + space.y)) {
//             queue.push(mappieces.get((space.x+1) + "," + (space.y)));
//             actor.possiblemovestoward.set((space.x+1) + "," + (space.y), breadth);        
//         }
//         if((space.x - 1) > 0 && mappieces.get((space.x-1) + "," + (space.y)).actor == null && mappieces.get((space.x-1) + "," + space.y).type === "." && !actor.possiblemovestoward.has((space.x-1) + "," + space.y)) {
//             queue.push(mappieces.get((space.x-1) + "," + (space.y)));
//             actor.possiblemovestoward.set((space.x-1) + "," + (space.y), breadth);   
//         }
//     }

// }

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
        //a space is only considered if it is unoccupied && mappieces.get(space.x + "," + (space.y+1)).actor == null
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
var round = 0;
//we loop until all enemies are destroyed
while(gobbos.size > 0 && elves.size > 0) {
    round++;
    //need to determine actor order
    var queue = buildturnqueue();
    //pop it, check if they are still alive, then move or attack
    while(queue.length > 0) {
        var actor = queue[0];
        //check if either faction is dead with each queue pop
        if(gobbos.size == 0 || elves.size == 0) break;
        if(actor.hp > 0) {
            //move or attack
            //find nearest enemy
            //check for neighbors - they won't be returned by nearest enemy fields
            var fight = false;
            var enemy = null;
            var N = actor.cursquare.x + "," + (actor.cursquare.y-1);
            var W = (actor.cursquare.x-1) + "," + actor.cursquare.y;
            var E = (actor.cursquare.x+1) + "," + actor.cursquare.y;
            var S = actor.cursquare.x + "," + (actor.cursquare.y+1);
            if(mappieces.has(N) && mappieces.get(N).actor != null && mappieces.get(N).actor.type !== actor.type) {
                //fight!
                fight = true;
                enemy = mappieces.get(N).actor;
            } else if (mappieces.has(W) && mappieces.get(W).actor != null && mappieces.get(W).actor.type !== actor.type){
                fight = true;
                enemy = mappieces.get(W).actor;
            } else if (mappieces.has(E) && mappieces.get(E).actor != null && mappieces.get(E).actor.type !== actor.type){
                fight = true;
                enemy = mappieces.get(E).actor;
            } else if (mappieces.has(S) && mappieces.get(S).actor != null && mappieces.get(S).actor.type !== actor.type){
                fight = true;
                enemy = mappieces.get(S).actor;
            }
            if(fight) {
                enemy.hp = enemy.hp - actor.attack;
                if(enemy.hp < 0){
                    //remove them from the game!
                    if(actor.type === 'E') gobbos.delete(enemy.id);
                    else elves.delete(enemy.id);
                    //remove them from the board
                    enemy.cursquare.actor = null;
                    enemy.cursquare = null;
                    deadactors.push(enemy);
                }
            } else {
                //move
                //find nearest enemy by looking up my coords against all enemy potential fields
                var enemies;
                if(actor.type === 'E') enemies = gobbos;
                else enemies = elves;
                var nearestdist = 1000;
                var nearestenemies = [];
                var currentcoords = actor.cursquare.x + "," + actor.cursquare.y;
                enemies.forEach(enemy => {
                    //look up my coords in their potential
                    //if it doesnt exist that means the path is blocked
                    if (enemy.potentialfield.has(currentcoords)) {
                        var dist = enemy.potentialfield.get(currentcoords);
                        if (dist < nearestdist) {
                            nearestdist = dist;
                            nearestenemies = [];
                            nearestenemies.push(enemy);
                        } else if (dist == nearestdist){
                            nearestenemies.push(enemy);
                        }
                    }
                });
                var nearestenemy = nearestenemies[0];
                for(var i = 1; i < nearestenemies.length; i++){
                    //pick the one with the lowest y. if those are tied, pick the one with the lowest x;
                    if(nearestenemies[i].y < nearestenemy.y) {
                        nearestenemy = nearestenemies[i];
                    } else if (nearestenemies[i].y == nearestenemy.y && nearestenemies[i].x < nearestenemy.x) {
                        nearestenemy = nearestenemies[i];
                    }
                }
                //move closer to it by checking all potential moves to see if it gets you closer
                var newdist = null;
                var newcoord = actor.cursquare.x + "," + actor.cursquare.y;;
                if (nearestenemy.potentialfield.has(N) && (newdist == null || nearestenemy.potentialfield.get(N) < newdist)) {
                    newcoord = N;
                    newdist = nearestenemy.potentialfield.get(N)
                }
                if (nearestenemy.potentialfield.has(W) && (newdist == null || nearestenemy.potentialfield.get(W) < newdist)) {
                    newcoord = W;
                    newdist = nearestenemy.potentialfield.get(W)
                }
                if (nearestenemy.potentialfield.has(E) && (newdist == null || nearestenemy.potentialfield.get(E) < newdist)) {
                    newcoord = E;
                    newdist = nearestenemy.potentialfield.get(E)
                }
                if (nearestenemy.potentialfield.has(S) && (newdist == null || nearestenemy.potentialfield.get(S) < newdist)) {
                    newcoord = S;
                    newdist = nearestenemy.potentialfield.get(S)
                }
                //move!
                //get the space we're going to move to
                var newspace = mappieces.get(newcoord);
                //update the map
                newspace.actor = actor;
                actor.cursquare.actor = null;
                actor.cursquare = newspace;
                //calc my potential field
                buildpotential(actor);

            }
        }
        queue.shift();
    }
    printboard();
    
}

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

function buildturnqueue(){
    var queue = [];
    for(var y = 0; y < map.length; y++){
        for (var x = 0; x < map[y].length; x++){
            if(map[y][x].actor != null) {
                queue.push(map[y][x].actor);
            }
        }
    }
    return queue;
}

function getspacestring(space) {
    return space.x + ',' + space.y;
}

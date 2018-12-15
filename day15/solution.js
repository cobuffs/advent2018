var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");

//array of actors (elves and gobbos) with stats
var gobbos = new Map();
var elves = new Map();
var elfpower = 3;
var gobbopower = 3;
var startinghp = 200;
var simcount = 1;
//track dead actors
var deadactors = [];
//representation of board state?
var actorcount = 0;
var spacecount = 0;
var validspacecount = 0;
//build the map
var map;
var mappieces;
//start executing turns
var roundscompleted = 0;
var currentround = 0;

function reset(){
    elves = new Map();
    gobbos = new Map();
    map = new Array(inputs.length);
    mappieces = new Map();

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
    deadactors = [];
    roundscompleted = 0;
    currentround = 0;

    wipepossibletargets();
    calcfields();

}
//#region "init"


//build field for all actors across the whole grid
calcfields();
//#endregion
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
        var coordstr = space.x + "," + (space.y-1);
        if(space.y - 1 > 0 && mappieces.get(coordstr).type === "." && !actor.potentialfield.has(coordstr)) {
            //if we hit an enemy, add it as a potential combatant along with the distance
            var pieceup = mappieces.get(coordstr);
            if(pieceup.actor !== null) {
                if (pieceup.actor.type !== actor.type) {
                    if (!pieceup.actor.possibletargets.has(actor.id)) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    } else if (pieceup.actor.possibletargets.get(actor.id).dist > breadth) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    }
                }
            } else {
                queue.push(pieceup);
                actor.potentialfield.set(coordstr, breadth);                
            }
        }
        coordstr = space.x + "," + (space.y+1);
        if(space.y + 1 < map.length && mappieces.get(coordstr).type === "." && !actor.potentialfield.has(coordstr)) {
            var pieceup = mappieces.get(coordstr);
            if(pieceup.actor !== null) {
                if (pieceup.actor.type !== actor.type) {
                    if (!pieceup.actor.possibletargets.has(actor.id)) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    } else if (pieceup.actor.possibletargets.get(actor.id).dist > breadth) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    }
                }
            } else {
                queue.push(pieceup);
                actor.potentialfield.set(coordstr, breadth);                
            }
        }
        coordstr = (space.x+1) + "," + space.y;
        if((space.x + 1) < map[space.y].length && mappieces.get(coordstr).type === "." && !actor.potentialfield.has(coordstr)) {
            var pieceup = mappieces.get(coordstr);
            if(pieceup.actor !== null) {
                if (pieceup.actor.type !== actor.type) {
                    if (!pieceup.actor.possibletargets.has(actor.id)) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    } else if (pieceup.actor.possibletargets.get(actor.id).dist > breadth) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    }
                }
            } else {
                queue.push(pieceup);
                actor.potentialfield.set(coordstr, breadth);                
            }
        }
        coordstr = (space.x-1) + "," + space.y;
        if((space.x - 1) > 0 && mappieces.get(coordstr).type === "." && !actor.potentialfield.has(coordstr)) {
            var pieceup = mappieces.get(coordstr);
            if(pieceup.actor !== null) {
                if (pieceup.actor.type !== actor.type) {
                    if (!pieceup.actor.possibletargets.has(actor.id)) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    } else if (pieceup.actor.possibletargets.get(actor.id).dist > breadth) {
                        pieceup.actor.possibletargets.set(actor.id, {"actor":actor, "dist": breadth});
                    }
                }
            } else {
                queue.push(pieceup);
                actor.potentialfield.set(coordstr, breadth);                
            }
        }
    }
}


//we loop until all enemies are destroyed
function simulate(simcount) {
    while(gobbos.size > 0 && elves.size > 0) {
        currentround++;
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
                if(!combat(actor)) {
                    //move
                    //find nearest enemy by looking up my coords against all enemy potential fields
                    var enemies;
                    var nearestdist = 1000;
                    var nearestenemies = [];
                    var currentcoords = actor.cursquare.x + "," + actor.cursquare.y;
                    actor.possibletargets.forEach(target => {
                        if (target.dist < nearestdist) {
                            nearestenemies = [];
                            nearestdist = target.dist;
                            nearestenemies.push(target.actor);
                        } else if (target.dist == nearestdist) {
                            nearestenemies.push(target.actor);
                        }
                    });
                    //freeze if we cant move closer to any enemies
                    if(nearestenemies.length == 0){ 
                        queue.shift();
                        continue;
                    }
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
                    var newcoord = actor.cursquare.x + "," + actor.cursquare.y;
                    var N = actor.cursquare.x + "," + (actor.cursquare.y-1);
                    var W = (actor.cursquare.x-1) + "," + actor.cursquare.y;
                    var E = (actor.cursquare.x+1) + "," + actor.cursquare.y;
                    var S = actor.cursquare.x + "," + (actor.cursquare.y+1);
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
                    wipepossibletargets();
                    calcfields();
                    //fight!!!
                    combat(actor);
                    //calc all potential fields
                }
            }
            queue.shift();
        }
        if(gobbos.size > 0 && elves.size > 0 && queue.length == 0) roundscompleted++;
    }
    var sumofwinners = 0;
    var winners;
    if(gobbos.size > 0) winners = gobbos;
    else winners = elves;
    winners.forEach(survivor => {
        sumofwinners+= survivor.hp;
    });
    console.log("Winner: %s, Rounds: %s, Num Survivors: %s, Survivor Total HP: %s, ATK: %s, Score: %s", gobbos.size > 0 ? 'Goblins!' : 'Elves!', roundscompleted, gobbos.size > 0 ? gobbos.size : elves.size, sumofwinners, elfpower, (roundscompleted)*sumofwinners);

}
//simulate until elves suffer no losses
while(true) {
    reset();
    simulate();
    if(elves.size == 10) break;
    else elfpower++;
}

function printboard(){
    process.stdout.write('########## ROUND ' + currentround + ' ###########\n')
    for(var y = 0; y < map.length; y++){
        for (var x = 0; x < map[y].length; x++){
            process.stdout.write((map[y][x].actor != null ? map[y][x].actor.type : map[y][x].type));
        }
        process.stdout.write('\n');
    }
    process.stdout.write('\n');
}

function buildactor(id, type, square) {
    var actor = {
        "id": id,
        "type": type,
        "attack": type === 'E' ? elfpower : gobbopower,
        "hp": startinghp,
        "cursquare": square,
        "originalspace": square,
        "potentialfield": new Map(),
        "possibletargets": new Map()
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

function sortdist(a, b) {
    return a.dist - b.dist;
}

function calcfields(){
    gobbos.forEach(gobbo => {
        buildpotential(gobbo);
    });
    
    elves.forEach(elf => {
        buildpotential(elf);
    });
}

function wipepossibletargets(){
    gobbos.forEach(gobbo => {
        gobbo.possibletargets = new Map();
    });
    
    elves.forEach(elf => {
        elf.possibletargets = new Map();
    });
}

function combat(actor) {
    var fight = false;
    var enemy = null;
    var N = actor.cursquare.x + "," + (actor.cursquare.y-1);
    var W = (actor.cursquare.x-1) + "," + actor.cursquare.y;
    var E = (actor.cursquare.x+1) + "," + actor.cursquare.y;
    var S = actor.cursquare.x + "," + (actor.cursquare.y+1);
    var targets = [];
    var minhp = 500;
    if(mappieces.has(N) && mappieces.get(N).actor != null && mappieces.get(N).actor.type !== actor.type) {
        //fight!
        fight = true;
        enemy = mappieces.get(N).actor;
        if(enemy.hp < minhp) {
            targets = [];
            minhp = enemy.hp;
            targets.push(enemy);
        } else if (enemy.hp == minhp) targets.push(enemy);
    } 
    if (mappieces.has(W) && mappieces.get(W).actor != null && mappieces.get(W).actor.type !== actor.type){
        fight = true;
        enemy = mappieces.get(W).actor;
        if(enemy.hp < minhp) {
            targets = [];
            minhp = enemy.hp;
            targets.push(enemy);
        } else if (enemy.hp == minhp) targets.push(enemy);
    }
    if (mappieces.has(E) && mappieces.get(E).actor != null && mappieces.get(E).actor.type !== actor.type){
        fight = true;
        enemy = mappieces.get(E).actor;
        if(enemy.hp < minhp) {
            targets = [];
            minhp = enemy.hp;
            targets.push(enemy);
        } else if (enemy.hp == minhp) targets.push(enemy);
    } 
    if (mappieces.has(S) && mappieces.get(S).actor != null && mappieces.get(S).actor.type !== actor.type){
        fight = true;
        enemy = mappieces.get(S).actor;
        if(enemy.hp < minhp) {
            targets = [];
            minhp = enemy.hp;
            targets.push(enemy);
        } else if (enemy.hp == minhp) targets.push(enemy);
    }
    enemy = targets[0];
    if(fight) {
        enemy.hp = enemy.hp - actor.attack;
        if(enemy.hp <= 0){
            //remove them from the game!
            if(actor.type === 'E') gobbos.delete(enemy.id);
            else elves.delete(enemy.id);
            //remove them from the board
            enemy.cursquare.actor = null;
            enemy.cursquare = null;
            deadactors.push(enemy);
            wipepossibletargets();
            calcfields();
            //console.log("%s died in round %s", enemy.type, currentround);
        }
    }
    return fight;
}
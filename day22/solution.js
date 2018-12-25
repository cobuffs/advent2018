// const depth = 11820;
// const targetx = 7;
// const targety = 782;

var _ = require('underscore');

const depth = 510;
const targetx = 10;
const targety = 10;

// 0 - nothing
// 1 - torch
// 2 - climbing

var totalmin = 0;

// The region at 0,0 (the mouth of the cave) has a geologic index of 0.
// The region at the coordinates of the target has a geologic index of 0.
// If the region's Y coordinate is 0, the geologic index is its X coordinate times 16807.
// If the region's X coordinate is 0, the geologic index is its Y coordinate times 48271.
// Otherwise, the region's geologic index is the result of multiplying the erosion levels of the regions at X-1,Y and X,Y-1.
// A region's erosion level is its geologic index plus the cave system's depth, all modulo 20183. Then:

// If the erosion level modulo 3 is 0, the region's type is rocky.
// If the erosion level modulo 3 is 1, the region's type is wet.
// If the erosion level modulo 3 is 2, the region's type is narrow.

var cave = new Map();

var masterid = 0;
var totalrisk = 0;

for (var i = 0; i <= targety+100; i++){
    for(var j = 0; j <= targetx+100; j++) {
        var sq = buildsq(masterid++,j,i);
        cave.set(sq.key, sq);
        totalrisk += sq.type;
    }
}

console.log(totalrisk);
//go down NSEW:0123
//over then down: 2639
//over then down looking one ahead: 2170
//down then over: 2247
//down then over looking one ahead: 2240

//on movement we have to go to a zone that accepts our current tool or swap to the one tool that overlaps
//1. prioritize going closer to target
//2. prioritize staying the same distance from target
//3. prioritize not swapping tools

const maxmin = 2170;


//lets try a depth first search and prioritize based on tool usage then by distance


function simulate() {
    var queue = [];
    var speed = mins;
    var origin = cave.get("0,0");
    queue.push(origin);
    var times = new Map();
    var founnd = false;

    while(queue.length !== 0 && !found && mins < maxmin) {
        var room = queue.shift();
        var N = cave.has(room.x + "," + (room.y-1)) ? cave.get(room.x + "," + (room.y-1)) : null;
        var S = cave.has(room.x + "," + (room.y+1)) ? cave.get(room.x + "," + (room.y+1)) : null;
        var E = cave.has((room.x+1) + "," + (room.y)) ? cave.get((room.x+1) + "," + (room.y)) : null;
        var W = cave.has((room.x-1) + "," + (room.y)) ? cave.get((room.x-1) + "," + (room.y)) : null;


    }
}


function updatetimeforsq(targsq, dir) {
    var newkey = "";
    if (dir === 0) {
        newkey = targsq.x + "," + (targsq.y - 1);
    } else if (dir === 1) {
        newkey = targsq.x + "," + (targsq.y + 1);
    } else if (dir === 2) {
        newkey = (targsq.x + 1) + "," + (targsq.y);
    } else {
        newkey = (targsq.x - 1) + "," + (targsq.y);
    }
    
    var optimaloptions = [0,1,2];
    var curoptions = findtooloptionsforsq(targsq);

    if (cave.has(newkey)) {
        optimaloptions = findtooloptionsforsq(cave.get(newkey));
    }

    var curoptions = _.union(optimaloptions, curoptions);

    if(targsq.type === 0){
        //rocky - can use torch or climbing gear (1 or 2)
        if(curequip === 0) {
            //check next one andd see if we can optimize
            curequip = curoptions[0];
            totalmin += 7;
        }
    } else if (targsq.type === 1) {
        //wet - climbing gear or neither (2 or 0)
        if(curequip === 1) {
            //check next one andd see if we can optimize
            curequip = curoptions[0];
            totalmin += 7;
        }

    } else {
        //narrow - torch or neither (1 or 0)
        if(curequip === 2){
            //check next one andd see if we can optimize
            curequip = curoptions[0];
            totalmin += 7;
        }
    }
    totalmin = totalmin + 1;
}

function getspacetypeswithouttoolchange(curtool) {
    //0 - rocky: 1,2
    //1 - wet: 0,2
    //2 - narrow: 0,1
    if (curtool === 0) return [1,2];
    else if (curtool === 1) return [0,2];
    else return [0,1];
}

function findtooloptionsforsq(sq){
    var options = new Array(2);
    if (sq.type === 0) {
        options[0] = 1;
        options[1] = 2;
    } else if (sq.type === 1) {
        options[0] = 0;
        options[1] = 2;
    } else {
        options[0] = 0;
        options[1] = 1;
    }
    return options;
}

function mdistance(x1,y1,x2,y2)
{
    return Math.abs(x2-x1) + Math.abs(y2-y1);
}

function buildsq (id,x,y) {
    var geo = 0;
    if((x === 0 && y === 0) || (x === targetx && y === targety)){
        geo = 0;
    } else if (y === 0) {
        geo = x * 16807;
    } else if (x === 0) {
        geo = y * 48271;
    } else {
        //erosion levels of the regions at X-1,Y and X,Y-1.
        geo = cave.get(x-1 + "," + y).erosionlevel * cave.get(x + "," + (y-1)).erosionlevel;        
    }

    //geos are always multiples of 20182 [0,407313124]

    //A region's erosion level is its geologic index plus the cave system's depth, all modulo 20183
    //levels are all between 0 and 20182
    var level = (geo + depth) % 20183;

    //types are all between 0 and 2
    var type = level % 3;

    var sq = {
        "id":id,
        "x":x,
        "y":y,
        "key": x + "," + y,
        "type": type,
        "geoindex": geo,
        "erosionlevel": level,
        "disttotarg": mdistance(x,y,targetx,targety),
        "hastarg": targetx === x && targety === y ? true : false
    };

    return sq;
}
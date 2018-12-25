const Graph = require('node-dijkstra');
const route = new Graph();

// const depth = 11820;
// const targetx = 7;
// const targety = 782;

var _ = require('underscore');

const depth = 510;
const targetx = 10;
const targety = 10;


var cave = new Map();

var masterid = 0;
var totalrisk = 0;
var targetid = 0;
var originid = 0;

for (var i = 0; i < targety+100; i++){
    for(var j = 0; j < targetx+100; j++) {
        var sq = buildsq(masterid++,j,i);
        cave.set(sq.key, sq);
        totalrisk += sq.type;
        if(i === targety && j === targetx) originid = sq.id;
    }
}

// 0 - nothing
// 1 - torch
// 2 - climbing

// 0 - rocky - 1,2
// 1 - wet - 0,2
// 2 - narrow - 0,1

//create relationships
for (var i = 0; i < targety+99; i++){
    for(var j = 0; j < targetx+99; j++) {
        var room = cave.get(j + "," + i);
        var N = cave.has(room.x + "," + (room.y-1)) ? cave.get(room.x + "," + (room.y-1)) : null;
        var S = cave.has(room.x + "," + (room.y+1)) ? cave.get(room.x + "," + (room.y+1)) : null;
        var E = cave.has((room.x+1) + "," + (room.y)) ? cave.get((room.x+1) + "," + (room.y)) : null;
        var W = cave.has((room.x-1) + "," + (room.y)) ? cave.get((room.x-1) + "," + (room.y)) : null;
        var roomit = [N,S,E,W];
        if(room.x === 0 && room.y === 0) {
            //only have the torch equipped
            if(E.type === 1) {
                route.addNode("0,0,1",{"1,0,2":8});
            } else {
                route.addNode("0,0,1",{"1,0,1":1});
            }
            if(S.type === 1) {
                route.addNode("0,0,1",{"0,1,2":8});
            } else {
                route.addNode("0,0,1",{"1,0,1":1});
            }
        }
        else {
            var equip = getequipforroom(room);
            for (var r = 0; r < 4; r++) {
                var targroom = roomit[r];
                if (targroom === null) continue;
                var targequip = getequipforroom(targroom);
                for (var v = 0; v < 3; v++) {
                    if (equip.indexOf(v) === -1) continue;
                    var routekey = room.key + "," + v;
                    var targkey = targroom.key + "," + v;
                    if (equip.indexOf(v) > -1 && targequip.indexOf(v) > -1) {
                        //valid for both
                        route.addNode(routekey, {targkey:1});
                    } else {
                        route.addNode(routekey, {targkey:8});
                    }
                }
            }
        }
    }
}
console.log(route.path("0,0,1","1,0,2"));

function getequipforroom(sq){ 
    if (room.type === 0) return [1,2];
    else if (room.type === 1) return [0,2];
    else return [0,1];
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
        "hastarg": targetx === x && targety === y ? true : false
    };

    return sq;
}
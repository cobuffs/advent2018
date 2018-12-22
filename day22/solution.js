const depth = 11820;
const targetx = 7;
const targety = 782;

// const depth = 510;
// const targetx = 10;
// const targety = 10;


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

for (var i = 0; i <= targety; i++){
    for(var j = 0; j <= targetx; j++) {
        var sq = buildsq(masterid++,j,i);
        cave.set(sq.key, sq);
        totalrisk += sq.type;
    }
}

console.log(totalrisk);

function getsqstats (x,y) {}

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

    //A region's erosion level is its geologic index plus the cave system's depth, all modulo 20183
    var level = (geo + depth) % 20183;

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
var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString();

var map = new Map();
var mastersquarecounter = 0;
var minx = 0;
var miny = 0;
var maxx = 0;
var maxy = 0;
var maxdep = 0;
var maxroom = null;
var countofthousands = 0;
const validdirs = ['N', 'S', 'E', 'W'];

//strip out the first character and last character and start building the map
var regex = inputs.substr(1, inputs.length);
//build starting square
var origin = buildroom(mastersquarecounter++);
origin.r = 0;
origin.c = 0;
map.set(origin.r+","+origin.c, origin);
var branchq = [];


//use a FILO queue to store off branches
//when we hit a (, put the previous room on the queue
//when we hit a |, get the room at the end of the queue and use it
//when we hit a ) remove a room from the queue
var dirarr = regex.split('');
var curspace = origin;
for (var i = 0; i < dirarr.length; i++) {
    //grab it and work it
    console.log("Working on %s", i);
    var dir = dirarr[i];
    if (validdirs.indexOf(dir) !== -1) {
        var newroom = buildroom(mastersquarecounter++);
        switch (dir) {
            case 'N':
                curspace.N = newroom;
                //newroom.S = curspace;
                newroom.r = curspace.r - 1;
                newroom.c = curspace.c;
                if (newroom.r < miny) miny = newroom.r;
                break;
            case 'S':
                curspace.S = newroom;
                //newroom.N = curspace;
                newroom.r = curspace.r + 1;
                newroom.c = curspace.c;
                if (newroom.r > maxy) maxy = newroom.r
                break;
            case 'E':
                curspace.E = newroom;
                //newroom.W = curspace;
                newroom.r = curspace.r;
                newroom.c = curspace.c + 1;
                if (newroom.c > maxx) maxx = newroom.c;
                break;
            case 'W':
                curspace.W = newroom;
                //newroom.E = curspace;
                newroom.r = curspace.r;
                newroom.c = curspace.c - 1;
                if (newroom.c < minx) minx = newroom.c;
                break;
                default: break;
        }
        //see if the fucker exists
        if(!map.has(newroom.r+","+newroom.c)){
            newroom.depth = curspace.depth + 1;
            if (newroom.depth > maxdep) {maxdep = newroom.depth; maxroom = newroom;}
            map.set(newroom.r+","+newroom.c, newroom);
            if(newroom.depth >= 1000) countofthousands++;
        }
        curspace = newroom;
    } else if (dir === '|') {
        curspace = branchq[branchq.length - 1];
    } else if (dir === '(') {
        branchq.push(curspace);
    } else if (dir === ')') {
        curspace = branchq.pop();
    }
}

console.log(maxdep);
console.log(countofthousands);
var view = new Array((maxy-miny)*2 + 3);
for(var i = 0; i < view.length; i++) {
    view[i] = new Array((maxx-minx)*2 + 3);
    view[i].fill('#');
}

function buildroom(id) {
    var square = {
        "id": id,
        "depth":0,
        "N": null,
        "S": null,
        "E": null,
        "W": null,
        "r": null,
        "c": null
    };
    return square;
}
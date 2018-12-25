var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var masterdroneid = 0;

var drones = new Map();
var strongest = null;

for(var i = 0; i < inputs.length; i++) {
    //rip out the coords
    var updated = inputs[i].split(">, ");
    var coords = updated[0].substr(5).split(",");
    var range = parseInt(updated[1].substr(2));
    var drone = builddrone(masterdroneid++, coords[0], coords[1], coords[2],range);
    if (strongest === null || drone.range > strongest.range) strongest = drone;
    drones.set(drone.id, drone);
}

var count = 0;
var dronemaxes = [];
var dronemax = 0;

drones.forEach(drone => {
    if(dronedistance(drone, strongest) <= strongest.range) count++;
});

console.log(count);


function builddrone(id,x,y,z,range) {
    var drone = {
        "id":id,
        "x":parseInt(x),
        "y":parseInt(y),
        "z":parseInt(z),
        "numinrange": 0,
        "range":range
    };
    return drone;
}

function countdronesinrange(drone1) {
    var countinrange = 0;
    drones.forEach(drone => {
        if (dronedistance(drone1, drone) <= drone1.range) countinrange++;
    });
    return countinrange;
}

function dronedistance(drone1, drone2) {
    return Math.abs(drone2.x-drone1.x) + Math.abs(drone2.y-drone1.y) + Math.abs(drone2.z-drone1.z);
}
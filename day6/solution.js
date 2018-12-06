var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");

function sortNumber(a, b) {
    return a.distance - b.distance;
}

//build a grid of all coordinates
var knownpoints = new Map();
var i = 0;
var maxx = 0;
var maxy = 0;
(inputs).forEach(input => {
    //kill the space
    input = input.trim();
    //break into [x][y]
    var coords = input.split(',');
    var x = parseInt(coords[0]);
    var y = parseInt(coords[1]);
    knownpoints.set(i, {"id": i++, "x": x, "y": y, "area":0})
    maxx = x > maxx ? x : maxx;
    maxy = y > maxy ? y : maxy;

    //map[x][y] = {"id": i++, "x": x, "y": y, "area":0};
});
//build a grid of every point
var map = new Array(maxx);
for(var i = 0; i < maxx; i++) {
    map[i] = new Array(maxy);
}

//where it isn't a known point check the distance again every known point
//for the shortest distance, log it
var regionsum = 0;
for(var i = 0; i < maxx; i++)
{
    for(var j = 0; j < maxy; j++) {
        if(typeof map[i][j] == 'undefined') {
            distances = [];
            var distsum = 0;
            knownpoints.forEach(point => {
                distances.push({"distance": mdistance(i,j,point.x,point.y), "point": point});
                distsum += mdistance(i,j,point.x,point.y);
            });
            if(distsum < 10000) regionsum++;
            distances.sort(sortNumber);
            var closest = 1;
            var min = distances[0].distance;
            while(closest < distances.length){
                if(distances[closest].distance == min) closest++;
                else break;
            }
            //remove all non cloest
            distances.splice(closest);
            map[i][j] = distances;
        }
    }
}

for(var i = 0; i < maxx; i++) {
    for(var j = 0; j < maxy; j++) {
        var element = map[i][j];
        if (element.length == 1) {
            var pointid = element[0].point.id;
            knownpoints.get(pointid).area++;
        }
    }
}

//bottom
for(var i = 0; i < maxx; i++) {
    var point = map[i][0][0].point;
    knownpoints.delete(point.id);
}
for(var i = 1; i < maxy; i++) {
    var point = map[0][i][0].point;
    knownpoints.delete(point.id);
}
for(var i = 0; i < maxy; i++) {
    var point = map[maxx - 1][i][0].point;
    knownpoints.delete(point.id);
}
for(var i = 1; i < maxx; i++) {
    var point = map[i][maxy-1][0].point;
    knownpoints.delete(point.id);
}

var area = 0;
knownpoints.forEach(points => {
    area += points.area;
});
console.log(regionsum);

console.log(knownpoints);
function mdistance(x1,y1,x2,y2)
{
    return Math.abs(x2-x1) + Math.abs(y2-y1);
}
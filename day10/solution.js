var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var points =[];
var iterations = new Map();
(inputs).forEach(input => {
    var positionx = parseInt(input.substr(10,6));
    var positiony = parseInt(input.substr(18,6));
    var velox = parseInt(input.substr(36,2));
    var veloy = parseInt(input.substr(40,2));

    var point = buildmasterpoint(positionx, positiony, velox, veloy);
    points.push(point);
});


//go to 20000 seconds and see which one has the greatest frequency of xpoints;
for(var i = 0; i < 20000; i++){
    //new iteration
    var iteration = builditeration(i);
    var xfreq = new Map();
    var yfreq = new Map();
    for(var j = 0; j < points.length; j++) {
        var point = points[j];
        //
        var newx = point.x + (i * point.vx);
        var newy = point.y + (i * point.vy);
        var pointatit = buildpoint(newx, newy);
        if(xfreq.has(newx)){
            var xs = xfreq.get(newx);
            xs.push(pointatit);
        } else {
            var xs = [];
            xs.push(pointatit);
            xfreq.set(newx, xs);
        }
        if(yfreq.has(newy)){
            var ys = yfreq.get(newy);
            ys.push(pointatit);
        } else {
            var ys = [];
            ys.push(pointatit);
            yfreq.set(newy, ys);
        }
        iteration.points.push(pointatit);
    }
    iteration.distinctxs = xfreq.size;
    iteration.distinctys = yfreq.size;
    iterations.set(i, iteration);
}

function builditeration(id) {
    var iteration = {
        "id":i,
        "points": [],
        "distinctxs": 0,
        "distinctys": 0
    }
    return iteration;
}

//find the iteration with the fewest xfreq and yfreq
var candidate = iterations.get(0);
iterations.forEach(entry => {
    if(entry.distinctxs <= candidate.distinctxs) {
        candidate = entry;
    }
});

logascsv(candidate);
console.log(candidate.id);
function buildpoint(x,y){
    var point = {
        "x": x,
        "y": y
    };
    return point;
}

function buildmasterpoint(x,y,vx,vy) {
    var point = {
        "x": x,
        "y": y,
        "vx": vx,
        "vy": vy
    };
    //console.log("%s,%s,%s,%s",x,y,vx,vy);
    return point;
}

function logascsv(candidate) {
    for(var i = 0; i < candidate.points.length; i++){
        var x = candidate.points[i].x;
        var y = candidate.points[i].y;
        console.log("%s,%s",x,y);
    }
}
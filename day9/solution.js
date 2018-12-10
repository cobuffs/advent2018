var fs = require('fs');
var input = fs.readFileSync('input.txt').toString();
var inputarr = input.split(" ");
var numplayers = parseInt(inputarr[0]);
var finalpoints = parseInt(inputarr[6]);
var players = new Map();
var marbles = [];
marbles.push(0);
var currentmarble = 0;

for(var i = 1; i <= numplayers; i++) {
    players.set(i, buildelf(i));
}
//test
var i = 1;
var currentplayer = players.get(1);
var highplayer = players.get(1);
for(var i = 1; i <= finalpoints; i++) {
    //log every 1000th iteration
    if(i % 1000 == 0) {
        console.log("iteration: %s",i);
        console.log(highplayer);
    }
    if (i % 23 == 0) {
        //keep the currenet marble and add it to the score
        currentplayer.score += i;
        //remove the marble 7 to the left of the current and add it to score 5->7
        var additionmarble = currentmarble - 7 < 0 ? marbles.length + (currentmarble - 7 ) : currentmarble - 7;
        currentplayer.score += marbles[additionmarble];
        marbles.splice(additionmarble, 1);
        currentmarble = additionmarble;
        if(currentplayer.score > highplayer.score) highplayer = currentplayer;
    } else {
    //place marble
        var startpos = (currentmarble + 1) % marbles.length;
        var endpos = (currentmarble + 1) % marbles.length;
        marbles.splice(startpos+1,0,i);
        currentmarble = startpos + 1;
        //console.log("start: %s, end: %s", startpos, endpos);
        //console.log(marbles);
    }
    currentplayer = players.get((currentplayer.id % numplayers) + 1);
}

console.log(highplayer)

function buildelf(id) {
    var elf = {
        "id": id,
        "score": 0
    }
    return elf;
}
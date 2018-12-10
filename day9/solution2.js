var fs = require('fs');
var input = fs.readFileSync('input.txt').toString();
var inputarr = input.split(" ");
var numplayers = parseInt(inputarr[0]);
var finalmarble = parseInt(inputarr[6])*100;
var players = new Map();
var initialmarble = buildmarble(0);
initialmarble.prev = initialmarble;
initialmarble.next = initialmarble;
var currentmarble = initialmarble;

for(var i = 1; i <= numplayers; i++) {
    players.set(i, buildelf(i));
}
//test
var i = 1;
var currentplayer = players.get(1);
var highplayer = players.get(1);
for(var i = 1; i <= finalmarble; i++) {
    //log every 1000th iteration
    if(i % 1000 == 0) {
        //console.log("iteration: %s",i);
        //console.log(highplayer);
    }
    if (i % 23 == 0) {
        //keep the currenet marble and add it to the score
        currentplayer.score += i;
        //remove the marble 7 to the left of the current and add it to score 5->7
        //var additionmarble = currentmarble - 7 < 0 ? marbles.length + (currentmarble - 7 ) : currentmarble - 7;
        var additionalmarble;
        for(var j = 0; j < 7; j++) {
            additionalmarble = currentmarble.prev;
            currentmarble = additionalmarble;
        }
        currentplayer.score += additionalmarble.val;
        //remove it
        var prevmarble = additionalmarble.prev;
        var nextmarble = additionalmarble.next;

        additionalmarble.prev.next = nextmarble;
        additionalmarble.next.prev = prevmarble;
        additionalmarble = null;
        currentmarble = nextmarble;
        if(currentplayer.score > highplayer.score) highplayer = currentplayer;
    } else {
    //place marble
        var leftmarble = currentmarble.next;
        var rightmarble = currentmarble.next.next;
        var newmarble = buildmarble(i);
        newmarble.prev = leftmarble;
        newmarble.next = rightmarble;
        leftmarble.next = newmarble;
        rightmarble.prev = newmarble;
        currentmarble = newmarble;
        //var startpos = (currentmarble + 1) % marbles.length;
        //var endpos = (currentmarble + 1) % marbles.length;
        //marbles.splice(startpos+1,0,i);
        //currentmarble = startpos + 1;
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

function buildmarble(id){
    var marble = {"val": id, "prev": null, "next": null};
    return marble;
}
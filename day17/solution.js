var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var squareid = 0;
var clays = new Map();
var waterunits = 0;
var minx = 500;
var miny = 100;
var maxx = 0;
var debug = 2000;
//229
var offset = 0;
var maxy = 0;
var instructions = [];
//lets build the board
for (var i = 0; i < inputs.length; i++){
    var line = inputs[i].split(', ');
    //line should always have 2 elements and one will have ..
    var in1 = line[0];
    var in2 = line[1].split('..');
    var xstart = 0;
    var xend = 0
    var ystart;
    var yend = 0;
    if(in1.substr(0,1) === 'x'){
        // has height
        xstart = parseInt(in1.substring(2));
        ystart = parseInt(in2[0].substr(2));
        yend = parseInt(in2[1]);
        xend = xstart;
    } else {
        ystart = parseInt(in1.substring(2));
        xstart = parseInt(in2[0].substr(2));
        xend = parseInt(in2[1]);
        yend = ystart;
    }
    //build all possible points that are made by this entry
    for(var xi = xstart; xi <= xend; xi++) {
        for(var yi = ystart; yi <= yend; yi++){
            var key = xi + "," + yi;
            clays.set(key, true);
        }
    }

    if (xstart < minx) minx = xstart;
    if (yend > maxy) maxy = yend;
    if (xend > maxx) maxx = xend;
    if (ystart < miny) miny = ystart;
}

//build board based on values found above
//y
var board = new Array(maxy + 1);
//expand the board by 1 in every direction
minx = minx-1;
maxx = maxx+1;
maxy = maxy+1;
//need a header row
board[0] = new Array(offset + 1);
for(var i = 0; i < board.length; i++) {
    offset = maxx - minx;
    board[i] = new Array(offset + 1);
    for(var j = 0; j < board[i].length; j++){
        
        var type;
        var x = minx + j;
        var y = i;
        //see if this is a known type of square
        //spout
        if(i === 0 && x === 500) type = '+';
        else{
            if(clays.has(x+","+y)) type = '#';
            else type = '.';
        }
        var square = buildsquare(squareid++,type, x, y, i, j);
        board[i][j] = square;
    }
}



filldown(board[0][500-minx]);
//printboard(debug);

var watercount = 0;
var settleunits = 0;
for(var i = miny; i < board.length; i++) {
    for(var j = 0; j < board[i].length; j++){
        if (board[i][j].type === '|' || board[i][j].type === '~') watercount++;
        if (board[i][j].type === '~') settleunits++;
    }
}

console.log(watercount);
console.log(settleunits);
//water falls until it hits something
//when it hits something it fills while it has a base of water or clay
//if it hits a wall on both sides, it moves up and continues
//if it breaks down the whole process repeats
function filldown(water) {
    if(water.r + 1 >= board.length || water.r + 1 > debug) return;
    var S = board[water.r+1][water.c];
    if(S.type === '|') return;
    else if(S.type === '~') fillbreath(S);
    else if(S.type === '#') {
        fillbreath(water);
        //water.type = '~';
    }
    else {
        S.type = '|';
        filldown(S);
    }
}


function fillbreath(water) {
    //comes in as a drip. flip it
    //printboard();
    //fill E,W until the floor falls out
    if(water.c - 1 < 0 || water.c + 1 >= board[0].length) return;
    if(water.r - 1 < 1 || water.r + 1 >= board.length) return;
    
    var S = board[water.r+1][water.c];
    var W = board[water.r][water.c-1];
    var E = board[water.r][water.c+1];
    var N = board[water.r-1][water.c];

    //for us to accumulate at all, we need a wall on both sides. see if this is the case
    var wend = null;
    var ws = null;
    var eend = null;
    var es = null;

    for(var i = water.c-1; i >= 0; i--) {
        var newW = board[water.r][i];
        var newS = board[water.r+1][i];
        //if we hit a wall we're done
        if(newW.type === '#' || newS.type === '.' || newS.type === '|') {
            wend = newW;
            if((newS.type === '.' || newS.type === '|') && newW.type !== '#') ws = newS;
            break;
        }
    }

    for(var i = water.c+1;i < board[water.r].length; i++) {
        var newE = board[water.r][i];
        var newS = board[water.r+1][i];
        //if we hit a wall we're done
        if(newE.type === '#' || newS.type === '.'|| newS.type === '|') {
            eend = newE;
            if((newS.type === '.' || newS.type === '|' ) && newE.type !== '#') es = newS;
            break;
        }
    }

    if(wend !== null && eend !== null){
        //if ends were ., flip to drips
        for(var i = wend.c+1; i < eend.c; i++) {
            if(es !== null || ws !== null) board[wend.r][i].type = '|';
            else board[wend.r][i].type = '~';
        }
        if (ws !== null) {
            wend.type = '|';
            filldown(wend);
        }
        if (es !== null) {
            eend.type = '|';
            filldown(eend);
        }
        if(ws === null && es === null) fillbreath(N);
    }

    //if both E and W hit a boundary
    //fill the row and go up the drip

    //if we hit a drop, we shouldn't do anything

    //if we hit a hole in the floor, switch to a drop and fill donw


    // var wend = null;
    // var eend = null;
    // water.type = '~';

    // //spread N, W, E
    // //check W
    // for(var i = water.c-1; i >= 0; i--){
    //     var newW = board[water.r][i];
    //     var newS = board[water.r+1][i];
    //     if (newW.type === '#' || newW.type === '|') break;
    //     else if (newS.type === '|') break;
    //     else if (newS.type === '.') {
    //         wend = newW;
    //         newW.type = '|';
    //         break;
    //     } else newW.type = '~';
    // }
    // //check E
    // for(var i = water.c+1; i < board[water.r].length; i++){
    //     var newE = board[water.r][i];
    //     var newS = board[water.r+1][i];
    //     if (newE.type === '#' || newE.type === '|') break;
    //     else if (newS.type === '|') break;
    //     else if (newS.type === '.') {
    //         eend = newE;
    //         newE.type = '|';
    //         break;
    //     } else newE.type = '~';
    // }
    // //go up a level and fill
    // //drip down if im not contained
    // if(eend != null || wend != null) {
    //     if(eend != null) {
    //         filldown(eend);
    //     }
    //     if(wend != null) {
    //         filldown(wend);
    //     }
    // } else if(newE.type === '|' && newW.type === '|') return;
    // else fillbreath(N);
    // return;
}


function printboard(height=board.length) {
    var outstr = '\n\n';
    for(var i = 0; i < board.length && i < height; i++) {
        for(var j = 0; j < board[i].length; j++){
            var sq = board[i][j];
            outstr += sq.type;
        }
        outstr += '\n';
    }
    process.stdout.write(outstr);
}

function buildsquare(id, type, x, y, r, c) {
    var square = {
        "id":id,
        "x": x,
        "y": y,
        "r": r,
        "c": c,
        "type": type
    };
    return square;
}
var fs = require('fs');
var inputs = fs.readFileSync('sample.txt').toString().split("\n");
var squareid = 0;
var clays = new Map();
var waterunits = 0;
var minx = 500;
var maxx = 0;
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

//lets drip some water and see what happens
//#region giving up on recursion for now
// function dripdown(water) {
//     printboard();
//     //if already water, good to go
//     if(water.type === '~') return;
//     //switch to drip
//     water.type = '|';
//     //if i can't move, return
//     if(water.r + 1 > board.length) return;
//     if(water.r < 1) return;
//     var S = board[water.r+1][water.c];
//     var W = board[water.r][water.c-1];
//     var E = board[water.r][water.c+1];
//     var N = board[water.r-1][water.c];
//     // if((S.type === '|' || S.type === '#' || S.type === '~') && (W.type === '|' || W.type === '#' || W.type === '~') && (E.type === '|' || E.type === '#' || E.type === '~')){
//     //     water.type = '~';
//     //     return;
//     // }
//     //water should come in as a board point. look for adjacent points
//     //check down, left, right
//     //first priority is heading down
//     if(S.type !== '#') {
//         //drip
//         dripdown(S);
//     } else {
//         //switch to water and spread
//         water.type = '~';
//         //if i can't move S, try to spready EW
//         if (W.type === '.') dripdown(W);
//         if (E.type === '.') dripdown(E);
//         if (N.type === '|') dripdown(N);
//     }
// }
//#endregion

filldown(board[0][500-minx]);
//printboard();
//count them when we're done
var watercount = 0;
for(var i = 0; i < board.length; i++) {
    for(var j = 0; j < board[i].length; j++){
        if (board[i][j].type === '|' || board[i][j].type === '~') watercount++;
    }
}
    
console.log(watercount);
printboard();
//water falls until it hits something
//when it hits something it fills while it has a base of water or clay
//if it hits a wall on both sides, it moves up and continues
//if it breaks down the whole process repeats
function filldown(water) {
    //printboard();
    //bottom of board
    if(water.r + 1 >= board.length) return;
    //console.log(water);
    var S = board[water.r+1][water.c];

    if(S.type === '#' || S.type === '~') {
        fillbreath(water);
        return;
    }
    else {
        S.type = '|';
        filldown(S);
    }

}

function fillbreath(water) {
    //fill E,W until the floor falls out
    //printboard();
    if(water.c - 1 < 0 || water.c + 1 > board[0].length) return;

    var S = board[water.r+1][water.c];
    var W = board[water.r][water.c-1];
    var E = board[water.r][water.c+1];
    var N = board[water.r-1][water.c];
    var wend = null;
    var eend = null;
    water.type = '~';

    //spread N, W, E
    //check W
    for(var i = water.c-1; i > 0; i--){
        var newW = board[water.r][i];
        var newS = board[water.r+1][i];
        if (newW.type === '#') break;
        else if (newS.type === '.') {
            wend = newW;
            newW.type = '|';
            break;
        } else newW.type = '~';
    }
    //check E
    for(var i = water.c+1; i < board[water.r].length; i++){
        var newE = board[water.r][i];
        var newS = board[water.r+1][i];
        if (newE.type === '#') break;
        else if (newS.type === '.') {
            eend = newE;
            newE.type = '|';
            break;
        } else newE.type = '~';
    }
    //go up a level and fill
    //drip down if im not contained
    if(eend != null || wend != null) {
        if(eend != null) filldown(eend);
        if(wend != null) filldown(wend);
    } else fillbreath(N);
    return;
}


function printboard() {
    var outstr = '\n\n';
    for(var i = 0; i < board.length; i++) {
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
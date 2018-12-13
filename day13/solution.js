var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var tracks = new Map();

//possible characters
// | N,S track
// / N,S,E,W
// - E,W
// \ N,S,E,W
// + intersection
// > cart traveling east
// < cart traveling west
// v cart traveling south
// ^ cart traveling north

var validpieces = ['|','/','\\','-','+','<','>','v','^','X'];

// build the board - we'll take another pass to build the links
var cartid = 0;
var carttracker = new Map();
var ticktracker = [];
for (var i = 0; i < inputs.length; i++){
    var pieces = inputs[i].split('');
    for(var j = 0; j < pieces.length; j++){
        //check for a car
        var piece = pieces[j];
        //check for valid piece
        if(validpieces.indexOf(piece) != -1) {
            var cart = null;
            if(piece == '>' || piece == '<' || piece == 'v' || piece == '^') {
                hascart = true;
                cart = buildcart(cartid++);
                if(piece == '>') {
                    cart.xdir = 1;
                    piece = '-';
                }
                if(piece == '<') {
                    cart.xdir = -1;
                    piece = '-';
                }
                if(piece == 'v') {
                    cart.ydir = 1;
                    piece = '|';
                }
                if(piece == '^') {
                    cart.ydir = -1;
                    piece = '|';
                }
            }
            var square = buildsquare(j,i,piece,cart);
            if (cart != null) {
                cart.square = square;
                carttracker.set(cart.id, cart);
            }
            //add it to the board
            tracks.set(getsquarestring(square), square);
            ticktracker.push(square);
        }
    }
}

//build relationships
//ticktracker already has all valid spaces so use that as iterator
for(var i = 0; i < ticktracker.length; i++) {
    var square = ticktracker[i];
    //ensure pointers work the way we think
    var N = tracks.get(square.x + ',' + (square.y - 1));
    var S = tracks.get(square.x + ',' + (square.y + 1));
    var E = tracks.get((square.x + 1) + ',' + square.y);
    var W = tracks.get((square.x - 1) + ',' + square.y);
    if(square.type == '-') {
        //snag E and W
        square.E = E;
        square.W = W;
    } else if (square.type == '|') {
        square.N = N;
        square.S = S;
    } else if (square.type == '+') {
        square.E = E;
        square.W = W;
        square.N = N;
        square.S = S;        
    } else if (square.type == '\\' || square.type == '/') {
        //need to figure out which border it is
        //       |     or    ---\
        //    1  \--       2    |
        if(square.type == '\\') {
            if(typeof N !== 'undefined' && typeof E !== 'undefined' && (N.type == '+' || N.type == '|') && (E.type == '+' || E.type == '-')){
                //1
                square.N = N;
                square.E = E;
                square.option = 1;
            } else if (typeof S !== 'undefined' && typeof W !== 'undefined' && (S.type == '+' || S.type == '|') && (W.type == '+' || W.type == '-')) {
                //2
                square.S = S;
                square.W = W;
                square.option = 2;
            }
        } else {
            //need to figure out which border it is
            //        |     or    /--
            //    1  -/       2   |
            if(typeof N !== 'undefined' && typeof W !== 'undefined' && (N.type == '+' || N.type == '|') && (W.type == '+' || W.type == '-')){
                //1
                square.N = N;
                square.W = W;
                square.option = 1;
            } else if (typeof S !== 'undefined' && typeof E !== 'undefined' && (S.type == '+' || S.type == '|') && (E.type == '+' || E.type == '-')) {
                //2
                square.S = S;
                square.E = E;
                square.option = 2;
            }            
        }
    }
}

//wait for a collision
var collision = false;
var tick = 0;
while(carttracker.size != 1) {
    //go through every game space and look for a cart.
    //if a cart is found, move it
    //if it hits another cart break!
        //make sure carts only move once each tick
        tick++;
    carttracker.forEach(cart => {cart.hasmoved = false}); 
    for(var i = 0; i < ticktracker.length; i++) {

        var space = ticktracker[i];
        if (space.cart != null && !space.cart.hasmoved) {
            var cart = space.cart;
            var newspacekey = null;
            //figure out what direction to move
            //if i'm on an intersection, change directions
            if(space.type == '+') {
                //figure out car orientation
                //0,1 0,-1 1,0 -1,0
                if(cart.ydir == 1){
                    if(cart.nextturn == 'L') {
                        cart.xdir = 1;
                        cart.ydir = 0;
                        cart.nextturn = 'S';
                    } else if (cart.nextturn == 'S') {
                        cart.nextturn = 'R';
                    } else {
                        cart.xdir = -1;
                        cart.ydir = 0;
                        cart.nextturn = 'L';
                    }
                } else if (cart.ydir == -1) {
                    if(cart.nextturn == 'L') {
                        cart.xdir = -1;
                        cart.ydir = 0;
                        cart.nextturn = 'S';
                    } else if (cart.nextturn == 'S') {
                        cart.nextturn = 'R';
                    } else {
                        cart.xdir = 1;
                        cart.ydir = 0;
                        cart.nextturn = 'L';
                    }
                } else if (cart.xdir == 1) {
                    if(cart.nextturn == 'L') {
                        cart.xdir = 0;
                        cart.ydir = -1;
                        cart.nextturn = 'S';
                    } else if (cart.nextturn == 'S') {
                        cart.nextturn = 'R';
                    } else {
                        cart.xdir = 0;
                        cart.ydir = 1;
                        cart.nextturn = 'L';
                    }
                } else if (cart.xdir == -1) {
                    if(cart.nextturn == 'L') {
                        cart.xdir = 0;
                        cart.ydir = 1;
                        cart.nextturn = 'S';
                    } else if (cart.nextturn == 'S') {
                        cart.nextturn = 'R';
                    } else {
                        cart.xdir = 0;
                        cart.ydir = -1;
                        cart.nextturn = 'L';
                    }
                } else console.log("UH OH");

            } else if(space.type == '\\') {
                if(space.option == 1) {
                    //has N and E
                    //could be going W or S
                    if(cart.xdir == -1) {
                        //turn N
                        cart.xdir = 0;
                        cart.ydir = -1;
                    } else if (cart.ydir == 1) {
                        //turn E
                        cart.xdir = 1;
                        cart.ydir = 0;
                    } else console.log("INVALID MOVE");
                } else {
                    //has S and W
                    if(cart.xdir == 1) {
                        //turn N
                        cart.xdir = 0;
                        cart.ydir = 1;
                    } else if (cart.ydir == -1) {
                        //turn E
                        cart.xdir = -1;
                        cart.ydir = 0;
                    } else console.log("INVALID MOVE");
                }
            } else if(space.type == '/') {
                if(space.option == 1) {
                    //has N and W
                    if(cart.xdir == 1) {
                        //turn N
                        cart.xdir = 0;
                        cart.ydir = -1;
                    } else if (cart.ydir == 1) {
                        //turn E
                        cart.xdir = -1;
                        cart.ydir = 0;
                    } else console.log("INVALID MOVE");

                } else {
                    //has S and E
                    if(cart.xdir == -1) {
                        //turn N
                        cart.xdir = 0;
                        cart.ydir = 1;
                    } else if (cart.ydir == -1) {
                        //turn E
                        cart.xdir = 1;
                        cart.ydir = 0;
                    } else console.log("INVALID MOVE");
                }
            } 
            newspacekey = (cart.xdir + space.x) + ',' + (cart.ydir + space.y);
            var newspace = tracks.get(newspacekey);
            if(typeof newspace == 'undefined') console.log("ERROR");
            if(newspace.cart != null) {
                //remove both carts
                console.log("BANG at tick %s between %s and %s", tick, cart.id, newspace.cart.id);
                carttracker.delete(cart.id);
                carttracker.delete(newspace.cart.id);
                space.cart = null;
                cart.space = null;
                newspace.cart.space = null;
                newspace.cart = null;

            } else {
                newspace.cart = cart;
                cart.square = newspace;
                cart.hasmoved = true;
                space.cart = null;
            }
        }
    }
}

carttracker.forEach(cart => {console.log(getsquarestring(cart.square));});
function buildsquare(x,y,type,cart) {
    return {
        "x": x,
        "y": y,
        "type": type,
        "N": null,
        "S": null,
        "E": null,
        "W": null,
        "option": 1,
        "cart": cart
    };
}

function getsquarestring(square) {
    return square.x + ',' + square.y;
}

// carts go left, straight, right as they hit intersections

function buildcart(id) {
    return {
        "id": id,
        "square": null,
        "xdir":0,
        "ydir":0,
        "hasmoved": false,
        "nextturn": "L" 
    };
}
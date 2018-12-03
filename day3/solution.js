var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
//make giant 2d array
var fabric = create2darray(1500);
var claims = new Map();
//create data structure of all fabrics
(inputs).forEach(input => {
    //break on spaces
    input = input.split(" ");
    var id = input [0];
    //2 = 509,796:
    //3 = 18x15
    var offs = input[2].substr(0, input[2].length-1).split(',');
    //offs = x off, y off
    //dims = width, height
    var dims = input[3].replace(/[\n\r]+/g, '').split('x');
    claims.set(id, {'id':id, 'possible': 'true'});
    for(var i = 0; i < parseInt(dims[0]); i++) {
        for(var j = 0; j < parseInt(dims[1]); j++) {
            var square = fabric[i + parseInt(offs[0])][j + parseInt(offs[1])];
            square.ids.push(id);
        }
    }

});

var counter = 0;
for (var i = 0; i < 1500; i++) {
    for (var j = 0; j < 1500; j++) {
        if (fabric[i][j].ids.length > 1) {
            counter++;
            for(var x = 0; x < fabric[i][j].ids.length; x++) {
                var claim = claims.get(fabric[i][j].ids[x]);
                claim.possible = false;
            }
        }
    }
}

claims.forEach(claim => {
    if(claim.possible) console.log(claim);
});

function create2darray(rows) {
    var arr = new Array(rows);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        for(var j = 0; j < rows; j++) {
            arr[i][j] = 
            {
                'ids':[],
            };
        }
    }
    return arr;
}
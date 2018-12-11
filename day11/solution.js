var gridserial = 1133;
var griddim = 300;
var powergrid = new Array(griddim);
for(var i = 0; i < powergrid.length; i++){
    powergrid[i] = new Array(griddim);
    for(var j = 0; j < powergrid[i].length; j++) {
        powergrid[i][j] = buildcell(i+1,j+1);
    }
}

var maxpowerorigin = powergrid[0][0];
for(var i = 0; i < powergrid.length; i++){
    for (var j = 0; j < powergrid[i].length; j++) {
        var powersum = 0;
        var gridsize = 0;
        var powerorigin = powergrid[i][j];
        // part 1
        // for (var x = 0; x < 3; x++){
        //     for (var y = 0; y < 3; y++){
        //         var cell = powergrid[i+x][j+y];
        //         powersum += cell.powerlevel;
        //     }
        // }

        //max square size is the diff of a x or y to a boundary
        var maxx = griddim - i;
        var maxy = griddim - j;
        var maxsq = maxx < maxy ? maxx : maxy;
        //find the best candidate for this starting point

        //try every square originating at that point
        for (var q = 0; q < maxsq; q++) {
            var qpower = 0;
            for (var x = 0; x < q; x++){
                for (var y = 0; y < q; y++){
                    var cell = powergrid[i+x][j+y];
                    qpower += cell.powerlevel;
                }
            }
            if (qpower > powerorigin.gridtotal) {
                powerorigin.gridsize = q;
                powerorigin.gridtotal = qpower;
            }
        }

        //powerorigin.gridtotal = powersum;
        if(powerorigin.gridtotal > maxpowerorigin.gridtotal) maxpowerorigin = powerorigin;
    }
}

console.log(maxpowerorigin);

function buildcell(x,y) {
    var id = x + 10;
    var cell = {
        "x": x,
        "y": y,
        "id": id,
        "powerlevel": Math.floor(((((id * y) + gridserial) * id) / 100) % 10) - 5,
        "gridtotal": 0,
        "gridsize": 0
    };
    return cell;
}


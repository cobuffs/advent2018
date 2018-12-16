var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var opscodes = new Map();

//execute it in blocks of 3s
for(var i = 0; i < inputs.length; i++){
    var line = inputs[i].split(' ');
    if (line[0] == "Before:") {
        //process them here
        var reg0b = parseInt(line[1].substr(1,1));
        var reg1b = parseInt(line[2].substr(0,1));
        var reg2b = parseInt(line[3].substr(0,1));
        var reg3b = parseInt(line[4].substr(0,1));
        
        var lineafter = inputs[i+2].split(' ');
        var reg0a = parseInt(lineafter[2].substr(1,1));
        var reg1a = parseInt(lineafter[3].substr(0,1));
        var reg2a = parseInt(lineafter[4].substr(0,1));
        var reg3a = parseInt(lineafter[5].substr(0,1));

        var instructions = inputs[i+1].split(' ');
        var opscode = parseInt(instructions[0]);
        var A = parseInt(instructions[1]);
        var B = parseInt(instructions[2]);
        var C = parseInt(instructions[3]);

        var op = {
            "regb":[reg0b,reg1b,reg2b,reg3b],
            "rega": [reg0a,reg1a,reg2a,reg3a],
            "instruction": {
                "A":A,
                "B":B,
                "C":C
            }
        };

        //check if we have hit this op yet
        var val;
        if(opscodes.has(opscode)){
            val = opscodes.get(opscode);
        } else {
            val = {
                "possibleops":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                "ops":[]
            };
        }
        val.ops.push(op);
        opscodes.set(opscode, val);
    }
    //skip for now
    else continue;
}
var mastercount = 0;
var totalcount = 0;
opscodes.forEach(code => {
    //check each of the 16 ops to see if they are valid
    var testops = code.ops;
    totalcount += testops.length;
    for(var i = 0; i < testops.length; i++) {
        var op = testops[i];
        var countofoptions = 0;
        //#region build possibles
        //0:addr (add register) stores into register C the result of adding register A and register B
        if((op.regb[op.instruction.A] + op.regb[op.instruction.B]) == op.rega[op.instruction.C]) {
            //make sure the other registers didn't change
            //create reg copys to compare
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[0] = true;
                countofoptions++;
            }
        }

        //1:addi (add immediate) stores into register C the result of adding register A and value B.
        if((op.regb[op.instruction.A] + op.instruction.B) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[1] = true;
                countofoptions++;
            }
        }

        //2:mulr (multiply register) stores into register C the result of multiplying register A and register B.
        if((op.regb[op.instruction.A] * op.regb[op.instruction.B]) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[2] = true;
                countofoptions++;
            }
        }

        //3:muli (multiply immediate) stores into register C the result of multiplying register A and value B.
        if((op.regb[op.instruction.A] * op.instruction.B) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[3] = true;
                countofoptions++;
            }
        }
        

        //4:banr (bitwise AND register) stores into register C the result of the bitwise AND of register A and register B.
        if((op.regb[op.instruction.A] & op.regb[op.instruction.B]) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[4] = true;
                countofoptions++;
            }
        }

        //5:bani (bitwise AND immediate) stores into register C the result of the bitwise AND of register A and value B.
        if((op.regb[op.instruction.A] & op.instruction.B) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[5] = true;
                countofoptions++;
            }
        }

        //6:borr (bitwise OR register) stores into register C the result of the bitwise OR of register A and register B.
        if((op.regb[op.instruction.A] | op.regb[op.instruction.B]) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[6] = true;
                countofoptions++;
            }
        }

        //7:bori (bitwise OR immediate) stores into register C the result of the bitwise OR of register A and value B.
        if((op.regb[op.instruction.A] | op.instruction.B) == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[7] = true;
                countofoptions++;
            }
        }

        //8:setr (set register) copies the contents of register A into register C. (Input B is ignored.)
        if(op.regb[op.instruction.A] == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[8] = true;
                countofoptions++;
            }
        }

        //9:seti (set immediate) stores value A into register C. (Input B is ignored.)
        if(op.instruction.A == op.rega[op.instruction.C]) {
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[9] = true;
                countofoptions++;
            }
        }

        //10:gtir (greater-than immediate/register) sets register C to 1 if value A is greater than register B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           ((op.instruction.A > op.regb[op.instruction.B] && op.rega[op.instruction.C] == 1) || (op.instruction.A <= op.regb[op.instruction.B] && op.rega[op.instruction.C] == 0))){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[10] = true;
                countofoptions++;
            }
        }
        
        //11:gtri (greater-than register/immediate) sets register C to 1 if register A is greater than value B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           ((op.regb[op.instruction.A] > op.instruction.B && op.rega[op.instruction.C] == 1) || (op.regb[op.instruction.A] <= op.instruction.B && op.rega[op.instruction.C] == 0))){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[11] = true;
                countofoptions++;
            }
        }
        
        //12:gtrr (greater-than register/register) sets register C to 1 if register A is greater than register B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           ((op.regb[op.instruction.A] > op.regb[op.instruction.B] && op.rega[op.instruction.C] == 1) || (op.regb[op.instruction.A] <= op.regb[op.instruction.B] && op.rega[op.instruction.C] == 0))){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[12] = true;
                countofoptions++;
            }
        }

        //13:eqir (equal immediate/register) sets register C to 1 if value A is equal to register B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           (op.instruction.A == op.regb[op.instruction.B] && op.rega[op.instruction.C] == 1)){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[13] = true;
                countofoptions++;
            }
        }
        //14:eqri (equal register/immediate) sets register C to 1 if register A is equal to value B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           (op.rega[op.instruction.A] == op.instruction.B && op.rega[op.instruction.C] == 1)){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[14] = true;
                countofoptions++;
            }
        }
        //15:eqrr (equal register/register) sets register C to 1 if register A is equal to register B. Otherwise, register C is set to 0.
        if((op.rega[op.instruction.C] == 0 || op.rega[op.instruction.C] == 1) && 
           (op.regb[op.instruction.A] == op.regb[op.instruction.B] && op.rega[op.instruction.C] == 1)){
            var regac = op.rega.slice();
            var regbc = op.regb.slice();
            //remove reg C
            regac.splice(op.instruction.C, 1);
            regbc.splice(op.instruction.C, 1);
            if(arraysEqual(regac, regbc)) {
                code.possibleops[15] = true;
                countofoptions++;
            }
        }
        if (countofoptions >= 3) mastercount++;
        //#endregion        
    }
});

function counttrues(arr) {
    var sum = 0;
    for(var i = 0; i < arr.length; i++) {
        if(arr[i]) sum++;
    }
    return sum;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

var opsfuncts = [

];

console.log("3 or more: %s, Total: %s", mastercount,totalcount);
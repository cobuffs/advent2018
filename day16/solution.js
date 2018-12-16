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
//#region debug
var count = new Array(16);
count.fill(0);
//#endregion
opscodes.forEach(code => {
    //check each of the 16 ops to see if they are valid
    var testops = code.ops;
    totalcount += testops.length;
    for(var i = 0; i < testops.length; i++) {
        var op = testops[i];
        var countofoptions = 0;
        //final reg
        var rb = op.regb;
        var ra = op.rega;
        var A = op.instruction.A;
        var B = op.instruction.B;
        var C = op.instruction.C;
        //#region build possibles
        //0:addr (add register) stores into register C the result of adding register A and register B
        if(ra[C] === (rb[A] + rb[B])) {
            //make sure the other registers didn't change
            //create reg copys to compare
            countofoptions += check(0,code,op);
        }

        //1:addi (add immediate) stores into register C the result of adding register A and value B.
        if(ra[C] === (rb[A] + B)) {
            countofoptions += check(1,code,op);
        }

        //2:mulr (multiply register) stores into register C the result of multiplying register A and register B.
        if(ra[C] === (rb[A] * rb[B])) {
            countofoptions += check(2,code,op);
        }

        //3:muli (multiply immediate) stores into register C the result of multiplying register A and value B.
        if(ra[C] === (rb[A] * B)) {
            countofoptions += check(3,code,op);
        }
        
        //4:banr (bitwise AND register) stores into register C the result of the bitwise AND of register A and register B.
        if(ra[C] === (rb[A] & rb[B])) {
            countofoptions += check(4,code,op);
        }

        //5:bani (bitwise AND immediate) stores into register C the result of the bitwise AND of register A and value B.
        if(ra[C] === (rb[A] & B)) {
            countofoptions += check(5,code,op);
        }

        //6:borr (bitwise OR register) stores into register C the result of the bitwise OR of register A and register B.
        if(ra[C] === (rb[A] | rb[B])) {
            countofoptions += check(6,code,op);
        }

        //7:bori (bitwise OR immediate) stores into register C the result of the bitwise OR of register A and value B.
        if(ra[C] === (rb[A] | B)) {
            countofoptions += check(7,code,op);
        }

        //8:setr (set register) copies the contents of register A into register C. (Input B is ignored.)
        if(ra[C] === rb[A]) {
            countofoptions += check(8,code,op);
        }

        //9:seti (set immediate) stores value A into register C. (Input B is ignored.)
        if(ra[C] === A) {
            countofoptions += check(9,code,op);
        }

        //10:gtir (greater-than immediate/register) sets register C to 1 if value A is greater than register B. Otherwise, register C is set to 0.
        if(ra[C] === (A > rb[B] ? 1 : 0)) {
            countofoptions += check(10,code,op);
        }
        
        //11:gtri (greater-than register/immediate) sets register C to 1 if register A is greater than value B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] > B ? 1 : 0)){
            countofoptions += check(11,code,op);
        }
        
        //12:gtrr (greater-than register/register) sets register C to 1 if register A is greater than register B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] > rb[B] ? 1 : 0)) { 
            countofoptions += check(12,code,op);
        }

        //13:eqir (equal immediate/register) sets register C to 1 if value A is equal to register B. Otherwise, register C is set to 0.
        if(ra[C] === (A === rb[B] ? 1 : 0)){
            countofoptions += check(13,code,op);
        }
        //14:eqri (equal register/immediate) sets register C to 1 if register A is equal to value B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] === B ? 1 : 0)){
            countofoptions += check(14,code,op);
        }
        //15:eqrr (equal register/register) sets register C to 1 if register A is equal to register B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] === rb[B] ? 1 : 0)){
            countofoptions += check(15,code,op);
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

function check(opid,code,op) {
    var regac = op.rega.slice();
    var regbc = op.regb.slice();
    //remove reg C
    regac.splice(op.instruction.C, 1);
    regbc.splice(op.instruction.C, 1);
    if(arraysEqual(regac, regbc)) {
        code.possibleops[opid] = true;
        count[opid] = count[opid]+1;
        return 1;
    } else {
        console.log("SHOULD THIS HAPPEN?!");
        return 0;
    }
}

console.log(count);
console.log("3 or more: %s, Total: %s", mastercount,totalcount);
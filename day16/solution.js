var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var opscodes = new Map();
var programsteps = [];
var masterregister = [0,0,0,0];

var opexecs = [  
    (A, B, C) => { masterregister[C] = masterregister[A] + masterregister[B] },
    (A, B, C) => { masterregister[C] = masterregister[A] + B },
    (A, B, C) => { masterregister[C] = masterregister[A] * masterregister[B] },
    (A, B, C) => { masterregister[C] = masterregister[A] * B },
    (A, B, C) => { masterregister[C] = masterregister[A] & masterregister[B] },
    (A, B, C) => { masterregister[C] = masterregister[A] & B },
    (A, B, C) => { masterregister[C] = masterregister[A] | masterregister[B] },
    (A, B, C) => { masterregister[C] = masterregister[A] | B },
    (A, B, C) => { masterregister[C] = masterregister[A] },
    (A, B, C) => { masterregister[C] = A },
    (A, B, C) => { masterregister[C] = A > masterregister[B] ? 1 : 0 },
    (A, B, C) => { masterregister[C] = masterregister[A] > B ? 1 : 0 },
    (A, B, C) => { masterregister[C] = masterregister[A] > masterregister[B] ? 1 : 0 },
    (A, B, C) => { masterregister[C] = A === masterregister[B] ? 1 : 0 },
    (A, B, C) => { masterregister[C] = masterregister[A] === B ? 1 : 0 },
    (A, B, C) => { masterregister[C] = masterregister[A] === masterregister[B] ? 1 : 0 }
];


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
            "rega":[reg0a,reg1a,reg2a,reg3a],
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
                "code": opscode,
                "possibleops":new Array(16),
                "isop":null,
                "ops":[]
            };
        }
        val.ops.push(op);
        opscodes.set(opscode, val);
    }
    //skip for now
    else if (i >= 3238) {
        programsteps.push(line);
    }
}
var mastercount = 0;
var totalcount = 0;
//#region debug
var count = new Array(16);
count.fill(0);
//#endregion
opscodes.forEach(code => {
    //check each of the 16 ops to see if they are valid
    code.possibleops.fill(true);
    var testops = code.ops;
    totalcount += testops.length;
    for(var i = 0; i < testops.length; i++) {
        var op = testops[i];
        var countofoptions = 0;
        //final masterregister
        var rb = op.regb;
        var ra = op.rega;
        var A = op.instruction.A;
        var B = op.instruction.B;
        var C = op.instruction.C;
        //#region build possibles
        //0:addr (add register) stores into register C the result of adding register A and register B
        if(ra[C] === (rb[A] + rb[B])) {
            //make sure the other registers didn't change
            //create masterregister copys to compare
            countofoptions += check(0,code,op);
        } else code.possibleops[0] = false;

        //1:addi (add immediate) stores into register C the result of adding register A and value B.
        if(ra[C] === (rb[A] + B)) {
            countofoptions += check(1,code,op);
        } else code.possibleops[1] = false;

        //2:mulr (multiply register) stores into register C the result of multiplying register A and register B.
        if(ra[C] === (rb[A] * rb[B])) {
            countofoptions += check(2,code,op);
        } else code.possibleops[2] = false;

        //3:muli (multiply immediate) stores into register C the result of multiplying register A and value B.
        if(ra[C] === (rb[A] * B)) {
            countofoptions += check(3,code,op);
        } else code.possibleops[3] = false;
        
        //4:banr (bitwise AND register) stores into register C the result of the bitwise AND of register A and register B.
        if(ra[C] === (rb[A] & rb[B])) {
            countofoptions += check(4,code,op);
        } else code.possibleops[4] = false;

        //5:bani (bitwise AND immediate) stores into register C the result of the bitwise AND of register A and value B.
        if(ra[C] === (rb[A] & B)) {
            countofoptions += check(5,code,op);
        } else code.possibleops[5] = false;

        //6:borr (bitwise OR register) stores into register C the result of the bitwise OR of register A and register B.
        if(ra[C] === (rb[A] | rb[B])) {
            countofoptions += check(6,code,op);
        } else code.possibleops[6] = false;

        //7:bori (bitwise OR immediate) stores into register C the result of the bitwise OR of register A and value B.
        if(ra[C] === (rb[A] | B)) {
            countofoptions += check(7,code,op);
        } else code.possibleops[7] = false;

        //8:setr (set register) copies the contents of register A into register C. (Input B is ignored.)
        if(ra[C] === rb[A]) {
            countofoptions += check(8,code,op);
        } else code.possibleops[8] = false;

        //9:seti (set immediate) stores value A into register C. (Input B is ignored.)
        if(ra[C] === A) {
            countofoptions += check(9,code,op);
        } else code.possibleops[9] = false;

        //10:gtir (greater-than immediate/register) sets register C to 1 if value A is greater than register B. Otherwise, register C is set to 0.
        if(ra[C] === (A > rb[B] ? 1 : 0)) {
            countofoptions += check(10,code,op);
        } else code.possibleops[10] = false;
        
        //11:gtri (greater-than register/immediate) sets register C to 1 if register A is greater than value B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] > B ? 1 : 0)){
            countofoptions += check(11,code,op);
        } else code.possibleops[11] = false;
        
        //12:gtrr (greater-than register/register) sets register C to 1 if register A is greater than register B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] > rb[B] ? 1 : 0)) { 
            countofoptions += check(12,code,op);
        } else code.possibleops[12] = false;

        //13:eqir (equal immediate/register) sets register C to 1 if value A is equal to register B. Otherwise, register C is set to 0.
        if(ra[C] === (A === rb[B] ? 1 : 0)){
            countofoptions += check(13,code,op);
        } else code.possibleops[13] = false;
        //14:eqri (equal register/immediate) sets register C to 1 if register A is equal to value B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] === B ? 1 : 0)){
            countofoptions += check(14,code,op);
        } else code.possibleops[14] = false;
        //15:eqrr (equal register/register) sets register C to 1 if register A is equal to register B. Otherwise, register C is set to 0.
        if(ra[C] === (rb[A] === rb[B] ? 1 : 0)){
            countofoptions += check(15,code,op);
        } else code.possibleops[15] = false;
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
    //remove masterregister C
    regac.splice(op.instruction.C, 1);
    regbc.splice(op.instruction.C, 1);
    if(arraysEqual(regac, regbc)) {
        //code.possibleops[opid] = true;
        count[opid] = count[opid]+1;
        return 1;
    } else {
        console.log("SHOULD THIS HAPPEN?!");
        return 0;
    }
}

//did these on a spreadsheeet :\ - lets try to figure it out programmatically
// // 0	13
// opscodes.get(0).isop = 13;
// // 1	6
// opscodes.get(1).isop = 6;
// // 2	0
// opscodes.get(2).isop = 0;
// // 3	11
// opscodes.get(3).isop = 11;
// // 4	3
// opscodes.get(4).isop = 3;
// // 5	10
// opscodes.get(5).isop = 10;
// // 6	2
// opscodes.get(6).isop = 2;
// // 7	4
// opscodes.get(7).isop = 4;
// // 8	7
// opscodes.get(8).isop = 7;
// // 9	14
// opscodes.get(9).isop = 14;
// // 10	15
// opscodes.get(10).isop = 15;
// // 11	5
// opscodes.get(11).isop = 5;
// // 12	8
// opscodes.get(12).isop = 8;
// // 13	12
// opscodes.get(13).isop = 12;
// // 14	1
// opscodes.get(14).isop = 1;
// // 15	9
// opscodes.get(15).isop = 9;

var upforgrabs = new Array(16);
upforgrabs.fill(1);

while(upforgrabs.reduce(getSum, 0) !== 0){
    //find the opscode with only 1 possibility and claim it
    opscodes.forEach(code => {
        var possibles = [];
        for(var i = 0; i < code.possibleops.length; i++) {
            //false out any that have been claimed already
            if(code.possibleops[i] && upforgrabs[i] === 0) {
                code.possibleops[i] = false;
            } else if (code.possibleops[i] && upforgrabs[i] === 1) {
                possibles.push(i);
            }
        }
        //see if we can claim it
        if (possibles.length === 1) {
            var final = possibles[0];
            code.isop = final;
            upforgrabs[final] = 0;
        }
    });
}

//run the program
for(var i  = 0; i < programsteps.length; i++) {
    programstep = programsteps[i];
    var op = parseInt(programstep[0]);
    var opindex = opscodes.get(op).isop;
    var A = parseInt(programstep[1]);
    var B = parseInt(programstep[2]);
    var C = parseInt(programstep[3]);
    opexecs[opindex](A,B,C);
}

function getSum(total, num) {
    return total + Math.round(num);
}

console.log("3 or more: %s, Total: %s", mastercount,totalcount);
process.stdout.write("Final Register Values: ")
console.log(masterregister);

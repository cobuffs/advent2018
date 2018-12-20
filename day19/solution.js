var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var instructions = [];
//inputs[0] represents the instruction pointer
var boundreg = inputs[0].split(' ')[1];
var instrptr = 0;

masterregister = [1,0,0,0,0,0];
//21102564
//21102564
//111329541292242  x
//111329520189680
//251221
//10802503 x 
//10802516 x
//10802557
//1, 2, 3, 7, 251221
//[sum of factors, current factor working on, number to factor, ?, product between 2 and 5 when it is equaled to 2, we found a factor!, number to try]
//number to try gets multiplied by current factor working on and 
//[ 1, 2, 10551282, 9, 0, 47655 ]
//masterregister = [0,1,10551282,0,0,10551281];

//reg 5 increments reg 1 which increments reg 0
//after 1: [1,2,...]
//10551283

var opmap = new Map();
opmap.set('addr', (A, B, C) => { masterregister[C] = masterregister[A] + masterregister[B]; });
opmap.set('addi', (A, B, C) => { masterregister[C] = masterregister[A] + B; });
opmap.set('mulr', (A, B, C) => { masterregister[C] = masterregister[A] * masterregister[B]; });
opmap.set('muli', (A, B, C) => { masterregister[C] = masterregister[A] * B; });
opmap.set('banr', (A, B, C) => { masterregister[C] = masterregister[A] & masterregister[B]; });
opmap.set('bani', (A, B, C) => { masterregister[C] = masterregister[A] & B; });
opmap.set('borr', (A, B, C) => { masterregister[C] = masterregister[A] | masterregister[B]; });
opmap.set('bori', (A, B, C) => { masterregister[C] = masterregister[A] | B; });
opmap.set('setr', (A, B, C) => { masterregister[C] = masterregister[A]; });
opmap.set('seti', (A, B, C) => { masterregister[C] = A; });
opmap.set('gtir', (A, B, C) => { masterregister[C] = A > masterregister[B] ? 1 : 0; });
opmap.set('gtri', (A, B, C) => { masterregister[C] = masterregister[A] > B ? 1 : 0; });
opmap.set('gtrr', (A, B, C) => { masterregister[C] = masterregister[A] > masterregister[B] ? 1 : 0; });
opmap.set('eqir', (A, B, C) => { masterregister[C] = A === masterregister[B] ? 1 : 0; });
opmap.set('eqri', (A, B, C) => { masterregister[C] = masterregister[A] === B ? 1 : 0; });
opmap.set('eqrr', (A, B, C) => { masterregister[C] = masterregister[A] === masterregister[B] ? 1 : 0; });


for(var i = 1; i < inputs.length; i++){
    var line = inputs[i].split(' ');
    instructions.push(buildop(line[0],line[1],line[2],line[3]));
}

// repeating pattern is: reg 6 is going up by 1 each loop
// ip=3 0,1,10551282,3,0,428060 mulr 1 5 4 ip=4 0,1,10551282,3,428060,428060 
// ip=4 0,1,10551282,4,428060,428060 eqrr 4 2 4 ip=5 0,1,10551282,4,0,428060 
// ip=5 0,1,10551282,5,0,428060 addr 4 3 3 ip=6 0,1,10551282,5,0,428060 
// ip=6 0,1,10551282,6,0,428060 addi 3 1 3 ip=8 0,1,10551282,7,0,428060 
// ip=8 0,1,10551282,8,0,428060 addi 5 1 5 ip=9 0,1,10551282,8,0,428061 
// ip=9 0,1,10551282,9,0,428061 gtrr 5 2 4 ip=10 0,1,10551282,9,0,428061 
// ip=10 0,1,10551282,10,0,428061 addr 3 4 3 ip=11 0,1,10551282,10,0,428061 
// ip=11 0,1,10551282,11,0,428061 seti 2 2 3 ip=3 0,1,10551282,2,0,428061

//lets give ourselves 1k iterations to find a pattern
var counter = 0;
var jump1 = true;
var jump2 = true;
while(instrptr < instructions.length) {

    //track the instr
    //write the instrptr to bound reg
    masterregister[boundreg] = instrptr;
    var desc = "ip=" + instrptr + " " + masterregister + " ";
    //get the instruction and execute it
    var inst = instructions[instrptr];
    desc += opstr(inst);
    opmap.get(inst.op)(inst.A, inst.B, inst.C);
    
    //read it back to ptr and add 1
    instrptr = masterregister[boundreg] + 1;
    desc += " ip=" + instrptr + " " + masterregister + " ";
    //if (masterregister[1] !== 0) console.log(masterregister);
    if (masterregister[5] === 1) console.log(masterregister);
    //if (masterregister[1] !== 2 && masterregister[0] !== 1) console.log(masterregister);;
    

    //console.log(counter + " " + desc);
}

console.log(masterregister[0]);

function buildop(op, A, B, C) {
    var op = {
        "op": op,
        "A": parseInt(A),
        "B": parseInt(B),
        "C": parseInt(C)
    };
    return op;
}

function opstr(op) {
    return op.op + " " + op.A + " " + op.B + " " + op.C;
}
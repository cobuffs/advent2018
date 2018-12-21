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

var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var instructions = [];
//inputs[0] represents the instruction pointer
var boundreg = inputs[0].split(' ')[1];
var instrptr = 0;



for(var i = 1; i < inputs.length; i++){
    var line = inputs[i].split(' ');
    instructions.push(buildop(line[0],line[1],line[2],line[3]));
}
const numlog = 50;

//lets go crazy
for(var i = 0; i < 1;i++) {
    foo = Math.pow(2,i) - 1;
    masterregister = [11592302,0,0,0,0,0];
    var counter = 0;
    var optrail = new Array(numlog);
    var reg1 = 0;
    var changes = 0;
    var lastreg = 0;
    console.log("trying: " + masterregister);
    while(instrptr < instructions.length && counter < 2500) {

        //track the instr
        //write the instrptr to bound reg
        masterregister[boundreg] = instrptr;
        var desc = "#" + counter + " ip=" + instrptr + " " + masterregister + " ";
        //get the instruction and execute it
        var inst = instructions[instrptr];
        desc += opstr(inst);
        opmap.get(inst.op)(inst.A, inst.B, inst.C);
        
        //read it back to ptr and add 1
        instrptr = masterregister[boundreg] + 1;
        desc += " ip=" + instrptr + " " + masterregister + " ";
        //if (masterregister[1] !== 0) console.log(masterregister);
        //if (masterregister[1] !== 2 && masterregister[0] !== 1) console.log(masterregister);;
        console.log(counter + " " + desc);
        //console.log(masterregister);

        //store off last 100 ops
        optrail[counter++%numlog] = desc;
        reg1 = masterregister[1];
        if(reg1 !== lastreg && counter > numlog) {
            changes++;
            lastreg = reg1;
            //printoptrail();
        }
        
    }
}


function printoptrail() {
    //want to start with the counter
    for(var i = 0; i < optrail.length; i++){
        console.log(optrail[(i+counter)%numlog]);
    }
}

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
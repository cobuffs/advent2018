var fs = require('fs');
var inputs = fs.readFileSync('input.txt').toString().split("\n");
var deptree = new Map();
(inputs).forEach(input => {
    var depstep = input.substr(5, 1);
    var steptodo = input.substr(36, 1);
    //build a big tree
    var depstepnode = getormakenode(depstep);
    var steptodonode = getormakenode(steptodo);
    depstepnode.children.push(steptodonode);
    depstepnode.children.sort(sortsteps);
    steptodonode.dependson.push(depstepnode);
    steptodonode.children.sort(sortsteps);
    deptree.set(depstep, depstepnode);
    deptree.set(steptodo, steptodonode);
});

//parse the tree
//find the root node to parse
var readytoprocess = [];
var processed = [];
deptree.forEach(node => {
    if(node.dependson.length == 0) readytoprocess.push(node);
});
readytoprocess.sort(sortsteps);

//define some workers
var workers = new Map();
for(var i = 0; i < 5; i++) {
    var worker = {
        "id": i,
        "workingon":null,
        "timeremaining":0
    }
    workers.set(i, worker);
}

var iteration = 0;
while(processed.length != 26) {
    //how many workers do i have available to work?
    workit();
    var availableworkers = [];
    workers.forEach(worker => {
        if(worker.workingon == null) {
            availableworkers.push(worker);
        }
    });
    //assign work
    for(var i = 0; i < availableworkers.length && readytoprocess.length > 0; i++) {
        var nodetowork = readytoprocess[0];
        availableworkers[i].workingon = nodetowork;
        availableworkers[i].timeremaining = nodetowork.node.charCodeAt(0) - 4;
        console.log("[%s]Assigned %s to %s. It will take %s seconds.", iteration, nodetowork.node, availableworkers[i].id, nodetowork.node.charCodeAt(0) - 4);
        readytoprocess.shift();
    }
    iteration++;
}

console.log(iteration - 1);

function workit() {
    //each worker needs to work
    workers.forEach(worker => {
        if(worker.workingon != null) {
            worker.timeremaining--;
            if(worker.timeremaining == 0) {
                var nodetoprocess = worker.workingon;
                nodetoprocess.processed = true;
                processed.push(nodetoprocess.node);
                //check each kid
                for(var i = 0; i < nodetoprocess.children.length; i++) {
                    var kid = nodetoprocess.children[i];
                    if (checkifreadyforprocessing(kid)) {
                        readytoprocess.push(kid);
                        readytoprocess.sort(sortsteps);
                    }
                }
                //get ready for new work. no breaks!
                worker.workingon = null;
            }
        }
    });
}

function sortsteps(a,b) {
    return a.node < b.node ? -1 : b.node < a.node ? 1 : 0;;
}

function checkifreadyforprocessing(node) {
    //if all my dependson have been processed i'm ready
    var ready = false;
    for(var i = 0; i < node.dependson.length; i++) {
        var parent = node.dependson[i];
        if (!parent.processed) {
            ready = false;
            break;
        } else ready = true;
    }
    return ready;
}

function getormakenode(step) {
    var node = {};
    if(!deptree.has(step)) {
        node = {"node": step, "children":[], "dependson": [], "processed": false};
    } else node = deptree.get(step);
    return node;
}


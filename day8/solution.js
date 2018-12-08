var fs = require('fs');
var input = fs.readFileSync('input.txt').toString();
var inputarr = input.split(' ');

var nodecount = 0;
var arrpointer = 0;
var nodes = [];
var mastermeta = [];
var rootnode = buildnode(nodecount++,parseInt(inputarr[arrpointer++]),parseInt(inputarr[arrpointer++]));

nodes.push(rootnode);
processnode(rootnode);

function processnode(node) {
    var kidcount = node.numberofkids;
    var metacount = node.numberofmetas;
    //kids
    for(var i = 0; i < kidcount; i++){
        //processing a child
        var childnode = buildnode(nodecount++,inputarr[arrpointer++],inputarr[arrpointer++]);
        nodes.push(childnode);
        node.kids.push(childnode);
        processnode(childnode);
    }
    //metas
    for (var j = 0; j < metacount; j++) {
        var metaval = parseInt(inputarr[arrpointer++]);
        node.metadata.push(metaval);
        mastermeta.push(metaval);
    }
}

function getValOfNode(node) {
    //if we have no kids the val is the sum of the metadata entries
    var sum = 0
    if(node.numberofkids == 0) return(node.metadata.reduce(getSum));
    else {
        //walk the pointers to kids and return the val
        for(var i = 0; i < node.metadata.length; i++) {
            var kidindex = node.metadata[i] - 1;
            if(kidindex < node.kids.length){
                sum = sum + parseInt(getValOfNode(node.kids[kidindex]));
            }
        }
    }
    return sum;
}

console.log(mastermeta.reduce(getSum));
console.log(getValOfNode(rootnode));

function buildnode(id, kids, metas) {
    var node = {
        "id": nodecount,
        "numberofkids": kids,
        "numberofmetas": metas,
        "kids": [],
        "metadata":[]
    };
    return node;
}

function getSum(total, num) {
    return total + num;
}
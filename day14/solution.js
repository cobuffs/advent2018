var input = '505961';
var recipes = [];
recipes.push('3');
recipes.push('7');
var numrecipes = 2;
var elf0 = buildelf(0, 0);
var elf1 = buildelf(0, 1);
//var recipestr = "37";
var count = 1;
//part 1
//while(recipes.length <= (input + 9)){
var lastn = "";
while(true) {
    var recipe0 = parseInt(recipes[elf0.pos]);
    var recipe1 = parseInt(recipes[elf1.pos]);
    var sum = recipe0 + recipe1;
    var sumarr = sum.toString().split('');
    for(var i = 0; i < sumarr.length; i++) {
        recipes.push(sumarr[i]);
//        recipestr = recipestr + sumarr[i];
    }
    //move the elfs (elves?)
    elf0.pos = (elf0.pos + 1 + recipe0) % recipes.length;
    elf1.pos = (elf1.pos + 1 + recipe1) % recipes.length;
    // console.log("elf 0: %s, elf 1: %s", elf0.pos, elf1.pos);
    // console.log(recipes);
    
    //look for input
    //var recipestr = recipes.join('');
    // if(count % 10000 == 0) {
    //     console.log("iteration: %s", count);
    // }
    count++;
    
    //track however many digits are in my input
    //var inputstr = input.toString();
    lastn = "";
    for(var i = 0; i < input.length && recipes.length > input.length + 1; i++) {
        lastn = lastn + recipes[recipes.length-input.length-1+i];
    }
    //console.log(lastn);
    if(lastn.substr(0,input.length) == input || lastn.substr(1) == input) break;
}
console.log(count);
//console.log(recipes);
console.log(recipes.join('').substr(recipes.length - 10));
var recipestr = recipes.join('');
console.log(recipestr.indexOf(input));

function buildelf(id, pos) {
    var elf = {
        "id": id,
        "pos": pos
    };
    return elf;
}


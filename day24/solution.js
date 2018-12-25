//cold - 0
//radiation - 1
//slashing - 2
//fire - 3
//bludgeoning - 4

var fs = require('fs');
var control = JSON.parse(fs.readFileSync('input.json', 'utf8'));

var livingimmunity = new Map();
var buff = 0;
var livinginfection = new Map();

while(true) {
    reset();
    var winners = simulate();
    if (winners === 1) break;
    else buff++;
}


function reset() {
    control = JSON.parse(fs.readFileSync('input.json', 'utf8'));
    infection = control.infection;
    immunity = control.immunity;

    infection.sort(sortactors);
    immunity.sort(sortactors);
    
    livingimmunity = new Map();
    for(var i = 0; i < immunity.length; i++){
        //vitamin c!
        var cell = immunity[i];
        cell.atk += buff;
        livingimmunity.set(cell.id, cell);
    }
    
    livinginfection = new Map();
    for(var i = 0; i < infection.length; i++){
        livinginfection.set(infection[i].id, infection[i]);
    }

}

function simulate() {

    var winner = null;
        
    while(livingimmunity.size > 0 && livinginfection.size > 0) {
        var turnorder = [];

        //choose targets
        for(var i = 0; i < infection.length; i++) {
            //make sure i am alive
            var unit = infection[i];
            if(unit.numunits <= 0) continue;
            turnorder.push(unit);
            var targetunits = [];
            var targetdmg = 0;
            //look for the unit that we can maximize damage against and select it if is an option
            livingimmunity.forEach(immacell => {
                var dmg = unit.numunits * unit.atk;
                //is it alive?
                if(immacell.numunits > 0) {
                    //sim damage
                    //check if attack type is in weaknesses of opponent
                    if(immacell.weaknesses.indexOf(unit.atktype) > -1) {
                        //double damage
                        dmg = dmg * 2;
                    } else if (immacell.immunities.indexOf(unit.atktype) > -1) {
                        dmg = 0;
                    }
                    if(dmg === 0) {
                        return;
                    }
                    if (dmg > targetdmg) {
                        targetunits = [];
                        targetunits.push({"target": immacell, "dmg": dmg});
                        targetdmg = dmg;
                    } else if (dmg === targetdmg) {
                        targetunits.push({"target": immacell, "dmg": dmg});
                        targetdmg = dmg;
                    }
                }
            });
            //break ties and choose final target
            if (targetunits.length === 0) {
                unit.currenttarget = null;
                //no valid targets
            } else if (targetunits.length === 1) {
                //1 unit
                unit.currenttarget = targetunits[0];
            } else {
                //choose target with highest effective power followed by highest init
                var highesteffs =  [];
                var highestpwr = 0;
                for (var k = 0; k < targetunits.length; k++) {
                    if(targetunits[k].dmg === 0) break;
                    var targetunit = targetunits[k].target;
                    if((targetunit.atk * targetunit.numunits) === highestpwr) {
                        highesteffs.push(targetunit);
                    } else if ((targetunit.atk * targetunit.numunits) > highestpwr) {
                        hightesteffs = [];
                        highestpwr = (targetunit.atk * targetunit.numunits);
                        highesteffs.push(targetunit);
                    }
                }
                if(highesteffs.length === 1) {
                    unit.currenttarget = {"target":highesteffs[0], "dmg": dmg};
                } else {
                    //if still tied!
                    var highestinits =  [];
                    var highestinit = 0;
                    for (var k = 0; k < highesteffs.length; k++) {
                        var targetunit = highesteffs[k];
                        if((targetunit.atk * targetunit.numunits) === highestinit) {
                            highestinits.push(targetunit);
                        } else if ((targetunit.atk * targetunit.numunits) > highestinit) {
                            highestinits = [];
                            highestinit = (targetunit.atk * targetunit.numunits);
                            highestinits.push(targetunit);
                        }
                    }
                    unit.currenttarget = {"target": highestinits[0], "dmg": dmg};
                }
            }
            if(unit.currenttarget !== null) livingimmunity.delete(unit.currenttarget.target.id);
        }

        for(var i = 0; i < immunity.length; i++) {
            //make sure i am alive
            var unit = immunity[i];
            if(unit.numunits <= 0) continue;
            turnorder.push(unit);
            var targetunits = [];
            var targetdmg = 0;
            //look for the unit that we can maximize damage against and select it if is an option
            livinginfection.forEach(immacell => {
                var dmg = unit.numunits * unit.atk;
                //is it alive?
                if(immacell.numunits > 0) {
                    //sim damage
                    //check if attack type is in weaknesses of opponent
                    if(immacell.weaknesses.indexOf(unit.atktype) > -1) {
                        //double damage
                        dmg = dmg * 2;
                    } else if (immacell.immunities.indexOf(unit.atktype) > -1) {
                        dmg = 0;
                    }
                    if(dmg === 0) {
                        return;
                    }
                    if (dmg > targetdmg) {
                        targetunits = [];
                        targetunits.push({"target": immacell, "dmg": dmg});
                        targetdmg = dmg;
                    } else if (dmg === targetdmg) {
                        targetunits.push({"target": immacell, "dmg": dmg});
                        targetdmg = dmg;
                    }
                }
            });
            //break ties and choose final target
            if (targetunits.length === 0) {
                //no valid targets
            } else if (targetunits.length === 1) {
                //1 unit
                unit.currenttarget = targetunits[0];
            } else {
                //choose target with highest effective power followed by highest init
                var highesteffs =  [];
                var highestpwr = 0;
                var dmg = targetunits[0].dmg;
                for (var k = 0; k < targetunits.length; k++) {
                    var targetunit = targetunits[k].target;
                                    if((targetunit.atk * targetunit.numunits) === highestpwr) {
                        highesteffs.push(targetunit);
                    } else if ((targetunit.atk * targetunit.numunits) > highestpwr) {
                        hightesteffs = [];
                        highestpwr = (targetunit.atk * targetunit.numunits);
                        highesteffs.push(targetunit);
                    }
                }
                if(highesteffs.length === 1) {
                    unit.currenttarget = {"target":highesteffs[0], "dmg": dmg};
                } else {
                    //if still tied!
                    var highestinits =  [];
                    var highestinit = 0;
                    for (var k = 0; k < highesteffs.length; k++) {
                        var targetunit = highesteffs[k];
                        if((targetunit.atk * targetunit.numunits) === highestinit) {
                            highestinits.push(targetunit);
                        } else if ((targetunit.atk * targetunit.numunits) > highestinit) {
                            highestinits = [];
                            highestinit = (targetunit.atk * targetunit.numunits);
                            highestinits.push(targetunit);
                        }
                    }
                    unit.currenttarget = {"target": highestinits[0], "dmg": dmg};
                }
            }
            if(unit.currenttarget !== null) livinginfection.delete(unit.currenttarget.target.id);
        }

        //attack
        turnorder.sort(sortbyinit);
        for(var i = 0; i < turnorder.length; i++) {
            //make sure the target is still alive
            var us = turnorder[i];
            if(us.numunits <= 0) continue;
            if(us.currenttarget === null) continue;
            //lets recalculate dmg just in case we lost some units
            var dmg = us.numunits * us.atk;
            var them = us.currenttarget.target;
            if(them.weaknesses.indexOf(us.atktype) > -1) {
                //double damage
                dmg = dmg * 2;
            } 
            //calculate the losses
            var numlosses = Math.floor(dmg / them.hps);
            them.numunits -= numlosses;
        }

        //rebuild with survivors
        livingimmunity = new Map();
        for(var i = 0; i < immunity.length; i++){
            if(immunity[i].numunits > 0) livingimmunity.set(immunity[i].id, immunity[i]);
        }

        livinginfection = new Map();
        for(var i = 0; i < infection.length; i++){
            if(infection[i].numunits > 0) livinginfection.set(infection[i].id, infection[i]);
        }

        infection.sort(sortactors);
        immunity.sort(sortactors);
    }

    var winners;
    if(livingimmunity.size <= 0) {
        console.log("Buff - %s Disease wins with %s units", buff, livinginfection.size);
        winners = livinginfection;
        return 0;
    } else {
        console.log("Immunity Wins!");
        winners = livingimmunity;
        var totalunits = 0;
        livingimmunity.forEach(cell => {totalunits += cell.numunits});
        console.log(totalunits);
        return 1;
    }
}

function sortbyinit(a,b) {
    return b.init - a.init;
}

function sortactors(a,b) {
    if (((b.numunits * b.atk) - (a.numunits * a.atk)) === 0) return b.init - a.init;
    else return  (b.numunits * b.atk) - (a.numunits * a.atk);
}
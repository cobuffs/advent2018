var fs = require('fs');
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function sortNumber(a,b) {
    return a - b;
}

var inputs = fs.readFileSync('input.txt').toString().split("\n");
//map of all guards
var guards = new Map();
var days = new Map();
var datereg = /\[(.*?)\]/gm;
//read everything in, parse it, store it and sort it.
var guardcount = 0;

(inputs).forEach(input => {
    //get carriage returns out
    input = input.replace(/[\n\r]+/gm, '');
    var datestr = input.match(datereg)[0].substr(1,input.match(datereg)[0].length-2);
    //break on space 0: date 1: time
    var datetimearr = datestr.split(' ');
    var date = datetimearr[0];
    var timearr = datetimearr[1].split(':');
    var hour = timearr[0];
    var min = timearr[1];
    var actdate = new Date(date);
    //initialize it with the guard standing duty that day
    if(input.includes("Guard")) {
        if(hour === '23') {
            actdate = actdate.addDays(1);
        }

        var brokenstr = input.split(' ');
        var guard = brokenstr[3];

        if(days.has(actdate.toDateString())) console.log("Dupe! %s", actdate);
        else days.set(actdate.toDateString(), {'id': actdate.toDateString(),'guard': guard, 'events': [], 'raw': []})

        if (guards.has(guard)) {
            guards.get(guard).days.push(days.get(actdate.toDateString()));
        } else {
            guards.set(guard, {'id': guard, 'days': [], 'instancesasleep': new Array(60).fill(0), 'minasleep': 0});
        }
    }
});
console.log(guardcount);

//add all events
(inputs).forEach(input => {
    input = input.replace(/[\n\r]+/gm, '');
    var datestr = input.match(datereg)[0].substr(1,input.match(datereg)[0].length-2);
    //break on space 0: date 1: time
    var datetimearr = datestr.split(' ');
    var date = datetimearr[0];
    var timearr = datetimearr[1].split(':');
    var hour = timearr[0];
    var min = timearr[1];
    var actdate = new Date(date);
    
    if(!input.includes("Guard")) {
        var day = days.get(actdate.toDateString());
        day.events.push(parseInt(min));
        day.raw.push(input);
    }
});
var max = null;
var maxinstance = {'guard': null, 'count': 0};
//calc min asleep
for (const [key, guard] of guards.entries()) {
    var asleep = 0;
    for (var i = 0; i < guard.days.length; i++) {
        var day = guard.days[i];
        day.events.sort(sortNumber);
        //get all the events
        for (var j = 0; j < day.events.length - 1; j = j + 2){
            var startsleep = day.events[j];
            var endsleep = day.events[j+1];
            if (startsleep > endsleep) console.log("ERROR");
            asleep += endsleep - startsleep;
            while (startsleep < endsleep) {
                guard.instancesasleep[startsleep]++;
                if (guard.instancesasleep[startsleep] > maxinstance.count) {
                    maxinstance.guard = guard;
                    maxinstance.count = guard.instancesasleep[startsleep];
                }
                startsleep++;
            }
        }
    }
    guard.minasleep = asleep;
    if (max == null || guard.minasleep > max.minasleep) max = guard;
    //iterate days and count the total time sleeping
}

//for part 2 we need the guard that is most frequently asleep on the same minute

console.log(maxinstance);

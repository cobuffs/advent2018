var fs = require('fs');
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
var inputs = fs.readFileSync('input.txt').toString().split("\n");
//map of all guards
var guards = new Map();
var days = new Map();
var datereg = /\[(.*?)\]/gm;
//read everything in, parse it, store it and sort it.
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
    //console.log('Date: ' + date + " time: " + hour + ":" + min);
    var actdate = new Date(date);
    //console.log("y: %s, m: %s, d: %s, h: %s, m: %s, date: %s", year, mon, day, hour, min, actdate);

    //initialize it with the guard standing duty that day
    if(input.includes("Guard")) {
        var log = false;
        if(actdate.toLocaleDateString() === '1518-5-12') log = true;
        else log = false;
        if (log) console.log(input);
        if (log) console.log(date);
        if (log) console.log(actdate.toLocaleDateString());
        if(hour === '23') {
            actdate = actdate.addDays(1);
            if (log) console.log('yp');
        }
        if (log) console.log(actdate.toLocaleDateString());
        var brokenstr = input.split(' ');
        var guard = brokenstr[3];
        if (log) console.log(actdate.toLocaleDateString() + " " + guard);

        days.set(actdate.toLocaleDateString(), {'guard': guard, 'events': []})
        if (guards.has(guard)) {
            guards.get(guard).days.push(actdate.toLocaleDateString());
        } else {
            guards.set(guard, {'days': [], 'minasleep': 0});
        }
    }
});

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
        var day = days.get(actdate.toLocaleDateString());
        day.events.push(parseInt(min));
        day.events.sort();
        // console.log(actdate.toLocaleDateString());
        // console.log(day);
    }
});

//calc min asleep
console.log(days.get('1518-5-12'));


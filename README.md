# Pick
A class to accomodate dynamic (delayed) parameters

Pick class - Dan Zen for https://zimjs.com.

A system to pass in options as a parameter 
and then pick the option inside the function.

We might have a particle emitter with variable shapes.
If we pick the shape outside the function
then it would emmit the chosen shape over and over.
Instead, we can pass in a Pick object
and the Emitter can choose inside to emmit different particles.

Pick lets you pass a range, an array of choices, a series
or any function that returns a value as options.
Pass in a new Pick(options) as a parameter
and choose from options inside function
using Pick.choose(parameter).

Options: can pass these in to the options parameter of Pick() <br>
OR use as a Pick literal - pass any of these in as a parameter <br>
as long as the literal parameter of Pick.choose() is true (default)<br>

1. an Array of values to pick from randomly - eg. ["red", "green", "blue"]<br>
2. a Function that returns a value - eg. function(){return Date.now();}<br>
   see also the Pick.series() static method which returns a function that will execute a series in order<br>
   pass Pick.series("red", "green", "blue") into a parameter to select these in order then repeat, etc.<br>
3. a RAND object literal for a range - eg. {min:10, max:20, integer:true, negative:true} max is required<br>
4. any combination of the above - eg. ["red", function(){x>100?["green", "blue"]:"yellow"}] Pick is recursive<br>
5. a single value such as a Number, String, new Rectangle(), etc. this just passes through unchanged<br>
6. an object literal with a property of noPick having a value such as an Array or Function that Pick will not process<br>

<pre>
// EXAMPLE
// time is a parameter that can receive a Pick object (or a Pick object literal)
// which will allow our interval function to repeat times picked from the options
function interval(time, call) {
    function makeCall(t)
        setTimeout(function(){
            call();
            makeCall(Pick.choose(time));
        }, t);
    }
}

// every second 
// the Pick.choose() in the function passes numbers and strings through without change
interval(1000, function () {console.log("calling");});

// one, two or three seconds randomly
var pick = new Pick([1000, 2000, 3000]);
interval(pick, function () {console.log("calling");});

// one, two or three seconds randomly using a Pick literal
interval([1000, 2000, 3000], function () {console.log("calling");});

// a range between one and three seconds
interval({min:1000, max:3000}, function () {console.log("calling");});

// a range between one and three seconds - repeating after 3 choices
var pick = new Pick({min:1000, max:3000}).num(3);
interval(pick, function () {console.log("calling");});

// one, two and three seconds consecutively then repeat
interval(Pick.series(1000,2000,3000), function () {console.log("calling");});

// pick based on a function result
// here we return a Pick literal - Pick is recursive
// so if daytime, the interval runs randomly more slowly
function dayNight() {
    if (new Date.getHours() > 11) return [100,200,300];
    else return [1000, 2000, 3000];
}
interval(dayNight, function () {console.log("calling");});

EXAMPLE
Loop through a Pick
var pick = new Pick({max:10, integer:true});
var status = pick.loop(20, function(amount, i, total) {
    if (amount == 5) return; // like a continue in a for loop
    if (amount == 7) return "lose" // like a break in a for loop
    if (amount < 2) console.log("low")
    else if (amount > 8) console.log("high")
    console.log("completed " + i + " of " + total);
})
console.log(status=="lose"?"lose":"win");
</pre>

Pick is used extensively in ZIM at https://zimjs.com.  
It was originally called the ZIM VEE object. 
This class makes it more generic - so please use!

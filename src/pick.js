/*
Pick class - (c) 2019 Dan Zen for https://zimjs.com.
Free to use

A system to pass in options as an argument
and then pick the option inside the function.

We might have a particle emitter with variable shapes.
If we pick the shape outside the function
then it would emit the chosen shape over and over.
Instead, we can pass in a Pick object
and the Emitter can choose inside to emit different particles.

Pick lets you pass a range, an array of choices, a series
or any function that returns a value as options.
Pass in a new Pick(options) as an argument
and choose from options inside function
using Pick.choose(parameter).

Options: can pass these in to the options parameter of Pick()
OR use as a Pick literal - pass any of these in as an argument
as long as the literal parameter of Pick.choose() is true (default)

1. an Array of values to pick from randomly - eg. ["red", "green", "blue"]
2. a Function that returns a value - eg. function(){return Date.now();}
   see also the Pick.series() static method which returns a function that will execute a series in order
   pass Pick.series("red", "green", "blue") into a parameter to select these in order then repeat, etc.
3. a RAND object literal for a range - eg. {min:10, max:20, integer:true, negative:true} max is required
4. any combination of the above - eg. ["red", function(){x>100?["green", "blue"]:"yellow"}] Pick is recursive
5. a single value such as a Number, String, new Rectangle(), etc. this just passes through unchanged
6. an object literal with a property of noPick having a value such as an Array or Function that Pick will not process

// EXAMPLE
function interval(time, call) {
    function makeCall(t)
        setTimeout(function(){
            call();
            makeCall(Pick.choose(time));
        }, t);
    }
}
// every second - Pick.choose() passes numbers, strings, through
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
*/

function Pick(choices)  {
    this.choices = choices;
    this.num = function(num) {
        var s = [];
        for (var i=0; i<num; i++) {s.push(Pick.choose(this))}
        this.choices = Pick.series(s);
        return this;
    }
    var that = this;
    this.loop = function(num, call) {
        for (var i=0; i<num; i++) {
            if (typeof call == "function") call(Pick.choose(that, i, num));
        }
     }
};
Pick.prototype.type = "Pick";
Pick.series = function() {
    var array;
    if (arguments.length == 0) return function(){};
    if (arguments.length == 1 && Array.isArray(arguments[0])) array = arguments[0];
    else array = arguments;
    var count = 0;
    var f = function() {
        return array[(count++)%array.length];
    }
    f.array = array;
    return f;
}
Pick.rand = function(a, b, integer, negative) {
    if (a==null && b==null) return Math.random();
    if (a==null || isNaN(a)) a = 0;
    if (b==null || isNaN(b)) b = 0;
    if (a%1!=0 || b%1!=0) integer = false;
    if (integer==null) integer = true;
    if (negative) if (Math.random()>.5) {a*=-1; b*=-1;};
    if (integer) if (a>b) {a++;} else if (b>a) {b++;}
    var r;
    if (a == 0 && b == 0) return 0;
    else if (b == 0) r = Math.random()*a;
    else r = Math.min(a,b)+Math.random()*(Math.max(a,b)-Math.min(a,b));
    if (integer) return Math.floor(r);
    else return r;
}
Pick.choose = function(obj, literal) {
    if (literal == null) literal = true;
    if (obj.type=="Pick" || literal) {
        var c = obj.choices || obj;
        if (Array.isArray(c)) {
            var val = c[Math.floor(Math.random()*(c.length))];
            return Pick.choose(val); // recursive
        } else if (c.constructor === {}.constructor) {
            if (c.noPick!=null) return c.noPick; // a passthrough for arrays and functions
            if (c.max==null) return c;
            if (c.integer==null) c.integer = false;
            var val = Pick.rand(c.min, c.max, c.integer, c.negative);
            return val;
        } else if (typeof c == "function") {
            return Pick.choose((c)()); // recursive
        }
        return obj;
    } else {
        return obj;
    }
}
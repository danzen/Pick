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
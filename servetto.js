var s1 = require("servo").connect(B13);
var s2 = require("servo").connect(B10);

var v1 = 1,
    v2 = 0;

setInterval(function() {
  s1.move(Math.random(), 200);
  s2.move(Math.random(), 200);
}, 190);

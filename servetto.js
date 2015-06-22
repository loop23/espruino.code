var s = require("servo").connect(B13);
var v = 1;
setInterval(function() {
  v = 1 - v;
  s.move(v, 400);
}, 500);
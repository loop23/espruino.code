function Encoder(/*=PIN*/pina, /*=PIN*/pinb, callback) {
  this.last = 0;
  this.PINA = pina;
  this.PINB = pinb;
  this.callback = callback;
  var encoder = this;
  var onChange = function() {
    var a = digitalRead(encoder.PINA);
    var b = digitalRead(encoder.PINB);
    var s = 0;
    switch (this.last) {
      case 0b00 : if (a) s++; if (b) s--; break;
      case 0b01 : if (!a) s--; if (b) s++; break;
      case 0b10 : if (a) s--; if (!b) s++; break;
      case 0b11 : if (!a) s++; if (!b) s--; break;
    }
    this.last = a | (b<<1);
    if (s!==0) callback(s);
  };
  pinMode(this.PINA, "input_pulldown");
  pinMode(this.PINB, "input_pulldown");
  setWatch(onChange, this.PINA, { repeat: true });
  setWatch(onChange, this.PINB, { repeat: true });
}

var s1 = 114,
    s2 = 88,
    s3 = 5,
    s4 = 128,
    s5 = 128;
//Speed
new Encoder(B13,B14,function (direction) {
  s1 += direction;
  s1 = E.clip(s1, 0, 127);
  print("s1: " + s1);
});
//Pitch
new Encoder(B15,C4,function (direction) {
  s2 += direction;
  s2 = E.clip(s2, 0, 255);
  print("s2: " + s2);
});
//Bend
new Encoder(C5,C6,function (direction) {
  s3 += direction;
  s3 = E.clip(s3, 0, 15);
  print("s3: " + s3);
});

new Encoder(C7,C8,function (direction) {
  s4 += direction;
  s4 = E.clip(s4, 128, 254);
  print("s4: " + s4);
});

new Encoder(C9,C10,function (direction) {
  s5 += direction;
  s5 = E.clip(s5, 128, 254);
  print("s5: " + s5);
});

s = Serial1;
function play() {
  s.write(21);
  s.write(s1);
  s.write(22);
  s.write(s2);
  s.write(23);
  s.write(s3);
  s.write(s4);
  s.write(s5);
}

setInterval(play, 1200);
/*
var e1 = 128,
    e2 = 128,
    e3 = 128,
    e4 = 128,
    e5 = 128;
r = require("Encoder");
print("encmod: " + r);
res1 = r.connect(C11, C10,function (direction) {
  e1 += direction;
  print('e1:' + e1);
});

r.connect(C9,C8,function (direction) {
  e2 += direction;
  print('e2:' + e2);
});

r.connect(C5,C6,function (direction) {
  e3 += direction;
  print('e3:' + e3);
});
r.connect(B15,C4,function (direction) {
  e4 += direction;
  print('e4:' + e4);
});


r.connect(B13,B14,function (direction) {
  e5 += direction;
  print('e5:' + e5);
});
*/
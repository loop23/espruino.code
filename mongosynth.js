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

var s = Serial1;
var phrase = [{note: 170},
              {note: 150},
              {note: 160},
              {note: 130},
              {note: 180}];

function encfactory(left,right,pos) {
  var e = new Encoder(left, right, function(direction) {
    print("Rotated knob for " + pos + ' in direction: ' + direction);
    var note = phrase[pos].note;
    note += direction;
    phrase[pos].note = E.clip(note, 128, 254);
    print("Pos: " + pos + ' value: ' + note);
  });
}

encfactory(B13, B14, 0);
encfactory(B15, C4,  1);
encfactory(C5,  C6,  2);
encfactory(C7,  C8,  3);
encfactory(C9,  C10, 4);


function play() {
  for (var i = 0; i < 5; i++) {
    var note = phrase[i].note;
    print("Pos: " + i + ' - note: ' + note);
    s.write(note);
  }
}

setInterval(play, 3000);

leds = [C3,C2,C0,C15,B12,B9,B7,B6,B4,B3];
switches = [C1,C12,B8,B5,B2];

function makeClicker(pin) {
  return function() { print("Pin: " + pin + " clicked"); };
}

for (i=0; i < 5; i++) {
  pinMode(switches[i], 'input_pullup');
  setWatch(makeClicker(switches[i]),
                       switches[i],
                       { edge: 'rising', repeat: true });
}

var idx = 0;
var state = 1;
function switchled() {
  if (idx > 9) {
    idx = 0;
    state = 1 - state;
  }
  digitalWrite(leds[idx++], state);
}

setInterval(switchled, 23);
setInterval(play, 1000);

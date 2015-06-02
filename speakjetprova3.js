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
var leds = [C3,C2,C0,C15,B12,B9,B7,B6,B4,B3];
var switches = [C1,C12,B8,B5,B2];
var global = {
  speed: 114,
  pitch: 88,
  bend: 7
};
function noteChange(pos, direction) {
  var note = phrase[pos].note;
  note += direction;
  phrase[pos].note = E.clip(note, 128, 254);
}
function pauseChange(pos, direction) {
  var pause = phrase[pos].pause;
  pause += direction;
  phrase[pos].pause = E.clip(pause, 0, 6);
}
function otherChange(pos, direction) {
  print("Other - pos: " + pos + ', dir: ' + direction);
}
var changeAry = [noteChange, pauseChange, otherChange];
var changeAryPos = 0;
var changeAryFunc = function() { return changeAry[changeAryPos]; };
var phrase = [{note: 170, fast: false, slow: true, pause:0},
              {note: 150, fast: false, slow: false, pause: 0},
              {note: 160, fast: false, slow: false, pause: 0},
              {note: 130, fast: true, slow: false, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0}];
function encfactory(left, right, pos) {
  var e = new Encoder(left, right, function(direction) {
    changeAryFunc()(pos, direction);
    printNotes();
  });
}

function printNotes() {
  var buf = [];
  for (var i=0; i< 5; i++) buf = buf.concat(showNote(i));
  print(buf.join(' = '));
}

function showNote(i) {
  return('' + i + ':' + ' ' + phrase[i].note +
         (phrase[i].fast ? '+' : phrase[i].slow ? '-' : ' ') +
        phrase[i].pause);
}

encfactory(C9,  C10, 0);
encfactory(C7,  C8,  1);
encfactory(C5,  C6,  2);
encfactory(B15, C4,  3);
encfactory(B13, B14, 4);

function mybtnWatch() {
  print("Clicked!");
  changeAryPos = 1 - changeAryPos;
  print("Function:" + changeAryFunc());
}

var btnw = setWatch(mybtnWatch,
         BTN1,
         { repeat:true, edge: rising});

print("Button Watch id: " + btnw);


// Plays immediately
function playNow() {
  clearInterval();
  play();
  setInterval(play, 3000);
}

function play() {
  for (var i = 0; i < 5; i++) {
    var note = phrase[i].note;
    if (phrase[i].fast) {
      s.write(7);
    } else if (phrase[i].slow) {
      s.write(8);
    }
    s.write(phrase[i].pause);
    s.write(note);
  }
  printNotes();
}

function clearLeds() {
  for(i=0;i<5; i++) {
    digitalWrite(leds[i * 2], phrase[i].fast);
    digitalWrite(leds[i * 2 + 1], phrase[i].slow);
  }
}
clearLeds();
var pi = setInterval(play, 3000);


function makeClicker(pos) {
  return function() {
    var pp = phrase[pos];
    if (pp.fast) {
      pp.fast = false;
      pp.slow = true;
    } else if (pp.slow) {
      pp.fast = false;
      pp.slow = false;
    } else {
      pp.fast = true;
      pp.slow = false;
    }
    clearLeds();
  };
}

for (var i=0; i < 5; i++) {
  pinMode(switches[i], 'input_pullup');
  setWatch(makeClicker(i),
                       switches[i],
           { edge: 'rising', repeat: true, debounce: 50 });
}

function clearLeds() {
  for(i=0;i<5; i++) {
    digitalWrite(leds[i * 2], phrase[i].fast);
    digitalWrite(leds[i * 2 + 1], phrase[i].slow);
  }
}

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
  volume: 96,
  speed: 114,
  pitch: 88,
  bend: 7,
  retrigger: 3000
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
function isPlaying() {
  digitalRead(B3);
}
function otherChange(pos, direction) {
  var par, min, max;
  switch (pos) {
    case 0:
      par = 'volume';
      min = 0;
      max = 127;
      break;
    case 1:
      par = 'speed';
      min = 0;
      max = 127;
      break;
    case 2:
      par = 'pitch';
      min = 0;
      max = 255;
      break;
    case 3:
      par = 'bend';
      min = 0;
      max = 15;
      break;
    case 4:
      par = 'retrigger';
      min = 50;
      max = 3000;
      break;
  }
  var curr = global[par];
  if (pos == 4) {
    curr += 50 * direction;
  } else {
    curr += direction;
  }
  global[par] = E.clip(curr, min, max);
  if (pos == 4) {
    if (isPlaying()) {
      setWatch(retrigger, B3, { repeat: false, edge: falling });
    } else {
      retrigger();
    }
    return;
  }
  s.write(20); s.write(global.volume);
  s.write(21); s.write(global.speed);
  s.write(22); s.write(global.pitch);
  s.write(23); s.write(global.bend);
  print("Other - pos: " + pos + ', dir: ' + direction + ' par: ' + par);
}
// Clara, playa e retriggera
function retrigger() {
  retriggering = false;
  clearInterval();
  play();
  setInterval(play, global.retrigger);
  print("Set trigger to: " + global.retrigger);
}

var changeAry = [noteChange, pauseChange, otherChange];
var changeAryPos = 0;
var changeAryFunc = function() { return changeAry[changeAryPos]; };
var phrase = [{note: 170, fast: false, slow: true, pause:0},
              {note: 150, fast: false, slow: false, pause: 0},
              {note: 160, fast: false, slow: false, pause: 0},
              {note: 130, fast: true, slow: false, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0}];
function randomize() {
  for (var i=0;i<4; i++) {
    phrase[i].note = Math.floor(Math.random() * 72 + 128);
    phrase[i].pause = Math.floor(Math.random() * 6);
  }
  play();
}

function encfactory(left, right, pos) {
  var e = new Encoder(left, right, function(direction) {
    changeAryFunc()(pos, direction);
    printNotes();
  });
}

function printNotes() {
  var buf = [];
  for (var i=0; i< 5; i++) buf = buf.concat(showNote(i));
  print(buf.join(' <===> '));
}

function showNote(i) {
  return(phrase[i].note +
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
  changeAryPos += 1;
  if (changeAryPos == 3) changeAryPos = 0;
}

var btnw = setWatch(mybtnWatch,
                    BTN1,
                    { edge: 'rising',
                      repeat: true,
                      debounce: 50
                    });
print("Button Watch id: " + btnw);

// Plays immediately
function playNow() {
  clearInterval();
  play();
  setInterval(play, 3000);
}

function play() {
  digitalWrite(C3, true);
  digitalWrite(C2, true);
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
  setTimeout(drawLeds, 300);
}

function drawLeds() {
  for(i=0;i<5; i++) {
    digitalWrite(leds[i * 2], phrase[i].fast);
    digitalWrite(leds[i * 2 + 1], phrase[i].slow);
  }
}
drawLeds();
play();
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
    drawLeds();
  };
}
// Rende cliccabili i leds
for (var i=0; i < 5; i++) {
  pinMode(switches[i], 'input_pullup');
  setWatch(makeClicker(i),
                       switches[i],
           { edge: 'rising', repeat: true, debounce: 50 });
}

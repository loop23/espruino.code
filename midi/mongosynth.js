// Synthesizer thing with SpeakJet on serial1;
// Has a bunch of encoders whith leds for the interface.
// Old mode sends all at once, new one sends a phoneme at a time.

var retriggering = false;
var s = Serial1; // Should be A9?
var leds = [C3,C2,C0,C15,B12,B9,B7,B6,B4,B3];
var switches = [C1,C12,B8,B5,B2];
var enc = require("Encoder");
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
function printGlobal() {
  print("Vol: " + global.volume + ", speed: " + global.speed +
        ', pitch: ' + global.pitch + ', bend: ' + global.bend +
        ', retrig: ' + global.retrigger);
}
function globalChange(pos, direction) {
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
      if (retriggering) { // Already retriggering
        return;
      }
      retriggering = true;
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
  printGlobal();
}
// Clara, playa e retriggera
function retrigger() {
  retriggering = false;
  clearInterval();
  play();
  setInterval(play, global.retrigger);
  print("Set trigger to: " + global.retrigger);
}

var changeAry = [noteChange, pauseChange, globalChange];
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
    var ch = Math.floor(Math.random() * 3);
    if (ch === 0) {
      phrase[i].slow = true;
      phrase[i].fast = false;
    } else if (ch == 1) {
      phrase[i].slow = false;
      phrase[i].fast = true;
    } else {
      phrase[i].slow = false;
      phrase[i].fast = false;
    }
  }
}

function encfactory(left, right, pos) {
  console.log("Setting a watch on " + left + ' and ' + right + ' on ' + pos);
  var e = enc.connect(left, right, function(direction) {
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

encfactory(C10,  C9, 0);
encfactory(C8,  C7,  1);
encfactory(C6,  C5,  2);
encfactory(C4, B15, 3);
encfactory(B14, B13, 4);

function mybtnWatch() {
  changeAryPos += 1;
  if (changeAryPos == 3) changeAryPos = 0;
  if (changeAryPos === 0) {
    print("Phoneme mode");
  } else if (changeAryPos === 1) {
    print("Pause mode");
  } else {
    print("Global mode");
  }
}

var btnw = setWatch(mybtnWatch,
                    BTN1,
                    { edge: 'rising',
                      repeat: true,
                      debounce: 50
                    });

// Plays immediately
function playNow() {
  clearInterval();
  play();
  setInterval(play, 3000);
}
var gPos = 0;
function playStep() {
  digitalWrite(leds[gPos*2], 1);
  digitalWrite(leds[gPos*2 + 1], 1);

  var note = phrase[gPos];
    if (note.fast) {
      s.write(7);
    } else if (note.slow) {
      s.write(8);
    }
    //s.write(note.pause);
    s.write(note.note);
    gPos++;
    if (gPos > 3)
      gPos = 0;
  setTimeout(drawLeds, 400);
  setTimeout(playStep, 500);
}

function play() {
  // Playing leds
  digitalWrite(C3, true);
  digitalWrite(C2, true);
  for (var i = 0; i < 5; i++) {
    var note = phrase[i];
    if (note.fast) {
      s.write(7);
    } else if (note.slow) {
      s.write(8);
    }
    s.write(note.pause);
    s.write(note.note);
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
randomize();
drawLeds();

play();
var pi = setInterval(play, 1900);


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

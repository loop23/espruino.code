var s = Serial1;
s.setup(9600, { tx: B6 });

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
  switch(pos) {
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
    print("clearing");
    if (isPlaying()) { return; }
    clearInterval();
    setInterval(play, global.retrigger);
    print("Set trigger to: " + global.retrigger);
    return;
  }
  s.write(20); s.write(global.volume);
  s.write(21); s.write(global.speed);
  s.write(22); s.write(global.pitch);
  s.write(23); s.write(global.bend);
  print("Other - pos: " + pos + ', dir: ' + direction + ' par: ' + par);
}
var changeAry = [noteChange, pauseChange, otherChange];
var changeAryPos = 0;
var changeAryFunc = function() { return changeAry[changeAryPos]; };
var phrase = [{note: 170, fast: false, slow: true, pause:0},
              {note: 150, fast: false, slow: false, pause: 0},
              {note: 160, fast: false, slow: false, pause: 0},
              {note: 130, fast: true, slow: false, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0},
              {note: 180, fast: false, slow: true, pause: 0} ];

function randomize() {
  for (var i=0;i<8; i++) {
    phrase[i].note = Math.floor(Math.random() * 72 + 128);
    phrase[i].pause = Math.floor(Math.random() * 6);
  }
  play();
}

function printNotes() {
  var buf = [];
  for (var i=0; i< 8; i++) buf = buf.concat(showNote(i));
  print(buf.join(' <===> '));
}

function showNote(i) {
  return(phrase[i].note +
         (phrase[i].fast ? '+' : phrase[i].slow ? '-' : ' ') +
        phrase[i].pause);
}

var i = 0;
function play() {
  i++;
  if (i == 8) {
    i = 0;
  }
  var note = phrase[i].note;
  if (phrase[i].fast) {
    s.write(7);
  } else if (phrase[i].slow) {
    s.write(8);
  }
  s.write(phrase[i].pause);
  s.write(note);
}

var pi = setInterval(play, 3000);


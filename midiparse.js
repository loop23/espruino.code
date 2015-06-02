s = Serial2;
s.setup(115200, { parity:'none', bytesize:8, stopbits:1 });

function noteOn(chan, note, velocity) {
  print("Playing a " + note + ' on channel: ' + chan + ' with vel: ' + velocity); 
}

var state = 'waiting';
var message = '';
var p1, p2;
var chan;

s.onData(function(d) {
  var data = d.data;
  if (data.length != 1) {
    print("Weird multibyte thing!");
  }
  byte = data.charCodeAt(0);
  if (state == 'waiting') {
    if (byte < 0x80) {
      print("Out of order, non command!");
    } else { // command
      chan = byte & 0b1111;
      message = byte & 0b11110000;
      print("Command: " + message + ' on channel: ' + chan);
      state = 'P1';
    }
  } else if (state == 'P1') {
    p1 = byte;
    state = 'P2';
  } else if (state == 'P2') {
    p2 = byte;
    print("So, mess: " + message + ' ,p1: ' + p1 + ' ,p2: ' + p2);
    if (message == 0x90) {
      noteOn(chan, p1, p2);
    } else if (message == 0x80) {
      noteOff(chan, p1,p2);
    }
    state = 'waiting';
  }
});


// Try using midi to drive the speakjet on serial1
// Does not work, yet.
var midi = require('Midi').setup(Serial2, 115200);
var sj = Serial1;
sj.setup(9600, {tx: B6});

//midi.on('noteOn', nil);
midi.on('noteOn', function(i) {
  var p = i.note + 128;
  console.log('Playing a ' + p + ' vel: ' + i.velocity);
//  sj.write("\0"); sj.write('W');
  sj.write(20); sj.write(i.velocity);
  sj.write(p);
});

midi.on('ctrlChange', function(i) {
  //console.log("CtrlChng " + i.ctrl + ' - value: ' + i.value);
  if (i.ctrl == 3) {
    console.log("Setting speed");
    sj.write(21); sj.write(i.value);
  }
});


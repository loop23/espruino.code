var midi = require('Midi').setup(Serial2, 115200);
var out = A0;
var wsize = 256;
var wave = new Waveform(wsize,
                        { doublebuffer: false, bits: 8 });

analogWrite(out, 0.3);

// SawTooth
for (var i = 0; i < wsize; i++) {
  wave.buffer[i] = i;
}

midi.on('noteOn', function(i) {
  if (i.velocity === 0) {
    console.log("vel 0, stopping");
    wave.stop();
  } else {
    var dist = i.note - 62;
    console.log("Distance from A: " + dist);
    var freq = (440 * Math.pow(2, dist / 12)).toFixed();
    console.log("freq: " + freq);
    wave.startOutput(out, freq, { repeat: true });
  }
});

midi.on('noteOff', function(i) {
   console.log("Noteoff,stopping");
   wave.stop(); 
});

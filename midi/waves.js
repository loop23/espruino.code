// Attemps at generating audio. I don't think it works.
analogWrite(A0, 0.5);
w.startOutput(A0, 4000);
w.stop();


var w = new Waveform(1024);
for (var i=0;i<1024;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/64)*127;

function sineWave(wa) {
  var step = 2 * Math.PI / wa.buffer.length;
  print("Step: " + step);
  for (var i=0; i < wa.buffer.length; i++) {
    var val = 128 + (Math.sin(step * i) * 127);
    wa.buffer[i] = val;
    // print("a indice " + i + ' val: ' + val);
  }
  // print("Alla fine step * i?" + step * i);
}

function quadWave(wa) {
  for(var i=0; i<wa.buffer.length; i++) {
	if (i < wa.buffer.length / 2)
      wa.buffer[i] = 255;
    else
      wa.buffer[i] = 0;
  }
}

function plotWave(wa) {
  for (var i=0; i<wa.buffer.length; i++) {
    print("----------------------------------------------------------------".substr(0,
            Math.round(wa.buffer[i] / 4)));
  }
}

function play(freq, dur) {
  analogWrite(A0, 0.5);
  w.startOutput(A0, freq, {repeat:true});
  setTimeout(function() {
    w.stop();
    analogWrite(A0,0);
  }, dur);
}

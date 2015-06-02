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

setInterval(switchled, 30);


/* I tried measuring capacitance according to Gordon suggestion.
   To no avail so far, and I don't remember much about it.
*/

chargePin = A2;
readPin = A4;
dischargePin = A3;

var diff = 0;

// Discharged charges back
function discharged(e) {
  print("Discharged, charging");
  pinMode(dischargePin, 'input');
  pinMode(chargePin, 'output');
  digitalWrite(chargePin, true);
}

// charged discharges
function charged(e) {
  if (e) {
    print("Charged, Discharging, e.state: " + e.state);
    diff = (e.time - e.lastTime) * 1000;
  }
//  print("charged - time: " + e.time  + " Diff: " + diff);
  pinMode(chargePin, 'input');
  pinMode(dischargePin, 'output');
  digitalWrite(dischargePin, false);
}

setWatch(charged, readPin, { repeat: true, edge: 'rising' });
setWatch(discharged, readPin, { repeat: true, edge: 'falling' });


function getCap() {
  print("diff: " + diff);
}

setInterval(getCap, 3000);

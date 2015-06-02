chargePin = A2;
readPin = A4;
dischargePin = A3;
var ontime = 0;

function discharge() {
  pinMode(chargePin, 'input');
  pinMode(dischargePin, 'output');
  digitalWrite(dischargePin, false);
  while(analogRead(readPin) > 0.001) {
    //console.log('D');
  }  //print("Discharged");
}

function watchF(e) {
  print("time: " + e.time + " last: " + e.lastTime + ' this: ' + this);
  //elspsed = e.time - ontime;
  //print("Cap: " + elapsed);
  discharge();
}

function getCap() {
  pinMode(dischargePin, 'input');
  pinMode(chargePin, 'output');
  setWatch(watchF, readPin, { repeat: false, edge: 'rising' });
  ontime = getTime();
  digitalWrite(chargePin, true);
}

setInterval(getCap, 1000);


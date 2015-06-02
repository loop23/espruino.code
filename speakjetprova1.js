var step = 0;
require("Encoder").connect(A0,A1,function (direction) {
  step += direction;
  print(step);
});


s = Serial1;
i = 128;
start = 128;
min = 128;
max = 200;

function nextN() {
  if (i > max) {
    i = min;
    start ++;
    if (start > 200) start = 128;
  }
  // slow speed
  s.write(21);
  s.write(114);
  // Hi tone
  // s.write(14)
  // 
  
  s.write(Math.round(Math.random()*20 + 128));
  //s.write(14)
  s.write(Math.round(Math.random()*30 + 158));
  //s.write(14)
  s.write(Math.round(Math.random()*20 + 128));
  s.write(Math.round(Math.random()*30 + 158));
  //s.write(14)
  s.write(Math.round(Math.random()*20 + 128));

}

setInterval(nextN, 1100);

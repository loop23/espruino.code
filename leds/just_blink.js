// Reality check. Blinks the red led.

clearInterval();

var  l = false;
setInterval(function() {
  l = !l;
  LED1.write(l);
}, 500);

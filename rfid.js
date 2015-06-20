SPI1.setup({sck:B3, miso:B4, mosi:B5});
var nfc = require("MFRC522").connect(SPI1, B6 /*CS*/);
setInterval(function() {
  //print("intervaling");
 nfc.findCards(function(card) {
  print("Found card "+card);
  card = JSON.stringify(card);
  var leds = [LED1,LED2,LED3];
  if (card=="[164,172,21,201]") digitalPulse(LED1,1,500);
  if (card=="[52,61,40,235]") digitalPulse(LED2, 1, 500);
 });
}, 1000);
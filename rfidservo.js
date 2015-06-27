SPI1.setup({sck:B3, miso:B4, mosi:B5});
var nfc = require("MFRC522").connect(SPI1, B6 /*CS*/),
    servo = require("servo"),
    s1 = servo.connect(B13),
    s2 = servo.connect(B10);

setInterval(function() {
 nfc.findCards(function(card) {
   print("Found card "+card);
   card = JSON.stringify(card);
   var leds = [LED1,LED2,LED3];
   if (card=="[164,172,21,201]") {
     pos1();
   } else if (card=="[52,61,40,235]") {
     pos2();
   }
 });
}, 1000);

function pos1() {
  s1.move(0,2000);  
  s2.move(1,2000);
}

function pos2() {
  s1.move(1,2000);  
  s2.move(0,2000);
}


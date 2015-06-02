s = Serial2;
s.setup(115200, { parity:'none', bytesize:8, stopbits:1 });
s.onData(function(d) {
  var data = d.data;
  print("Len is: " + data.length);
  if (data == 0x90) {
    print("NoteOn!" + data.toString(16));
  } else {
    print("Other: " + data.toString(16) + ' ' + data);
  }
});


SPI1.setup({ sck:B3, mosi:B5, baud: 2 * 1000 * 1000 });
var g = require("PCD8544").connect(SPI1,B6,B7,B8, function() {
  g.clear();
  g.drawString("Hello",0,0);
  g.drawLine(0,10,84,10);
  g.flip();
});

function makeScroller(text, y, size) {
  var s = {
    y: y || 0,
    text: text,
    size: size || 10,
    draw: function() {
      g.setFontVector(this.size);
      g.drawString(this.text, this.off, this.y);
      this.off ++;
      if (this.off > 84) this.off = this.start;
    }
  };
  g.setFontVector(s.size);
  s.start = -g.stringWidth(s.text);
  s.off = s.start;
  console.log("Questo inizia da " + s.start);
  return s;
}

scrollers = [];
scrollers.push(makeScroller("Dio Cane!", 0, 7));
scrollers.push(makeScroller("Madonna boia!", 20, 15));

function draw() {
  g.clear();
  scrollers.forEach(function(i) {
    //console.log("Beh? " + i);
    i.draw();
  });
  g.flip();
}

setInterval(draw, 100);
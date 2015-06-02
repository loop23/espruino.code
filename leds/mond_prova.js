/* Prova mondriana */

function QuadStrip(width, height, spi) {
  this.spi = spi;
  this.spi.setup({baud:3200000});
  var really_me = this;
  this.width = width;
  this.height = height;
  this.size = width * height;
  this.buffer = new Uint8Array(this.size * 3);
  this.flip = function() {
    this.spi.send4bit(this.buffer, 0b0001, 0b0011);
  };
  this.flip();
  this.setPixel = function(x, y, c) {
    var idx;
    // If you wired it from top left, then check for === 0;
    // I wired it from bottom left;
	if (y % 2 === 1) {
      idx = y * height + x;
    } else {
      idx = y * height + ((width - 1) - x);
    }
    idx = idx * 3;
    really_me.buffer[idx] = (c & 0xff0000) >>> 16;
    really_me.buffer[idx+1] = (c & 0x00ff00) >>> 8;
    really_me.buffer[idx+2] = c & 0x0000ff;
  };

  // I only implemented fast clear because it's more common, because it
  // gets called on Graphic.clear, and because I'm lazy
  // If you need a proper fillRect you'll have to implement it.
  this.fillRect = function(x1, y1, x2, y2, c) {
    if (x1 === 0 &&
        y1 === 0 &&
        x2 === (really_me.width - 1) &&
        y2 === (really_me.height - 1) &&
        really_me.isGray(c)) {
      var lum = c & 0x0000ff;
      for (var i = 0; i < really_me.size * 3; i++) {
        really_me.buffer[i] = lum;
      }
    } else {
      print("Unimplemented.. sorry!");
    }
  };
  this.isGray = function(c) {
    var r = (c & 0xff0000) >>> 16;
    var g = (c & 0x00ff00) >>> 8;
    var b =  c & 0x0000ff;
	return ((r == g) && (g == b));
  };
}

var strip = new QuadStrip(5,5, SPI1);
var graphic = Graphics.createCallback(5,5,24, strip);

graphic.setColor(0x0000ff);
graphic.drawLine(0,0,4,4);
graphic.setColor(0xffffff);
graphic.drawLine(0,4,4,0);
strip.flip();

var mcols = [0xff0000, 0xffff00, 0x0000ff];
function rndint(max) {
  return Math.round(Math.random(max));
}

function rndRect() {
  graphic.setColor(mcols[rndint[3]]);
  graphic.drawRect(rndint[4], rndint[4], rndint[4], rndint[4]);
}

function four_rects() {
  for(var i=0; i<4; i++) {
    rndRect();
  }
  strip.flip();
}

setInterval(four_rects, 50);


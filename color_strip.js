echo(1);
print("We start the thing");

clearInterval();
var PSIZE = 25;
print("We have PSIZE: " + PSIZE);
var cols = new Uint8Array(PSIZE*3);
var wheelpos = 0;
var pos = 0;
print("Setup SPI1");
SPI1.setup({baud:3200000, mosi:A7});

print("before Color");
function Color(r,g,b) {
  this.r = r;
  this.g = g;
  this.b = b;
}
print("before darken");
Color.prototype.darken = function(amt) {
  this.r = (Math.max(this.r - amt,0));
  this.g = (Math.max(this.g - amt,0));
  this.b = (Math.max(this.b - amt,0));
};

print("before lighten");
Color.prototype.lighten = function(amt) {
  this.r = (Math.min(this.r + amt,255));
  this.g = (Math.min(this.g + amt,255));
  this.b = (Math.min(this.b + amt,255));
};
print("before toString");
Color.prototype.toString = function() {
  return "r:" + this.r +", g:" + this.g + ", b:" + this.b;
};

var gCol = new Color(0,0,0);

print("before setPixelColor");

var setPixelColor = function (pix, col) {
  var p = pix * 3;
  cols[p] = col.r;
  cols[p + 1] = col.g;
  cols[p + 2] = col.b;
};

print("before wheel");
function wheel(wpos) {
  if (wpos < 85) {
    gCol.r = wpos * 3;
    gCol.g = 256 - wpos * 3;
    gCol.b = 0;
  } else if (wpos < 170) {
    gCol.r = 255 - wpos * 3;
    gCol.g = 0;
    gCol.b = wpos * 3;
  } else {
    gCol.r = 0;
    gCol.g = wpos * 3;
    gCol.b = 255 - wpos * 3;
  }
}

print("before useWheel");
function useWheel() {
  if (pos>=PSIZE) pos=0;
  if (wheelpos === 255) wheelpos = 0;
  wheel(wheelpos);
  setPixelColor(pos, gCol);
  pos +=1;
  wheelpos +=1;
}

function resetCols(color) {
  for (var i=0; i<PSIZE; i++) {
	setPixelColor(i, color);
  }
}

function colorWipe(color) {
  setPixelColor(pos, color);
}

function show() {
  SPI1.send4bit(cols, 0b0001, 0b0011);
}

function doLights() {
  useWheel(); //255,120,100);
  show();
}

print("after doLights b4 setI");

setInterval(doLights, 100);




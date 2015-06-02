var PSIZE = 25;
var cols = new Uint8Array(PSIZE*3);
var wheelpos = 0,
    pos = 0;

SPI1.setup({baud:3200000});

function Color(r,g,b) {
  this.r = r;
  this.g = g;
  this.b = b;
}
var gCol = new Color(0,0,0);

Color.prototype.darken = function(amt) {
  this.r = (Math.max(this.r - amt,0));
  this.g = (Math.max(this.g - amt,0));
  this.b = (Math.max(this.b - amt,0));
};
Color.prototype.lighten = function(amt) {
  this.r = (Math.min(this.r + amt,255));
  this.g = (Math.min(this.g + amt,255));
  this.b = (Math.min(this.b + amt,255));
};

function setPixelColor(p, c) {
  p=p*3;
  cols[p]=c.r;
  cols[p+1]=c.g;
  cols[p+2]=c.b;
}

function wheel(wpos) {
  if (wpos < 86) {
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

function row(r,c) { 
  for (var i = r*5; i< r*5 + 5; i++) {
    setPixelColor(i, c);
  }
}

var white = new Color(255,255,255);

function rndrow() { 
  var whatrow = Math.round(Math.random() * 5); 
  row(whatrow, white); 
  show();
}

var black = new Color(0,0,0);
function useWheel() {
  if (pos>=PSIZE) pos=0;
  if (wheelpos === 254) wheelpos = 0;
  wheel(wheelpos);
  setPixelColor(pos, gCol);
  setPixelColor(pos -1 < 0 ? 24: pos -1, black); 
  pos +=1;
  wheelpos +=1;
}
// Calcola il pixel lineare da x,y
function px(x,y) {
  if (y % 2 === 0)
	return y*5+x;
  else
	return y*5+(4-x);
}
// Setta il x,y a color
function pxc(x,y,c) {
  setPixelColor(px(x,y),c);
  show();
}
// Setta tutti a color e mostra
function resetCols(color) {
  for (var i=0; i<PSIZE; i++) {
	setPixelColor(i, color);
  }
  show();
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

function flash() {
  resetCols(white);
}

setInterval(doLights, 10);
setInterval(flash, 10 * 25 * 4);

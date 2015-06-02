// Draws a single point changing color, and does a white flash once in a while.
// I sort of like the effect, I may port it into the lamp code.
// Has color wheel ported from some arduino code I saw online;
// Uses old hand made interface to drive leds.
var PSIZE = 9;
var cols = new Uint8Array(PSIZE*3);
var wheelpos = 0,
    pos = 0;

SPI2.setup({baud:3200000 , mosi:B15});

function Color(r,g,b) {
  this.r = r;
  this.g = g;
  this.b = b;
}
var gCol = new Color(0,0,0);

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
  if (wheelpos === 255) wheelpos = 0;
  wheel(wheelpos);
  setPixelColor(pos, gCol);
  setPixelColor(pos -1 < 0 ? 8: pos -1, black);
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
  SPI2.send4bit(cols, 0b0001, 0b0011);
}

function doLights() {
  useWheel(); //255,120,100);
  show();
}

function flash() {
  resetCols(white);
}
var tc = 100;
setInterval(doLights, tc);
setInterval(flash, 2 * PSIZE * tc);

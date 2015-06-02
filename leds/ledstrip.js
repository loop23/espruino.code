/* Striscia di led - versione multipattern e 
che da un certo momento in poi ha usato Graphics */

SPI1.setup({baud:3200000 , mosi:A7});
var g = Graphics.createArrayBuffer(5,5,24, { zigzag: true });
var patterns = [];
var tick = 0;


// Mondrian!
var mcolors = [[255,0,0], [0,0, 255], [255,255,0]];
// A random integer this max
function rndInt(maxi) {
  return Math.round(Math.random() * maxi);
}
function rndRect() {
  g.setColor(mcolors[rndint[3]]);
  g.drawRect(rndInt[4], rndInt[4], rndInt[4], rndInt[4]);
}
patterns.push(["Random bg", function() {
    g.setBgColor(Math.random(), Math.random(), Math.random());
    g.clear();
}]);

// Ogni 100 iter fa 4 rects random
patterns.push(["Mondrian", function() {
  if (tick++ % 100 === 0) {
    for (var i=0; i< 5; i++) {
      rndRect();
    }
  }
}]);

// 2d distance
function dist(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x2-x1,2) +
                   Math.pow(y2-y1,2));
}

// Torna un lfo() che fa un ciclo completo ogni period iterazioni.
// Usano una globale tick
function Lfo(period, type) {
  return function() {
    return Math.sin(tick * ( (2*Math.PI)/period));
  };
}

// Torna un punto mobile random
function MovingPoint() {
  var x = Math.random() * 4;
  var y = Math.random() * 4;
  var dx = (Math.random() - 0.5) / 100;
  var dy = (Math.random() - 0.5) / 100;
  return function() {
    if ((x + dx) > 4 || (x + dx) < 0) { dx = -dx; }
    if ((y + dy) > 4 || (y + dy) < 0) { dy = -dy; }
    x = x + dx;
    y = y + dy;
    return [x,y];
  };
}


var lfo1 = new Lfo(99);
var lfo2 = new Lfo(32);
var pt1 = new MovingPoint();
var pt2 = new MovingPoint();
var pt3 = new MovingPoint();

function redPx(x,y) {
  var m = pt1();
  var ret = Math.max(0, Math.round(255 - (dist(x,y,m[0], m[1]) * 100)));
  //console.log("X:" + x + " - Y: " + y + " - Ret: " + ret);
  return ret;
}
function greenPx(x,y) {
  var m = pt2();
  return Math.max(0,
                  Math.round(255 - (dist(x,y,m[0],m[1])* 100 )));
}
function bluePx(x,y) {
  var m = pt3();
  return Math.max(0,
                  Math.round(255 - (dist(x,y,m[0],m[1])* 100 )));
}


function px(x,y) {
  if (y % 2 === 0)
	return y*5+x;
  else
	return y*5+(4-x);
}

patterns.push(['distor', function() {
  for (var y=0; y < 5; y++) {
    for (var x=0; x < 5; x++) {
      var i = px(x,y) * 3;
      mbuffer[i] = redPx(x,y);
      mbuffer[i+1] = greenPx(x,y);
      mbuffer[i+2] = bluePx(x, y);
    }
  }
  tick++;
  return mbuffer;
}]);

function rndint(max) {
  return Math.round(Math.random(max));
}
/*
patterns.push(["Neon turn on", function() {
  var cols = "";
  for (var i = 0; i< 25; i++) {
    var px;
    if (Math.random > 0.6)
      px = String.fromCharCode(255);
    else
      px = String.fromCharCode(0);
    cols+=px + px +px;
  }
}]);
*/

patterns.push(["Mondrian", function() {
  if (tick++ % 100 === 0) {
    for (var i=0; i< 5; i++) {
      rndRect();
    }
  }
  return g.buffer;
}]);

patterns.push(["Sinus grayscale", function() {
  tick++;
  var cols = "";
  for (var i=0;i<25;i++) {
     var c = String.fromCharCode( (Math.sin(i+tick/50)+1) * 127 );
     cols += c + c + c;
  }
  return cols;
}]);

patterns.push(["color shift", function() {
  tick++;
  var cols = "";
  for (var i=0;i<25;i++) {
     cols += String.fromCharCode((0.5 + Math.sin((i+tick)*0.1324)) * 255) + 
             String.fromCharCode((0.5 + Math.sin((i+tick)*0.1654)) * 255) + 
             String.fromCharCode((0.5 + Math.sin((i+tick)*0.1)) * 255);
  }
  return cols;
}]);

patterns.push(["Random blue stuff", function() {
  tick++;
  var cols = "";
  for (var i=0;i<25;i++) {
     cols += String.fromCharCode( Math.random() * 100 ) +
             String.fromCharCode( Math.random() * 100 ) +
             String.fromCharCode( Math.random() * 255 );
  }
  return cols;
}]);

patterns.push(["red snake", function() {
  var cols = "";
  for (var i=0;i<25;i++) {
    cols += String.fromCharCode(tick%25===i ? 255 : 0) +
             String.fromCharCode(255) +
             String.fromCharCode(255);
  }
  tick++;
  return cols;
}]);

var dir = 1;
patterns.push(["gray pulsate", function() {
  if (tick > 24 || tick < 0) {
    console.log("Switching dir, tick: " + tick);
    dir = -dir;
  }
  tick += dir;
  var cols = "";
  for (var i = 0 ; i < 25; i++) {
	var lum = Math.round(Math.abs(tick - dir) * 10);
    console.log("tick: "+ tick + " - lum:" + lum);
    cols += String.fromCharCode(lum) +
			String.fromCharCode(lum) +
            String.fromCharCode(lum/2);
  }
  return cols;
}]);


var patternNumber = 0;
var getPattern = patterns[patternNumber][1];

function changePattern() {
  patternNumber = (patternNumber+1) % patterns.length;
  console.log("Selected pattern %o: %s", patternNumber, patterns[patternNumber][0]);
  getPattern = patterns[patternNumber][1];
  tick=0;
}

setWatch(changePattern, BTN, { repeat: true, edge:'falling' });

function doLights() {
  getPattern();
  SPI1.send4bit(g.buffer, 0b0001, 0b0011);
}

setInterval(doLights, 10);


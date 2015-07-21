/* The wanna-be-cool lamp code */
SPI1.setup({baud:3200000 , mosi:A7});
var WIDTH = 5;
var HEIGHT = 5;
var PSIZE = WIDTH * HEIGHT;

var g = Graphics.createArrayBuffer(WIDTH,
                                   HEIGHT,
                                   24, { zigzag: true });
g.flip = function() { SPI1.send4bit(g.buffer, 0b0001, 0b0011); };

var gswap = Graphics.createArrayBuffer(WIDTH,
                                       HEIGHT,
                                       24, { zigzag: true });
var patterns = [];
var tick = 0;

// Returns color wheel thing based on wpos (0..255)
function wheel(wpos) {
  if (wpos < 86) {
    return (wpos * 3) + ((256 - wpos * 3) << 8) + (0 << 16);
  } else if (wpos < 170) {
    return (255 - wpos * 3) + (0 << 8) + (wpos * 3 << 16);
  } else {
    return 0 + (wpos * 3 << 8) + ((255 - wpos * 3) << 16);
  }
}

// A random integer betwen min and max, taken from mdn
function getRandomInt(min, max) {
  max++;
  return Math.floor(Math.random() * (max - min)) + min;
}
// A pattern is what this thing does; Has optional init, if set does that
// upon switching instead of clearing etc.
function Pattern(name, period, fun, init) {
  this.name = name;
  this.period = period;
  this.init = init;
  this.f = fun;
}

function addPattern(pat) {
  patterns.push(pat);
  console.log("Added pattern: " + pat.name);
}

// Probably, red, green, blue
var mcolors = [255, 255<<8, 255<<16, 37373737, 637373731, 100*255+20+100*64000];
// Does a random rectangle in one of the above colors
function rndRect() {
  g.setColor(mcolors[getRandomInt(0,mcolors.length - 1)]);
  g.fillRect(getRandomInt(0,WIDTH),
             getRandomInt(0,HEIGHT),
             getRandomInt(0,WIDTH),
             getRandomInt(0,HEIGHT));
}

// A grey at this level - expects 0-255
function grey(level) {
  return level | (level << 8) | (level << 16);
}
// A yellow at this level - expect 0-255
function yellow(level) {
  return level | level << 8;
}

// 2d distance
function dist(x1,y1,x2,y2) {
//  "compiled";
  return Math.sqrt(Math.pow(x2-x1,2) +
                   Math.pow(y2-y1,2));
}

// Torna un lfo() che fa un ciclo completo ogni period iterazioni.
// L'lfo torna un float fra -1 e 1
// Usa una globale tick
function Lfo(period, phase) {
  if (!phase) phase = 0;
  return function() {
    "compiled";
    return Math.sin(tick * ( (2*Math.PI)/period) + phase);
  };
}

function Oscil(period, phase) {
  if (!phase) phase = 0;
  return function(theta) {
    "compiled";
    return Math.sin((tick/10 + theta) * ((2*Math.PI)/period) + phase);
  };
}
// Moltiplica il risultato di fun in modo da ottenera una cosa fra in e max; Davvero?
function Range(fun, min, max) {
  var mid = Math.abs((max - min)) / 2;
  return function() {
    "compiled";
    return fun() * mid + mid;
  };
}

// Torna un punto mobile random
function MovingPoint() {
  var x = getRandomInt(0,4);
  var y = getRandomInt(0,4);
  var dx = (Math.random() - 0.5) / 100;
  var dy = (Math.random() - 0.5) / 100;
  return function() {
    "compiled";
    var nx = x+dx;
    var ny = y+dy;
    if ((nx) > 4 || (nx) < 0) { dx = -dx; }
    if ((ny) > 4 || (ny) < 0) { dy = -dy; }
    x = x + dx;
    y = y + dy;
    return [x,y];
  };
}

var lfor1 = new Range(new Lfo(1000), 0, 255);
var lfo1 = new Lfo(99);
var lfo2 = new Lfo(32);
var pt1 = new MovingPoint();
var pt2 = new MovingPoint();
var pt3 = new MovingPoint();

//valore del rosso a x,y
function redPx(x,y) {
  "compiled";
  var m = pt1();
  var v = 255 - (dist(x,y,m[0],m[1]) * 100.0);
  if (v < 0) return 0;
  return v;
}
function greenPx(x,y) {
  "compiled";
  var m = pt2();
  var v = 255 - (dist(x,y,m[0],m[1]) * 100.0);
  if (v < 0) return 0;
  return v;
}
function bluePx(x,y) {
  "compiled";
  var m = pt3();
  var v = 255 - (dist(x,y,m[0],m[1]) * 100.0);
  if (v < 0) return 0;
  return v;
}
// Returns a function that goes from 0 to 1.0
// in [int] cycles
function Phasor(cycles) {
  var divisor = 1.0/cycles;
  return function() {
    "compiled";
    return (tick % cycles) * divisor;
  };
}

/*function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return Math.floor(r * 255) |
           Math.floor(g * 255) << 8 |
           Math.floor(b * 255) << 16;
}
*/

var lfor11 = new Range(new Lfo(3000, Math.PI), 0, 1);
var lfor112 = new Range(new Lfo(25000), -4, 0);
var lfor12 = new Range(new Lfo(100,Math.PI/8), 0, 1);
var lfor13 = new Range(new Lfo(100,Math.PI/4), 0, 1);
var lfor14 = new Range(new Lfo(100), 1, 3);

var lform1 = new Range(new Lfo(1000), 0, 1);
var lform2 = new Range(new Lfo(1000, Math.PI), 0, 1);
var osc1 = new Oscil(7);
var osc2 = new Oscil(11);
var osc3 = new Oscil(23);
var osc4 = new Oscil(10000);
var pha1 = new Phasor(1000);
addPattern(
  new Pattern("gradients",
   1,
    function() {
      "compiled";
      for (var x=0; x< WIDTH; x++) {
        for (var y=0; y< HEIGHT; y++) {
          var pv = pha1()*360;
          g.setColorHSV(pv, 1,1);
          g.drawRect(x,y,x,y);
        }
      }
    }
  )
);

addPattern(
  new Pattern("Bars",
    10,
    function() {
      for(var i=0; i<WIDTH; i++) {
        g.setColor(grey((Math.sin(tick / i / Math.PI)+1)* 127));
        g.drawLine(i,0,i,HEIGHT);
      }
    }
  )
);


addPattern(
  new Pattern("Sinusite",
    1,
    function() {
    for (i=0; i<WIDTH*HEIGHT;i++) {
      var ri = i*3;
      g.buffer[ri  ] = (osc1(i) + 1 ) * 127;
      g.buffer[ri+1] = (osc2(i) + 1 ) * 127;
      g.buffer[ri+2] = (osc3(i) + 1 ) * 127;
    }
  })
);

addPattern(
  new Pattern("TextEr",
    20,
    function() {
      var str = "DIO CANE BAFANGULO PORCODIO";
      g.setColorHSV(Math.round(lform1() * 360), 1, 1);
      g.setBgColorHSV(Math.round(lform2() * 360), 1, 1);
      g.clear();
      var idx = Math.round((tick/30)) % str.length;
      g.drawString(str[idx], 0,0);
    },
    function() {
      //g.setFontVector(5);
    }
  )
);

addPattern(
  new Pattern("just-on",
    100,
    function() {
       var o = g.getBgColor() + 1;
      g.setBgColor(o,o,o);
      g.clear();
    }
));

addPattern(
  new Pattern("mlines",
    1,
    function() {
      "compiled";
      var cnt = tick%25;
      g.setPixel(cnt/5, cnt%5, lform1() * 255*2*133.3);
  }
));

addPattern(
  new Pattern("mesme",
    10,
    function() {
      "compiled";
      for(i=0; i<WIDTH;i++) {
        if (i%2) {
          g.setColorHSV(lform1() * 360, lfo2() + 1,lfo1()+1.5);
        } else {
          g.setColorHSV(lform2() * 360, lfo1() + 1,lfo2()+1.5);
        }
       g.drawLine(i,0,i,HEIGHT);
      }
    },
    function() { return true; }
));

addPattern(
  new Pattern("mesme2",
    10,
    function() {
      for(i=0; i<HEIGHT;i++) {
        if (i%2) {
          g.setColorHSV(lform1() * 360, 1,1);
        } else {
          g.setColorHSV(lform2() * 360, 1,1);
        }
       g.drawLine(0,i,WIDTH,i);
      }
    },
    function() { return true; }
));

addPattern(
  new Pattern("mesme3",
    1,
    function() {
     "compiled";
     for(i=0; i<HEIGHT;i++) {
        for(j=0; j<WIDTH;j++) {
          if ((i+j)%2) {
            g.setColorHSV(lform1() * 360, 1,1);
          } else {
            g.setColorHSV(lform2() * 360, 1,1);
          }
          g.drawLine(i,j,i,j);
        }
      }
    },
    function() { return true; }
));



addPattern(
  new Pattern("lines",
    1,
    function() {
      "compiled";
      pos = lfor112();
      for (i = 0; i< WIDTH; i++) {
        g.setColorHSV(lfor11() * 360, 1, 1.5 - (Math.abs(i - pos)));
        g.drawLine(0, i, HEIGHT, i);
      }
    },
    function() {
      g.setBgColor(getRandomInt(0, 255),
                   getRandomInt(0, 255),
                   getRandomInt(0, 255));                     }
));

addPattern(new Pattern("cylon", 10, function() {
  g.setBgColorHSV(lfor11()*360, 1,1);
  g.clear();
}));

addPattern(new Pattern("SoftPx", 1,
  function() {
    g.setBgColor(grey(lfor1()/5));
    g.clear();
}));

// Does a square that changes color slowly.
addPattern(new Pattern('distorG', 30,
  function() {
    g.clear();
    var m = pt1();
    var x = m[0];
    var y = m[1];
    g.setColorHSV((1 - lfor11()) * 360, 1, 0.5);
    g.fillRect(x-1, y-1, x+1, y+1);
    g.setColorHSV(lfor11() * 360, 1, 1);
    g.fillRect(x ,y , x , y);
}));

// Tipo randomcross ma con drawLine.. molto piu' veloce!
addPattern(new Pattern("Randvar", 30, function() {
  var onx = getRandomInt(0,WIDTH);
  g.setColor(255);
  g.drawLine(onx, 0, onx, HEIGHT);
  var ony = getRandomInt(0,HEIGHT);
  g.setColor(255<<8);
  g.drawLine(0, ony, WIDTH, ony);
}));

addPattern(new Pattern("RandomCross", 1, function() {
  var onx = getRandomInt(0,WIDTH);
  var ony = getRandomInt(0,HEIGHT);
  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var acc = 0;
      if (x === onx) {
        acc = 255;
      } else if (Math.abs(x-onx) === 1) {
        acc = 10;
      }
      if (y === ony) {
        acc = acc | (255 << 8);
      } else if (Math.abs(y-ony) === 1) {
        acc = acc | (10 << 8);
      }
      g.setPixel(x,y,acc);
    }
  }
}));

// Ogni 100 iter fa 4 rects random
addPattern(new Pattern("Mondrian", 500, function() {
  g.setBgColor(mcolors[getRandomInt(0,3)]);
  for (var i=0; i < 5; i++) {
    rndRect();
  }
}));

// Does three big pixels that mix colors when overlapping
addPattern(new Pattern('distor', 1, function() {
  "compiled";
  for (var y=0; y < HEIGHT; y++) {
    for (var x=0; x < WIDTH; x++)
      g.setPixel(x,
                 y,
                 redPx(x,y) |
                 greenPx(x,y) << 8 |
                 bluePx(x, y) << 16);
  }
}));

addPattern(new Pattern('Candle', 1, function() {
  "compiled";
  for (var y = 0; y < HEIGHT; y++) {
    for (var xyell = 0; x < WIDTH; x++) {
      var val = (g.getPixel(x,y) + (Math.random() * 10 - 5));
      g.setPixel(x,y,yellow(val));
    }
  }
}));

addPattern(new Pattern("Random bg", 333, function() {
  g.setBgColor(Math.random(),
               Math.random(),
               Math.random());
}));

/*
addPattern(new Pattern("Neon turn on", 10, function() {
  for (var i = 0; i< WIDTH*HEIGHT; i++) {
    var px;
    if (Math.random > 0.6)
      px = String.fromCharCode(255);
    else
      px = String.fromCharCode(0);
    cols+=px + px +px;
    g.buffer = cols;
  }
}));
*/

function updateFireField() {
  gswap.clear();
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      var h = htocol(calculatePixelHeat(x, y));
      //console.log("Setto " + x + ',' + y + ' a ' + h);
      gswap.setPixel(x,y,h);
    }
  }

  for (var p = 0; p < 5; p++) {
    gswap.setPixel(p, 4, 0);
  }
  tmp = g.buffer;
  g.buffer = gswap.buffer;
  gswap.buffer = tmp;
}

var calculateSumOfSurroundingPixels = function(x, y) {
  var sum = 0;
  if (x > 0) {
    sum += g.getPixel(x-1, y+1);
    sum += g.getPixel(x-1, y);
  }

  sum += g.getPixel(x, y + 1);
  sum += g.getPixel(x,y);

  if (x < 4) {
    sum += g.getPixel(x+1, y + 1);
    sum += g.getPixel(x+1, y);
  }
  return sum & 0xff;
};

var calculatePixelHeat = function(x, y) {
  var heat = Math.round(calculateSumOfSurroundingPixels(x, y) / 5);
  if (heat > 0){
    heat--;
  }
  return heat;
};

function htocol(lum) {
  if (lum < 128) return lum;
  if (lum < 200) return lum + (lum/2 << 8) + (lum/2 << 16);
  return lum + (lum << 8) + (lum << 16);
}
// Fuochetto.. con la palette spaccherebbe!
addPattern(new Pattern("FireTry", 50, function() {
  updateFireField();
  for (var i = 0; i<WIDTH; i++) {
    var lum = getRandomInt(0, 255);
    g.setPixel(i,4,htocol(lum));
  }
}));

// Done with patterns, define machine to run them
var patN = 0;
function runPattern() {
  patterns[patN].f();
}

function changePattern(p) {
  clearTimeout();
  if (p) {
    patN = p;
  } else {
    patN = (patN + 1) % patterns.length;
  }
  console.log("Selecting pattern %i: %s",
              patN,
              patterns[patN].name);
  clearInterval();
  //g.clear();
  if (patterns[patN].init) {
    console.log("Custom init!");
    patterns[patN].init();
  } else {
    g.setBgColor(0,0,0);
    g.setColor(255);
  }
  //g.drawString(patN+1, 1,0);
  g.flip();
  tick=0;
  // In half secs resets
  setTimeout(function() {
    console.log("Starting!");
    loop();
  }, 500);
}

setWatch(changePattern, BTN, { repeat: true, edge:'falling' });
function cp(p) { changePattern(p); }

function loop() {
//  g.clear();
  runPattern();
  g.flip();
  tick++;
  schedule();
}

function schedule() {
  setTimeout(loop, patterns[patN].period);
}

loop();



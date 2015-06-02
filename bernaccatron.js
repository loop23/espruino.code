/* Js code for a bernaccatron; The idea is to map Weather data to
pixel status, so that a single glance allows the user to figure out
what the weather is going to be like in the next two days; This is useful
to figure out wether to take an umbrella, or completely avoid a trip */

var One = {
  "dt": 1416344400,
  "main": {
    "temp": 288.66,
    "temp_min": 286.15,
    "temp_max": 288.66,
    "pressure": 1021.02,
    "sea_level": 1026.04,
    "grnd_level": 1021.02,
    "humidity": 100,
    "temp_kf": 2.51
  },
  "weather": [
    {
      "id": 500,
      "main": "Rain",
      "description": "light rain",
      "icon": "10n"
    }
  ],
  "clouds": {
    "all": 92
  },
  "wind": {
    "speed": 1.85,
    "deg": 67.0029
  },
  "rain": {
    "3h": 3
  },
  "sys": {
    "pod": "n"
  },
  "dt_txt": "2014-11-18 21:00:00"
};

// First, work out pixel color; This is temperature based; First incarnation is
// absolute, may do relative (to season average) rendering as well.
// We need a gradient from blue to red; Define color first
function Color(r,g,b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

var red = new Color(1, 0, 0);
var blue = new Color(0, 0, 1);
// Define color in between; Takes two colors and a integer between
// 0 and 1 (0 is color a, 1 is color b) and returns a Color
function mixColor(a ,b ,mix) {
  var inv = 1 - mix;
  return new Color(a.r * inv + b.r * mix,
                   a.g * inv + b.g * mix,
                   a.b * inv + b.b * mix);
}


function Range(fun, min, max) {
  var mid = (max - min) / 2;
  return function() {
    return fun() * mid + mid;
  };
}

SPI2.setup({baud:3200000 , mosi:B15});
var WIDTH = 3;
var HEIGHT = 3;
var g = Graphics.createArrayBuffer(WIDTH,
                                   HEIGHT,
                                   24, { zigzag: true });
function upd() {
  SPI2.send4bit(g.buffer, 1, 3);
}

g.setPixel(0,0,255);
upd();


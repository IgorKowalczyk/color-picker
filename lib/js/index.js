/* (c) Igor Kowalczyk. All rights reserved. */

/*const toggletheme = document.querySelector('.theme-switch input[type="checkbox"]');
const currenttheme = localStorage.getItem('theme');
if (currenttheme) {
document.documentElement.setAttribute('data-theme', currenttheme);
if (currenttheme === 'dark') {
toggletheme.checked = true;
}
}
function switchtheme(e) {
if (e.target.checked) {
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('theme', 'dark');
}
else {
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('theme', 'light');
}
}
toggletheme.addEventListener('change', switchtheme, false);

var scrollposition = window.scrollY;
var logocontainer = document.getElementsByClassName('nav')[0];
window.addEventListener('scroll', function() {
scrollposition = window.scrollY;
if (scrollposition >= 40) {
logocontainer.classList.add('nav-scrolled');
} else {
logocontainer.classList.remove('nav-scrolled');
}
});
*/


/*document.addEventListener('click', function(event) {
if (!event.target.classList.contains("link-fade")) return;
event.preventDefault();
var link = event.target;
document.body.style.opacity = 0;
document.body.addEventListener("transitionend", function() {
location.href = link.href;
});
});

var date = document.querySelector(".date");
date.innerHTML = (new Date().getFullYear());

*/

var addSwatch = document.getElementById('add-swatch');
var modeToggle = document.getElementById('mode-toggle');
var swatches = document.getElementsByClassName('default-swatches')[0];
var colorIndicator = document.getElementById('color-indicator');
var userSwatches = document.getElementById('user-swatches');

var spectrumCanvas = document.getElementById('spectrum-canvas');
var spectrumCtx = spectrumCanvas.getContext('2d');
var spectrumCursor = document.getElementById('spectrum-cursor'); 
var spectrumRect = spectrumCanvas.getBoundingClientRect();

var hueCanvas = document.getElementById('hue-canvas');
var hueCtx = hueCanvas.getContext('2d');
var hueCursor = document.getElementById('hue-cursor'); 
var hueRect = hueCanvas.getBoundingClientRect();

var currentColor = '';
var hue = 0;
var saturation = 1;
var lightness = .5;

var rgbFields = document.getElementById('rgb-fields');
var hexField = document.getElementById('hex-field');

var red = document.getElementById('red');
var blue = document.getElementById('blue');
var green = document.getElementById('green');
var hex = document.getElementById('hex'); 

function ColorPicker(){
  this.addDefaultSwatches();
  createShadeSpectrum();
  createHueSpectrum();
};

ColorPicker.prototype.defaultSwatches = [
  '#FFFFFF', 
  '#FFFB0D', 
  '#0532FF', 
  '#FF9300', 
  '#00F91A', 
  '#FF2700', 
  '#000000', 
  '#686868', 
  '#EE5464', 
  '#D27AEE', 
  '#5BA8C4', 
  '#E64AA9'
];

function createSwatch(target, color){
  var swatch = document.createElement('button');
  swatch.classList.add('swatch');
  swatch.setAttribute('title', color);
  swatch.style.backgroundColor = color;
  swatch.addEventListener('click', function(){
    var color = tinycolor(this.style.backgroundColor);     
    colorToPos(color);
    setColorValues(color);
  });
  target.appendChild(swatch);
  refreshElementRects();
};

ColorPicker.prototype.addDefaultSwatches = function() {
  for(var i = 0; i < this.defaultSwatches.length; ++i){
    createSwatch(swatches, this.defaultSwatches[i]);
  } 
}

function refreshElementRects(){
  spectrumRect = spectrumCanvas.getBoundingClientRect();
  hueRect = hueCanvas.getBoundingClientRect();
}

function createShadeSpectrum(color) {
  canvas = spectrumCanvas;
  ctx = spectrumCtx;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(!color) color = '#f00';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  whiteGradient.addColorStop(0, "#fff");
  whiteGradient.addColorStop(1, "transparent");
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  blackGradient.addColorStop(0, "transparent");
  blackGradient.addColorStop(1, "#000");
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener('mousedown', function(e){
    startGetSpectrumColor(e);
  });
};

function createHueSpectrum() {
  var canvas = hueCanvas;
  var ctx = hueCtx;
  var hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  hueGradient.addColorStop(0.00, "hsl(0,100%,50%)");
  hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
  hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
  hueGradient.addColorStop(0.50, "hsl(180, 100%, 50%)");
  hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
  hueGradient.addColorStop(0.83, "hsl(61.2,100%,50%)");
  hueGradient.addColorStop(1.00, "hsl(360,100%,50%)");
  ctx.fillStyle = hueGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvas.addEventListener('mousedown', function(e){
    startGetHueColor(e);
  });
};

function colorToHue(color){
  var color = tinycolor(color);
  var hueString = tinycolor('hsl '+ color.toHsl().h + ' 1 .5').toHslString();
  return hueString;
};

function colorToPos(color){
  var color = tinycolor(color);
  var hsl = color.toHsl();
  hue = hsl.h;
  var hsv = color.toHsv();
  var x = spectrumRect.width * hsv.s;
  var y = spectrumRect.height * (1 - hsv.v);
  var hueY = hueRect.height - ((hue / 360) * hueRect.height);
  updateSpectrumCursor(x,y);
  updateHueCursor(hueY);
  setCurrentColor(color);
  createShadeSpectrum(colorToHue(color));   
};

function setColorValues(color){  
  //convert to tinycolor object
  var color = tinycolor(color);
  var rgbValues = color.toRgb();
  var hexValue = color.toHex();
  //set inputs
  red.value = rgbValues.r;
  green.value = rgbValues.g;
  blue.value = rgbValues.b;
  hex.value = hexValue;
};

function setCurrentColor(color){
  color = tinycolor(color);
  currentColor = color;
  colorIndicator.style.backgroundColor = color;
  document.body.style.backgroundColor = color; 
  spectrumCursor.style.backgroundColor = color; 
  hueCursor.style.backgroundColor = 'hsl('+ color.toHsl().h +', 100%, 50%)';
};

function updateHueCursor(y){
  hueCursor.style.top = y + 'px';
}

function updateSpectrumCursor(x, y){
  //assign position
  spectrumCursor.style.left = x + 'px';
  spectrumCursor.style.top = y + 'px';  
};

var startGetSpectrumColor = function(e) {
  getSpectrumColor(e);
  spectrumCursor.classList.add('dragging');
  window.addEventListener('mousemove', getSpectrumColor);
  window.addEventListener('mouseup', endGetSpectrumColor);
};

function getSpectrumColor(e) {
  // got some help here - http://stackoverflow.com/questions/23520909/get-hsl-value-given-x-y-and-hue
  e.preventDefault();
  //get x/y coordinates
  var x = e.pageX - spectrumRect.left;
  var y = e.pageY - spectrumRect.top;
  //constrain x max
  if(x > spectrumRect.width){ x = spectrumRect.width}
  if(x < 0){ x = 0}
  if(y > spectrumRect.height){ y = spectrumRect.height}
  if(y < 0){ y = .1}  
  //convert between hsv and hsl
  var xRatio = x / spectrumRect.width * 100;
  var yRatio = y / spectrumRect.height * 100; 
  var hsvValue = 1 - (yRatio / 100);
  var hsvSaturation = xRatio / 100;
  lightness = (hsvValue / 2) * (2 - hsvSaturation);
  saturation = (hsvValue * hsvSaturation) / (1 - Math.abs(2 * lightness - 1));
  var color = tinycolor('hsl ' + hue + ' ' + saturation + ' ' + lightness);
  setCurrentColor(color);  
  setColorValues(color);
  updateSpectrumCursor(x,y);
};

function endGetSpectrumColor(e){
  spectrumCursor.classList.remove('dragging');
  window.removeEventListener('mousemove', getSpectrumColor);
};

function startGetHueColor(e) {
  getHueColor(e);
  hueCursor.classList.add('dragging');
  window.addEventListener('mousemove', getHueColor);
  window.addEventListener('mouseup', endGetHueColor);
};

function getHueColor(e){
  e.preventDefault();
  var y = e.pageY - hueRect.top;
  if (y > hueRect.height){ y = hueRect.height};
  if (y < 0){ y = 0};  
  var percent = y / hueRect.height;
  hue = 360 - (360 * percent);
  var hueColor = tinycolor('hsl '+ hue + ' 1 .5').toHslString();
  var color = tinycolor('hsl '+ hue + ' ' + saturation + ' ' + lightness).toHslString();
  createShadeSpectrum(hueColor);
  updateHueCursor(y, hueColor)
  setCurrentColor(color);
  setColorValues(color);
};

function endGetHueColor(e){
    hueCursor.classList.remove('dragging');
  window.removeEventListener('mousemove', getHueColor);
};

// Add event listeners

red.addEventListener('change', function(){
    var color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
    colorToPos(color);
});

green.addEventListener('change', function(){
    var color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
    colorToPos(color);
});

blue.addEventListener('change', function(){
    var color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
    colorToPos(color);
});

addSwatch.addEventListener('click', function(){  
  createSwatch(userSwatches, currentColor);
});

modeToggle.addEventListener('click', function(){
  if(rgbFields.classList.contains('active') ? rgbFields.classList.remove('active') : rgbFields.classList.add('active'));
  if(hexField.classList.contains('active') ? hexField.classList.remove('active') : hexField.classList.add('active'));
});

window.addEventListener('resize', function(){
  refreshElementRects();
});

new ColorPicker();
/* (c) Igor Kowalczyk. All rights reserved. */

const toggletheme = document.querySelector('.theme-switch input[type="checkbox"]');
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

const radios = document.querySelectorAll('input[type="radio"]');
const colorContainer = document.getElementById('colorContainer');
const userInput = document.getElementById('userInput');
const fragment = document.getElementById('template');
let boxes = document.querySelectorAll('.box');
const updateBoxes = () => boxes = document.querySelectorAll('.box');
const setMode = (cMode) => {
boxes.forEach(box => {
box.querySelectorAll('p').forEach(item => {
if (cMode in item.dataset === true)
item.removeAttribute("hidden");
else item.setAttribute("hidden", true);
});
});
}
radios.forEach(option => {
option.addEventListener('change', (event) => {
return setMode(event.target.value);
});
});
const setDefault = () => radios[0].click();
setDefault();
const sendToClipboard = (str) => {
const el = document.createElement('textarea');
el.value = str;
el.setAttribute('readonly', '');
el.style.position = 'absolute';
el.style.left = '-9999px';
document.body.appendChild(el);
const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
el.select();
document.execCommand('copy');
document.body.removeChild(el);
if (selected) {
document.getSelection().removeAllRanges();
document.getSelection().addRange(selected);
}
}
const copyAnim = (el) => {
document.getElementById(el).className = "box pulse";
document.getElementById(el).addEventListener("animationend", function(event) {
document.getElementById(el).className = "box";
}, false);
}
const copyColor = (el) => {
copyAnim(el);
radios.forEach(item => {
if (item.checked === true) {
let bxid = el.match(/\d+/);
let result = boxes[bxid].querySelector(`[data-${item.value}]`);
sendToClipboard(result.textContent);
}
});
}
const to16 = (n) => parseInt(n, 10).toString(16);
const expand = (n) => (n.length === 1) ? `0${n}` : n;
const digits = (str) => str.match(/\d+/g);
const minMax = (r, g, b) => [Math.min(r, g, b), Math.max(r, g, b)];
const rgbToHEX = (rgb) => {
let [r, g, b] = digits(rgb);
[r, g, b] = [r, g, b].map(to16);
[r, g, b] = [r, g, b].map(expand);
return `#${r}${g}${b}`;
}
const rgbToHSL = (rgb) => {
let [r, g, b] = digits(rgb).map((n) => n / 255);
let [min, max] = minMax(r, g, b);
let [hue, sat, lit, c] = Array(4).fill(0);
lit = (max + min) / 2;
c = max - min;
if (c !== 0) hue = (max === r) ? ((g - b) / c) % 6 :
(max === g) ? (b - r) / c + 2 :
(r - g) / c + 4; //(max === b)
hue *= 60;
if (hue < 0) hue += 360;
if (c !== 0) sat = (c) / (1 - Math.abs(max + min - 1));
sat *= 100;
lit *= 100;
[hue, sat, lit] = [hue, sat, lit].map((n) => parseInt(n));
return `hsl(${hue}, ${sat}%, ${lit}%)`;
}
const hexToRGB = (hex) => {
hex = +`0x${hex.replace("#", "")}`;
let [r, g, b] = [(hex >> 16), (hex >> 8), hex].map((n) => n & 255);
return `rgb(${r}, ${g}, ${b})`;
}
const hexToHSL = (hex) => {
hex = hexToRGB(hex);
return rgbToHSL(hex);
}
function hslToHEX(hsl) {
let [h, s, l] = digits(hsl);
s /= 100;
l /= 100;
let [c, x, m, r, g, b] = Array(6).fill(0);
c = (1 - Math.abs(2 * l - 1)) * s;
x = c * (1 - Math.abs((h / 60) % 2 - 1));
m = l - c / 2;
if (0 <= h && h < 60)
[r, g, b] = [c, x, 0];
else if (60 <= h && h < 120)
[r, g, b] = [x, c, 0];
else if (120 <= h && h < 180)
[r, g, b] = [0, c, x];
else if (180 <= h && h < 240)
[r, g, b] = [0, x, c];
else if (240 <= h && h < 300)
[r, g, b] = [x, 0, c];
else if (300 <= h && h < 360)
[r, g, b] = [c, 0, x];
r = Math.round((r + m) * 255).toString(16);
g = Math.round((g + m) * 255).toString(16);
b = Math.round((b + m) * 255).toString(16);
[r, g, b] = [r, g, b].map(expand);
return `#${r}${g}${b}`;
}
const hslToRGB = (hsl) => {
let hex = hslToHEX(hsl);
return hexToRGB(hex);
}
function conversions(c) {
c = c.includes('(') ? [c.match(/\w+/g)[0].toUpperCase(), c] : ['HEX', c];
let v0 = v1 = v2 = "";
switch (c[0]) {
case "RGB":
v0 = c[1];
v1 = rgbToHEX(c[1]); // rgbToHEX
v2 = rgbToHSL(c[1]); // rgbToHSL
break;
case "HEX":
v0 = hexToRGB(c[1]); // hexToRGB
v1 = c[1];
v2 = hexToHSL(c[1]); // hexToHSL
break;
case "HSL":
v0 = hslToRGB(c[1]); // hslToRGB
v1 = hslToHEX(c[1]); // hslToHEX
v2 = c[1];
break;
}
return [v0, v1, v2];
}
function submit() {
let colors = userInput.value;
colors = colors.trim().split(`\n`);
colorContainer.textContent = '';
let boxID = 0;
colors.forEach(color => {
if (color !== '') {
const temp = document.importNode(template.content, true);
const cFormat = conversions(color);
temp.querySelector('.box').id = `box${boxID}`;
temp.querySelector('.box').style.backgroundColor = cFormat[0];
temp.querySelector('[data-default]').textContent = color; // DEF
temp.querySelector('[data-rgb]').textContent = cFormat[0]; // RGB
temp.querySelector('[data-hex]').textContent = cFormat[1]; // HEX
temp.querySelector('[data-hsl]').textContent = cFormat[2]; // HSL
colorContainer.appendChild(temp);
boxID++;
}
});
updateBoxes();
setDefault();
}
const palette = [
{
rgb: "rgb(17, 3, 7)",
hex: "#110307",
hsl: "hsl(345, 70%, 4%)"
},
{
rgb: "rgb(30, 5, 12)",
hex: "#1e050c",
hsl: "hsl(345, 70%, 7%)"
},
{
rgb: "rgb(43, 8, 17)",
hex: "#2b0811",
hsl: "hsl(345, 70%, 10%)"
},
{
rgb: "rgb(56, 10, 22)",
hex: "#380a16",
hsl: "hsl(345, 70%, 13%)"
},
{
rgb: "rgb(69, 12, 27)",
hex: "#450c1b",
hsl: "hsl(345, 70%, 16%)"
}
]
function submitJSON() {
let boxID = 0;
userInput.value = colorContainer.textContent = '';
palette.forEach(color => {
const temp = document.importNode(template.content, true);
temp.querySelector('.box').style.backgroundColor = color.rgb;
temp.querySelector('.box').id = `box${boxID}`;
const options = [color.rgb, color.hex, color.hsl];
userInput.value += `${options[boxID % 3]}\n`;
temp.querySelector('[data-default]').textContent = options[boxID % 3];
temp.querySelector('[data-rgb]').textContent = color.rgb; // RGB
temp.querySelector('[data-hex]').textContent = color.hex; // HEX
temp.querySelector('[data-hsl]').textContent = color.hsl; // HSL
colorContainer.appendChild(temp);
boxID++;
});
userInput.rows = (boxID < 20) ? (boxID + 1) : 20;
}
const cArray = ["#460a18", "rgb(70,10,24)", "#350812", "rgb(53,8,18)", "#23050c", "rgb(35,5,12)", "#120206", "rgb(18,2,6)", "#523c3e", "rgb(82,60,62)", "#373642", "rgb(55,54,66)", "#27293f", "rgb(39,41,63)", "#d5aaf0", "rgb(213,170,240)", "#996699", "rgb(153,102,153)", "#330033", "rgb(51,0,51)", "#50b2a1", "rgb(80,178,161)", "#336669", "#336669", "rgb(51,102,105)", "#295749", "rgb(41,87,73)", "#a4cabc", "rgb(164,202,188)", "#ebd596", "rgb(235,213,150)", "#e79f23", "rgb(231,159,35)", "rgb(231,159,35)", "#eab364", "rgb(234,179,100)", "#b2373e", "rgb(178,55,62)", "rgb(178,55,62)", "#acdb7a", "rgb(172,219,122)", "#ffffff", "rgb(255,255,255)", "#c5d6ea", "rgb(197,214,234)", "#1c2722", "rgb(28,39,34)", "#dcca61", "#dcca61", "rgb(220,202,97)", "#fa7d08", "rgb(250,125,8)", "#d32746", "rgb(211,39,70)", "#c5d6e8", "rgb(197,214,232)", "#493c3c", "rgb(73,60,60)", "rgb(73,60,60)", "#f2db74", "rgb(242,219,116)", "#d64128", "rgb(214,65,40)", "#feacdd", "rgb(254,172,221)", "#d3a11e", "rgb(211,161,30)", "#eee16a", "rgb(238,225,106)", "#2c1d1a", "rgb(44,29,26)", "#681e21", "rgb(104,30,33)", "#be0a16", "rgb(190,10,22)", "rgb(28,97,150)", "rgb(28,97,150)", "#3d5392", "rgb(61,83,146)", "#49407e", "rgb(73,64,126)", "#4e2f76", "rgb(78,47,118)", "#521d6b", "rgb(82,29,107)", "#223344", "#a8ea08", "rgb(168,234,8)", "#cfff00", "rgb(207,255,0)", "rgb(207,255,0)"];
const defaultList = () => {
let cArrayList = '';
cArray.forEach(item => {
cArrayList += `${item}\n`;
});
userInput.value = cArrayList.trim();
userInput.rows = 10;
submit();
}
defaultList();

document.addEventListener('click', function(event) {
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
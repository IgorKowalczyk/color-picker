const body = document.body;

const getValues = (() => (
Array.from(textarea.value.split("\n"))
.filter((v) => !!v & v.length > 3)
.map((v) => v.trim())
));

const setValues = ((value) => {
textarea.value = (
value
.filter((v) => (!!v & v.length > 3))
.map((v) => v.trim())
.join("\n")
);
textarea.rows = 10;
});

const toJSON = ((value) => {
return JSON.stringify(value, null, 2);
});

const dataObj = {
values: [],
add(data) {
this.values.push(data);
},

init() {
btnEXPORT.addEventListener("click", () => {
const a = document.createElement("a");
const content = JSON.stringify({ palette: dataObj.values }, null, 2);
a.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
a.setAttribute("download", "palette.json");
a.style.display = "none";
body.appendChild(a);
a.click();
body.removeChild(a);
}, false);
}
};

const tableObj = {
reset() {
if (table.hasAttribute("data-active")) {
table.textContent = "";
dataObj.values = [];
table.appendChild(
document.importNode(table_reset.content, true)
);
} else {
table.setAttribute("data-active", true);
}
},

add(array) {
array.forEach((color, i) => {
const instance = document.importNode(template.content, true);
const cells = [...instance.querySelectorAll("td")];
const [cDef, cRGB, cHEX, cHSL, cBl, cWh] = cells;
([cRGB.id, cHEX.id, cHSL.id] = [`rgb${i}`, `hex${i}`, `hsl${i}`]);

const { contrast } = color;
cDef.dataset.tooltip = `black: ${contrast.black}\n white: ${contrast.white}`;
cDef.style.color = (contrast.white > 4.5) ? "white" : "black";
cDef.style.background = color.rgb;

cDef.textContent = color.default;
cRGB.textContent = color.rgb;
cHEX.textContent = color.hex;
cHSL.textContent = color.hsl;
cBl.textContent = contrast.black;
cWh.textContent = contrast.white;
table.appendChild(instance);
});

btnEXPORT.removeAttribute("data-hide");
}
};


const colorUtil = {
hexString({ r, g, b }) { return `#${r}${g}${b}` /**/ .toUpperCase() /**/ ; },
rgbString({ r, g, b }) { return `rgb(${r}, ${g}, ${b})`; },
hslString({ h, s, l }) { return `hsl(${h}, ${s}%, ${l}%)`; },

rgbToHEX(value, { data } = false) {
let [r, g, b] = value.match(/\d+/g);
[r, g, b] = [r, g, b].map((n) => parseInt(n, 10).toString(16));
[r, g, b] = [r, g, b].map((n) => n.length === 1 ? `0${n}` : n);
return (data) ? ([r, g, b]) : colorUtil.hexString({ r, g, b });
},

rgbToHSL(value, { data } = false) {
let [r, g, b] = (Array.isArray(value)) ? value: value.match(/\d+/g);
[r, g, b] = [r, g, b].map((v) => v / 255);
let cmin = Math.min(r, g, b);
let cmax = Math.max(r, g, b);
let c = cmax - cmin;
let [h, s, l] = [0, 0, (cmax + cmin) * 0.5];
if (c !== 0) {
h =
(cmax === r) ? ((g - b) / c) % 6 :
(cmax === g) ? (b - r) / c + 2 :
(r - g) / c + 4; // (cmax === b)
s = c / (1 - Math.abs(cmax + cmin - 1));
}
[h, s, l] = [h * 60, s * 100, l * 100];
if (h < 0) h += 360;
[h, s, l] = [h, s, l].map((n) => parseInt(n));
return (data) ? ([h, s, l]) : colorUtil.hslString({ h, s, l });
},

hslToRGB(value, { data } = false) {
let [h, s, l] = value.match(/\d+/g);
[h, s, l] = [h / 60, s / 100, l / 100];
let c = s * (1 - Math.abs(2 * l - 1));
let x = c * (1 - Math.abs(h % 2 - 1));
let m = l - c / 2;
[c, x, m] = [(c + m), (x + m), m].map((v) => Math.round(v * 255));
[c, x, m] = [c, x, m].map((v) => (v < 1) ? 0 : v);
let [r, g, b] = [[c, x, m], [x, c, m], [m, c, x], [m, x, c], [x, m, c], [c, m, x]][Math.floor(h) % 6];
return (data) ? ([r, g, b]) : colorUtil.rgbString({ r, g, b });
},

hslToHEX(value, { data } = false) {
let [r, g, b] = colorUtil.hslToRGB(value, { data: true });
[r, g, b] = [r, g, b].map((n) => parseInt(n, 10).toString(16));
[r, g, b] = [r, g, b].map((n) => n.length === 1 ? `0${n}` : n);
return (data) ? ([r, g, b]) : colorUtil.hexString({ r, g, b });
},

hexToRGB(value, { data } = false) {
const hex = `0x${value.replace("#", "")}`;
const [r, g, b] = [(hex >> 16), (hex >> 8), hex].map((n) => n & 255);
return (data) ? ([r, g, b]) : colorUtil.rgbString({ r, g, b });
},

hexToHSL(value) {
const [r, g, b] = colorUtil.hexToRGB(value, { data: true });
return colorUtil.rgbToHSL([r, g, b]);
},

getContrast(colorA, colorB) {
const lin_sRGB = (v) =>
(v < 0.04045) ? (v / 12.92) : ((v + 0.055) / 1.055) ** 2.4;
const LUM = (value) => {
let [r, g, b] = value.match(/\d+/g);
[r, g, b] = [r, g, b].map(v => lin_sRGB(v / 255));
[r, g, b] = [r * 0.2126, g * 0.7152, b * 0.0722];
return [r, g, b].reduce((a, b) => a + b);
}
const [L1, L2] = [LUM(colorA), LUM(colorB)];
const compare = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
return (compare != undefined) ?
compare.toPrecision((compare >= 10) ? 4 : 3) : (L1 === L2) ? 1 : 21;
},
};


const submit = (() => {
tableObj.reset();

const isHEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
const isRGB = /^rgb\((\s*\d{1,3}\s*),(\s*\d{1,3}\s*),(\s*\d{1,3}\s*)\)$/i;
const isHSL = /^hsl\((\s*\d{1,3}\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*)\)$/i;

const { hexToRGB, hexToHSL, rgbToHEX, rgbToHSL, hslToRGB, hslToHEX, getContrast } = colorUtil;

const inputValues = getValues();
textarea.value = inputValues.join("\n");

inputValues.forEach(color => {
if (isHEX.test(color) && color.length < 6) {
color = "#" + ([...color.slice(1)])
.map((v) => `${v}${v}`).join("");
}

const [formatDEF, formatRGB, formatHEX, formatHSL] =
(isHEX.test(color)) ? ['HEX', hexToRGB(color), color, hexToHSL(color)] :
(isRGB.test(color)) ? ['RGB', color, rgbToHEX(color), rgbToHSL(color)] :
(isHSL.test(color)) ? ['HSL', hslToRGB(color), hslToHEX(color), color] : "";

dataObj.add({
default: formatDEF,
rgb: formatRGB,
hex: formatHEX,
hsl: formatHSL,
contrast: {
black: getContrast(formatRGB, "rgb(0,0,0)"),
white: getContrast(formatRGB, "rgb(255,255,255)")
}
});
});
tableObj.add(dataObj.values);
});

const copyObj = {
copyText(value) {
const body = document.body;
const el = document.createElement('textarea');
el.value = value;
el.setAttribute('readonly', "");
el.style.position = 'absolute';
el.style.left = '-9999px';
body.appendChild(el);
const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
el.select();
document.execCommand('copy');
body.removeChild(el);
if (selected) {
document.getSelection().removeAllRanges();
document.getSelection().addRange(selected);
}
},
copyAnim(el) {
el = document.getElementById(el);
el.className = "box pulse";
el.addEventListener("animationend", () => {
el.className = "box";
}, false);
}
};

button.addEventListener("click", () => { submit() }, false);

table.addEventListener("click", (e) => {
if (e.target && e.target.nodeName == "TD") {
copyObj.copyAnim(e.target.id)
copyObj.copyText(e.target.textContent);
}
}, false);

const colorArray = ([
"#E5F2EE",
"rgb(171, 223, 207)",
"#78CBB4",
"#4FB79D",
"hsl(166, 53%, 41%)",
"#1B9077",
"#0C7C66",
"#036855",
"#005545",
"#004136",
"hsl(170, 100%, 8%)",
"#001A15",
"rgb(242, 229, 229)",
"#F2C2C3",
"#F0A0A1",
"rgb(236, 127, 129)",
"#E66467",
"hsl(357, 68%, 58%)",
"hsl(357, 61%, 51%)",
"#BE2A31",
"#A41E25",
"#7F131A",
"#500B10",
"#1A0305",
"#F2EAE5",
"#EFCEBC",
"#EAB293",
"#E2986E",
"#D8814F",
"hsl(22, 57%, 50%)",
"#B75D22",
"#A04E14",
"#843F0A",
"#632F05",
"#3E1F01",
"#1A0D00",
"hsl(38, 34%, 92%)",
"#F0DBAE",
"#E7C878",
"rgb(217, 179, 72)",
"#C49D21",
"#AB8606",
"hsl(47, 100%, 28%)",
"#765E00",
"#5C4A00",
"#443700",
"#2E2600",
"hsl(48, 100%, 5%)",
"#EDF2E3",
"rgb(204, 235, 169)",
"#99D971",
"hsl(105, 53%, 51%)",
"#2EB01E",
"#069A08",
"#008310",
"#006D16",
"#005817",
"#004214",
"#002E0F",
"#001A09"
]);

setValues(colorArray);
dataObj.init();
submit();

const toggletheme = document.querySelector('.theme-switch input[type="checkbox"]');
const currenttheme = localStorage.getItem('theme');
const meta = document.querySelector('meta[name="theme-color"]');
if (currenttheme) {
document.documentElement.setAttribute('data-theme', currenttheme);
if (currenttheme === 'dark') {
toggletheme.checked = true;
}
}
function switchtheme(e) {
if (e.target.checked) {
document.documentElement.setAttribute('data-theme', 'dark');
meta.setAttribute("content", "#222");
localStorage.setItem('theme', 'dark');
}
else {
document.documentElement.setAttribute('data-theme', 'light');
meta.setAttribute("content", "#ffffff");
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

(function () {
var close = document.getElementById("close");
var info = document.getElementById("info");
if(sessionStorage.getItem('info') === null) {
close.addEventListener("click", () => {
info.classList.add("info-hide");
sessionStorage.setItem('info', 'true');
});
} else {
info.style.display="none";
}
})();

var date = document.querySelector(".date");
date.innerHTML = (new Date().getFullYear());
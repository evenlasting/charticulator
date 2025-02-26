"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultColorPalette = exports.getDefaultColorPaletteByValue = exports.getDefaultColorGeneratorResetFunction = exports.setDefaultColorGeneratorResetFunction = exports.getDefaultColorPaletteGenerator = exports.setDefaultColorPaletteGenerator = exports.interpolateColors = exports.interpolateColor = exports.getColorConverter = exports.colorToHTMLColorHEX = exports.colorToHTMLColor = exports.parseColorOrThrowException = exports.colorFromHTMLColor = void 0;
const math_1 = require("./math");
/** Get Color from HTML color string */
function colorFromHTMLColor(html) {
    let m;
    m = html.match(/^ *rgb *\( *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *\) *$/);
    if (m) {
        return { r: +m[1], g: +m[2], b: +m[3] };
    }
    m = html.match(/^ *rgba *\( *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *\) *$/);
    if (m) {
        return { r: +m[1], g: +m[2], b: +m[3] };
    }
    m = html.match(/^ *#([0-9a-fA-F]{3}) *$/);
    if (m) {
        const r = parseInt(m[1][0], 16) * 17;
        const g = parseInt(m[1][1], 16) * 17;
        const b = parseInt(m[1][2], 16) * 17;
        return { r, g, b };
    }
    m = html.match(/^ *#([0-9a-fA-F]{6}) *$/);
    if (m) {
        const r = parseInt(m[1].slice(0, 2), 16);
        const g = parseInt(m[1].slice(2, 4), 16);
        const b = parseInt(m[1].slice(4, 6), 16);
        return { r, g, b };
    }
    return { r: 0, g: 0, b: 0 };
}
exports.colorFromHTMLColor = colorFromHTMLColor;
function parseColorOrThrowException(html) {
    let m;
    m = html.match(/^ *rgb *\( *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *\) *$/);
    if (m) {
        return { r: +m[1], g: +m[2], b: +m[3] };
    }
    m = html.match(/^ *rgba *\( *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *, *([0-9.\-e]+) *\) *$/);
    if (m) {
        return { r: +m[1], g: +m[2], b: +m[3] };
    }
    m = html.match(/^ *#([0-9a-fA-F]{3}) *$/);
    if (m) {
        const r = parseInt(m[1][0], 16) * 17;
        const g = parseInt(m[1][1], 16) * 17;
        const b = parseInt(m[1][2], 16) * 17;
        return { r, g, b };
    }
    m = html.match(/^ *#([0-9a-fA-F]{6}) *$/);
    if (m) {
        const r = parseInt(m[1].slice(0, 2), 16);
        const g = parseInt(m[1].slice(2, 4), 16);
        const b = parseInt(m[1].slice(4, 6), 16);
        return { r, g, b };
    }
    throw new Error(`Cant recognize color: ${html}`);
}
exports.parseColorOrThrowException = parseColorOrThrowException;
function colorToHTMLColor(color) {
    return `rgb(${color.r.toFixed(0)},${color.g.toFixed(0)},${color.b.toFixed(0)})`;
}
exports.colorToHTMLColor = colorToHTMLColor;
function colorToHTMLColorHEX(color) {
    const f = (x) => (0x100 | Math.round(x)).toString(16).substring(1);
    return `#${f(color.r)}${f(color.g)}${f(color.b)}`;
}
exports.colorToHTMLColorHEX = colorToHTMLColorHEX;
function xyz_to_lab_f(t) {
    if (t > 0.008856451679035631) {
        return Math.cbrt(t);
    }
    else {
        return t / 0.12841854934601665 + 0.13793103448275862;
    }
}
// D65 Luminant
const D65_Xn = 95.047;
const D65_Yn = 100.0;
const D65_Zn = 108.883;
function xyz_to_lab(x, y, z) {
    // D65 white point:
    const l = 116 * xyz_to_lab_f(y / D65_Yn) - 16;
    const a = 500 * (xyz_to_lab_f(x / D65_Xn) - xyz_to_lab_f(y / D65_Yn));
    const b = 200 * (xyz_to_lab_f(y / D65_Yn) - xyz_to_lab_f(z / D65_Zn));
    return [l, a, b];
}
function lab_to_xyz_f(t) {
    if (t > 0.20689655172413793) {
        return t * t * t;
    }
    else {
        return 0.12841854934601665 * (t - 0.13793103448275862);
    }
}
function lab_to_xyz(l, a, b) {
    const x = D65_Xn * lab_to_xyz_f((l + 16) / 116 + a / 500);
    const y = D65_Yn * lab_to_xyz_f((l + 16) / 116);
    const z = D65_Zn * lab_to_xyz_f((l + 16) / 116 - b / 200);
    return [x, y, z];
}
function hcl_to_lab(h_degree, c, l) {
    const h = math_1.Geometry.degreesToRadians(h_degree);
    return [l, c * Math.cos(h), c * Math.sin(h)];
}
function lab_to_hcl(l, a, b) {
    const c = Math.sqrt(a * a + b * b);
    let h_degree = (Math.atan2(b, a) / Math.PI) * 180;
    h_degree = ((h_degree % 360) + 360) % 360;
    return [h_degree, c, l];
}
function hcl_to_xyz(h, c, l) {
    const [L, a, b] = hcl_to_lab(h, c, l);
    return lab_to_xyz(L, a, b);
}
function xyz_to_hcl(x, y, z) {
    const [L, a, b] = xyz_to_lab(x, y, z);
    return lab_to_hcl(L, a, b);
}
function xyz_to_sRGB_f(v) {
    if (v > 0.0031308) {
        return 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
    }
    else {
        return 12.92 * v;
    }
}
function xyz_to_sRGB(x, y, z) {
    const Rl = x * 3.2406 + y * -1.5372 + z * -0.4986;
    const Gl = x * -0.9689 + y * 1.8758 + z * 0.0415;
    const Bl = x * 0.0557 + y * -0.204 + z * 1.057;
    let r = xyz_to_sRGB_f(Rl / 100) * 255;
    let g = xyz_to_sRGB_f(Gl / 100) * 255;
    let b = xyz_to_sRGB_f(Bl / 100) * 255;
    const clamped = r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return [r, g, b, clamped];
}
function sRGB_to_xyz_f(v) {
    if (v <= 0.04045) {
        return v / 12.92;
    }
    else {
        return Math.pow((v + 0.055) / 1.055, 2.4);
    }
}
function sRGB_to_xyz(r, g, b) {
    const Rl = sRGB_to_xyz_f(r / 255);
    const Gl = sRGB_to_xyz_f(g / 255);
    const Bl = sRGB_to_xyz_f(b / 255);
    const x = 0.4124 * Rl + 0.3576 * Gl + 0.1805 * Bl;
    const y = 0.2126 * Rl + 0.7152 * Gl + 0.0722 * Bl;
    const z = 0.0193 * Rl + 0.1192 * Gl + 0.9505 * Bl;
    return [x * 100, y * 100, z * 100];
}
function xyz_to_AppleP3_f(v) {
    if (v > 0.0031308) {
        return 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
    }
    else {
        return 12.92 * v;
    }
}
function xyz_to_AppleP3(x, y, z) {
    const Rl = x * 2.725394 + y * -1.018003 + z * -0.440163;
    const Gl = x * -0.795168 + y * 1.689732 + z * 0.022647;
    const Bl = x * 0.041242 + y * -0.087639 + z * 1.100929;
    let r = xyz_to_AppleP3_f(Rl / 100) * 255;
    let g = xyz_to_AppleP3_f(Gl / 100) * 255;
    let b = xyz_to_AppleP3_f(Bl / 100) * 255;
    const clamped = r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return [r, g, b, clamped];
}
function AppleP3_to_xyz_f(v) {
    if (v <= 0.04045) {
        return v / 12.92;
    }
    else {
        return Math.pow((v + 0.055) / 1.055, 2.4);
    }
}
function AppleP3_to_xyz(r, g, b) {
    const Rl = AppleP3_to_xyz_f(r / 255);
    const Gl = AppleP3_to_xyz_f(g / 255);
    const Bl = AppleP3_to_xyz_f(b / 255);
    const x = 0.44517 * Rl + 0.277134 * Gl + 0.172283 * Bl;
    const y = 0.209492 * Rl + 0.721595 * Gl + 0.068913 * Bl;
    const z = 0.0 * Rl + 0.047061 * Gl + 0.907355 * Bl;
    return [x * 100, y * 100, z * 100];
}
const colorspaces = new Map();
const converter_cache = new Map();
function addColorspace(name, fromXYZ, toXYZ) {
    colorspaces.set(name, { fromXYZ, toXYZ });
}
addColorspace("lab", xyz_to_lab, lab_to_xyz);
addColorspace("sRGB", xyz_to_sRGB, sRGB_to_xyz);
addColorspace("AppleDisplayP3", xyz_to_AppleP3, AppleP3_to_xyz);
addColorspace("hcl", xyz_to_hcl, hcl_to_xyz);
function getColorConverter(from, to) {
    const hash = from + "|" + to;
    if (converter_cache.has(hash)) {
        return converter_cache.get(hash);
    }
    let c;
    if (from == to) {
        c = (a, b, c) => [a, b, c];
    }
    else if (from == "xyz") {
        c = colorspaces.get(to).fromXYZ;
    }
    else if (to == "xyz") {
        c = colorspaces.get(from).toXYZ;
    }
    else {
        const f1 = colorspaces.get(from).toXYZ;
        const f2 = colorspaces.get(to).fromXYZ;
        c = (a, b, c) => {
            const [x, y, z] = f1(a, b, c);
            return f2(x, y, z);
        };
    }
    converter_cache.set(hash, c);
    return c;
}
exports.getColorConverter = getColorConverter;
function hueInterp(a, b, t) {
    if (Math.abs(b - a) > 180) {
        if (b > a) {
            b = b - 360;
        }
        else {
            a = a - 360;
        }
    }
    return t * (b - a) + a;
}
function interpolateColor(from, to, colorspace = "lab") {
    const color_to_space = getColorConverter("sRGB", colorspace);
    const space_to_color = getColorConverter(colorspace, "sRGB");
    const c1 = color_to_space(from.r, from.g, from.b);
    const c2 = color_to_space(to.r, to.g, to.b);
    return (t) => {
        t = Math.min(1, Math.max(0, t));
        const [r, g, b] = space_to_color(colorspace == "hcl"
            ? hueInterp(c1[0], c2[0], t)
            : c1[0] * (1 - t) + c2[0] * t, c1[1] * (1 - t) + c2[1] * t, c1[2] * (1 - t) + c2[2] * t);
        return { r, g, b };
    };
}
exports.interpolateColor = interpolateColor;
function interpolateColors(colors, colorspace = "lab") {
    const color_to_space = getColorConverter("sRGB", colorspace);
    const space_to_color = getColorConverter(colorspace, "sRGB");
    const cs = colors.map((x) => color_to_space(x.r, x.g, x.b));
    return (t) => {
        t = Math.min(1, Math.max(0, t));
        const pos = t * (colors.length - 1);
        let i1 = Math.floor(pos);
        let i2 = i1 + 1;
        i1 = Math.min(colors.length - 1, Math.max(i1, 0));
        i2 = Math.min(colors.length - 1, Math.max(i2, 0));
        const d = pos - i1;
        const c1 = cs[i1];
        const c2 = cs[i2];
        const [r, g, b] = space_to_color(colorspace == "hcl"
            ? hueInterp(c1[0], c2[0], d)
            : c1[0] * (1 - d) + c2[0] * d, c1[1] * (1 - d) + c2[1] * d, c1[2] * (1 - d) + c2[2] * d);
        return { r, g, b };
    };
}
exports.interpolateColors = interpolateColors;
const brewer3 = ["#7fc97f", "#beaed4", "#fdc086"].map(colorFromHTMLColor);
const brewer6 = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
].map(colorFromHTMLColor);
const brewer12 = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
].map(colorFromHTMLColor);
let defaultColorGeneratorFunction = null;
let defaultColorGeneratorResetFunction;
function setDefaultColorPaletteGenerator(generatorFunction) {
    defaultColorGeneratorFunction = generatorFunction;
}
exports.setDefaultColorPaletteGenerator = setDefaultColorPaletteGenerator;
function getDefaultColorPaletteGenerator() {
    return defaultColorGeneratorFunction;
}
exports.getDefaultColorPaletteGenerator = getDefaultColorPaletteGenerator;
function setDefaultColorGeneratorResetFunction(resetFunction) {
    defaultColorGeneratorResetFunction = resetFunction;
}
exports.setDefaultColorGeneratorResetFunction = setDefaultColorGeneratorResetFunction;
function getDefaultColorGeneratorResetFunction() {
    return defaultColorGeneratorResetFunction;
}
exports.getDefaultColorGeneratorResetFunction = getDefaultColorGeneratorResetFunction;
// eslint-disable-next-line
function getDefaultColorPaletteByValue(value, count) {
    return defaultColorGeneratorFunction === null || defaultColorGeneratorFunction === void 0 ? void 0 : defaultColorGeneratorFunction(value);
}
exports.getDefaultColorPaletteByValue = getDefaultColorPaletteByValue;
function getDefaultColorPalette(count) {
    if (defaultColorGeneratorFunction) {
        return new Array(count)
            .fill(null)
            .map((v, index) => defaultColorGeneratorFunction(index.toString()));
    }
    let r = brewer12;
    if (count <= 3) {
        r = brewer3;
    }
    else if (count <= 6) {
        r = brewer6;
    }
    else {
        r = brewer12;
    }
    return r;
}
exports.getDefaultColorPalette = getDefaultColorPalette;
//# sourceMappingURL=color.js.map
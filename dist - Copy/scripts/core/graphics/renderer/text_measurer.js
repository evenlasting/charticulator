"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitByWidth = exports.split = exports.BREAKERS_REGEX = exports.SPACE = exports.TextMeasurer = void 0;
const __1 = require("../..");
const defaults_1 = require("../../../app/stores/defaults");
class TextMeasurer {
    constructor() {
        if (typeof document != "undefined") {
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.fontFamily = defaults_1.defaultFont;
            this.fontSize = defaults_1.defaultFontSize;
        }
    }
    setFontFamily(family) {
        this.fontFamily = family;
    }
    setFontSize(size) {
        this.fontSize = size;
    }
    measure(text) {
        this.context.font = `${this.fontSize}px "${this.fontFamily}"`;
        return {
            width: this.context.measureText(text).width,
            fontSize: this.fontSize,
            ideographicBaseline: this.fontSize * TextMeasurer.parameters.ideographicBaseline[0] +
                TextMeasurer.parameters.ideographicBaseline[1],
            hangingBaseline: this.fontSize * TextMeasurer.parameters.hangingBaseline[0] +
                TextMeasurer.parameters.hangingBaseline[1],
            alphabeticBaseline: this.fontSize * TextMeasurer.parameters.alphabeticBaseline[0] +
                TextMeasurer.parameters.alphabeticBaseline[1],
            middle: this.fontSize * TextMeasurer.parameters.middle[0] +
                TextMeasurer.parameters.middle[1],
        };
    }
    static GetGlobalInstance() {
        if (this.globalInstance == null) {
            this.globalInstance = new TextMeasurer();
        }
        return this.globalInstance;
    }
    static Measure(text, family, size) {
        const inst = this.GetGlobalInstance();
        inst.setFontFamily(family);
        inst.setFontSize(size);
        return inst.measure(text);
    }
    static ComputeTextPosition(x, y, metrics, alignX = "left", alignY = "middle", xMargin = 0, yMargin = 0) {
        const cwidth = metrics.width;
        const cheight = (metrics.middle - metrics.ideographicBaseline) * 2;
        let cx = cwidth / 2, cy = cheight / 2;
        if (alignX == "left") {
            cx = -xMargin;
        }
        if (alignX == "right") {
            cx = cwidth + xMargin;
        }
        if (alignY == "top") {
            cy = -yMargin;
        }
        if (alignY == "bottom") {
            cy = cheight + yMargin;
        }
        return [x - cx, y - cheight + cy - metrics.ideographicBaseline];
    }
}
exports.TextMeasurer = TextMeasurer;
TextMeasurer.parameters = {
    hangingBaseline: [0.7245381636743151, -0.005125313493913097],
    ideographicBaseline: [-0.2120442632498544, 0.008153756552125913],
    alphabeticBaseline: [0, 0],
    middle: [0.34642399534071056, -0.22714036109493208],
};
TextMeasurer.globalInstance = null;
exports.SPACE = " ";
exports.BREAKERS_REGEX = /[\s]+/g;
function split(str) {
    return str.split(exports.BREAKERS_REGEX);
}
exports.split = split;
/**
 * Splits text to fragments do display text with word wrap
 * Source code taken from https://github.com/microsoft/powerbi-visuals-utils-formattingutils/blob/master/src/wordBreaker.ts#L130
 * @param content source of text
 * @param maxWidth max awailable with for text
 * @param maxNumLines limit lines count, rest of words will be drew in the last line
 * @param fontFamily font family
 * @param fontSize font size in px
 */
function splitByWidth(content, maxWidth, maxNumLines, fontFamily, fontSize) {
    // Default truncator returns string as-is
    const result = [];
    const words = split(content);
    let usedWidth = 0;
    let wordsInLine = [];
    for (const word of words) {
        // Last line? Just add whatever is left
        if (maxNumLines > 0 && result.length >= maxNumLines - 1) {
            wordsInLine.push(word);
            continue;
        }
        // Determine width if we add this word
        // Account for SPACE we will add when joining...
        const metrics = __1.Graphics.TextMeasurer.Measure(word, fontFamily, fontSize);
        const wordWidth = metrics.width;
        // If width would exceed max width,
        // then push used words and start new split result
        if (usedWidth + wordWidth > maxWidth) {
            // Word alone exceeds max width, just add it.
            if (wordsInLine.length === 0) {
                result.push(word);
                usedWidth = 0;
                wordsInLine = [];
                continue;
            }
            result.push(wordsInLine.join(exports.SPACE));
            usedWidth = 0;
            wordsInLine = [];
        }
        // ...otherwise, add word and continue
        wordsInLine.push(word);
        usedWidth += wordWidth;
    }
    // Push remaining words onto result (if any)
    if (wordsInLine && wordsInLine.length) {
        result.push(wordsInLine.join(exports.SPACE));
    }
    return result;
}
exports.splitByWidth = splitByWidth;
//# sourceMappingURL=text_measurer.js.map
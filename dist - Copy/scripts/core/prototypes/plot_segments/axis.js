"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAxisProperties = exports.buildAxisInference = exports.buildAxisWidgets = exports.buildAxisAppearanceWidgets = exports.getNumericalInterpolate = exports.getCategoricalAxis = exports.AxisRenderer = exports.AxisMode = exports.defaultAxisStyle = void 0;
const common_1 = require("../../common");
const graphics_1 = require("../../graphics");
const text_measurer_1 = require("../../graphics/renderer/text_measurer");
const index_1 = require("../../index");
const common_2 = require("../common");
const specification_1 = require("../../specification");
const strings_1 = require("../../../strings");
const defaults_1 = require("../../../app/stores/defaults");
const types_1 = require("../../specification/types");
const virtualScroll_1 = require("./virtualScroll");
const Expression = require("../../expression");
const React = require("react");
exports.defaultAxisStyle = {
    tickColor: { r: 0, g: 0, b: 0 },
    showTicks: true,
    lineColor: { r: 0, g: 0, b: 0 },
    fontFamily: defaults_1.defaultFont,
    fontSize: defaults_1.defaultFontSize,
    tickSize: 5,
    wordWrap: false,
    verticalText: false,
    gridlineStyle: "none",
    gridlineColor: {
        r: 234,
        g: 234,
        b: 234,
    },
    gridlineWidth: 1,
};
function fillDefaultAxisStyle(style) {
    return common_1.fillDefaults(style, exports.defaultAxisStyle);
}
var AxisMode;
(function (AxisMode) {
    AxisMode["X"] = "x";
    AxisMode["Y"] = "y";
})(AxisMode = exports.AxisMode || (exports.AxisMode = {}));
class AxisRenderer {
    constructor() {
        this.ticks = [];
        this.style = exports.defaultAxisStyle;
        this.rangeMin = 0;
        this.rangeMax = 1;
        this.oppositeSide = false;
        this.scrollRequired = false;
        this.shiftAxis = true;
        this.hiddenCategoriesRatio = 0;
        this.handlerSize = 0;
        this.dataType = types_1.AxisDataBindingType.Default;
        this.windowSize = 0;
    }
    setStyle(style) {
        if (!style) {
            this.style = exports.defaultAxisStyle;
        }
        else {
            this.style = fillDefaultAxisStyle(common_1.deepClone(style));
        }
        return this;
    }
    setAxisDataBinding(data, rangeMin, rangeMax, enablePrePostGap, reverse, getTickFormat, plotSegment, dataflow) {
        var _a, _b;
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        if (!data) {
            return this;
        }
        this.plotSegment = plotSegment;
        this.dataFlow = dataflow;
        this.data = data;
        this.setStyle(data.style);
        this.oppositeSide = data.side == "opposite";
        this.scrollRequired = data.allowScrolling;
        this.shiftAxis =
            (data.barOffset == null || data.barOffset === 0) &&
                ((data.allCategories && data.windowSize < ((_a = data.allCategories) === null || _a === void 0 ? void 0 : _a.length)) ||
                    Math.abs(data.dataDomainMax - data.dataDomainMin) > data.windowSize);
        this.dataType = data.type;
        if (data.allCategories && data.windowSize < ((_b = data.allCategories) === null || _b === void 0 ? void 0 : _b.length)) {
            this.hiddenCategoriesRatio = data.windowSize / data.allCategories.length;
            this.handlerSize = rangeMax / this.hiddenCategoriesRatio;
            this.windowSize = data.windowSize;
        }
        switch (data.type) {
            case "numerical":
                {
                    if (!data.numericalMode || data.numericalMode == "linear") {
                        this.setLinearScale(data.domainMin, data.domainMax, rangeMin, rangeMax, data.tickFormat);
                    }
                    if (data.numericalMode == "logarithmic") {
                        this.setLogarithmicScale(data.domainMin, data.domainMax, rangeMin, rangeMax, data.tickFormat);
                    }
                    if (data.numericalMode == "temporal") {
                        this.setTemporalScale(data.domainMin, data.domainMax, rangeMin, rangeMax, data.tickFormat);
                    }
                }
                break;
            case "categorical":
                {
                    this.setCategoricalScale(data.categories, getCategoricalAxis(data, enablePrePostGap, reverse).ranges, rangeMin, rangeMax, getTickFormat);
                }
                break;
            // case "default":
            //   {
            //   }
            //   break;
        }
        return this;
    }
    setTicksByData(ticks, tickFormatString, tickFormatType) {
        const position2Tick = new Map();
        for (const tick of ticks) {
            const pos = this.valueToPosition(tick.value);
            let label;
            const tickFormat = tickFormatString
                ? tickFormatString === null || tickFormatString === void 0 ? void 0 : tickFormatString.replace(common_1.tickFormatParserExpression(), "$1") : null;
            if (!tickFormat) {
                label = tick.tick;
            }
            else {
                if (tickFormatType === types_1.TickFormatType.Number) {
                    label = common_1.getFormat()(tickFormat)(tick.tick);
                }
                else if (tickFormatType === types_1.TickFormatType.Date) {
                    label = common_1.applyDateFormat(new Date(tick.tick), tickFormat);
                }
                else {
                    label = tick.tick;
                }
            }
            position2Tick.set(pos, label);
        }
        this.ticks = [];
        for (const [pos, tick] of position2Tick.entries()) {
            this.ticks.push({
                position: pos,
                label: tick,
            });
        }
    }
    static getTickFormat(tickFormat, defaultFormat) {
        if (tickFormat == null || tickFormat == "") {
            return defaultFormat;
        }
        else {
            // {.0%}
            return (value) => {
                return tickFormat.replace(common_1.tickFormatParserExpression(), (_, spec) => {
                    return common_1.getFormat()(spec)(value);
                });
            };
        }
    }
    setLinearScale(domainMin, domainMax, rangeMin, rangeMax, tickFormat) {
        const scale = new common_1.Scale.LinearScale();
        scale.domainMin = domainMin;
        scale.domainMax = domainMax;
        const rangeLength = Math.abs(rangeMax - rangeMin);
        const ticks = scale.ticks(Math.round(Math.min(10, rangeLength / 40)));
        const defaultFormat = scale.tickFormat(Math.round(Math.min(10, rangeLength / 40)));
        const resolvedFormat = AxisRenderer.getTickFormat(tickFormat, defaultFormat);
        const r = [];
        for (let i = 0; i < ticks.length; i++) {
            const tx = ((ticks[i] - domainMin) / (domainMax - domainMin)) *
                (rangeMax - rangeMin) +
                rangeMin;
            if (!isNaN(tx)) {
                r.push({
                    position: tx,
                    label: resolvedFormat(ticks[i]),
                });
            }
        }
        this.valueToPosition = (value) => ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin) +
            rangeMin;
        this.ticks = r;
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this;
    }
    setLogarithmicScale(domainMin, domainMax, rangeMin, rangeMax, tickFormat) {
        const scale = new common_1.Scale.LogarithmicScale();
        scale.domainMin = domainMin;
        scale.domainMax = domainMax;
        const rangeLength = Math.abs(rangeMax - rangeMin);
        const ticks = scale.ticks(Math.round(Math.min(10, rangeLength / 40)));
        const defaultFormat = scale.tickFormat(Math.round(Math.min(10, rangeLength / 40)));
        const resolvedFormat = AxisRenderer.getTickFormat(tickFormat, defaultFormat);
        const r = [];
        for (let i = 0; i < ticks.length; i++) {
            const tx = ((Math.log(ticks[i]) - Math.log(domainMin)) /
                (Math.log(domainMax) - Math.log(domainMin))) *
                (rangeMax - rangeMin) +
                rangeMin;
            if (!isNaN(tx)) {
                r.push({
                    position: tx,
                    label: resolvedFormat(ticks[i]),
                });
            }
        }
        this.valueToPosition = (value) => ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin) +
            rangeMin;
        this.ticks = r;
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this;
    }
    setTemporalScale(domainMin, domainMax, rangeMin, rangeMax, tickFormatString) {
        const scale = new common_1.Scale.DateScale();
        scale.domainMin = domainMin;
        scale.domainMax = domainMax;
        const rangeLength = Math.abs(rangeMax - rangeMin);
        const ticksCount = Math.round(Math.min(10, rangeLength / 40));
        const ticks = scale.ticks(ticksCount);
        const tickFormat = scale.tickFormat(ticksCount, tickFormatString === null || tickFormatString === void 0 ? void 0 : tickFormatString.replace(common_1.tickFormatParserExpression(), "$1"));
        const r = [];
        for (let i = 0; i < ticks.length; i++) {
            const tx = ((ticks[i] - domainMin) / (domainMax - domainMin)) *
                (rangeMax - rangeMin) +
                rangeMin;
            if (!isNaN(tx)) {
                r.push({
                    position: tx,
                    label: tickFormat(ticks[i]),
                });
            }
        }
        this.valueToPosition = (value) => ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin) +
            rangeMin;
        this.ticks = r;
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this;
    }
    setCategoricalScale(domain, range, rangeMin, rangeMax, tickFormat) {
        const r = [];
        for (let i = 0; i < domain.length; i++) {
            const position = ((range[i][0] + range[i][1]) / 2) * (rangeMax - rangeMin) + rangeMin;
            if (!isNaN(position)) {
                r.push({
                    position,
                    label: tickFormat ? tickFormat(domain[i]) : domain[i],
                });
            }
        }
        this.valueToPosition = (value) => {
            const i = domain.indexOf(value);
            if (i >= 0) {
                return (((range[i][0] + range[i][1]) / 2) * (rangeMax - rangeMin) + rangeMin);
            }
            else {
                return 0;
            }
        };
        this.ticks = r;
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this;
    }
    renderGridLine(x, y, angle, side, size) {
        const style = this.style;
        if (style.gridlineStyle === "none") {
            return;
        }
        if (this.oppositeSide) {
            side = -side;
        }
        const g = graphics_1.makeGroup([]);
        const cos = Math.cos(common_1.Geometry.degreesToRadians(angle));
        const sin = Math.sin(common_1.Geometry.degreesToRadians(angle));
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        const x1 = x + rangeMin * cos;
        const y1 = y + rangeMin * sin;
        const x2 = x + rangeMax * cos;
        const y2 = y + rangeMax * sin;
        const tickSize = size;
        const lineStyle = {
            strokeLinecap: "round",
            // strokeColor: style.lineColor,
            strokeColor: style.gridlineColor,
            strokeWidth: style.gridlineWidth,
            strokeDasharray: common_2.strokeStyleToDashArray(style.gridlineStyle),
        };
        // Base line
        g.elements.push(graphics_1.makeLine(x1, y1, x2, y2, lineStyle));
        // Ticks
        const ticksData = this.ticks.map((x) => x.position);
        for (const tickPosition of ticksData) {
            const tx = x + tickPosition * cos;
            const ty = y + tickPosition * sin;
            const dx = -side * tickSize * sin;
            const dy = side * tickSize * cos;
            g.elements.push(graphics_1.makeLine(tx, ty, tx + dx, ty + dy, lineStyle));
        }
        return g;
    }
    renderGridlinesForAxes(x, y, axis, size) {
        switch (axis) {
            case AxisMode.X: {
                return this.renderGridLine(x, y, 0, 1, size);
            }
            case AxisMode.Y: {
                return this.renderGridLine(x, y, 90, -1, size);
            }
        }
    }
    // eslint-disable-next-line
    renderLine(x, y, angle, side, offset) {
        const g = graphics_1.makeGroup([]);
        const style = this.style;
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        const tickSize = style.tickSize;
        const lineStyle = {
            strokeLinecap: "square",
            strokeColor: style.lineColor,
        };
        AxisRenderer.textMeasurer.setFontFamily(style.fontFamily);
        AxisRenderer.textMeasurer.setFontSize(style.fontSize);
        if (this.oppositeSide) {
            side = -side;
        }
        //shift axis for scrollbar space
        if (this.scrollRequired && this.shiftAxis) {
            if (angle === 90) {
                x += side * AxisRenderer.SCROLL_BAR_SIZE;
            }
            if (angle === 0) {
                y += -side * AxisRenderer.SCROLL_BAR_SIZE;
            }
        }
        const cos = Math.cos(common_1.Geometry.degreesToRadians(angle));
        const sin = Math.sin(common_1.Geometry.degreesToRadians(angle));
        const x1 = x + rangeMin * cos;
        const y1 = y + rangeMin * sin;
        const x2 = x + rangeMax * cos;
        const y2 = y + rangeMax * sin;
        // Base line
        g.elements.push(graphics_1.makeLine(x1, y1, x2, y2, lineStyle));
        // Ticks
        const ticksData = this.ticks.map((x) => x.position);
        const visibleTicks = ticksData.concat([rangeMin, rangeMax]);
        if (style.showTicks) {
            for (const tickPosition of visibleTicks) {
                const tx = x + tickPosition * cos;
                const ty = y + tickPosition * sin;
                const dx = side * tickSize * sin;
                const dy = -side * tickSize * cos;
                g.elements.push(graphics_1.makeLine(tx, ty, tx + dx, ty + dy, lineStyle));
            }
        }
        // Tick texts
        const ticks = this.ticks.map((x) => {
            return {
                position: x.position,
                label: x.label,
                measure: AxisRenderer.textMeasurer.measure(x.label),
            };
        });
        let maxTextWidth = 0;
        let maxTickDistance = 0;
        for (let i = 0; i < ticks.length; i++) {
            maxTextWidth = Math.max(maxTextWidth, ticks[i].measure.width);
            if (i > 0) {
                maxTickDistance = Math.max(maxTickDistance, Math.abs(ticks[i - 1].position - ticks[i].position));
            }
        }
        for (const tick of ticks) {
            const tx = x + tick.position * cos, ty = y + tick.position * sin;
            const offset = 3;
            const dx = side * (tickSize + offset) * sin, dy = -side * (tickSize + offset) * cos;
            if (Math.abs(cos) < 0.5) {
                if (style.wordWrap ||
                    (typeof tick.label === "string" &&
                        common_1.splitStringByNewLine(tick.label).length > 1)) {
                    let textContent = text_measurer_1.splitByWidth(common_1.replaceSymbolByTab(common_1.replaceSymbolByNewLine(tick.label)), maxTickDistance, 10000, style.fontFamily, style.fontSize);
                    textContent = textContent.flatMap((line) => common_1.splitStringByNewLine(line));
                    const lines = [];
                    for (let index = 0; index < textContent.length; index++) {
                        const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, AxisRenderer.textMeasurer.measure(textContent[index]), style.verticalText ? "middle" : side * sin < 0 ? "right" : "left", style.verticalText
                            ? side * sin < 0
                                ? "bottom"
                                : "top"
                            : "middle", 0);
                        const text = graphics_1.makeText(px, py -
                            style.fontSize * index +
                            (side * cos > 0
                                ? 0
                                : (textContent.length * style.fontSize - style.fontSize) / 2), textContent[index], style.fontFamily, style.fontSize, {
                            fillColor: style.tickColor,
                        });
                        lines.push(text);
                    }
                    const gText = graphics_1.makeGroup(lines);
                    gText.transform = {
                        x: tx + dx,
                        y: ty + dy,
                        angle: style.verticalText ? angle : 0,
                    };
                    g.elements.push(gText);
                }
                else {
                    // 60 ~ 120 degree
                    const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, tick.measure, side * sin < 0 ? "right" : "left", "middle", 0);
                    const gText = graphics_1.makeGroup([
                        graphics_1.makeText(px, py, tick.label, style.fontFamily, style.fontSize, {
                            fillColor: style.tickColor,
                        }, this.plotSegment && this.dataFlow
                            ? {
                                enableSelection: this.data.enableSelection,
                                glyphIndex: 1,
                                rowIndices: applySelectionFilter(this.data, this.plotSegment.table, ticks.indexOf(tick), this.dataFlow),
                                plotSegment: this.plotSegment,
                            }
                            : undefined),
                    ]);
                    gText.transform = {
                        x: tx + dx,
                        y: ty + dy,
                        angle: style.verticalText ? (sin > 0 ? angle - 90 : angle + 90) : 0,
                    };
                    g.elements.push(gText);
                }
            }
            else if (Math.abs(cos) < Math.sqrt(3) / 2) {
                const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, tick.measure, side * sin < 0 ? "right" : "left", "middle", 0);
                const gText = graphics_1.makeGroup([
                    graphics_1.makeText(px, py, tick.label, style.fontFamily, style.fontSize, {
                        fillColor: style.tickColor,
                    }, this.plotSegment && this.dataFlow
                        ? {
                            enableSelection: this.data.enableSelection,
                            glyphIndex: 1,
                            rowIndices: applySelectionFilter(this.data, this.plotSegment.table, ticks.indexOf(tick), this.dataFlow),
                            plotSegment: this.plotSegment,
                        }
                        : undefined),
                ]);
                gText.transform = {
                    x: tx + dx,
                    y: ty + dy,
                    angle: style.verticalText ? (sin > 0 ? angle - 90 : angle + 90) : 0,
                };
                g.elements.push(gText);
            }
            else {
                if (!style.wordWrap &&
                    maxTextWidth > maxTickDistance &&
                    typeof tick.label === "string" &&
                    common_1.splitStringByNewLine(tick.label).length === 1) {
                    const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, tick.measure, style.verticalText
                        ? side * cos > 0
                            ? "right"
                            : "left"
                        : style.wordWrap
                            ? "middle"
                            : side * cos > 0
                                ? "right"
                                : "left", style.verticalText
                        ? "middle"
                        : style.wordWrap
                            ? "middle"
                            : side * cos > 0
                                ? "top"
                                : "bottom", 0);
                    const gText = graphics_1.makeGroup([
                        graphics_1.makeText(px, py, tick.label, style.fontFamily, style.fontSize, {
                            fillColor: style.tickColor,
                        }, this.plotSegment && this.dataFlow
                            ? {
                                enableSelection: this.data.enableSelection,
                                glyphIndex: 1,
                                rowIndices: applySelectionFilter(this.data, this.plotSegment.table, ticks.indexOf(tick), this.dataFlow),
                                plotSegment: this.plotSegment,
                            }
                            : undefined),
                    ]);
                    gText.transform = {
                        x: tx + dx,
                        y: ty + dy,
                        angle: style.verticalText
                            ? cos > 0
                                ? 90 + angle
                                : 90 + angle - 180
                            : cos > 0
                                ? 36 + angle
                                : 36 + angle - 180,
                    };
                    g.elements.push(gText);
                }
                else {
                    if (style.wordWrap ||
                        (typeof tick.label === "string" &&
                            common_1.splitStringByNewLine(tick.label).length > 1)) {
                        let textContent = [
                            common_1.replaceSymbolByTab(common_1.replaceSymbolByNewLine(tick.label)),
                        ];
                        if (style.wordWrap) {
                            textContent = text_measurer_1.splitByWidth(common_1.replaceSymbolByTab(common_1.replaceSymbolByNewLine(tick.label)), maxTickDistance, 10000, style.fontFamily, style.fontSize);
                        }
                        textContent = textContent.flatMap((line) => common_1.splitStringByNewLine(line));
                        const lines = [];
                        for (let index = 0; index < textContent.length; index++) {
                            const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, AxisRenderer.textMeasurer.measure(textContent[index]), style.wordWrap ? "middle" : side * cos > 0 ? "right" : "left", side * cos > 0 ? "top" : "bottom", 0);
                            const text = graphics_1.makeText(px, py -
                                style.fontSize * index +
                                (side * cos > 0 ? 0 : textContent.length * style.fontSize), textContent[index], style.fontFamily, style.fontSize, {
                                fillColor: style.tickColor,
                            }, this.plotSegment && this.dataFlow
                                ? {
                                    enableSelection: this.data.enableSelection,
                                    glyphIndex: 1,
                                    rowIndices: applySelectionFilter(this.data, this.plotSegment.table, ticks.indexOf(tick), this.dataFlow),
                                    plotSegment: this.plotSegment,
                                }
                                : undefined);
                            lines.push(text);
                        }
                        const gText = graphics_1.makeGroup(lines);
                        gText.transform = {
                            x: tx + dx,
                            y: ty + dy,
                            angle: style.verticalText
                                ? style.wordWrap
                                    ? 0
                                    : cos > 0
                                        ? 90 + angle
                                        : 90 + angle - 180
                                : style.wordWrap
                                    ? 0
                                    : cos > 0
                                        ? 36 + angle
                                        : 36 + angle - 180,
                        };
                        g.elements.push(gText);
                    }
                    else {
                        const [px, py] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, 0, tick.measure, style.verticalText
                            ? side * cos > 0
                                ? "right"
                                : "left"
                            : "middle", style.verticalText ? "middle" : side * cos > 0 ? "top" : "bottom", 0);
                        const gText = graphics_1.makeGroup([
                            graphics_1.makeText(px, py, tick.label, style.fontFamily, style.fontSize, {
                                fillColor: style.tickColor,
                            }, this.plotSegment && this.dataFlow
                                ? {
                                    enableSelection: this.data.enableSelection,
                                    glyphIndex: 1,
                                    rowIndices: applySelectionFilter(this.data, this.plotSegment.table, ticks.indexOf(tick), this.dataFlow),
                                    plotSegment: this.plotSegment,
                                }
                                : undefined),
                        ]);
                        gText.transform = {
                            x: tx + dx,
                            y: ty + dy,
                            angle: style.verticalText ? 90 + angle : 0,
                        };
                        g.elements.push(gText);
                    }
                }
            }
        }
        if (offset) {
            g.transform = {
                x: angle == 90 ? offset : 0,
                y: angle == 90 ? 0 : offset,
                angle: 0,
            };
        }
        return g;
    }
    renderCartesian(x, y, axis, offset) {
        switch (axis) {
            case AxisMode.X: {
                return this.renderLine(x, y, 0, 1, offset);
            }
            case AxisMode.Y: {
                return this.renderLine(x, y, 90, -1, offset);
            }
        }
    }
    renderPolarRadialGridLine(x, y, innerRadius, outerRadius) {
        const style = this.style;
        if (style.gridlineStyle === "none") {
            return;
        }
        const g = graphics_1.makeGroup([]);
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        const gridineArcRotate = 90;
        const lineStyle = {
            strokeLinecap: "round",
            strokeColor: style.gridlineColor,
            strokeWidth: style.gridlineWidth,
            strokeDasharray: common_2.strokeStyleToDashArray(style.gridlineStyle),
        };
        for (const tickPosition of this.ticks
            .map((x) => x.position)
            .concat([rangeMin, rangeMax])) {
            const cos = Math.cos(common_1.Geometry.degreesToRadians(-tickPosition + gridineArcRotate));
            const sin = Math.sin(common_1.Geometry.degreesToRadians(-tickPosition + gridineArcRotate));
            const tx1 = x + cos * innerRadius;
            const ty1 = y + sin * innerRadius;
            const tx2 = x + cos * outerRadius;
            const ty2 = y + sin * outerRadius;
            g.elements.push(graphics_1.makeLine(tx1, ty1, tx2, ty2, lineStyle));
        }
        return g;
    }
    renderPolarArcGridLine(x, y, innerRadius, outerRadius, startAngle, endAngle) {
        const style = this.style;
        if (style.gridlineStyle === "none") {
            return;
        }
        const g = graphics_1.makeGroup([]);
        const startCos = Math.cos(common_1.Geometry.degreesToRadians(startAngle));
        const startSin = Math.sin(common_1.Geometry.degreesToRadians(startAngle));
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        const gridineArcRotate = 90;
        const lineStyle = {
            strokeLinecap: "round",
            strokeColor: style.gridlineColor,
            strokeWidth: style.gridlineWidth,
            strokeDasharray: common_2.strokeStyleToDashArray(style.gridlineStyle),
        };
        let radius = (outerRadius - innerRadius) / this.ticks.length;
        for (const tickPosition of this.ticks
            .map((x) => x.position)
            .concat([rangeMin, rangeMax])) {
            const tx1 = x + tickPosition * startCos;
            const ty1 = y + tickPosition * startSin;
            const arc = graphics_1.makePath(lineStyle);
            arc.moveTo(tx1, ty1);
            arc.polarLineTo(x, y, -startAngle + gridineArcRotate, tickPosition, -endAngle + gridineArcRotate, tickPosition, true);
            g.elements.push(arc.path);
            radius += radius;
        }
        return g;
    }
    // eslint-disable-next-line
    renderPolar(cx, cy, radius, side) {
        const style = this.style;
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        const lineStyle = {
            strokeLinecap: "round",
            strokeColor: style.lineColor,
        };
        const g = graphics_1.makeGroup([]);
        g.transform.x = cx;
        g.transform.y = cy;
        AxisRenderer.textMeasurer.setFontFamily(style.fontFamily);
        AxisRenderer.textMeasurer.setFontSize(style.fontSize);
        const margins = 10;
        const maxTickDistance = common_1.Geometry.degreesToRadians(radius * ((rangeMax - rangeMin) / this.ticks.length)) -
            margins * 2; // lenght of arc for all ticks
        for (const tick of this.ticks) {
            const angle = tick.position;
            const radians = common_1.Geometry.degreesToRadians(angle);
            const tx = Math.sin(radians) * radius;
            const ty = Math.cos(radians) * radius;
            const lablel = tick.label && common_1.replaceSymbolByTab(common_1.replaceSymbolByNewLine(tick.label));
            if (lablel &&
                (style.wordWrap ||
                    (typeof tick.label === "string" &&
                        common_1.splitStringByNewLine(lablel).length > 1))) {
                let textContent = [lablel];
                if (style.wordWrap) {
                    textContent = text_measurer_1.splitByWidth(lablel, maxTickDistance, 10000, style.fontFamily, style.fontSize);
                }
                textContent = textContent.flatMap((line) => common_1.splitStringByNewLine(line));
                const lines = [];
                for (let index = 0; index < textContent.length; index++) {
                    const [textX, textY] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, style.tickSize * side, AxisRenderer.textMeasurer.measure(textContent[index]), "middle", side > 0 ? "bottom" : "top", 0, 2);
                    const gt = graphics_1.makeText(textX, textY -
                        style.fontSize * index +
                        (side > 0
                            ? style.fontSize * textContent.length - style.fontSize
                            : 0), textContent[index], style.fontFamily, style.fontSize, {
                        fillColor: style.tickColor,
                    });
                    lines.push(gt);
                }
                const gt = graphics_1.makeGroup([
                    graphics_1.makeLine(0, 0, 0, style.tickSize * side, lineStyle),
                    ...lines,
                ]);
                gt.transform.angle = -angle;
                gt.transform.x = tx;
                gt.transform.y = ty;
                g.elements.push(gt);
            }
            else {
                const [textX, textY] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, style.tickSize * side, AxisRenderer.textMeasurer.measure(tick.label), "middle", side > 0 ? "bottom" : "top", 0, 2);
                const gt = graphics_1.makeGroup([
                    graphics_1.makeLine(0, 0, 0, style.tickSize * side, lineStyle),
                    graphics_1.makeText(textX, textY, tick.label, style.fontFamily, style.fontSize, {
                        fillColor: style.tickColor,
                    }),
                ]);
                gt.transform.angle = -angle;
                gt.transform.x = tx;
                gt.transform.y = ty;
                g.elements.push(gt);
            }
        }
        return g;
    }
    renderCurve(coordinateSystem, y, side) {
        const style = this.style;
        const lineStyle = {
            strokeLinecap: "round",
            strokeColor: style.lineColor,
        };
        const g = graphics_1.makeGroup([]);
        g.transform = coordinateSystem.getBaseTransform();
        AxisRenderer.textMeasurer.setFontFamily(style.fontFamily);
        AxisRenderer.textMeasurer.setFontSize(style.fontSize);
        for (const tick of this.ticks) {
            const tangent = tick.position;
            const metrics = AxisRenderer.textMeasurer.measure(tick.label);
            const [textX, textY] = text_measurer_1.TextMeasurer.ComputeTextPosition(0, -style.tickSize * side, metrics, "middle", side < 0 ? "bottom" : "top", 0, 2);
            const gt = graphics_1.makeGroup([
                graphics_1.makeLine(0, 0, 0, -style.tickSize * side, lineStyle),
                graphics_1.makeText(textX, textY, tick.label, style.fontFamily, style.fontSize, {
                    fillColor: style.tickColor,
                }),
            ]);
            gt.transform = coordinateSystem.getLocalTransform(tangent, y);
            g.elements.push(gt);
        }
        return g;
    }
    renderVirtualScrollBar(x, y, axis, scrollPosition, onScroll, zoom) {
        switch (axis) {
            case AxisMode.X: {
                return this.renderScrollBar(x, y, 0, 1, scrollPosition, onScroll, zoom);
            }
            case AxisMode.Y: {
                return this.renderScrollBar(x, y, 90, -1, scrollPosition, onScroll, zoom);
            }
        }
    }
    renderScrollBar(x, y, angle, side, handlePosition, onScroll, zoom) {
        if (!this.scrollRequired) {
            return null;
        }
        const cos = Math.cos(common_1.Geometry.degreesToRadians(angle));
        const sin = Math.sin(common_1.Geometry.degreesToRadians(angle));
        const rangeMin = this.rangeMin;
        const rangeMax = this.rangeMax;
        let x1 = x + rangeMin * cos;
        let y1 = y + rangeMin * sin;
        let x2 = x + rangeMax * cos;
        let y2 = y + rangeMax * sin;
        if (this.oppositeSide) {
            side = -side;
        }
        if (!this.oppositeSide) {
            if (angle === 90) {
                x1 += side * AxisRenderer.SCROLL_BAR_SIZE;
                x2 += side * AxisRenderer.SCROLL_BAR_SIZE;
            }
            if (angle === 0) {
                y1 += -side * AxisRenderer.SCROLL_BAR_SIZE;
                y2 += -side * AxisRenderer.SCROLL_BAR_SIZE;
            }
        }
        let width = 0;
        let height = 0;
        if (angle === 90) {
            height += Math.abs(y2 - y1);
            width = AxisRenderer.SCROLL_BAR_SIZE;
        }
        if (angle === 0) {
            width += Math.abs(x2 - x1);
            height = AxisRenderer.SCROLL_BAR_SIZE;
        }
        return React.createElement(virtualScroll_1.VirtualScrollBar, {
            onScroll,
            handlerBarWidth: AxisRenderer.SCROLL_BAR_SIZE,
            height,
            width,
            x: x1,
            y: y1,
            initialPosition: handlePosition,
            vertical: angle === 90,
            zoom,
            scrollBarRatio: this.hiddenCategoriesRatio,
            windowSize: this.windowSize,
            dataType: this.dataType,
        });
    }
}
exports.AxisRenderer = AxisRenderer;
AxisRenderer.SCROLL_BAR_SIZE = 10;
AxisRenderer.textMeasurer = new text_measurer_1.TextMeasurer();
function getCategoricalAxis(data, enablePrePostGap, reverse) {
    if (data.enablePrePostGap) {
        enablePrePostGap = true;
    }
    const chunkSize = (1 - data.gapRatio) / data.categories.length;
    let preGap, postGap, gap, gapScale;
    if (enablePrePostGap) {
        gap = data.gapRatio / data.categories.length;
        gapScale = 1 / data.categories.length;
        preGap = gap / 2;
        postGap = gap / 2;
    }
    else {
        if (data.categories.length == 1) {
            gap = 0;
            gapScale = 1;
        }
        else {
            gap = data.gapRatio / (data.categories.length - 1);
            gapScale = 1 / (data.categories.length - 1);
        }
        preGap = 0;
        postGap = 0;
    }
    const chunkRanges = data.categories.map((c, i) => {
        return [
            preGap + (gap + chunkSize) * i,
            preGap + (gap + chunkSize) * i + chunkSize,
        ];
    });
    if (reverse) {
        chunkRanges.reverse();
    }
    return {
        gap,
        preGap,
        postGap,
        gapScale,
        ranges: chunkRanges,
    };
}
exports.getCategoricalAxis = getCategoricalAxis;
function getNumericalInterpolate(data) {
    if (data.numericalMode == "logarithmic") {
        const p1 = Math.log(data.domainMin);
        const p2 = Math.log(data.domainMax);
        const pdiff = p2 - p1;
        return (x) => (Math.log(x) - p1) / pdiff;
    }
    else {
        const p1 = data.domainMin;
        const p2 = data.domainMax;
        const pdiff = p2 - p1;
        return (x) => (x - p1) / pdiff;
    }
}
exports.getNumericalInterpolate = getNumericalInterpolate;
function buildAxisAppearanceWidgets(axisProperty, manager, options) {
    if (options.isVisible) {
        let vertical = null;
        if (!options.wordWrap) {
            vertical = manager.inputBoolean({ property: axisProperty, field: ["style", "verticalText"] }, {
                type: "checkbox",
                label: strings_1.strings.objects.axes.verticalText,
            });
        }
        return [
            manager.vertical(manager.verticalGroup({
                header: strings_1.strings.objects.visibilityAndPosition,
            }, [
                manager.inputBoolean({ property: axisProperty, field: "visible" }, {
                    type: "checkbox",
                    label: strings_1.strings.objects.visibleOn.visible,
                }),
                manager.inputBoolean({ property: axisProperty, field: "onTop" }, {
                    type: "checkbox",
                    label: strings_1.strings.objects.onTop,
                }),
                manager.inputSelect({ property: axisProperty, field: "side" }, {
                    type: "dropdown",
                    showLabel: true,
                    label: strings_1.strings.objects.position,
                    options: ["default", "opposite"],
                    labels: [strings_1.strings.objects.default, strings_1.strings.objects.opposite],
                }),
                options.isOffset
                    ? manager.inputNumber({
                        property: axisProperty,
                        field: ["offset"],
                    }, {
                        label: strings_1.strings.objects.axes.offSet,
                    })
                    : null,
            ]), manager.verticalGroup({
                header: strings_1.strings.objects.style,
            }, [
                manager.inputColor({
                    property: axisProperty,
                    field: ["style", "lineColor"],
                }, {
                    label: strings_1.strings.objects.axes.lineColor,
                    labelKey: strings_1.strings.objects.axes.lineColor,
                }),
                manager.inputBoolean({ property: axisProperty, field: ["style", "showTicks"] }, {
                    type: "checkbox",
                    label: strings_1.strings.objects.axes.showTickLine,
                    checkBoxStyles: {
                        root: {
                            marginTop: 5,
                        },
                    },
                }),
                manager.inputColor({
                    property: axisProperty,
                    field: ["style", "tickColor"],
                }, {
                    label: strings_1.strings.objects.axes.tickColor,
                    labelKey: strings_1.strings.objects.axes.tickColor,
                }),
                manager.inputFormat({
                    property: axisProperty,
                    field: "tickFormat",
                }, {
                    blank: strings_1.strings.core.auto,
                    isDateField: false,
                    label: strings_1.strings.objects.axes.tickFormat,
                }),
                manager.inputNumber({
                    property: axisProperty,
                    field: ["style", "tickSize"],
                }, {
                    label: strings_1.strings.objects.axes.ticksize,
                }),
                manager.inputFontFamily({
                    property: axisProperty,
                    field: ["style", "fontFamily"],
                }, {
                    label: strings_1.strings.objects.font,
                }),
                manager.inputNumber({ property: axisProperty, field: ["style", "fontSize"] }, {
                    showUpdown: true,
                    updownStyle: "font",
                    updownTick: 2,
                    label: strings_1.strings.objects.fontSize,
                    minimum: 1,
                }),
                manager.inputBoolean({ property: axisProperty, field: ["style", "wordWrap"] }, {
                    type: "checkbox",
                    headerLabel: strings_1.strings.objects.text.textDisplaying,
                    label: strings_1.strings.objects.text.wrapText,
                }),
                vertical,
            ])),
        ];
    }
    else {
        return manager.verticalGroup({
            header: strings_1.strings.objects.visibilityAndPosition,
        }, [
            manager.inputBoolean({ property: axisProperty, field: "visible" }, {
                type: "checkbox",
                label: strings_1.strings.objects.visibleOn.visible,
            }),
        ]);
    }
}
exports.buildAxisAppearanceWidgets = buildAxisAppearanceWidgets;
function buildInteractivityGroup(axisProperty, manager) {
    return manager.verticalGroup({
        header: "Interactivity",
    }, [
        manager.inputBoolean({ property: axisProperty, field: "enableSelection" }, {
            type: "checkbox",
            label: "Selection",
        }),
    ]);
}
// eslint-disable-next-line
function buildAxisWidgets(data, axisProperty, manager, axisName, showOffset = true) {
    const widgets = [];
    const dropzoneOptions = {
        dropzone: {
            type: "axis-data-binding",
            property: axisProperty,
            prompt: axisName + ": " + strings_1.strings.objects.dropData,
        },
    };
    const makeAppearance = () => {
        return buildAxisAppearanceWidgets(axisProperty, manager, {
            isVisible: data.visible,
            wordWrap: data.style.wordWrap,
            isOffset: showOffset,
        });
    };
    if (data != null) {
        switch (data.type) {
            case "numerical":
                {
                    widgets.push(manager.verticalGroup({
                        header: strings_1.strings.objects.general,
                    }, [
                        // manager.sectionHeader(
                        //   axisName + strings.objects.axes.numericalSuffix,
                        //   manager.clearButton({ property: axisProperty }, null, true),
                        //   dropzoneOptions
                        // ),
                        manager.label(strings_1.strings.objects.axes.data),
                        manager.horizontal([1, 0], manager.sectionHeader(null, manager.inputExpression({
                            property: axisProperty,
                            field: "expression",
                        }, {}), dropzoneOptions), manager.clearButton({ property: axisProperty }, null, true)),
                        data.valueType === "date"
                            ? manager.label(strings_1.strings.objects.dataAxis.range)
                            : null,
                        data.valueType === "date"
                            ? manager.inputDate({ property: axisProperty, field: "domainMin" }, { label: strings_1.strings.objects.dataAxis.start })
                            : null,
                        data.valueType === "date"
                            ? manager.inputDate({ property: axisProperty, field: "domainMax" }, { label: strings_1.strings.objects.dataAxis.end })
                            : null,
                        data.valueType !== "date"
                            ? manager.label(strings_1.strings.objects.dataAxis.range)
                            : null,
                        data.valueType !== "date"
                            ? manager.inputNumber({ property: axisProperty, field: "domainMin" }, {
                                label: strings_1.strings.objects.axes.from,
                                observerConfig: {
                                    isObserver: true,
                                    properties: {
                                        property: axisProperty,
                                        field: "autoDomainMin",
                                    },
                                    value: false,
                                },
                            })
                            : null,
                        data.valueType !== "date"
                            ? manager.inputNumber({ property: axisProperty, field: "domainMax" }, {
                                label: strings_1.strings.objects.axes.to,
                                observerConfig: {
                                    isObserver: true,
                                    properties: {
                                        property: axisProperty,
                                        field: "autoDomainMax",
                                    },
                                    value: false,
                                },
                            })
                            : null,
                        data.numericalMode != "temporal"
                            ? manager.inputSelect({ property: axisProperty, field: "numericalMode" }, {
                                options: ["linear", "logarithmic"],
                                labels: [
                                    strings_1.strings.scale.linear,
                                    strings_1.strings.scale.logarithmic,
                                ],
                                showLabel: true,
                                type: "dropdown",
                                label: "Mode",
                            })
                            : null,
                        manager.inputSelect({ property: axisProperty, field: "tickFormatType" }, {
                            options: [
                                types_1.TickFormatType.None,
                                types_1.TickFormatType.Date,
                                types_1.TickFormatType.Number,
                            ],
                            labels: [
                                strings_1.strings.objects.axes.tickDataFormatTypeNone,
                                strings_1.strings.objects.axes.tickDataFormatTypeDate,
                                strings_1.strings.objects.axes.tickDataFormatTypeNumber,
                            ],
                            showLabel: true,
                            type: "dropdown",
                            label: strings_1.strings.objects.axes.tickDataFormatType,
                        }),
                        data.tickFormatType !== types_1.TickFormatType.None
                            ? manager.inputExpression({
                                property: axisProperty,
                                field: "tickDataExpression",
                            }, {
                                label: strings_1.strings.objects.axes.tickData,
                            })
                            : null,
                        manager.inputFormat({
                            property: axisProperty,
                            field: "tickFormat",
                        }, {
                            blank: strings_1.strings.core.auto,
                            isDateField: data.numericalMode === types_1.NumericalMode.Temporal ||
                                data.valueType === specification_1.DataType.Date,
                            label: strings_1.strings.objects.axes.tickFormat,
                        }),
                        manager.label(strings_1.strings.objects.dataAxis.scrolling),
                        manager.inputBoolean({
                            property: axisProperty,
                            field: "allowScrolling",
                        }, {
                            type: "checkbox",
                            label: strings_1.strings.objects.dataAxis.allowScrolling,
                            observerConfig: {
                                isObserver: true,
                                properties: {
                                    property: axisProperty,
                                    field: "windowSize",
                                },
                                value: 10,
                            },
                        }),
                        data.allowScrolling
                            ? manager.inputNumber({
                                property: axisProperty,
                                field: "windowSize",
                            }, {
                                maximum: 1000000,
                                minimum: 1,
                                label: strings_1.strings.objects.dataAxis.windowSize,
                            })
                            : null,
                        data.allowScrolling
                            ? manager.inputNumber({
                                property: axisProperty,
                                field: "barOffset",
                            }, {
                                maximum: 1000000,
                                minimum: -1000000,
                                label: strings_1.strings.objects.dataAxis.barOffset,
                            })
                            : null,
                    ]));
                    widgets.push(makeAppearance());
                }
                break;
            case "categorical":
                {
                    widgets.push(manager.verticalGroup({
                        header: strings_1.strings.objects.general,
                    }, [
                        // manager.sectionHeader(
                        //   strings.objects.axes.data,
                        //   manager.clearButton({ property: axisProperty }, null, true),
                        //   dropzoneOptions
                        // ),
                        // manager.vertical(
                        manager.label(strings_1.strings.objects.axes.data),
                        manager.horizontal([1, 0], manager.sectionHeader(null, manager.inputExpression({
                            property: axisProperty,
                            field: "expression",
                        }, {}), dropzoneOptions), manager.clearButton({ property: axisProperty }, null, true), manager.reorderWidget({ property: axisProperty, field: "categories" }, { allowReset: true })),
                        manager.inputNumber({ property: axisProperty, field: "gapRatio" }, {
                            minimum: 0,
                            maximum: 1,
                            percentage: true,
                            showSlider: true,
                            label: "Gap",
                        }),
                        data.valueType === "date"
                            ? (manager.inputExpression({
                                property: axisProperty,
                                field: "tickDataExpression",
                            }, {
                                label: strings_1.strings.objects.axes.tickData,
                            }),
                                manager.row(strings_1.strings.objects.axes.tickFormat, manager.inputFormat({
                                    property: axisProperty,
                                    field: "tickFormat",
                                }, {
                                    blank: strings_1.strings.core.auto,
                                    isDateField: data.numericalMode === types_1.NumericalMode.Temporal ||
                                        data.valueType === specification_1.DataType.Date,
                                })))
                            : null,
                        manager.label(strings_1.strings.objects.dataAxis.scrolling),
                        manager.inputBoolean({
                            property: axisProperty,
                            field: "allowScrolling",
                        }, {
                            type: "checkbox",
                            label: strings_1.strings.objects.dataAxis.allowScrolling,
                            observerConfig: {
                                isObserver: true,
                                properties: {
                                    property: axisProperty,
                                    field: "windowSize",
                                },
                                value: 10,
                            },
                        }),
                        data.allowScrolling
                            ? manager.inputNumber({
                                property: axisProperty,
                                field: "windowSize",
                            }, {
                                maximum: 1000000,
                                minimum: 1,
                                label: strings_1.strings.objects.dataAxis.windowSize,
                            })
                            : null,
                        data.allowScrolling
                            ? manager.inputNumber({
                                property: axisProperty,
                                field: "barOffset",
                            }, {
                                maximum: 1000000,
                                minimum: -1000000,
                                label: strings_1.strings.objects.dataAxis.barOffset,
                            })
                            : null,
                    ]));
                    widgets.push(buildInteractivityGroup(axisProperty, manager));
                    widgets.push(makeAppearance());
                }
                break;
            case "default":
                {
                    widgets.push(manager.sectionHeader(axisName + strings_1.strings.objects.axes.stackingSuffix, manager.clearButton({ property: axisProperty }, null, true), dropzoneOptions), manager.inputNumber({ property: axisProperty, field: "gapRatio" }, {
                        minimum: 0,
                        maximum: 1,
                        percentage: true,
                        showSlider: true,
                        label: "Gap",
                    }));
                }
                break;
        }
        widgets.push(manager.verticalGroup({
            header: axisName + strings_1.strings.objects.dataAxis.exportProperties,
        }, [
            manager.inputBoolean({
                property: axisProperty,
                field: "autoDomainMin",
            }, {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoMin,
            }),
            manager.inputBoolean({
                property: axisProperty,
                field: "autoDomainMax",
            }, {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoMax,
            }),
        ]));
    }
    else {
        widgets.push(
        // manager.sectionHeader(
        //   axisName + ": " + strings.core.none,
        //   null,
        //   dropzoneOptions
        // )
        manager.verticalGroup({
            header: strings_1.strings.objects.general,
        }, [
            manager.label(strings_1.strings.objects.axes.data),
            manager.horizontal([1, 0, 0, 0], manager.sectionHeader(null, manager.inputText({
                property: null,
            }, {
                disabled: true,
                value: strings_1.strings.core.none,
            }), dropzoneOptions)),
        ]));
    }
    return widgets;
}
exports.buildAxisWidgets = buildAxisWidgets;
function buildAxisInference(plotSegment, property) {
    const axis = (plotSegment.properties[property]);
    return {
        objectID: plotSegment._id,
        dataSource: {
            table: plotSegment.table,
            groupBy: plotSegment.groupBy,
        },
        axis: {
            expression: axis.expression,
            type: axis.type,
            style: axis.style,
            order: axis.order,
            orderMode: axis.orderMode,
            rawExpression: axis.rawExpression,
            property,
            defineCategories: true,
        },
    };
}
exports.buildAxisInference = buildAxisInference;
function buildAxisProperties(plotSegment, property) {
    const axisObject = plotSegment.properties[property];
    const style = axisObject.style;
    if (!style) {
        return [];
    }
    return [
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "style",
                    subfield: "tickSize",
                },
            },
            type: index_1.Specification.AttributeType.Number,
            default: style.tickSize,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "style",
                    subfield: "fontSize",
                },
            },
            type: index_1.Specification.AttributeType.Number,
            default: style.fontSize,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "style",
                    subfield: "fontFamily",
                },
            },
            type: index_1.Specification.AttributeType.FontFamily,
            default: style.fontFamily,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "style",
                    subfield: "lineColor",
                },
            },
            type: index_1.Specification.AttributeType.Color,
            default: common_1.rgbToHex(style.lineColor),
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "style",
                    subfield: "tickColor",
                },
            },
            type: index_1.Specification.AttributeType.Color,
            default: common_1.rgbToHex(style.tickColor),
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "tickFormat",
                },
            },
            type: index_1.Specification.AttributeType.Text,
            default: null,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "tickFormatType",
                },
            },
            type: index_1.Specification.AttributeType.Enum,
            default: types_1.TickFormatType.None,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "tickDataExpression",
                },
            },
            type: index_1.Specification.AttributeType.Text,
            default: null,
        },
        {
            objectID: plotSegment._id,
            target: {
                property: {
                    property,
                    field: "offset",
                },
            },
            type: index_1.Specification.AttributeType.Number,
            default: 0,
        },
    ];
}
exports.buildAxisProperties = buildAxisProperties;
function getTable(dataflow, name) {
    return dataflow.getTable(name);
}
function applySelectionFilter(data, tableName, index, dataflow) {
    var _a;
    const filteredIndices = [];
    const table = getTable(dataflow, tableName);
    if (data.type === types_1.AxisDataBindingType.Default ||
        data.type === types_1.AxisDataBindingType.Numerical) {
        return table.rows.map((row, id) => id);
    }
    const parsed = (_a = Expression.parse(data === null || data === void 0 ? void 0 : data.expression)) === null || _a === void 0 ? void 0 : _a.args[0];
    if (data.type === types_1.AxisDataBindingType.Categorical) {
        for (let i = 0; i < table.rows.length; i++) {
            const rowContext = table.getRowContext(i);
            if (data.categories[index] == parsed.getStringValue(rowContext)) {
                filteredIndices.push(i);
            }
        }
    }
    return filteredIndices;
}
//# sourceMappingURL=axis.js.map
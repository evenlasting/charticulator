"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericalNumberLegendClass = exports.NumericalNumberLegendAttributeNames = void 0;
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
const axis_1 = require("../plot_segments/axis");
const plot_segments_1 = require("../plot_segments");
var NumericalNumberLegendAttributeNames;
(function (NumericalNumberLegendAttributeNames) {
    NumericalNumberLegendAttributeNames["x1"] = "x1";
    NumericalNumberLegendAttributeNames["y1"] = "y1";
    NumericalNumberLegendAttributeNames["x2"] = "x2";
    NumericalNumberLegendAttributeNames["y2"] = "y2";
    NumericalNumberLegendAttributeNames["cx"] = "cx";
    NumericalNumberLegendAttributeNames["cy"] = "cy";
    NumericalNumberLegendAttributeNames["radius"] = "radius";
    NumericalNumberLegendAttributeNames["startAngle"] = "startAngle";
    NumericalNumberLegendAttributeNames["endAngle"] = "endAngle";
})(NumericalNumberLegendAttributeNames = exports.NumericalNumberLegendAttributeNames || (exports.NumericalNumberLegendAttributeNames = {}));
const PRECISION = 1e-3;
class NumericalNumberLegendClass extends chart_element_1.ChartElementClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [
            NumericalNumberLegendAttributeNames.x1,
            NumericalNumberLegendAttributeNames.y1,
            NumericalNumberLegendAttributeNames.x2,
            NumericalNumberLegendAttributeNames.y2,
            NumericalNumberLegendAttributeNames.cx,
            NumericalNumberLegendAttributeNames.cy,
            NumericalNumberLegendAttributeNames.radius,
            NumericalNumberLegendAttributeNames.startAngle,
            NumericalNumberLegendAttributeNames.endAngle,
        ];
        this.attributes = {
            x1: {
                name: NumericalNumberLegendAttributeNames.x1,
                type: Specification.AttributeType.Number,
            },
            y1: {
                name: NumericalNumberLegendAttributeNames.y1,
                type: Specification.AttributeType.Number,
            },
            x2: {
                name: NumericalNumberLegendAttributeNames.x2,
                type: Specification.AttributeType.Number,
            },
            y2: {
                name: NumericalNumberLegendAttributeNames.y2,
                type: Specification.AttributeType.Number,
            },
            cx: {
                name: NumericalNumberLegendAttributeNames.cx,
                type: Specification.AttributeType.Number,
            },
            cy: {
                name: NumericalNumberLegendAttributeNames.cx,
                type: Specification.AttributeType.Number,
            },
            radius: {
                name: NumericalNumberLegendAttributeNames.radius,
                type: Specification.AttributeType.Number,
            },
            startAngle: {
                name: NumericalNumberLegendAttributeNames.startAngle,
                type: Specification.AttributeType.Number,
            },
            endAngle: {
                name: NumericalNumberLegendAttributeNames.endAngle,
                type: Specification.AttributeType.Number,
            },
        };
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x1 = 0;
        attrs.y1 = 0;
        attrs.x2 = 0;
        attrs.y2 = 0;
        attrs.cx = 0;
        attrs.cy = 0;
        attrs.radius = 0;
        attrs.startAngle = 0;
        attrs.endAngle = 0;
    }
    getScale() {
        const scale = this.object.properties.scale;
        const scaleIndex = common_1.indexOf(this.parent.object.scales, (x) => x._id == scale);
        if (scaleIndex >= 0) {
            return [
                this.parent.object.scales[scaleIndex],
                this.parent.state.scales[scaleIndex],
            ];
        }
        else {
            return null;
        }
    }
    getBoundingBox() {
        if (this.object.properties.polarAngularMode) {
            const { cx, cy, radius } = this.state.attributes;
            const bbox = {
                type: "circle",
                cx,
                cy,
                radius,
            };
            return bbox;
        }
        else {
            const { x1, y1, x2, y2 } = this.state.attributes;
            const bbox = {
                type: "line",
                x1,
                y1,
                x2,
                y2,
            };
            return bbox;
        }
    }
    getHandles() {
        const { attributes } = this.state;
        if (this.object.properties.polarAngularMode) {
            const { cx, cy } = attributes;
            // TODO is there a circle handle?????
            const points = [
                {
                    type: "point",
                    x: cx,
                    y: cy,
                    actions: [
                        {
                            type: "attribute",
                            source: "x",
                            attribute: NumericalNumberLegendAttributeNames.cx,
                        },
                        {
                            type: "attribute",
                            source: "y",
                            attribute: NumericalNumberLegendAttributeNames.cy,
                        },
                    ],
                    options: {
                        snapToClosestPoint: true,
                    },
                },
            ];
            return points;
        }
        else {
            const { x1, y1, x2, y2 } = attributes;
            const points = [
                {
                    type: "point",
                    x: x1,
                    y: y1,
                    actions: [
                        {
                            type: "attribute",
                            source: "x",
                            attribute: NumericalNumberLegendAttributeNames.x1,
                        },
                        {
                            type: "attribute",
                            source: "y",
                            attribute: NumericalNumberLegendAttributeNames.y1,
                        },
                    ],
                    options: {
                        snapToClosestPoint: true,
                    },
                },
                {
                    type: "point",
                    x: x2,
                    y: y2,
                    actions: [
                        {
                            type: "attribute",
                            source: "x",
                            attribute: NumericalNumberLegendAttributeNames.x2,
                        },
                        {
                            type: "attribute",
                            source: "y",
                            attribute: NumericalNumberLegendAttributeNames.y2,
                        },
                    ],
                    options: {
                        snapToClosestPoint: true,
                    },
                },
            ];
            return points;
        }
    }
    getGraphics() {
        const scale = this.getScale();
        if (!scale) {
            return null;
        }
        if (!this.object.properties.axis.visible) {
            return null;
        }
        const rangeMin = scale[1].attributes.rangeMin;
        const rangeMax = scale[1].attributes.rangeMax;
        const domainMin = scale[0].properties.domainMin;
        const domainMax = scale[0].properties.domainMax;
        if (this.object.properties.polarAngularMode) {
            return this.getPolarAxisGraphics(rangeMin, rangeMax, domainMin, domainMax);
        }
        else {
            return Graphics.makeGroup([
                this.getLineAxisGraphics(rangeMin, rangeMax, domainMin, domainMax),
                this.getGridLineGraphics(rangeMin, rangeMax, domainMin, domainMax),
            ]);
        }
    }
    getPolarAxisGraphics(rangeMin, rangeMax, domainMin, domainMax) {
        const renderer = new axis_1.AxisRenderer();
        renderer.oppositeSide = this.object.properties.axis.side === "opposite";
        const { startAngle, endAngle } = this.state.attributes;
        const length = endAngle - startAngle;
        const props = this.object.properties;
        const scaling = (rangeMax - rangeMin) / (domainMax - domainMin);
        renderer.setLinearScale(domainMin, domainMin + (length - rangeMin / 360) / scaling, startAngle, endAngle, props.axis.tickFormat);
        renderer.setStyle(this.object.properties.axis.style);
        return renderer.renderPolar(this.state.attributes.cx, this.state.attributes.cy, this.state.attributes.radius, renderer.oppositeSide ? -1 : 1);
    }
    getLineAxisGraphics(rangeMin, rangeMax, domainMin, domainMax) {
        const dx = this.state.attributes.x2 - this.state.attributes.x1;
        const dy = this.state.attributes.y2 - this.state.attributes.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const renderer = new axis_1.AxisRenderer();
        renderer.oppositeSide = this.object.properties.axis.side === "opposite";
        const props = this.object.properties;
        // Extend/shrink range, and update the domain accordingly. Keep the scaling factor.
        const scaling = (rangeMax - rangeMin) / (domainMax - domainMin);
        renderer.setLinearScale(domainMin, domainMin + (length - rangeMin) / scaling, rangeMin, length, props.axis.tickFormat);
        renderer.setStyle(this.object.properties.axis.style);
        return renderer.renderLine(this.state.attributes.x1, this.state.attributes.y1, (Math.atan2(dy, dx) / Math.PI) * 180, -1);
    }
    getGridLineGraphics(rangeMin, rangeMax, domainMin, domainMax) {
        var _a, _b, _c, _d;
        const legendId = this.object._id;
        const chartConstrains = this.parent.object.constraints;
        if (chartConstrains.length > 0) {
            //x1, y1, x2, y2
            //check if 4 constrain for legend
            const amountLegendConstrain = chartConstrains.filter((elem) => { var _a; return ((_a = elem.attributes) === null || _a === void 0 ? void 0 : _a.element) === legendId; });
            if (amountLegendConstrain.length === 4) {
                const targetConstrain = chartConstrains === null || chartConstrains === void 0 ? void 0 : chartConstrains.find((constant) => { var _a; return ((_a = constant === null || constant === void 0 ? void 0 : constant.attributes) === null || _a === void 0 ? void 0 : _a.element) === legendId; });
                const targetId = (_a = targetConstrain === null || targetConstrain === void 0 ? void 0 : targetConstrain.attributes) === null || _a === void 0 ? void 0 : _a.targetElement;
                const plotSIdx = this.parent.object.elements.findIndex((element) => element._id === targetId);
                const plotSAttributes = (_b = this.parent.state.elements[plotSIdx]) === null || _b === void 0 ? void 0 : _b.attributes;
                const x1 = this.state.attributes.x1;
                const x2 = this.state.attributes.x2;
                const y1 = this.state.attributes.y1;
                const y2 = this.state.attributes.y2;
                const isXEquals = Math.abs(x2 - x1) < PRECISION;
                const isYEquals = Math.abs(y2 - y1) < PRECISION;
                if (!isXEquals && !isYEquals) {
                    return null;
                }
                const angle = isYEquals ? 0 : 90;
                const dx = (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.x2) - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.x1);
                const dy = (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.y2) - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.y1);
                const length = isYEquals ? dx : dy;
                const renderer = new axis_1.AxisRenderer();
                const props = this.object.properties;
                const scaling = (rangeMax - rangeMin) / (domainMax - domainMin);
                renderer.setLinearScale(domainMin, domainMin + (length - rangeMin) / scaling, rangeMin, length, props.axis.tickFormat);
                renderer.setStyle(Object.assign(Object.assign({}, axis_1.defaultAxisStyle), (_d = (_c = this.object.properties) === null || _c === void 0 ? void 0 : _c.axis) === null || _d === void 0 ? void 0 : _d.style));
                //gridline should be in PlotSegment
                let side = 1;
                if (isXEquals) {
                    if (y1 > y2) {
                        if (Math.abs(x1 - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.x1)) < PRECISION) {
                            side = -1;
                        }
                        else {
                            side = 1;
                        }
                    }
                    else {
                        if (Math.abs(x1 - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.x1)) < PRECISION) {
                            side = -1;
                        }
                        else {
                            side = 1;
                        }
                    }
                }
                if (isYEquals) {
                    if (x1 > x2) {
                        if (Math.abs(y1 - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.y1)) < PRECISION) {
                            side = 1;
                        }
                        else {
                            side = -1;
                        }
                    }
                    else {
                        if (Math.abs(y1 - (plotSAttributes === null || plotSAttributes === void 0 ? void 0 : plotSAttributes.y1)) < PRECISION) {
                            side = 1;
                        }
                        else {
                            side = -1;
                        }
                    }
                }
                return renderer.renderGridLine(x1 > x2 ? x2 : x1, y1 > y2 ? y2 : y1, angle, side, isYEquals ? dy : dx);
            }
        }
        return null;
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        return [
            manager.sectionHeader(strings_1.strings.objects.axis),
            axis_1.buildAxisAppearanceWidgets("axis", manager, {
                isVisible: props.axis.visible,
                wordWrap: props.axis.style.wordWrap,
                isOffset: false,
            }),
            ...plot_segments_1.PlotSegmentClass.getGridLineAttributePanelWidgets(manager, "axis"),
        ];
    }
}
exports.NumericalNumberLegendClass = NumericalNumberLegendClass;
NumericalNumberLegendClass.classID = "legend.numerical-number";
NumericalNumberLegendClass.type = "legend";
NumericalNumberLegendClass.metadata = {
    displayName: "Legend",
    iconPath: "CharticulatorLegend",
};
NumericalNumberLegendClass.defaultProperties = {
    visible: true,
    axis: {
        side: "default",
        visible: true,
        style: common_1.deepClone(axis_1.defaultAxisStyle),
        tickFormat: "",
    },
};
//# sourceMappingURL=numerical_legend.js.map
"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendClass = void 0;
const defaults_1 = require("../../../app/stores/defaults");
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
class LegendClass extends chart_element_1.ChartElementClass {
    constructor() {
        super(...arguments);
        this.attributeNames = ["x", "y"];
        this.attributes = {
            x: {
                name: "x",
                type: Specification.AttributeType.Number,
            },
            y: {
                name: "y",
                type: Specification.AttributeType.Number,
            },
        };
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x = 0;
        attrs.y = 0;
    }
    getLayoutBox() {
        const { x, y } = this.state.attributes;
        const [width, height] = this.getLegendSize();
        let x1, y1, x2, y2;
        switch (this.object.properties.alignX) {
            case "start":
                x1 = x;
                x2 = x + width;
                break;
            case "middle":
                x1 = x - width / 2;
                x2 = x + width / 2;
                break;
            case "end":
                x1 = x - width;
                x2 = x;
                break;
        }
        switch (this.object.properties.alignY) {
            case "start":
                y1 = y;
                y2 = y + height;
                break;
            case "middle":
                y1 = y - height / 2;
                y2 = y + height / 2;
                break;
            case "end":
                y1 = y - height;
                y2 = y;
                break;
        }
        return { x1, y1, x2, y2 };
    }
    getBoundingBox() {
        const { x1, y1, x2, y2 } = this.getLayoutBox();
        return {
            type: "rectangle",
            cx: (x1 + x2) / 2,
            cy: (y1 + y2) / 2,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
            rotation: 0,
        };
    }
    getHandles() {
        const attrs = this.state.attributes;
        const { x, y } = attrs;
        return [
            {
                type: "point",
                x,
                y,
                actions: [
                    { type: "attribute", source: "x", attribute: "x" },
                    { type: "attribute", source: "y", attribute: "y" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
        ];
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
    getLegendSize() {
        return [10, 10];
    }
    getOrderingObjects() {
        const scale = this.getScale();
        if (scale) {
            const [scaleObject] = scale;
            const mapping = scaleObject.properties.mapping;
            return Object.keys(mapping);
        }
        return [];
    }
    getAttributePanelWidgets(manager) {
        const widget = [
            manager.verticalGroup({
                header: strings_1.strings.objects.legend.labels,
            }, [
                manager.inputFontFamily({ property: "fontFamily" }, { label: strings_1.strings.objects.font }),
                manager.inputNumber({ property: "fontSize" }, {
                    showUpdown: true,
                    updownStyle: "font",
                    updownTick: 2,
                    label: strings_1.strings.objects.size,
                }),
                manager.inputColor({ property: "textColor" }, {
                    label: strings_1.strings.objects.color,
                    labelKey: strings_1.strings.objects.color,
                }),
                manager.inputSelect({ property: "markerShape" }, {
                    type: "dropdown",
                    showLabel: true,
                    icons: ["RectangleShape", "TriangleShape", "Ellipse"],
                    labels: [
                        strings_1.strings.toolbar.rectangle,
                        strings_1.strings.toolbar.triangle,
                        strings_1.strings.toolbar.ellipse,
                    ],
                    options: ["rectangle", "triangle", "circle"],
                    label: strings_1.strings.objects.legend.markerShape,
                }),
                this.object.classID === "legend.categorical"
                    ? manager.label(strings_1.strings.objects.legend.ordering)
                    : null,
                this.object.classID === "legend.categorical"
                    ? manager.reorderWidget({
                        property: "order",
                    }, {
                        items: this.getOrderingObjects(),
                        onConfirm: (items) => {
                            manager.emitSetProperty({
                                property: "order",
                                field: null,
                            }, items);
                        },
                    })
                    : null,
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.legend.layout,
            }, [
                manager.vertical(manager.label(strings_1.strings.alignment.alignment), manager.horizontal([0, 0], manager.inputSelect({ property: "alignX" }, {
                    type: "radio",
                    icons: [
                        "AlignHorizontalLeft",
                        "AlignHorizontalCenter",
                        "AlignHorizontalRight",
                    ],
                    labels: [
                        strings_1.strings.alignment.left,
                        strings_1.strings.alignment.middle,
                        strings_1.strings.alignment.right,
                    ],
                    options: ["start", "middle", "end"],
                }), manager.inputSelect({ property: "alignY" }, {
                    type: "radio",
                    options: ["start", "middle", "end"],
                    icons: [
                        "AlignVerticalBottom",
                        "AlignVerticalCenter",
                        "AlignVerticalTop",
                    ],
                    labels: [
                        strings_1.strings.alignment.bottom,
                        strings_1.strings.alignment.middle,
                        strings_1.strings.alignment.top,
                    ],
                }), null)),
            ]),
        ];
        return widget;
    }
    getTemplateParameters() {
        const properties = [];
        if (this.object.properties.fontFamily) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "fontFamily",
                },
                type: Specification.AttributeType.FontFamily,
                default: this.object.properties.fontFamily,
            });
        }
        if (this.object.properties.fontSize) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "fontSize",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.fontSize,
            });
        }
        if (this.object.properties.textColor) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "textColor",
                },
                type: Specification.AttributeType.Color,
                default: common_1.rgbToHex(this.object.properties.textColor),
            });
        }
        if (this.object.properties.markerShape) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "markerShape",
                },
                type: Specification.AttributeType.Enum,
                default: this.object.properties.markerShape,
            });
        }
        if (this.object.properties.alignY) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "alignY",
                },
                type: Specification.AttributeType.Enum,
                default: this.object.properties.alignY,
            });
        }
        if (this.object.properties.alignX) {
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "alignX",
                },
                type: Specification.AttributeType.Enum,
                default: this.object.properties.alignX,
            });
        }
        return {
            properties,
        };
    }
}
exports.LegendClass = LegendClass;
LegendClass.metadata = {
    displayName: "Legend",
    iconPath: "CharticulatorLegend",
};
LegendClass.defaultProperties = {
    scale: null,
    visible: true,
    alignX: "start",
    alignY: "end",
    fontFamily: defaults_1.defaultFont,
    fontSize: defaults_1.defaultFontSizeLegend,
    textColor: { r: 0, g: 0, b: 0 },
    dataSource: "columnValues",
    dataExpressions: [],
    markerShape: "circle",
    order: null,
};
//# sourceMappingURL=legend.js.map
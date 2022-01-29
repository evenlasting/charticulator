"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolElementClass = exports.symbolTypesList = void 0;
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const graphics_1 = require("../../graphics");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const common_2 = require("../common");
const emphasis_1 = require("./emphasis");
const symbol_attrs_1 = require("./symbol.attrs");
exports.symbolTypesList = symbol_attrs_1.symbolTypes;
class SymbolElementClass extends emphasis_1.EmphasizableMarkClass {
    constructor() {
        super(...arguments);
        this.attributes = symbol_attrs_1.symbolAttributes;
        this.attributeNames = Object.keys(symbol_attrs_1.symbolAttributes);
    }
    initializeState() {
        super.initializeState();
        const attrs = this.state.attributes;
        attrs.x = 0;
        attrs.y = 0;
        attrs.size = 60;
        attrs.fill = { r: 128, g: 128, b: 128 };
        attrs.strokeWidth = 1;
        attrs.opacity = 1;
        attrs.visible = true;
        attrs.symbol = "circle";
    }
    /** Get link anchors for this mark */
    getLinkAnchors(mode) {
        const attrs = this.state.attributes;
        return [
            {
                element: this.object._id,
                points: [
                    {
                        x: attrs.x,
                        y: attrs.y,
                        xAttribute: "x",
                        yAttribute: "y",
                        direction: { x: mode == "begin" ? 1 : -1, y: 0 },
                    },
                ],
            },
        ];
    }
    // Get the graphical element from the element
    // eslint-disable-next-line
    getGraphics(cs, offset, 
    // eslint-disable-next-line
    glyphIndex = 0, 
    // eslint-disable-next-line
    manager, emphasize) {
        const attrs = this.state.attributes;
        if (!attrs.visible || !this.object.properties.visible) {
            return null;
        }
        if (attrs.size <= 0) {
            return null;
        }
        const pc = cs.transformPoint(attrs.x + offset.x, attrs.y + offset.y);
        const rotation = this.object.properties.rotation;
        const style = Object.assign({ strokeColor: attrs.stroke, strokeWidth: attrs.strokeWidth, fillColor: attrs.fill, opacity: attrs.opacity }, this.generateEmphasisStyle(emphasize));
        switch (attrs.symbol) {
            case "square": {
                const w = Math.sqrt(attrs.size);
                const elem = {
                    type: "rect",
                    style,
                    x1: -w / 2,
                    y1: -w / 2,
                    x2: w / 2,
                    y2: w / 2,
                    rotation: rotation,
                };
                const gr = graphics_1.makeGroup([elem]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            case "cross": {
                const r = Math.sqrt(attrs.size / 5) / 2;
                const path = Graphics.makePath(style);
                path.moveTo(-3 * r, -r);
                path.lineTo(-r, -r);
                path.lineTo(-r, -3 * r);
                path.lineTo(-r, -3 * r);
                path.lineTo(+r, -3 * r);
                path.lineTo(+r, -r);
                path.lineTo(+3 * r, -r);
                path.lineTo(+3 * r, +r);
                path.lineTo(+r, +r);
                path.lineTo(+r, +3 * r);
                path.lineTo(-r, +3 * r);
                path.lineTo(-r, +r);
                path.lineTo(-3 * r, +r);
                path.transformRotation(rotation);
                path.closePath();
                const gr = graphics_1.makeGroup([path.path]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            case "diamond": {
                const tan30 = 0.5773502691896257; // Math.sqrt(1 / 3);
                const tan30_2 = 1.1547005383792515; // tan30 * 2;
                const y = Math.sqrt(attrs.size / tan30_2), x = y * tan30;
                const path = Graphics.makePath(style);
                path.moveTo(0, -y);
                path.lineTo(x, 0);
                path.lineTo(0, y);
                path.lineTo(-x, 0);
                path.transformRotation(rotation);
                path.closePath();
                const gr = graphics_1.makeGroup([path.path]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            case "star": {
                const ka = 0.8908130915292852281;
                // const kr = 0.3819660112501051; // Math.sin(Math.PI / 10) / Math.sin(7 * Math.PI / 10),
                const kx = 0.22451398828979266; // Math.sin(2 * Math.PI / 10) * kr;
                const ky = -0.3090169943749474; // -Math.cos(2 * Math.PI / 10) * kr;
                const r = Math.sqrt(attrs.size * ka), x = kx * r, y = ky * r;
                const path = Graphics.makePath(style);
                path.moveTo(0, -r);
                path.lineTo(x, y);
                for (let i = 1; i < 5; ++i) {
                    const a = (Math.PI * 2 * i) / 5, c = Math.cos(a), s = Math.sin(a);
                    path.lineTo(s * r, -c * r);
                    path.lineTo(c * x - s * y, s * x + c * y);
                }
                path.transformRotation(rotation);
                path.closePath();
                const gr = graphics_1.makeGroup([path.path]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            case "triangle": {
                const sqrt3 = Math.sqrt(3);
                const y = -Math.sqrt(attrs.size / (sqrt3 * 3));
                const path = Graphics.makePath(style);
                path.moveTo(0, y * 2);
                path.lineTo(-sqrt3 * y, -y);
                path.lineTo(sqrt3 * y, -y);
                path.transformRotation(rotation);
                path.closePath();
                const gr = graphics_1.makeGroup([path.path]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            case "wye": {
                const c = -0.5, s = Math.sqrt(3) / 2, k = 1 / Math.sqrt(12), a = (k / 2 + 1) * 3;
                const r = Math.sqrt(attrs.size / a), x0 = r / 2, y0 = r * k, x1 = x0, y1 = r * k + r, x2 = -x1, y2 = y1;
                const path = Graphics.makePath(style);
                path.moveTo(x0, y0);
                path.lineTo(x1, y1);
                path.lineTo(x2, y2);
                path.lineTo(c * x0 - s * y0, s * x0 + c * y0);
                path.lineTo(c * x1 - s * y1, s * x1 + c * y1);
                path.lineTo(c * x2 - s * y2, s * x2 + c * y2);
                path.lineTo(c * x0 + s * y0, c * y0 - s * x0);
                path.lineTo(c * x1 + s * y1, c * y1 - s * x1);
                path.lineTo(c * x2 + s * y2, c * y2 - s * x2);
                path.transformRotation(rotation);
                path.closePath();
                const gr = graphics_1.makeGroup([path.path]);
                gr.transform.x = pc.x;
                gr.transform.y = pc.y;
                return gr;
            }
            default: {
                return {
                    type: "circle",
                    style,
                    cx: pc.x,
                    cy: pc.y,
                    r: Math.sqrt(attrs.size / Math.PI),
                };
            }
        }
    }
    // Get DropZones given current state
    getDropZones() {
        const attrs = this.state.attributes;
        const { x, y, size } = attrs;
        const r = Math.sqrt(size);
        return [
            {
                type: "line",
                p1: { x: x + r, y },
                p2: { x: x - r, y },
                title: "size",
                dropAction: {
                    scaleInference: {
                        attribute: "size",
                        attributeType: Specification.AttributeType.Number,
                        hints: { rangeNumber: [0, 200 * Math.PI] },
                    },
                },
            },
        ];
    }
    // Get bounding rectangle given current state
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
            },
        ];
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x, y, size } = attrs;
        return {
            type: "circle",
            cx: x,
            cy: y,
            radius: Math.sqrt(size / Math.PI),
        };
    }
    getSnappingGuides() {
        const attrs = this.state.attributes;
        const { x, y } = attrs;
        return [
            { type: "x", value: x, attribute: "x" },
            { type: "y", value: y, attribute: "y" },
        ];
    }
    getAttributePanelWidgets(manager) {
        const parentWidgets = super.getAttributePanelWidgets(manager);
        let widgets = [
            manager.verticalGroup({
                header: strings_1.strings.objects.general,
            }, [
                manager.mappingEditor(strings_1.strings.objects.rect.shape, "symbol", {
                    acceptKinds: [Specification.DataKind.Categorical],
                    hints: { rangeEnum: symbol_attrs_1.symbolTypes },
                    defaultValue: "circle",
                }),
                manager.mappingEditor(strings_1.strings.objects.size, "size", {
                    acceptKinds: [Specification.DataKind.Numerical],
                    hints: { rangeNumber: [0, 200 * Math.PI] },
                    defaultValue: 60,
                    numberOptions: {
                        showSlider: true,
                        minimum: 0,
                        sliderRange: [0, 3600],
                        sliderFunction: "sqrt",
                    },
                }),
                manager.mappingEditor(strings_1.strings.objects.visibleOn.visibility, "visible", {
                    defaultValue: true,
                }),
                manager.inputNumber({ property: "rotation" }, {
                    label: strings_1.strings.objects.rotation,
                    showUpdown: true,
                    updownTick: 5,
                }),
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.style,
            }, [
                manager.mappingEditor(strings_1.strings.objects.fill, "fill", {}),
                manager.mappingEditor(strings_1.strings.objects.stroke, "stroke", {}),
                this.object.mappings.stroke != null
                    ? manager.mappingEditor(strings_1.strings.objects.strokeWidth, "strokeWidth", {
                        hints: { rangeNumber: [0, 5] },
                        defaultValue: 1,
                        numberOptions: {
                            showSlider: true,
                            sliderRange: [0, 5],
                            minimum: 0,
                        },
                    })
                    : null,
                manager.mappingEditor(strings_1.strings.objects.opacity, "opacity", {
                    hints: { rangeNumber: [0, 1] },
                    defaultValue: 1,
                    numberOptions: {
                        showSlider: true,
                        minimum: 0,
                        maximum: 1,
                        step: 0.1,
                    },
                }),
            ]),
        ];
        widgets = widgets.concat([]);
        return widgets.concat(parentWidgets);
    }
    getTemplateParameters() {
        const properties = [];
        if (this.object.mappings.visible &&
            this.object.mappings.visible.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "visible",
                },
                type: Specification.AttributeType.Boolean,
                default: this.state.attributes.visible,
            });
        }
        if (this.object.mappings.fill &&
            this.object.mappings.fill.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "fill",
                },
                type: Specification.AttributeType.Color,
                default: common_1.rgbToHex(this.state.attributes.fill),
            });
        }
        if (this.object.mappings.strokeWidth &&
            this.object.mappings.strokeWidth.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "strokeWidth",
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.strokeWidth,
            });
        }
        if (this.object.mappings.stroke &&
            this.object.mappings.stroke.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "stroke",
                },
                type: Specification.AttributeType.Color,
                default: common_1.rgbToHex(this.state.attributes.stroke),
            });
        }
        if (this.object.mappings.size &&
            this.object.mappings.size.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "size",
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.size,
            });
        }
        if (this.object.mappings.opacity &&
            this.object.mappings.opacity.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "opacity",
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.opacity,
            });
        }
        if (this.object.mappings.symbol &&
            this.object.mappings.symbol.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "symbol",
                },
                type: Specification.AttributeType.Enum,
                default: this.state.attributes.symbol,
            });
        }
        return {
            properties,
        };
    }
}
exports.SymbolElementClass = SymbolElementClass;
SymbolElementClass.classID = "mark.symbol";
SymbolElementClass.type = "mark";
SymbolElementClass.metadata = {
    displayName: "Symbol",
    iconPath: "Shapes",
    creatingInteraction: {
        type: "point",
        mapping: { x: "x", y: "y" },
    },
};
SymbolElementClass.defaultProperties = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { visible: true, rotation: 0 });
SymbolElementClass.defaultMappingValues = {
    fill: { r: 17, g: 141, b: 255 },
    strokeWidth: 1,
    opacity: 1,
    size: 60,
    visible: true,
};
//# sourceMappingURL=symbol.js.map
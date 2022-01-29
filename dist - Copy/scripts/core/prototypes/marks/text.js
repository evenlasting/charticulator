"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextElementClass = void 0;
const defaults_1 = require("../../../app/stores/defaults");
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const types_1 = require("../../specification/types");
const common_2 = require("../common");
const emphasis_1 = require("./emphasis");
const text_attrs_1 = require("./text.attrs");
class TextElementClass extends emphasis_1.EmphasizableMarkClass {
    constructor() {
        super(...arguments);
        this.attributes = text_attrs_1.textAttributes;
        this.attributeNames = Object.keys(text_attrs_1.textAttributes);
    }
    // Initialize the state of an element so that everything has a valid value
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x = 0;
        attrs.y = 0;
        attrs.text = "Text";
        attrs.fontFamily = defaults_1.defaultFont;
        attrs.fontSize = defaults_1.defaultFontSize;
        attrs.color = {
            r: 0,
            g: 0,
            b: 0,
        };
        attrs.visible = true;
        attrs.outline = null;
        attrs.opacity = 1;
    }
    // Get intrinsic constraints between attributes (e.g., x2 - x1 = width for rectangles)
    // eslint-disable-next-line
    buildConstraints(solver) { }
    // Get the graphical element from the element
    getGraphics(cs, offset, 
    // eslint-disable-next-line
    glyphIndex = 0, 
    // eslint-disable-next-line
    manager, empasized) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        if (!attrs.visible || !this.object.properties.visible) {
            return null;
        }
        const metrics = Graphics.TextMeasurer.Measure(attrs.text, attrs.fontFamily, attrs.fontSize);
        const [dx, dy] = Graphics.TextMeasurer.ComputeTextPosition(0, 0, metrics, props.alignment.x, props.alignment.y, props.alignment.xMargin, props.alignment.yMargin);
        const p = cs.getLocalTransform(attrs.x + offset.x, attrs.y + offset.y);
        p.angle += props.rotation;
        let text = null;
        const textContent = attrs.text && common_1.splitStringByNewLine(common_1.replaceNewLineBySymbol(attrs.text));
        if (textContent && textContent.length > 1) {
            const height = attrs.fontSize;
            const lines = [];
            for (let index = 0; index < textContent.length; index++) {
                lines.push(Graphics.makeText(dx, dy - height * index, textContent[index], attrs.fontFamily, attrs.fontSize, Object.assign({ strokeColor: attrs.outline, fillColor: attrs.color, opacity: attrs.opacity }, this.generateEmphasisStyle(empasized))));
            }
            text = Graphics.makeGroup(lines);
        }
        else {
            text = Graphics.makeText(dx, dy, attrs.text, attrs.fontFamily, attrs.fontSize, Object.assign({ strokeColor: attrs.outline, fillColor: attrs.color, opacity: attrs.opacity }, this.generateEmphasisStyle(empasized)));
        }
        const g = Graphics.makeGroup([text]);
        g.transform = p;
        return g;
    }
    // Get DropZones given current state
    getDropZones() {
        return [
            Object.assign(Object.assign({ type: "rectangle" }, this.getBoundingRectangle()), { title: "text", dropAction: {
                    scaleInference: {
                        attribute: "text",
                        attributeType: Specification.AttributeType.Text,
                    },
                } }),
        ];
    }
    // Get bounding rectangle given current state
    getHandles() {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const { x, y } = attrs;
        const bbox = this.getBoundingRectangle();
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
            {
                type: "text-alignment",
                actions: [
                    { type: "property", source: "alignment", property: "alignment" },
                    { type: "property", source: "rotation", property: "rotation" },
                    {
                        type: "attribute-value-mapping",
                        source: "text",
                        attribute: "text",
                    },
                ],
                textWidth: bbox.width,
                textHeight: bbox.height,
                anchorX: x,
                anchorY: y,
                text: attrs.text,
                alignment: props.alignment,
                rotation: props.rotation,
            },
        ];
    }
    getBoundingRectangle() {
        const props = this.object.properties;
        const attrs = this.state.attributes;
        const metrics = Graphics.TextMeasurer.Measure(attrs.text, attrs.fontFamily, attrs.fontSize);
        const [dx, dy] = Graphics.TextMeasurer.ComputeTextPosition(0, 0, metrics, props.alignment.x, props.alignment.y, props.alignment.xMargin, props.alignment.yMargin);
        const cx = dx + metrics.width / 2;
        const cy = dy + metrics.middle;
        const rotation = this.object.properties.rotation;
        const cos = Math.cos(common_1.Geometry.degreesToRadians(rotation));
        const sin = Math.sin(common_1.Geometry.degreesToRadians(rotation));
        return {
            cx: attrs.x + cx * cos - cy * sin,
            cy: attrs.y + cx * sin + cy * cos,
            width: metrics.width,
            height: (metrics.middle - metrics.ideographicBaseline) * 2,
            rotation,
        };
    }
    getBoundingBox() {
        const rect = this.getBoundingRectangle();
        const attrs = this.state.attributes;
        return {
            type: "anchored-rectangle",
            anchorX: attrs.x,
            anchorY: attrs.y,
            cx: rect.cx - attrs.x,
            cy: rect.cy - attrs.y,
            width: rect.width,
            height: rect.height,
            rotation: rect.rotation,
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
        const props = this.object.properties;
        return [
            manager.verticalGroup({
                header: strings_1.strings.objects.general,
            }, [
                manager.mappingEditor(strings_1.strings.toolbar.text, "text", {}),
                manager.mappingEditor(strings_1.strings.objects.font, "fontFamily", {
                    defaultValue: defaults_1.defaultFont,
                }),
                manager.mappingEditor(strings_1.strings.objects.size, "fontSize", {
                    hints: { rangeNumber: [0, 36] },
                    defaultValue: defaults_1.defaultFontSize,
                    numberOptions: {
                        showUpdown: true,
                        updownStyle: "font",
                        minimum: 0,
                        updownTick: 2,
                    },
                }),
                manager.mappingEditor(strings_1.strings.objects.visibleOn.visibility, "visible", {
                    defaultValue: true,
                }),
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.anchorAndRotation,
            }, [
                manager.inputSelect({ property: "alignment", field: "x" }, {
                    type: "radio",
                    icons: [
                        "AlignHorizontalLeft",
                        "AlignHorizontalCenter",
                        "AlignHorizontalRight",
                    ],
                    labels: ["Left", "Middle", "Right"],
                    options: ["left", "middle", "right"],
                    label: strings_1.strings.objects.anchorX,
                }),
                props.alignment.x != "middle"
                    ? manager.inputNumber({ property: "alignment", field: "xMargin" }, {
                        updownTick: 1,
                        showUpdown: true,
                        label: "Margin",
                    })
                    : null,
                manager.inputSelect({ property: "alignment", field: "y" }, {
                    type: "radio",
                    icons: [
                        "AlignVerticalTop",
                        "AlignVerticalCenter",
                        "AlignVerticalBottom",
                    ],
                    labels: ["Top", "Middle", "Bottom"],
                    options: ["top", "middle", "bottom"],
                    label: strings_1.strings.objects.anchorY,
                }),
                props.alignment.y != "middle"
                    ? manager.inputNumber({ property: "alignment", field: "yMargin" }, {
                        updownTick: 1,
                        showUpdown: true,
                        label: strings_1.strings.objects.text.margin,
                    })
                    : null,
                manager.inputNumber({ property: "rotation" }, {
                    label: strings_1.strings.objects.rotation,
                    showUpdown: true,
                    updownTick: 1,
                }),
            ]),
            manager.verticalGroup({
                header: "Style",
            }, [
                manager.mappingEditor(strings_1.strings.objects.color, "color", {}),
                manager.mappingEditor(strings_1.strings.objects.outline, "outline", {}),
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
        ].concat(parentWidgets);
    }
    getTemplateParameters() {
        const properties = [];
        if (this.object.mappings.fontFamily &&
            this.object.mappings.fontFamily.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "fontFamily",
                },
                type: Specification.AttributeType.FontFamily,
                default: this.state.attributes.fontFamily,
            });
        }
        if (this.object.mappings.fontSize &&
            this.object.mappings.fontSize.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "fontSize",
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.fontSize,
            });
        }
        if (this.object.mappings.color &&
            this.object.mappings.color.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "color",
                },
                type: Specification.AttributeType.Color,
                default: common_1.rgbToHex(this.state.attributes.color),
            });
        }
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
        if (this.object.mappings.text &&
            this.object.mappings.text.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "text",
                },
                type: Specification.AttributeType.Text,
                default: this.state.attributes.text,
            });
        }
        return {
            properties,
        };
    }
}
exports.TextElementClass = TextElementClass;
TextElementClass.classID = "mark.text";
TextElementClass.type = "mark";
TextElementClass.metadata = {
    displayName: "Text",
    iconPath: "FontColorA",
    creatingInteraction: {
        type: "point",
        mapping: { x: "x", y: "y" },
    },
};
TextElementClass.defaultMappingValues = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { text: "Text", fontFamily: defaults_1.defaultFont, fontSize: defaults_1.defaultFontSize, color: { r: 0, g: 0, b: 0 }, opacity: 1, visible: true });
TextElementClass.defaultProperties = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { alignment: {
        x: types_1.TextAlignmentHorizontal.Middle,
        y: types_1.TextAlignmentVertical.Top,
        xMargin: 5,
        yMargin: 5,
    }, rotation: 0, visible: true });
//# sourceMappingURL=text.js.map
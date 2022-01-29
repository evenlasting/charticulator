"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextboxElementClass = void 0;
const defaults_1 = require("../../../app/stores/defaults");
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const graphics_1 = require("../../graphics");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const common_2 = require("../common");
const emphasis_1 = require("./emphasis");
const textbox_attrs_1 = require("./textbox.attrs");
class TextboxElementClass extends emphasis_1.EmphasizableMarkClass {
    constructor() {
        super(...arguments);
        this.attributes = textbox_attrs_1.textboxAttributes;
        this.attributeNames = Object.keys(textbox_attrs_1.textboxAttributes);
    }
    // Initialize the state of an element so that everything has a valid value
    initializeState() {
        const defaultWidth = 30;
        const defaultHeight = 50;
        const attrs = this.state.attributes;
        attrs.x1 = -defaultWidth / 2;
        attrs.y1 = -defaultHeight / 2;
        attrs.x2 = +defaultWidth / 2;
        attrs.y2 = +defaultHeight / 2;
        attrs.cx = 0;
        attrs.cy = 0;
        attrs.width = defaultWidth;
        attrs.height = defaultHeight;
        attrs.color = {
            r: 0,
            g: 0,
            b: 0,
        };
        attrs.visible = true;
        attrs.outline = null;
        attrs.opacity = 1;
        attrs.text = null;
        attrs.fontFamily = defaults_1.defaultFont;
        attrs.fontSize = defaults_1.defaultFontSize;
    }
    // eslint-disable-next-line
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const parentWidgets = super.getAttributePanelWidgets(manager);
        const widgets = [
            manager.verticalGroup({
                header: strings_1.strings.objects.general,
            }, [
                manager.mappingEditor(strings_1.strings.objects.width, "width", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [Specification.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.mappingEditor(strings_1.strings.objects.height, "height", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [Specification.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.mappingEditor(strings_1.strings.objects.visibleOn.visibility, "visible", {
                    defaultValue: true,
                }),
            ]),
            manager.verticalGroup({
                header: strings_1.strings.toolbar.text,
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
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.layout,
            }, [
                manager.inputSelect({ property: "alignX" }, {
                    type: "radio",
                    options: ["start", "middle", "end"],
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
                    label: strings_1.strings.objects.alignX,
                }),
                props.alignX != "middle"
                    ? manager.inputNumber({ property: "paddingX" }, {
                        updownTick: 1,
                        showUpdown: true,
                        label: strings_1.strings.objects.text.margin,
                    })
                    : null,
                manager.inputSelect({ property: "alignY" }, {
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
                    label: strings_1.strings.objects.alignX,
                }),
                props.alignY != "middle"
                    ? manager.inputNumber({ property: "paddingY" }, {
                        updownTick: 1,
                        showUpdown: true,
                        label: strings_1.strings.objects.text.margin,
                    })
                    : null,
                manager.inputBoolean({ property: "wordWrap" }, {
                    type: "checkbox",
                    headerLabel: strings_1.strings.objects.text.textDisplaying,
                    label: strings_1.strings.objects.text.wrapText,
                }),
                props.wordWrap
                    ? manager.inputBoolean({ property: "overFlow" }, {
                        type: "checkbox",
                        label: strings_1.strings.objects.text.overflow,
                    })
                    : null,
                props.wordWrap
                    ? manager.inputSelect({ property: "alignText" }, {
                        type: "radio",
                        options: ["end", "middle", "start"],
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
                        label: strings_1.strings.alignment.alignment,
                    })
                    : null,
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.style,
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
        ];
        return widgets.concat(parentWidgets);
    }
    // Get intrinsic constraints between attributes (e.g., x2 - x1 = width for rectangles)
    buildConstraints(solver) {
        const [x1, y1, x2, y2, cx, cy, width, height] = solver.attrs(this.state.attributes, ["x1", "y1", "x2", "y2", "cx", "cy", "width", "height"]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
            [1, x2],
            [-1, x1],
        ], [[1, width]]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
            [1, y2],
            [-1, y1],
        ], [[1, height]]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cx]], [
            [1, x1],
            [1, x2],
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cy]], [
            [1, y1],
            [1, y2],
        ]);
    }
    // Get the graphical element from the element
    // eslint-disable-next-line
    getGraphics(cs, offset, 
    // eslint-disable-next-line
    glyphIndex, 
    // eslint-disable-next-line
    manager) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        if (!attrs.text ||
            (!attrs.color && !attrs.outline) ||
            !attrs.visible ||
            attrs.opacity == 0) {
            return Graphics.makeGroup([]);
        }
        const metrics = Graphics.TextMeasurer.Measure(attrs.text, attrs.fontFamily, attrs.fontSize);
        const helper = new Graphics.CoordinateSystemHelper(cs);
        const cheight = (metrics.middle - metrics.ideographicBaseline) * 2;
        let y = 0;
        switch (props.alignY) {
            case "start":
                {
                    y = attrs.y1 - metrics.ideographicBaseline + props.paddingY;
                }
                break;
            case "middle":
                {
                    y = attrs.cy - cheight / 2 - metrics.ideographicBaseline;
                }
                break;
            case "end":
                {
                    y = attrs.y2 - cheight - metrics.ideographicBaseline - props.paddingY;
                }
                break;
        }
        let textElement;
        const applyStyles = (textElement, attrs) => {
            if (attrs.outline) {
                if (attrs.color) {
                    const g = Graphics.makeGroup([
                        Object.assign(Object.assign({}, textElement), { style: {
                                strokeColor: attrs.outline,
                            } }),
                        Object.assign(Object.assign({}, textElement), { style: {
                                fillColor: attrs.color,
                            } }),
                    ]);
                    g.style = { opacity: attrs.opacity };
                    return g;
                }
                else {
                    return Object.assign(Object.assign({}, textElement), { style: {
                            strokeColor: attrs.outline,
                            opacity: attrs.opacity,
                        } });
                }
            }
            else {
                return Object.assign(Object.assign({}, textElement), { style: {
                        fillColor: attrs.color,
                        opacity: attrs.opacity,
                    } });
            }
        };
        const textContent = common_1.replaceNewLineBySymbol(attrs.text);
        if ((textContent && common_1.splitStringByNewLine(textContent).length > 1) ||
            props.wordWrap) {
            const height = attrs.fontSize;
            // set limit of lines depends of height bounding box
            let maxLines = 1000;
            // if option enabled and no space for rest of text, set limit of lines count
            if (!props.overFlow) {
                maxLines = Math.floor(Math.abs(attrs.y2 - attrs.y1) / height);
            }
            let textContentList = [textContent];
            // auto wrap text content
            if (props.wordWrap) {
                textContentList = graphics_1.splitByWidth(common_1.replaceSymbolByTab(common_1.replaceSymbolByNewLine(attrs.text)), Math.abs(attrs.x2 - attrs.x1) - 10, maxLines, attrs.fontFamily, attrs.fontSize);
            }
            // add user input wrap
            textContentList = textContentList.flatMap((line) => common_1.splitStringByNewLine(line));
            const lines = [];
            let textBoxShift = 0;
            switch (props.alignY) {
                case "start":
                    {
                        switch (props.alignText) {
                            case "start":
                                textBoxShift = -height;
                                break;
                            case "middle":
                                textBoxShift = (textContentList.length * height) / 2 - height;
                                break;
                            case "end":
                                textBoxShift = textContentList.length * height - height;
                                break;
                        }
                    }
                    break;
                case "middle":
                    {
                        switch (props.alignText) {
                            case "start":
                                textBoxShift = -height / 2;
                                break;
                            case "middle":
                                textBoxShift =
                                    (textContentList.length * height) / 2 - height / 2;
                                break;
                            case "end":
                                textBoxShift = textContentList.length * height - height / 2;
                                break;
                        }
                    }
                    break;
                case "end":
                    {
                        switch (props.alignText) {
                            case "start":
                                textBoxShift = 0;
                                break;
                            case "middle":
                                textBoxShift = (textContentList.length * height) / 2;
                                break;
                            case "end":
                                textBoxShift = textContentList.length * height;
                                break;
                        }
                    }
                    break;
            }
            for (let index = 0; index < textContentList.length; index++) {
                const pathMaker = new Graphics.PathMaker();
                helper.lineTo(pathMaker, attrs.x1 + offset.x + props.paddingX, y + offset.y + textBoxShift - height * index, attrs.x2 + offset.x - props.paddingX, y + offset.y + textBoxShift - height * index, true);
                const cmds = pathMaker.path.cmds;
                const textElement = applyStyles({
                    key: index,
                    type: "text-on-path",
                    pathCmds: cmds,
                    text: textContentList[index],
                    fontFamily: attrs.fontFamily,
                    fontSize: attrs.fontSize,
                    align: props.alignX,
                }, attrs);
                lines.push(textElement);
            }
            return Graphics.makeGroup(lines);
        }
        else {
            const pathMaker = new Graphics.PathMaker();
            helper.lineTo(pathMaker, attrs.x1 + offset.x + props.paddingX, y + offset.y, attrs.x2 + offset.x - props.paddingX, y + offset.y, true);
            const cmds = pathMaker.path.cmds;
            textElement = {
                type: "text-on-path",
                pathCmds: cmds,
                text: attrs.text,
                fontFamily: attrs.fontFamily,
                fontSize: attrs.fontSize,
                align: props.alignX,
            };
            return applyStyles(textElement, attrs);
        }
    }
    /** Get link anchors for this mark */
    // eslint-disable-next-line
    getLinkAnchors() {
        const attrs = this.state.attributes;
        const element = this.object._id;
        return [
            {
                element,
                points: [
                    {
                        x: attrs.x1,
                        y: attrs.y1,
                        xAttribute: "x1",
                        yAttribute: "y1",
                        direction: { x: -1, y: 0 },
                    },
                    {
                        x: attrs.x1,
                        y: attrs.y2,
                        xAttribute: "x1",
                        yAttribute: "y2",
                        direction: { x: -1, y: 0 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.x2,
                        y: attrs.y1,
                        xAttribute: "x2",
                        yAttribute: "y1",
                        direction: { x: 1, y: 0 },
                    },
                    {
                        x: attrs.x2,
                        y: attrs.y2,
                        xAttribute: "x2",
                        yAttribute: "y2",
                        direction: { x: 1, y: 0 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.x1,
                        y: attrs.y1,
                        xAttribute: "x1",
                        yAttribute: "y1",
                        direction: { x: 0, y: -1 },
                    },
                    {
                        x: attrs.x2,
                        y: attrs.y1,
                        xAttribute: "x2",
                        yAttribute: "y1",
                        direction: { x: 0, y: -1 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.x1,
                        y: attrs.y2,
                        xAttribute: "x1",
                        yAttribute: "y2",
                        direction: { x: 0, y: 1 },
                    },
                    {
                        x: attrs.x2,
                        y: attrs.y2,
                        xAttribute: "x2",
                        yAttribute: "y2",
                        direction: { x: 0, y: 1 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.cx,
                        y: attrs.y1,
                        xAttribute: "cx",
                        yAttribute: "y1",
                        direction: { x: 0, y: -1 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.cx,
                        y: attrs.y2,
                        xAttribute: "cx",
                        yAttribute: "y2",
                        direction: { x: 0, y: 1 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.x1,
                        y: attrs.cy,
                        xAttribute: "x1",
                        yAttribute: "cy",
                        direction: { x: -1, y: 0 },
                    },
                ],
            },
            {
                element,
                points: [
                    {
                        x: attrs.x2,
                        y: attrs.cy,
                        xAttribute: "x2",
                        yAttribute: "cy",
                        direction: { x: 1, y: 0 },
                    },
                ],
            },
        ];
    }
    // Get DropZones given current state
    getDropZones() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return [
            {
                type: "line",
                p1: { x: x2, y: y1 },
                p2: { x: x1, y: y1 },
                title: "width",
                accept: { kind: Specification.DataKind.Numerical },
                dropAction: {
                    scaleInference: {
                        attribute: "width",
                        attributeType: Specification.AttributeType.Number,
                        hints: { autoRange: true, startWithZero: "always" },
                    },
                },
            },
            {
                type: "line",
                p1: { x: x1, y: y1 },
                p2: { x: x1, y: y2 },
                title: "height",
                accept: { kind: Specification.DataKind.Numerical },
                dropAction: {
                    scaleInference: {
                        attribute: "height",
                        attributeType: Specification.AttributeType.Number,
                        hints: { autoRange: true, startWithZero: "always" },
                    },
                },
            },
        ];
    }
    // Get bounding rectangle given current state
    getHandles() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return [
            {
                type: "line",
                axis: "x",
                actions: [{ type: "attribute", attribute: "x1" }],
                value: x1,
                span: [y1, y2],
            },
            {
                type: "line",
                axis: "x",
                actions: [{ type: "attribute", attribute: "x2" }],
                value: x2,
                span: [y1, y2],
            },
            {
                type: "line",
                axis: "y",
                actions: [{ type: "attribute", attribute: "y1" }],
                value: y1,
                span: [x1, x2],
            },
            {
                type: "line",
                axis: "y",
                actions: [{ type: "attribute", attribute: "y2" }],
                value: y2,
                span: [x1, x2],
            },
            {
                type: "point",
                x: x1,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
            },
            {
                type: "point",
                x: x1,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
            {
                type: "point",
                x: x2,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
            },
            {
                type: "point",
                x: x2,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
        ];
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return {
            type: "rectangle",
            cx: (x1 + x2) / 2,
            cy: (y1 + y2) / 2,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
            rotation: 0,
        };
    }
    getSnappingGuides() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2, cx, cy } = attrs;
        return [
            { type: "x", value: x1, attribute: "x1" },
            { type: "x", value: x2, attribute: "x2" },
            { type: "x", value: cx, attribute: "cx" },
            { type: "y", value: y1, attribute: "y1" },
            { type: "y", value: y2, attribute: "y2" },
            { type: "y", value: cy, attribute: "cy" },
        ];
    }
    getTemplateParameters() {
        const properties = [];
        if (this.object.mappings.vistextible &&
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
        if (this.object.properties.wordWrap !== undefined) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "wordWrap",
                },
                type: Specification.AttributeType.Boolean,
                default: this.object.properties.wordWrap,
            });
        }
        return {
            properties,
        };
    }
}
exports.TextboxElementClass = TextboxElementClass;
TextboxElementClass.classID = "mark.textbox";
TextboxElementClass.type = "mark";
TextboxElementClass.metadata = {
    displayName: "Textbox",
    iconPath: "TextField",
    creatingInteraction: {
        type: "rectangle",
        mapping: { xMin: "x1", yMin: "y1", xMax: "x2", yMax: "y2" },
    },
};
TextboxElementClass.defaultProperties = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { visible: true, paddingX: 0, paddingY: 0, alignX: "middle", alignY: "middle", wordWrap: false, overFlow: true, alignText: "start" });
TextboxElementClass.defaultMappingValues = {
    text: "Text",
    fontFamily: defaults_1.defaultFont,
    fontSize: defaults_1.defaultFontSize,
    color: { r: 0, g: 0, b: 0 },
    opacity: 1,
    visible: true,
};
//# sourceMappingURL=textbox.js.map
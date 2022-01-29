"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineElementClass = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../../common");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const line_attrs_1 = require("./line.attrs");
const common_2 = require("../common");
const Graphics = require("../../graphics");
const emphasis_1 = require("./emphasis");
const specification_1 = require("../../specification");
const strings_1 = require("../../../strings");
class LineElementClass extends emphasis_1.EmphasizableMarkClass {
    constructor() {
        super(...arguments);
        this.attributes = line_attrs_1.lineAttributes;
        this.attributeNames = Object.keys(line_attrs_1.lineAttributes);
    }
    // Initialize the state of an element so that everything has a valid value
    initializeState() {
        super.initializeState();
        const defaultWidth = 30;
        const defaultHeight = 50;
        const attrs = this.state.attributes;
        attrs.x1 = -defaultWidth / 2;
        attrs.y1 = -defaultHeight / 2;
        attrs.x2 = +defaultWidth / 2;
        attrs.y2 = +defaultHeight / 2;
        attrs.cx = 0;
        attrs.cy = 0;
        attrs.dx = 0;
        attrs.dy = 0;
        attrs.stroke = { r: 0, g: 0, b: 0 };
        attrs.strokeWidth = 1;
        attrs.opacity = 1;
        attrs.visible = true;
    }
    /** Get link anchors for this mark */
    getLinkAnchors(mode) {
        const attrs = this.state.attributes;
        return [
            {
                element: this.object._id,
                points: [
                    {
                        x: attrs.cx,
                        y: attrs.cy,
                        xAttribute: "cx",
                        yAttribute: "cy",
                        direction: { x: mode == "begin" ? 1 : -1, y: 0 },
                    },
                ],
            },
            {
                element: this.object._id,
                points: [
                    {
                        x: attrs.x1,
                        y: attrs.y1,
                        xAttribute: "x1",
                        yAttribute: "y1",
                        direction: { x: mode == "begin" ? 1 : -1, y: 0 },
                    },
                ],
            },
            {
                element: this.object._id,
                points: [
                    {
                        x: attrs.x2,
                        y: attrs.y2,
                        xAttribute: "x2",
                        yAttribute: "y2",
                        direction: { x: mode == "begin" ? 1 : -1, y: 0 },
                    },
                ],
            },
        ];
    }
    /** Get intrinsic constraints between attributes (e.g., x2 - x1 = width for rectangles) */
    buildConstraints(solver) {
        const [x1, y1, x2, y2, cx, cy, dx, dy] = solver.attrs(this.state.attributes, ["x1", "y1", "x2", "y2", "cx", "cy", "dx", "dy"]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cx]], [
            [1, x1],
            [1, x2],
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cy]], [
            [1, y1],
            [1, y2],
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, dx]], [
            [1, x2],
            [-1, x1],
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, dy]], [
            [1, y2],
            [-1, y1],
        ]);
    }
    /** Get the graphical element from the element */
    getGraphics(cs, offset, 
    // eslint-disable-next-line
    glyphIndex = 0, 
    // eslint-disable-next-line
    manager, emphasize) {
        const attrs = this.state.attributes;
        if (!attrs.visible || !this.object.properties.visible) {
            return null;
        }
        const helper = new Graphics.CoordinateSystemHelper(cs);
        return helper.line(attrs.x1 + offset.x, attrs.y1 + offset.y, attrs.x2 + offset.x, attrs.y2 + offset.y, Object.assign({ strokeColor: attrs.stroke, strokeOpacity: attrs.opacity, strokeWidth: attrs.strokeWidth, strokeDasharray: common_2.strokeStyleToDashArray(this.object.properties.strokeStyle) }, this.generateEmphasisStyle(emphasize)));
    }
    /** Get DropZones given current state */
    getDropZones() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        const cx = x1;
        const cy = y1;
        return [
            {
                type: "line",
                p1: { x: x2, y: cy },
                p2: { x: x1, y: cy },
                title: "dx",
                accept: { kind: "numerical" },
                dropAction: {
                    scaleInference: {
                        attribute: "dx",
                        attributeType: "number",
                        hints: { autoRange: true, startWithZero: "always" },
                    },
                },
            },
            {
                type: "line",
                p1: { x: cx, y: y1 },
                p2: { x: cx, y: y2 },
                title: "dy",
                accept: { kind: "numerical" },
                dropAction: {
                    scaleInference: {
                        attribute: "dy",
                        attributeType: "number",
                        hints: { autoRange: true, startWithZero: "always" },
                    },
                },
            },
        ];
    }
    /** Get bounding rectangle given current state */
    getHandles() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2, cx, cy } = attrs;
        return [
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
                x: x2,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
            {
                type: "point",
                x: cx,
                y: cy,
                actions: [
                    { type: "attribute", source: "x", attribute: "cx" },
                    { type: "attribute", source: "y", attribute: "cy" },
                ],
            },
        ];
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return {
            type: "line",
            morphing: true,
            x1,
            y1,
            x2,
            y2,
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
    getAttributePanelWidgets(manager) {
        const parentWidgets = super.getAttributePanelWidgets(manager);
        return [
            manager.verticalGroup({
                header: strings_1.strings.toolbar.line,
            }, [
                manager.mappingEditor("X Span", "dx", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [Specification.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.mappingEditor("Y Span", "dy", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [Specification.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.mappingEditor("Visibility", "visible", {
                    defaultValue: true,
                }),
            ]),
            manager.verticalGroup({
                header: strings_1.strings.objects.style,
            }, [
                manager.mappingEditor(strings_1.strings.objects.stroke, "stroke", {}),
                manager.mappingEditor(strings_1.strings.objects.strokeWidth, "strokeWidth", {
                    hints: { rangeNumber: [0, 5] },
                    defaultValue: 1,
                    numberOptions: {
                        showSlider: true,
                        sliderRange: [0, 10],
                        minimum: 0,
                    },
                }),
                manager.inputSelect({ property: "strokeStyle" }, {
                    type: "dropdown",
                    showLabel: true,
                    icons: ["stroke/solid", "stroke/dashed", "stroke/dotted"],
                    labels: ["Solid", "Dashed", "Dotted"],
                    options: ["solid", "dashed", "dotted"],
                    label: strings_1.strings.objects.line.lineStyle,
                }),
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
        if (this.object.mappings.stroke &&
            this.object.mappings.stroke.type === specification_1.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: "stroke",
                },
                type: Specification.AttributeType.Color,
                default: this.state.attributes.stroke &&
                    common_1.rgbToHex(this.state.attributes.stroke),
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
            properties.push({
                objectID: this.object._id,
                target: {
                    property: "strokeStyle",
                },
                type: Specification.AttributeType.Enum,
                default: this.object.properties.strokeStyle,
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
        return {
            properties,
        };
    }
}
exports.LineElementClass = LineElementClass;
LineElementClass.classID = "mark.line";
LineElementClass.type = "mark";
LineElementClass.metadata = {
    displayName: "Line",
    iconPath: "Line",
    creatingInteraction: {
        type: "line-segment",
        mapping: { x1: "x1", y1: "y1", x2: "x2", y2: "y2" },
    },
};
LineElementClass.defaultProperties = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { strokeStyle: "solid", visible: true });
LineElementClass.defaultMappingValues = {
    stroke: { r: 0, g: 0, b: 0 },
    strokeWidth: 1,
    opacity: 1,
    visible: true,
};
//# sourceMappingURL=line.js.map
"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RectElementClass = exports.ShapeType = void 0;
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const common_2 = require("../common");
const emphasis_1 = require("./emphasis");
const rect_attrs_1 = require("./rect.attrs");
const strings_1 = require("../../../strings");
var ShapeType;
(function (ShapeType) {
    ShapeType["Rectangle"] = "rectangle";
    ShapeType["Triangle"] = "triangle";
    ShapeType["Ellips"] = "ellipse";
})(ShapeType = exports.ShapeType || (exports.ShapeType = {}));
class RectElementClass extends emphasis_1.EmphasizableMarkClass {
    constructor() {
        super(...arguments);
        this.attributes = rect_attrs_1.rectAttributes;
        this.attributeNames = Object.keys(rect_attrs_1.rectAttributes);
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
        attrs.width = defaultWidth;
        attrs.height = defaultHeight;
        attrs.stroke = null;
        attrs.fill = { r: 200, g: 200, b: 200 };
        attrs.strokeWidth = 1;
        attrs.opacity = 1;
        attrs.visible = true;
    }
    getTemplateParameters() {
        const properties = [];
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
                default: common_1.rgbToHex(this.state.attributes.stroke),
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
        properties.push({
            objectID: this.object._id,
            target: {
                property: "rx",
            },
            type: Specification.AttributeType.Number,
            default: 0,
        });
        properties.push({
            objectID: this.object._id,
            target: {
                property: "ry",
            },
            type: Specification.AttributeType.Number,
            default: 0,
        });
        return {
            properties,
        };
    }
    getAttributePanelWidgets(manager) {
        const parentWidgets = super.getAttributePanelWidgets(manager);
        let widgets = [
            manager.verticalGroup({
                header: strings_1.strings.objects.general,
            }, [
                manager.mappingEditor(strings_1.strings.objects.width, "width", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [specification_1.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.mappingEditor(strings_1.strings.objects.height, "height", {
                    hints: { autoRange: true, startWithZero: "always" },
                    acceptKinds: [specification_1.DataKind.Numerical],
                    defaultAuto: true,
                }),
                manager.inputSelect({ property: "shape" }, {
                    type: "dropdown",
                    showLabel: true,
                    label: strings_1.strings.objects.rect.shape,
                    icons: ["RectangleShape", "TriangleShape", "Ellipse"],
                    labels: [
                        strings_1.strings.objects.rect.shapes.rectangle,
                        strings_1.strings.objects.rect.shapes.triangle,
                        strings_1.strings.objects.rect.shapes.ellipse,
                    ],
                    options: [
                        ShapeType.Rectangle,
                        ShapeType.Triangle,
                        ShapeType.Ellips,
                    ],
                }),
                manager.inputBoolean({ property: "allowFlipping" }, {
                    type: "checkbox",
                    label: strings_1.strings.objects.rect.flipping,
                }),
                manager.mappingEditor(strings_1.strings.objects.visibleOn.visibility, "visible", {
                    defaultValue: true,
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
                this.object.mappings.stroke != null
                    ? manager.inputSelect({ property: "strokeStyle" }, {
                        type: "dropdown",
                        showLabel: true,
                        label: "Line Style",
                        icons: ["stroke/solid", "stroke/dashed", "stroke/dotted"],
                        labels: [
                            strings_1.strings.objects.links.solid,
                            strings_1.strings.objects.links.dashed,
                            strings_1.strings.objects.links.dotted,
                        ],
                        options: ["solid", "dashed", "dotted"],
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
                this.object.properties.shape === ShapeType.Rectangle
                    ? manager.inputNumber({
                        property: "rx",
                    }, {
                        label: strings_1.strings.objects.roundX,
                        showUpdown: true,
                        updownTick: 1,
                        minimum: 0,
                    })
                    : null,
                this.object.properties.shape === ShapeType.Rectangle
                    ? manager.inputNumber({
                        property: "ry",
                    }, {
                        label: strings_1.strings.objects.roundY,
                        showUpdown: true,
                        updownTick: 1,
                        minimum: 0,
                    })
                    : null,
            ]),
        ];
        widgets = widgets.concat(parentWidgets);
        return widgets;
    }
    /**
     * Get intrinsic constraints between attributes (e.g., x2 - x1 = width for rectangles)
     *   -------------- y1
     *   |            |     |
     *   |      *     | yc  height
     *   |            |     |
     *   -------------- y2
     *  x1     xc     x2
     *  <----width---->
     */
    buildConstraints(solver) {
        // take variables for attributes
        const [x1, y1, x2, y2, cx, cy, width, height] = solver.attrs(this.state.attributes, ["x1", "y1", "x2", "y2", "cx", "cy", "width", "height"]);
        // Describes intrinsic relations of reactangle
        // add constraint x2 - x1 = width
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
            [1, x2],
            [-1, x1],
        ], [[1, width]]);
        // add constraint y2 - y1 = height
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
            [1, y2],
            [-1, y1],
        ], [[1, height]]);
        // add constraint x1 + x2 = 2 * xc
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cx]], [
            [1, x1],
            [1, x2],
        ]);
        // add constraint y1 + y2 = 2 * yc
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cy]], [
            [1, y1],
            [1, y2],
        ]);
        if (!this.object.properties.allowFlipping &&
            this.object.properties.allowFlipping !== undefined) {
            // Additional constraint to prevent flipping mark objects
            // add constraint x2 >= x1
            solver.addSoftInequality(solver_1.ConstraintStrength.WEAKER, 0, [[1, x2]], [[1, x1]]);
            // add constraint y2 >= y1
            solver.addSoftInequality(solver_1.ConstraintStrength.WEAKER, 0, [[1, y2]], [[1, y1]]);
        }
    }
    // Get the graphical element from the element
    getGraphics(cs, offset, 
    // eslint-disable-next-line
    glyphIndex = 0, 
    // eslint-disable-next-line
    manager, empasized) {
        const attrs = this.state.attributes;
        const properties = this.object.properties;
        if (!attrs.visible || !this.object.properties.visible) {
            return null;
        }
        const helper = new Graphics.CoordinateSystemHelper(cs);
        switch (this.object.properties.shape) {
            case ShapeType.Ellips: {
                return helper.ellipse(attrs.x1 + offset.x, attrs.y1 + offset.y, attrs.x2 + offset.x, attrs.y2 + offset.y, Object.assign({ strokeColor: attrs.stroke, strokeWidth: attrs.strokeWidth, strokeLinejoin: "miter", strokeDasharray: common_2.strokeStyleToDashArray(this.object.properties.strokeStyle), fillColor: attrs.fill, opacity: attrs.opacity }, this.generateEmphasisStyle(empasized)));
            }
            case ShapeType.Triangle: {
                const pathMaker = new Graphics.PathMaker();
                helper.lineTo(pathMaker, attrs.x1 + offset.x, attrs.y1 + offset.y, (attrs.x1 + attrs.x2) / 2 + offset.x, attrs.y2 + offset.y, true);
                helper.lineTo(pathMaker, (attrs.x1 + attrs.x2) / 2 + offset.x, attrs.y2 + offset.y, attrs.x2 + offset.x, attrs.y1 + offset.y, false);
                pathMaker.closePath();
                const path = pathMaker.path;
                path.style = Object.assign({ strokeColor: attrs.stroke, strokeWidth: attrs.strokeWidth, strokeLinejoin: "miter", strokeDasharray: common_2.strokeStyleToDashArray(this.object.properties.strokeStyle), fillColor: attrs.fill, opacity: attrs.opacity }, this.generateEmphasisStyle(empasized));
                return path;
            }
            case ShapeType.Rectangle:
            default: {
                return helper.rect(attrs.x1 + offset.x, attrs.y1 + offset.y, attrs.x2 + offset.x, attrs.y2 + offset.y, Object.assign({ strokeColor: attrs.stroke, strokeWidth: attrs.strokeWidth, strokeLinejoin: "miter", strokeDasharray: common_2.strokeStyleToDashArray(this.object.properties.strokeStyle), fillColor: attrs.fill, opacity: attrs.opacity }, this.generateEmphasisStyle(empasized)), properties.rx, properties.ry);
            }
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
                accept: { kind: specification_1.DataKind.Numerical },
                dropAction: {
                    scaleInference: {
                        attribute: "width",
                        attributeType: specification_1.AttributeType.Number,
                        hints: { autoRange: true, startWithZero: "always" },
                    },
                },
            },
            {
                type: "line",
                p1: { x: x1, y: y1 },
                p2: { x: x1, y: y2 },
                title: "height",
                accept: { kind: specification_1.DataKind.Numerical },
                dropAction: {
                    scaleInference: {
                        attribute: "height",
                        attributeType: specification_1.AttributeType.Number,
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
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "x",
                actions: [{ type: "attribute", attribute: "x2" }],
                value: x2,
                span: [y1, y2],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "y",
                actions: [{ type: "attribute", attribute: "y1" }],
                value: y1,
                span: [x1, x2],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "y",
                actions: [{ type: "attribute", attribute: "y2" }],
                value: y2,
                span: [x1, x2],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x1,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x1,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x2,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y1" },
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
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
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
}
exports.RectElementClass = RectElementClass;
RectElementClass.classID = "mark.rect";
RectElementClass.type = "mark";
RectElementClass.metadata = {
    displayName: "Shape",
    iconPath: "RectangleShape",
    creatingInteraction: {
        type: ShapeType.Rectangle,
        mapping: { xMin: "x1", yMin: "y1", xMax: "x2", yMax: "y2" },
    },
};
RectElementClass.defaultProperties = Object.assign(Object.assign({}, common_2.ObjectClass.defaultProperties), { visible: true, strokeStyle: "solid", shape: ShapeType.Rectangle, allowFlipping: true, rx: 0, ry: 0 });
RectElementClass.defaultMappingValues = {
    fill: { r: 17, g: 141, b: 255 },
    strokeWidth: 1,
    opacity: 1,
    visible: true,
};
//# sourceMappingURL=rect.js.map
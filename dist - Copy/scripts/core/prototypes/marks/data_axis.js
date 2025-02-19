"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAxisClass = void 0;
// This implements Data-Driven Guides (straight line guide).
const mark_1 = require("./mark");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const attrs_1 = require("../attrs");
const common_1 = require("../common");
const axis_1 = require("../plot_segments/axis");
const React = require("react");
const strings_1 = require("../../../strings");
class DataAxisClass extends mark_1.MarkClass {
    getAttributeNames(expr) {
        return [`anchorX${expr.name}`, `anchorY${expr.name}`];
    }
    get attributeNames() {
        const r = ["x1", "y1", "x2", "y2"];
        for (const item of this.object.properties.dataExpressions) {
            const [xName, yName] = this.getAttributeNames(item);
            r.push(xName);
            r.push(yName);
        }
        return r;
    }
    get attributes() {
        const r = Object.assign({}, attrs_1.AttrBuilder.line());
        for (const item of this.object.properties.dataExpressions) {
            const [xName, yName] = this.getAttributeNames(item);
            r[xName] = {
                name: xName,
                type: Specification.AttributeType.Number,
            };
            r[yName] = {
                name: yName,
                type: Specification.AttributeType.Number,
            };
        }
        return r;
    }
    buildConstraints(solver, context) {
        if (context == null) {
            return;
        }
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const [x1, y1, x2, y2] = solver.attrs(attrs, ["x1", "y1", "x2", "y2"]);
        if (props.axis) {
            if (props.axis.type == "numerical") {
                for (const item of props.dataExpressions) {
                    const [attrX, attrY] = this.getAttributeNames(item);
                    const expr = (context.getExpressionValue(item.expression, context.rowContext));
                    const interp = axis_1.getNumericalInterpolate(props.axis);
                    const t = interp(expr);
                    if (attrs[attrX] == null) {
                        attrs[attrX] = attrs.x1;
                    }
                    if (attrs[attrY] == null) {
                        attrs[attrY] = attrs.y1;
                    }
                    solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                        [t, x2],
                        [1 - t, x1],
                    ], [[1, solver.attr(attrs, attrX)]]);
                    solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                        [t, y2],
                        [1 - t, y1],
                    ], [[1, solver.attr(attrs, attrY)]]);
                }
            }
        }
    }
    /** Initialize the state of an element so that everything has a valid value */
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x1 = -10;
        attrs.y1 = -10;
        attrs.x2 = 10;
        attrs.y2 = 10;
    }
    /** Get bounding rectangle given current state */
    getHandles() {
        const attrs = this.state.attributes;
        return [
            {
                type: "point",
                x: attrs.x1,
                y: attrs.y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
            },
            {
                type: "point",
                x: attrs.x2,
                y: attrs.y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
        ];
    }
    getGraphics(cs, offset, glyphIndex = 0) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const ps = this.getPlotSegmentClass();
        switch (props.visibleOn) {
            case "all":
                break;
            case "last":
                {
                    const index = ps === null || ps === void 0 ? void 0 : ps.getLastGlyphIndex();
                    if (glyphIndex != index) {
                        return null;
                    }
                }
                break;
            case "first":
            default:
                {
                    const index = ps === null || ps === void 0 ? void 0 : ps.getFirstGlyphIndex();
                    if (glyphIndex != index) {
                        return null;
                    }
                }
                break;
        }
        if (props.axis) {
            if (props.axis.visible) {
                const renderer = new axis_1.AxisRenderer();
                renderer.setAxisDataBinding(props.axis, 0, Math.sqrt((attrs.x2 - attrs.x1) * (attrs.x2 - attrs.x1) +
                    (attrs.y2 - attrs.y1) * (attrs.y2 - attrs.y1)), false, false);
                const g = renderer.renderLine(0, 0, (Math.atan2(attrs.y2 - attrs.y1, attrs.x2 - attrs.x1) / Math.PI) *
                    180, -1);
                g.transform = cs.getLocalTransform(attrs.x1 + offset.x, attrs.y1 + offset.y);
                return g;
            }
            else {
                return null;
            }
        }
        else {
            const renderer = new axis_1.AxisRenderer();
            renderer.setAxisDataBinding(null, 0, Math.sqrt((attrs.x2 - attrs.x1) * (attrs.x2 - attrs.x1) +
                (attrs.y2 - attrs.y1) * (attrs.y2 - attrs.y1)), false, false);
            const g = renderer.renderLine(0, 0, (Math.atan2(attrs.y2 - attrs.y1, attrs.x2 - attrs.x1) / Math.PI) * 180, -1);
            g.transform = cs.getLocalTransform(attrs.x1 + offset.x, attrs.y1 + offset.y);
            return g;
        }
    }
    getSnappingGuides() {
        const attrs = this.state.attributes;
        const guides = [];
        if (attrs.x1 != attrs.x2) {
            for (const item of this.object.properties.dataExpressions) {
                const attr = this.getAttributeNames(item)[0];
                guides.push({
                    type: "x",
                    value: attrs[attr],
                    attribute: attr,
                });
            }
        }
        if (attrs.y1 != attrs.y2) {
            for (const item of this.object.properties.dataExpressions) {
                const attr = this.getAttributeNames(item)[1];
                guides.push({
                    type: "y",
                    value: attrs[attr],
                    attribute: attr,
                });
            }
        }
        for (const item of this.object.properties.dataExpressions) {
            const [attrX, attrY] = this.getAttributeNames(item);
            guides.push({
                type: "label",
                x: attrs[attrX],
                y: attrs[attrY],
                text: item.expression,
            });
        }
        return guides;
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        return {
            type: "line",
            x1: attrs.x1,
            y1: attrs.y1,
            x2: attrs.x2,
            y2: attrs.y2,
        };
    }
    // Get DropZones given current state
    getDropZones() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return [
            {
                type: "line",
                p1: { x: x1, y: y1 },
                p2: { x: x2, y: y2 },
                title: "Data Axis",
                dropAction: {
                    axisInference: {
                        property: "axis",
                        appendToProperty: "dataExpressions",
                    },
                },
            },
        ];
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const axisWidgets = axis_1.buildAxisWidgets(props.axis, "axis", manager, strings_1.strings.toolbar.dataAxis, false);
        const r = [
            manager.verticalGroup({
                header: strings_1.strings.objects.general,
            }, [
                manager.inputSelect({ property: "visibleOn" }, {
                    labels: [
                        strings_1.strings.objects.visibleOn.all,
                        strings_1.strings.objects.visibleOn.first,
                        strings_1.strings.objects.visibleOn.last,
                    ],
                    showLabel: true,
                    options: ["all", "first", "last"],
                    type: "dropdown",
                    label: strings_1.strings.objects.visibleOn.label,
                }),
            ]),
            ...axisWidgets,
        ];
        if (props.dataExpressions.length > 0) {
            r.push(manager.verticalGroup({
                header: strings_1.strings.objects.axes.dataExpressions,
            }, [
                manager.arrayWidget({ property: "dataExpressions" }, (item, index) => {
                    const expressionInput = manager.inputExpression({
                        property: "dataExpressions",
                        field: item.field instanceof Array
                            ? [...item.field, "expression"]
                            : [item.field, "expression"],
                    }, { table: this.getGlyphClass().object.table });
                    return React.createElement("fragment", { key: index }, expressionInput);
                }, {
                    allowDelete: true,
                    allowReorder: true,
                }),
            ]));
        }
        return r;
    }
    getTemplateParameters() {
        const props = this.object.properties;
        const dataSource = {
            table: this.getGlyphClass().object.table,
            groupBy: null,
        };
        let properties = [];
        if (this.object.properties.axis) {
            properties = properties.concat(axis_1.buildAxisProperties(this.object, "axis"));
            properties.push({
                objectID: this.object._id,
                target: {
                    property: {
                        property: "axis",
                        field: "categories",
                    },
                },
                type: Specification.AttributeType.Enum,
                default: "ascending",
            });
        }
        if (props.dataExpressions && props.dataExpressions.length > 0) {
            return {
                inferences: [
                    {
                        objectID: this.object._id,
                        dataSource,
                        axis: {
                            expression: props.dataExpressions[0].expression,
                            additionalExpressions: props.dataExpressions.map((x) => x.expression),
                            type: props.axis.type,
                            property: "axis",
                            defineCategories: false,
                        },
                    },
                    ...props.dataExpressions.map((x, i) => {
                        return {
                            objectID: this.object._id,
                            dataSource,
                            expression: {
                                expression: x.expression,
                                property: {
                                    property: "dataExpressions",
                                    field: [i, "expression"],
                                },
                            },
                        };
                    }),
                ],
                properties,
            };
        }
    }
}
exports.DataAxisClass = DataAxisClass;
DataAxisClass.classID = "mark.data-axis";
DataAxisClass.type = "mark";
DataAxisClass.metadata = {
    displayName: "DataAxis",
    iconPath: "mark/data-axis",
    creatingInteraction: {
        type: "line-segment",
        mapping: { x1: "x1", y1: "y1", x2: "x2", y2: "y2" },
    },
};
DataAxisClass.defaultProperties = Object.assign(Object.assign({}, common_1.ObjectClass.defaultProperties), { dataExpressions: [], axis: null, visible: true, visibleOn: "first" });
//# sourceMappingURL=data_axis.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideClass = exports.GuidePropertyNames = exports.GuideAttributeNames = void 0;
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
const common_1 = require("../common");
const glyphs_1 = require("../glyphs");
const charts_1 = require("../charts");
const strings_1 = require("../../../strings");
var GuideAttributeNames;
(function (GuideAttributeNames) {
    GuideAttributeNames["value"] = "value";
    GuideAttributeNames["computedBaselineValue"] = "computedBaselineValue";
})(GuideAttributeNames = exports.GuideAttributeNames || (exports.GuideAttributeNames = {}));
var GuidePropertyNames;
(function (GuidePropertyNames) {
    GuidePropertyNames["axis"] = "axis";
    GuidePropertyNames["baseline"] = "baseline";
})(GuidePropertyNames = exports.GuidePropertyNames || (exports.GuidePropertyNames = {}));
class GuideClass extends chart_element_1.ChartElementClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [
            GuideAttributeNames.value,
            GuideAttributeNames.computedBaselineValue,
        ];
        this.attributes = {
            value: {
                name: GuideAttributeNames.value,
                type: Specification.AttributeType.Number,
            },
            computedBaselineValue: {
                name: GuideAttributeNames.computedBaselineValue,
                type: Specification.AttributeType.Number,
            },
        };
    }
    initializeState() {
        this.state.attributes.value = 0;
        this.state.attributes.computedBaselineValue = 0;
    }
    getAxis() {
        return this.object.properties.axis;
    }
    getParentType() {
        const { classID } = this.parent.object;
        const rectGlyph = common_1.isType(classID, glyphs_1.RectangleGlyph.classID);
        const rectChart = common_1.isType(classID, charts_1.RectangleChart.classID);
        return { rectChart, rectGlyph };
    }
    // eslint-disable-next-line
    buildConstraints(solver) {
        const { rectGlyph, rectChart } = this.getParentType();
        if (rectGlyph) {
            switch (this.object.properties.baseline) {
                case "center":
                case "middle": {
                    const [, computedBaselineValue] = solver.attrs(this.state.attributes, [
                        GuideAttributeNames.value,
                        GuideAttributeNames.computedBaselineValue,
                    ]);
                    solver.addLinear(solver_1.ConstraintStrength.HARD, this.state.attributes.value, [[-1, computedBaselineValue]]);
                    break;
                }
                case "left": {
                    this.computeBaselineFromParentAttribute(solver, ["width"], ([width], value) => [
                        [-0.5, width],
                        [+1, value],
                    ]);
                    break;
                }
                case "right": {
                    this.computeBaselineFromParentAttribute(solver, ["width"], ([width], value) => [
                        [+0.5, width],
                        [+1, value],
                    ]);
                    break;
                }
                case "top": {
                    this.computeBaselineFromParentAttribute(solver, ["height"], ([height], value) => [
                        [+0.5, height],
                        [+1, value],
                    ]);
                    break;
                }
                case "bottom": {
                    this.computeBaselineFromParentAttribute(solver, ["height"], ([height], value) => [
                        [-0.5, height],
                        [+1, value],
                    ]);
                    break;
                }
            }
        }
        else if (rectChart) {
            switch (this.object.properties.baseline) {
                case "center": {
                    this.computeBaselineFromParentAttribute(solver, ["cx"], ([cx], value) => [
                        [+1, cx],
                        [+1, value],
                    ]);
                    break;
                }
                case "middle": {
                    this.computeBaselineFromParentAttribute(solver, ["cy"], ([cy], value) => [
                        [+1, cy],
                        [+1, value],
                    ]);
                    break;
                }
                case "left": {
                    this.computeBaselineFromParentAttribute(solver, ["width", "marginLeft"], ([width, marginLeft], value) => [
                        [-0.5, width],
                        [+1, marginLeft],
                        [+1, value],
                    ]);
                    break;
                }
                case "right": {
                    this.computeBaselineFromParentAttribute(solver, ["width", "marginRight"], ([width, marginRight], value) => [
                        [+0.5, width],
                        [-1, marginRight],
                        [+1, value],
                    ]);
                    break;
                }
                case "top": {
                    this.computeBaselineFromParentAttribute(solver, ["height", "marginTop"], ([height, marginTop], value) => [
                        [+0.5, height],
                        [-1, marginTop],
                        [+1, value],
                    ]);
                    break;
                }
                case "bottom": {
                    this.computeBaselineFromParentAttribute(solver, ["height", "marginBottom"], ([height, marginBottom], value) => [
                        [-0.5, height],
                        [+1, marginBottom],
                        [+1, value],
                    ]);
                    break;
                }
            }
        }
    }
    computeBaselineFromParentAttribute(solver, parentAttributeNames, rhsFn) {
        const parentAttrs = this.parent.state.attributes;
        const parentAttributeVariables = solver.attrs(parentAttrs, parentAttributeNames);
        // parentAttributeNames.forEach(parentAttributeName => solver.makeConstant(parentAttrs, parentAttributeName));
        const [value, computedBaselineValue] = solver.attrs(this.state.attributes, [
            GuideAttributeNames.value,
            GuideAttributeNames.computedBaselineValue,
        ]);
        solver.makeConstant(this.state.attributes, GuideAttributeNames.value);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, computedBaselineValue]], rhsFn(parentAttributeVariables, value));
    }
    getLinkAnchors() {
        return [];
    }
    /** Get handles given current state */
    // eslint-disable-next-line max-lines-per-function
    getHandles() {
        const inf = [-1000, 1000];
        const { value } = this.state.attributes;
        const { axis, baseline } = this.object.properties;
        const { rectChart, rectGlyph } = this.getParentType();
        const handleLineGlyph = () => {
            return [
                {
                    type: "line",
                    axis,
                    actions: [
                        {
                            type: "attribute-value-mapping",
                            attribute: GuideAttributeNames.value,
                            source: GuideAttributeNames.value,
                        },
                    ],
                    value,
                    span: inf,
                },
            ];
        };
        const handleRelativeLine = (reference) => {
            return [
                {
                    type: "relative-line",
                    axis,
                    actions: [
                        {
                            type: "attribute-value-mapping",
                            attribute: GuideAttributeNames.value,
                            source: GuideAttributeNames.value,
                        },
                    ],
                    reference,
                    sign: 1,
                    value,
                    span: inf,
                },
            ];
        };
        const parentAttrs = this.parent.state.attributes;
        if (rectGlyph) {
            switch (baseline) {
                case "center":
                case "middle": {
                    return handleLineGlyph();
                }
                case "left": {
                    return handleRelativeLine(+parentAttrs.ix1);
                }
                case "right": {
                    return handleRelativeLine(+parentAttrs.ix2);
                }
                case "top": {
                    return handleRelativeLine(+parentAttrs.iy2);
                }
                case "bottom": {
                    return handleRelativeLine(+parentAttrs.iy1);
                }
            }
        }
        else if (rectChart) {
            switch (baseline) {
                case "center": {
                    return handleRelativeLine(+parentAttrs.cx);
                }
                case "middle": {
                    return handleRelativeLine(+parentAttrs.cy);
                }
                case "left": {
                    return handleRelativeLine(+parentAttrs.x1);
                }
                case "right": {
                    return handleRelativeLine(+parentAttrs.x2);
                }
                case "top": {
                    return handleRelativeLine(+parentAttrs.y2);
                }
                case "bottom": {
                    return handleRelativeLine(+parentAttrs.y1);
                }
            }
        }
    }
    getSnappingGuides() {
        const snappingGuideAxis = (attribute, value) => {
            return {
                type: this.getAxis(),
                value,
                attribute,
                visible: true,
                visualType: common_1.SnappingGuidesVisualTypes.Guide,
                priority: 1,
            };
        };
        const r = [
            snappingGuideAxis(GuideAttributeNames.computedBaselineValue, this.state.attributes.computedBaselineValue),
        ];
        return r;
    }
    getAttributePanelWidgets(manager) {
        const widgets = [
            manager.sectionHeader(strings_1.strings.objects.guides.guide),
        ];
        let labels;
        let options;
        let icons;
        if (this.object.properties.axis === "x") {
            const hOptions = ["left", "center", "right"];
            options = hOptions;
            labels = [
                strings_1.strings.alignment.left,
                strings_1.strings.alignment.center,
                strings_1.strings.alignment.right,
            ];
            icons = [
                "AlignHorizontalLeft",
                "AlignHorizontalCenter",
                "AlignHorizontalRight",
            ];
        }
        else {
            const vOptions = ["top", "middle", "bottom"];
            options = vOptions;
            labels = [
                strings_1.strings.alignment.top,
                strings_1.strings.alignment.middle,
                strings_1.strings.alignment.bottom,
            ];
            icons = ["AlignVerticalTop", "align/y-middle", "AlignVerticalBottom"];
        }
        widgets.push(manager.inputSelect({ property: GuidePropertyNames.baseline }, {
            type: "dropdown",
            showLabel: true,
            labels,
            options,
            icons,
            label: strings_1.strings.objects.guides.baseline,
        }));
        widgets.push(manager.mappingEditor(strings_1.strings.objects.guides.offset, GuideAttributeNames.value, {
            defaultValue: this.state.attributes.value,
        }));
        return widgets;
    }
    getTemplateParameters() {
        const properties = [
            {
                objectID: this.object._id,
                target: {
                    attribute: GuidePropertyNames.baseline,
                },
                type: Specification.AttributeType.Enum,
                default: this.object.properties.baseline,
            },
            {
                objectID: this.object._id,
                target: {
                    attribute: GuideAttributeNames.computedBaselineValue,
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.computedBaselineValue,
            },
        ];
        if (this.object.mappings.value &&
            this.object.mappings.value.type === Specification.MappingType.value) {
            properties.push({
                objectID: this.object._id,
                target: {
                    attribute: GuideAttributeNames.value,
                },
                type: Specification.AttributeType.Number,
                default: this.state.attributes.value,
            });
        }
        return {
            properties,
        };
    }
}
exports.GuideClass = GuideClass;
GuideClass.classID = "guide.guide";
GuideClass.type = "guide";
GuideClass.metadata = {
    displayName: "Guide",
    iconPath: "guide/x",
};
GuideClass.defaultProperties = {
    baseline: null,
};
//# sourceMappingURL=guide.js.map
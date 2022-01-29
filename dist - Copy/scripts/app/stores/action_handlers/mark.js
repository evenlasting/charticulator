"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../../core");
const dataset_1 = require("../../../core/dataset");
const specification_1 = require("../../../core/specification");
const actions_1 = require("../../actions");
const registry_1 = require("./registry");
// eslint-disable-next-line
function default_1(REG) {
    // Internal registry of mark-level action handlers
    const MR = new registry_1.ActionHandlerRegistry();
    MR.add(actions_1.Actions.UpdateMarkAttribute, function (action) {
        for (const key in action.updates) {
            // eslint-disable-next-line
            if (!action.updates.hasOwnProperty(key)) {
                continue;
            }
            delete action.mark.mappings[key];
            action.glyph.constraints = action.glyph.constraints.filter((c) => {
                if (c.type == "snap") {
                    if (c.attributes.element == action.mark._id &&
                        c.attributes.attribute == key) {
                        return false;
                    }
                }
                return true;
            });
        }
        this.forAllGlyph(action.glyph, (glyphState) => {
            for (const [mark, markState] of core_1.zipArray(action.glyph.marks, glyphState.marks)) {
                if (mark == action.mark) {
                    for (const key in action.updates) {
                        // eslint-disable-next-line
                        if (!action.updates.hasOwnProperty(key)) {
                            continue;
                        }
                        markState.attributes[key] = action.updates[key];
                        this.addPresolveValue(core_1.Solver.ConstraintStrength.WEAK, markState.attributes, key, action.updates[key]);
                    }
                }
            }
        });
    });
    MR.add(actions_1.Actions.SetObjectProperty, function (action) {
        // check name property. Names of objects are unique
        if (action.property === "name" &&
            this.chartManager.isNameUsed(action.value)) {
            return;
        }
        if (action.field == null) {
            action.object.properties[action.property] = action.value;
        }
        else {
            const obj = action.object.properties[action.property];
            action.object.properties[action.property] = core_1.setField(obj, action.field, action.value);
        }
    });
    MR.add(actions_1.Actions.SetMarkAttribute, function (action) {
        if (action.mapping == null) {
            delete action.mark.mappings[action.attribute];
        }
        else {
            action.mark.mappings[action.attribute] = action.mapping;
            action.glyph.constraints = action.glyph.constraints.filter((c) => {
                if (c.type == "snap") {
                    if (c.attributes.element == action.mark._id &&
                        c.attributes.attribute == action.attribute) {
                        return false;
                    }
                }
                return true;
            });
        }
    });
    MR.add(actions_1.Actions.UnmapMarkAttribute, function (action) {
        delete action.mark.mappings[action.attribute];
    });
    MR.add(actions_1.Actions.SnapMarks, function (action) {
        const idx1 = action.glyph.marks.indexOf(action.mark);
        if (idx1 < 0) {
            return;
        }
        // let elementState = this.markState.elements[idx1];
        const idx2 = action.glyph.marks.indexOf(action.targetMark);
        if (idx2 < 0) {
            return;
        }
        // let targetElementState = this.markState.elements[idx2];
        // elementState.attributes[action.attribute] = targetElementState.attributes[action.targetAttribute];
        // Remove any existing attribute mapping
        delete action.mark.mappings[action.attribute];
        // Remove any existing snapping
        action.glyph.constraints = action.glyph.constraints.filter((c) => {
            if (c.type == "snap") {
                if (c.attributes.element == action.mark._id &&
                    c.attributes.attribute == action.attribute) {
                    return false;
                }
            }
            return true;
        });
        action.glyph.constraints.push({
            type: "snap",
            attributes: {
                element: action.mark._id,
                attribute: action.attribute,
                targetElement: action.targetMark._id,
                targetAttribute: action.targetAttribute,
                gap: 0,
            },
        });
        // Force the states to be equal
        this.forAllGlyph(action.glyph, (glyphState) => {
            const elementState = glyphState.marks[idx1];
            const targetElementState = glyphState.marks[idx2];
            elementState.attributes[action.attribute] =
                targetElementState.attributes[action.targetAttribute];
            this.addPresolveValue(core_1.Solver.ConstraintStrength.STRONG, elementState.attributes, action.attribute, targetElementState.attributes[action.targetAttribute]);
        });
    });
    MR.add(actions_1.Actions.MarkActionGroup, function (action) {
        for (const item of action.actions) {
            // Recursively handle group actions
            MR.handleAction(this, item);
        }
    });
    // The entry point for mark actions
    REG.add(actions_1.Actions.MarkAction, function (mainAction) {
        this.saveHistory();
        MR.handleAction(this, mainAction);
        // Solve constraints only after all actions are processed
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.MapDataToMarkAttribute, function (action) {
        var _a, _b, _c;
        this.saveHistory();
        const inferred = (action.hints && action.hints.scaleID) ||
            this.scaleInference({
                glyph: action.glyph,
                chart: {
                    table: action.expressionTable,
                },
            }, {
                expression: action.expression,
                valueType: action.valueType,
                valueKind: action.valueMetadata.kind,
                outputType: action.attributeType,
                hints: action.hints,
                markAttribute: action.attribute,
            });
        if (inferred != null) {
            if (action.valueType == core_1.Specification.DataType.Image &&
                action.valueType === core_1.Specification.DataType.Image) {
                action.mark.mappings[action.attribute] = {
                    type: specification_1.MappingType.expressionScale,
                    table: (_a = action.expressionTable) !== null && _a !== void 0 ? _a : action.glyph.table,
                    expression: `first(${core_1.ImageKeyColumn})`,
                    valueExpression: action.expression,
                    valueType: action.valueType,
                    scale: inferred,
                    attribute: action.attribute,
                    valueIndex: action.hints && action.hints.allowSelectValue != undefined
                        ? 0
                        : null,
                };
            }
            else {
                action.mark.mappings[action.attribute] = {
                    type: specification_1.MappingType.scale,
                    table: (_b = action.expressionTable) !== null && _b !== void 0 ? _b : action.glyph.table,
                    expression: action.expression,
                    valueType: action.valueType,
                    scale: inferred,
                    attribute: action.attribute,
                    valueIndex: action.hints && action.hints.allowSelectValue != undefined
                        ? 0
                        : null,
                };
            }
            if (!this.chart.scaleMappings.find((scaleMapping) => scaleMapping.scale === inferred)) {
                this.chart.scaleMappings.push(Object.assign(Object.assign({}, action.mark.mappings[action.attribute]), { attribute: action.attribute }));
            }
        }
        else {
            if ((action.valueType == core_1.Specification.DataType.Boolean ||
                action.valueType == core_1.Specification.DataType.String ||
                action.valueType == core_1.Specification.DataType.Number) &&
                action.attributeType == core_1.Specification.AttributeType.Text) {
                let format;
                // don't apply format to numbers if data kind is categorical to draw as are
                if (action.valueMetadata.kind === dataset_1.DataKind.Categorical) {
                    format = undefined;
                }
                else {
                    // If the valueType is a number and kind is not categorical, use a format
                    format =
                        action.valueType == core_1.Specification.DataType.Number
                            ? ".1f"
                            : undefined;
                }
                action.mark.mappings[action.attribute] = {
                    type: specification_1.MappingType.text,
                    table: (_c = action.expressionTable) !== null && _c !== void 0 ? _c : action.glyph.table,
                    textExpression: new core_1.Expression.TextExpression([
                        { expression: core_1.Expression.parse(action.expression), format },
                    ]).toString(),
                };
            }
        }
        this.solveConstraintsAndUpdateGraphics();
    });
}
exports.default = default_1;
//# sourceMappingURL=mark.js.map
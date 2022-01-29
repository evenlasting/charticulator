"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeGuidesToBaseline = void 0;
const specification_1 = require("../../core/specification");
const guides_1 = require("../../core/prototypes/guides");
const core_1 = require("../../core");
const prototypes_1 = require("../../core/prototypes");
const nested_chart_1 = require("../../core/prototypes/marks/nested_chart");
var CommonPropertyNames;
(function (CommonPropertyNames) {
    CommonPropertyNames["name"] = "name";
    CommonPropertyNames["gap"] = "gap";
})(CommonPropertyNames || (CommonPropertyNames = {}));
var DeletedAttributeNames;
(function (DeletedAttributeNames) {
    DeletedAttributeNames["value2"] = "value2";
})(DeletedAttributeNames || (DeletedAttributeNames = {}));
var DeletedPropertyNames;
(function (DeletedPropertyNames) {
    DeletedPropertyNames["value"] = "value";
    DeletedPropertyNames["value2"] = "value2";
})(DeletedPropertyNames || (DeletedPropertyNames = {}));
/** Upgrade old versions of chart spec and state to newer version */
function upgradeGuidesToBaseline(appStoreState) {
    upgradeScope(appStoreState.chart, appStoreState.chartState);
    return appStoreState;
}
exports.upgradeGuidesToBaseline = upgradeGuidesToBaseline;
function upgradeScope(parentElement, parentState) {
    upgradeChartGuides(parentElement, parentState);
    upgradeGlyphGuides(parentElement, parentState);
}
function upgradeChartGuides(parentElement, parentState) {
    // get chart guides
    const chartGuideRefs = find(parentElement.elements, parentState.elements, (element) => element.classID === guides_1.GuideClass.classID);
    chartGuideRefs.forEach((ref) => {
        const { element, state } = ref;
        // convert mappings to actual values
        const parentMapping = element.mappings.value;
        if (parentMapping && parentMapping.type === specification_1.MappingType.parent) {
            const { parentAttribute } = parentMapping;
            // set value to actual mapped attr value
            state.attributes[guides_1.GuideAttributeNames.value] =
                parentState.attributes[parentAttribute];
            // remove the mapping
            delete element.mappings.value;
        }
        else {
            // guides should not be mapped to anything other than parent
            // Notify user?
        }
        // find other elements constrained to this chartElementItem
        parentElement.constraints.forEach((constraint) => {
            if (constraint.type === "snap" &&
                constraint.attributes.targetElement === element._id) {
                changeConstraintTarget(element, constraint, +state.attributes[guides_1.GuideAttributeNames.value], parentElement.elements, parentState.elements);
            }
        });
        // add new properties
        addNewGuideProperties(element, state);
        // remove deleted properties / attributes
        removeOldGuideProperties(element, state);
    });
}
function upgradeGlyphGuides(parentElement, parentState, nested = false) {
    parentElement.glyphs.forEach((glyph) => {
        // collect and separate marks from guides
        const guides = {};
        glyph.marks.forEach((mark) => {
            if (prototypes_1.isType(mark.classID, guides_1.GuideClass.classID)) {
                guides[mark._id] = mark;
            }
            else if (prototypes_1.isType(mark.classID, nested_chart_1.NestedChartElementClass.classID)) {
                const nc = mark;
                upgradeGlyphGuides(nc.properties.specification, null, true); // nested charts do not store in ChartState
            }
        });
        // get element which uses this glyph
        const related = find(parentElement.elements, parentState && parentState.elements, (element) => {
            const ps = element;
            return ps.glyph === glyph._id;
        });
        // look at constraints
        glyph.constraints.forEach((constraint) => {
            if (constraint.type === "snap") {
                const id = constraint.attributes.targetElement;
                const guide = guides[id];
                if (guide &&
                    constraint.attributes.targetAttribute === DeletedAttributeNames.value2) {
                    // make a new guide
                    const newGuide = createGuide(guide.properties[guides_1.GuidePropertyNames.axis], guide, +guide.properties[DeletedPropertyNames.value] +
                        +guide.properties[CommonPropertyNames.gap]);
                    // add new guide
                    glyph.marks.push(newGuide.element);
                    // add state instances
                    related.forEach((ref) => {
                        const s = ref.state;
                        if (s && s.glyphs) {
                            s.glyphs.forEach((glyphState) => {
                                glyphState.marks.push(newGuide.state);
                            });
                        }
                    });
                    if (nested) {
                        // nested charts store in mappings
                        const valueMapping = {
                            type: specification_1.MappingType.value,
                            value: newGuide.state.attributes[guides_1.GuideAttributeNames.value],
                        };
                        newGuide.element.mappings.value = valueMapping;
                    }
                    // point to new guide
                    constraint.attributes.targetElement = newGuide.element._id;
                    constraint.attributes.targetAttribute =
                        guides_1.GuideAttributeNames.computedBaselineValue;
                }
            }
        });
        // if (guide.mappings) {
        // TODO guides should not be mapped!
        // }
        for (const _id in guides) {
            const guide = guides[_id];
            // add new properties to guide
            addNewGuideProperties(guide);
            // delete old properties
            removeOldGuideProperties(guide);
            // modify all state instances
            related.forEach((ref) => {
                const s = ref.state;
                if (s && s.glyphs) {
                    s.glyphs.forEach((glyphState) => {
                        glyphState.marks.forEach((markState) => {
                            // add new properties to guide
                            addNewGuideProperties(null, markState);
                            // delete old properties
                            removeOldGuideProperties(null, markState);
                        });
                    });
                }
            });
        }
    });
}
function find(elements, states, predicate) {
    const refs = [];
    elements.forEach((element, index) => {
        if (predicate(element)) {
            const state = states && states[index];
            refs.push({ element, index, state });
        }
    });
    return refs;
}
function changeConstraintTarget(element, constraint, guideValue, elementCollection, stateCollection) {
    if (!element) {
        throw new Error("constraint bound to unknown element");
    }
    if (!element.properties) {
        throw new Error("constraint target element has no properties");
    }
    const gap = +element.properties[CommonPropertyNames.gap];
    if (constraint.attributes.targetAttribute === DeletedAttributeNames.value2 &&
        gap) {
        // create a 2nd guide to insert, based on gap property of first
        const axis = element.properties[guides_1.GuidePropertyNames.axis];
        const value = guideValue + gap;
        const newGuide = createGuide(axis, element, value);
        elementCollection.push(newGuide.element);
        stateCollection.push(newGuide.state);
        constraint.attributes.targetElement = newGuide.element._id;
        // find constraint object and make value attribute match
        const constrained = find(elementCollection, stateCollection, (element) => element._id === constraint.attributes.element);
        constrained.forEach((ref) => {
            const name = constraint.attributes.attribute;
            ref.state.attributes[name] = value;
        });
    }
    constraint.attributes.targetAttribute = "computedBaselineValue";
}
function addNewGuideProperties(element, state) {
    if (element) {
        const defaultBaseline = "center";
        element.properties[guides_1.GuidePropertyNames.baseline] = defaultBaseline;
    }
    if (state) {
        state.attributes[guides_1.GuideAttributeNames.computedBaselineValue] =
            state.attributes[guides_1.GuideAttributeNames.value];
    }
}
function removeOldGuideProperties(element, state) {
    if (element) {
        delete element.properties[CommonPropertyNames.gap];
        delete element.properties[DeletedPropertyNames.value]; // unused property in original schema
        delete element.properties[DeletedPropertyNames.value2]; // unused property in original schema
    }
    if (state) {
        delete state.attributes[DeletedAttributeNames.value2];
    }
}
function createGuide(axis, originalGuide, value) {
    const defaultBaselineH = "center";
    const defaultBaselineV = "middle";
    const element = {
        _id: core_1.uniqueID(),
        classID: "guide.guide",
        properties: {
            baseline: axis === "y" ? defaultBaselineV : defaultBaselineH,
            name: `${originalGuide.properties[CommonPropertyNames.name] || "Guide"} gap`,
            axis,
        },
        mappings: {},
    };
    const state = {
        attributes: {
            value,
            computedBaselineValue: value,
        },
    };
    return { element, state };
}
//# sourceMappingURL=migrator_baseline.js.map
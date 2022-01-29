"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapToAttribute = exports.onUpdateAttribute = void 0;
const utils_1 = require("../common/utils");
const common_1 = require("./common");
const object_1 = require("./object");
const plot_segments_1 = require("./plot_segments");
function onUpdateAttribute(manager, elementID, attribute, value) {
    const found = utils_1.zipArray(manager.chart.elements, manager.chartState.elements).find(([element]) => {
        return element._id === elementID;
    });
    if (found) {
        const elementState = found[1];
        elementState.attributes[attribute] = value;
    }
    else {
        for (const [element, elementState] of utils_1.zipArray(manager.chart.elements, manager.chartState.elements)) {
            if (object_1.isType(element.classID, plot_segments_1.CartesianPlotSegment.type)) {
                const plotSegment = element;
                const plotSegmentState = elementState;
                for (const glyphState of plotSegmentState.glyphs) {
                    const glyph = common_1.findObjectById(manager.chart, plotSegment.glyph);
                    const found = utils_1.zipArray(glyph.marks, glyphState.marks).find(([element]) => {
                        return element._id === elementID;
                    });
                    if (found) {
                        const elementState = found[1];
                        elementState.attributes[attribute] = value;
                    }
                }
            }
        }
    }
}
exports.onUpdateAttribute = onUpdateAttribute;
function snapToAttribute(manager, chartConstraints, objectId, attrName, attrValue) {
    chartConstraints
        .filter((constraint) => constraint.type == "snap" &&
        constraint.attributes.targetAttribute === attrName &&
        constraint.attributes.targetElement === objectId)
        .forEach((constraint) => {
        onUpdateAttribute(manager, constraint.attributes.element, constraint.attributes.attribute, attrValue);
    });
}
exports.snapToAttribute = snapToAttribute;
//# sourceMappingURL=update_attribute.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/no-namespace */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strokeStyleToDashArray = exports.getProperty = exports.setProperty = exports.forEachMapping = exports.forEachObject = exports.ObjectItemKind = exports.findObjectById = exports.SnappingGuidesVisualTypes = exports.Handles = exports.Controls = void 0;
const common_1 = require("../common");
const Controls = require("./controls");
exports.Controls = Controls;
__exportStar(require("./chart_element"), exports);
__exportStar(require("./object"), exports);
var Handles;
(function (Handles) {
    let HandleActionType;
    (function (HandleActionType) {
        HandleActionType["Property"] = "property";
        HandleActionType["Attribute"] = "attribute";
        HandleActionType["AttributeValueMapping"] = "attribute-value-mapping";
    })(HandleActionType = Handles.HandleActionType || (Handles.HandleActionType = {}));
})(Handles = exports.Handles || (exports.Handles = {}));
var SnappingGuidesVisualTypes;
(function (SnappingGuidesVisualTypes) {
    SnappingGuidesVisualTypes[SnappingGuidesVisualTypes["Guide"] = 0] = "Guide";
    SnappingGuidesVisualTypes[SnappingGuidesVisualTypes["Coordinator"] = 1] = "Coordinator";
    SnappingGuidesVisualTypes[SnappingGuidesVisualTypes["Point"] = 2] = "Point";
})(SnappingGuidesVisualTypes = exports.SnappingGuidesVisualTypes || (exports.SnappingGuidesVisualTypes = {}));
function findObjectById(spec, id) {
    if (spec._id == id) {
        return spec;
    }
    let obj = common_1.getById(spec.scales, id) ||
        common_1.getById(spec.elements, id) ||
        common_1.getById(spec.glyphs, id);
    if (obj != null) {
        return obj;
    }
    for (const glyph of spec.glyphs) {
        obj = common_1.getById(glyph.marks, id);
        if (obj != null) {
            return obj;
        }
    }
    return null;
}
exports.findObjectById = findObjectById;
var ObjectItemKind;
(function (ObjectItemKind) {
    ObjectItemKind["Chart"] = "chart";
    ObjectItemKind["ChartElement"] = "chart-element";
    ObjectItemKind["Glyph"] = "glyph";
    ObjectItemKind["Mark"] = "mark";
    ObjectItemKind["Scale"] = "scale";
})(ObjectItemKind = exports.ObjectItemKind || (exports.ObjectItemKind = {}));
function* forEachObject(chart) {
    yield { kind: ObjectItemKind.Chart, object: chart };
    for (const chartElement of chart.elements) {
        yield {
            kind: ObjectItemKind.ChartElement,
            object: chartElement,
            chartElement,
        };
    }
    for (const glyph of chart.glyphs) {
        yield { kind: ObjectItemKind.Glyph, object: glyph, glyph };
        for (const mark of glyph.marks) {
            yield { kind: ObjectItemKind.Mark, object: mark, glyph, mark };
        }
    }
    for (const scale of chart.scales) {
        yield { kind: ObjectItemKind.Scale, object: scale, scale };
    }
}
exports.forEachObject = forEachObject;
function* forEachMapping(mappings) {
    for (const key of Object.keys(mappings)) {
        yield [key, mappings[key]];
    }
}
exports.forEachMapping = forEachMapping;
function setProperty(object, property, value) {
    if (typeof property == "string") {
        object.properties[property] = value;
    }
    else if (property.subfield) {
        common_1.setField(object.properties[property.property][property.field], property.subfield, value);
    }
    else {
        common_1.setField(object.properties[property.property], property.field, value);
    }
}
exports.setProperty = setProperty;
function getProperty(object, property) {
    if (typeof property == "string") {
        return object.properties[property];
    }
    else {
        if (property.subfield) {
            return common_1.getField(object.properties[property.property][property.field], property.subfield);
        }
        else {
            return common_1.getField(object.properties[property.property], property.field);
        }
    }
}
exports.getProperty = getProperty;
function strokeStyleToDashArray(strokeStyle) {
    switch (strokeStyle) {
        case "dashed": {
            return "8";
        }
        case "dotted": {
            return "1 10";
        }
        default: {
            return "";
        }
    }
}
exports.strokeStyleToDashArray = strokeStyleToDashArray;
//# sourceMappingURL=common.js.map
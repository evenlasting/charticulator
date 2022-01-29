"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../../core");
const specification_1 = require("../../../core/specification");
const actions_1 = require("../../actions");
const app_store_1 = require("../app_store");
const selection_1 = require("../selection");
// eslint-disable-next-line
function default_1(REG) {
    REG.add(actions_1.Actions.AddGlyph, function (action) {
        this.saveHistory();
        const glyph = this.chartManager.addGlyph(action.classID, this.dataset.tables[0].name);
        this.currentSelection = new selection_1.GlyphSelection(null, glyph);
        this.currentGlyph = glyph;
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.RemoveGlyph, function (action) {
        this.saveHistory();
        this.chartManager.removeGlyph(action.glyph);
        this.currentSelection = null;
        this.currentGlyph = null;
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.SetGlyphAttribute, function (action) {
        this.saveHistory();
        if (action.mapping == null) {
            delete action.glyph.mappings[action.attribute];
        }
        else {
            action.glyph.mappings[action.attribute] = action.mapping;
        }
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.UpdateGlyphAttribute, function (action) {
        this.saveHistory();
        for (const key in action.updates) {
            // eslint-disable-next-line
            if (!action.updates.hasOwnProperty(key)) {
                continue;
            }
            delete action.glyph.mappings[key];
        }
        this.forAllGlyph(action.glyph, (glyphState) => {
            for (const key in action.updates) {
                // eslint-disable-next-line
                if (!action.updates.hasOwnProperty(key)) {
                    continue;
                }
                glyphState.attributes[key] = action.updates[key];
                this.addPresolveValue(core_1.Solver.ConstraintStrength.STRONG, glyphState.attributes, key, action.updates[key]);
            }
        });
        this.solveConstraintsAndUpdateGraphics();
    });
    // eslint-disable-next-line
    REG.add(actions_1.Actions.AddMarkToGlyph, function (action) {
        this.saveHistory();
        const mark = this.chartManager.createObject(action.classID);
        for (const key in action.properties) {
            mark.properties[key] = action.properties[key];
        }
        // Make sure name don't duplicate
        if (this.chartManager.isNameUsed(mark.properties.name)) {
            mark.properties.name = this.chartManager.findUnusedName(mark.properties.name);
        }
        this.chartManager.addMarkToGlyph(mark, action.glyph);
        let attributesSet = false;
        for (const attr in action.mappings) {
            // eslint-disable-next-line
            if (action.mappings.hasOwnProperty(attr)) {
                const [value, mapping] = action.mappings[attr];
                if (mapping != null) {
                    if (mapping.type == specification_1.MappingType._element) {
                        const elementMapping = mapping;
                        action.glyph.constraints.push({
                            type: "snap",
                            attributes: {
                                element: mark._id,
                                attribute: attr,
                                targetElement: elementMapping.element,
                                targetAttribute: elementMapping.attribute,
                                gap: 0,
                            },
                        });
                    }
                    else {
                        mark.mappings[attr] = mapping;
                    }
                }
                if (value != null) {
                    const idx = action.glyph.marks.indexOf(mark);
                    this.forAllGlyph(action.glyph, (glyphState) => {
                        glyphState.marks[idx].attributes[attr] = value;
                        this.addPresolveValue(core_1.Solver.ConstraintStrength.STRONG, glyphState.marks[idx].attributes, attr, value);
                    });
                }
                attributesSet = true;
            }
        }
        // Logic for first marks
        if (!attributesSet) {
            switch (action.classID) {
                case "mark.rect":
                case "mark.nested-chart":
                case "mark.textbox":
                case "mark.image":
                    {
                        mark.mappings.x1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix1",
                        };
                        mark.mappings.y1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy1",
                        };
                        mark.mappings.x2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix2",
                        };
                        mark.mappings.y2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy2",
                        };
                        // Move anchor to bottom
                        // action.glyph.marks[0].mappings["y"] = <Specification.ParentMapping>{ type: "parent", parentAttribute: "iy1" };
                    }
                    break;
                case "mark.line":
                    {
                        mark.mappings.x1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix1",
                        };
                        mark.mappings.y1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy1",
                        };
                        mark.mappings.x2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix2",
                        };
                        mark.mappings.y2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy2",
                        };
                    }
                    break;
                case "mark.symbol":
                case "mark.text":
                case "mark.icon":
                    {
                        mark.mappings.x = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "icx",
                        };
                        mark.mappings.y = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "icy",
                        };
                    }
                    break;
                case "mark.data-axis":
                    {
                        mark.mappings.x1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix1",
                        };
                        mark.mappings.y1 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy1",
                        };
                        mark.mappings.x2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "ix1",
                        };
                        mark.mappings.y2 = {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "iy2",
                        };
                    }
                    break;
            }
        }
        if (action.classID == "mark.nested-chart") {
            // Add column names to the mark
            const columnNameMap = {};
            for (const column of this.getTable(action.glyph.table).columns) {
                columnNameMap[column.name] = column.name;
            }
            mark.properties.columnNameMap = columnNameMap;
        }
        this.currentSelection = new selection_1.MarkSelection(this.findPlotSegmentForGlyph(action.glyph), action.glyph, action.glyph.marks[action.glyph.marks.length - 1]);
        this.currentGlyph = action.glyph;
        this.solveConstraintsAndUpdateGraphics();
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
    });
    REG.add(actions_1.Actions.RemoveMarkFromGlyph, function (action) {
        this.saveHistory();
        // We never delete the anchor
        if (action.mark.classID == "mark.anchor") {
            return;
        }
        this.chartManager.removeMarkFromGlyph(action.mark, action.glyph);
        this.currentSelection = null;
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
        this.solveConstraintsAndUpdateGraphics();
    });
}
exports.default = default_1;
//# sourceMappingURL=glyph.js.map
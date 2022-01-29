"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearSelection = exports.SelectMark = exports.Action = exports.objectDigest = void 0;
// Helper functions for digest
function objectDigest(obj) {
    return obj ? [obj.classID, obj._id] : null;
}
exports.objectDigest = objectDigest;
/**
 * Base class for all actions to describe all user interactions with charticulators objects
 * Actions dispatches by {@link BaseStore.dispatcher} method of the store.
 * List of charticulator app actions can be found in {@link "app/actions/actions"} module
 */
class Action {
    dispatch(dispatcher) {
        dispatcher.dispatch(this);
    }
    digest() {
        return { name: this.constructor.name };
    }
}
exports.Action = Action;
/** Dispatches when user selects the mark on the chart */
class SelectMark extends Action {
    /**
     * @param plotSegment plot segment where mark was selected
     * @param glyph glyph where mark was selected (on a glyph editor or on a chart)
     * @param mark selected mark
     * @param glyphIndex index of glyph
     */
    constructor(plotSegment, glyph, mark, glyphIndex = null) {
        super();
        this.plotSegment = plotSegment;
        this.glyph = glyph;
        this.mark = mark;
        this.glyphIndex = glyphIndex;
    }
    digest() {
        return {
            name: "SelectMark",
            plotSegment: objectDigest(this.plotSegment),
            glyph: objectDigest(this.glyph),
            mark: objectDigest(this.mark),
            glyphIndex: this.glyphIndex,
        };
    }
}
exports.SelectMark = SelectMark;
/** Dispatches when user reset selection of the mark on the chart */
class ClearSelection extends Action {
    digest() {
        return {
            name: "ClearSelection",
        };
    }
}
exports.ClearSelection = ClearSelection;
//# sourceMappingURL=actions.js.map
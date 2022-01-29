"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnappingSession = void 0;
class SnappingSession {
    constructor(guides, handle, threshold, findClosest) {
        this.handle = handle;
        this.threshold = threshold;
        this.candidates = [];
        this.currentCandidates = null;
        this.findClosestSnappingGuide = findClosest;
        switch (handle.type) {
            case "line":
                {
                    const lineHandle = handle;
                    // Get all guides
                    this.candidates = guides.filter((g) => {
                        return (g.guide.type == lineHandle.axis ||
                            g.guide.type == "angular" ||
                            g.guide.type == "radial" ||
                            g.guide.type == "point");
                    });
                }
                break;
            case "point":
                {
                    // Get all guides
                    this.candidates = guides.filter((g) => {
                        return (g.guide.type == "x" ||
                            g.guide.type == "y" ||
                            g.guide.type == "angular" ||
                            g.guide.type == "radial" ||
                            g.guide.type == "point");
                    });
                }
                break;
        }
    }
    giveProrityToPoint(a, b) {
        var _a, _b, _c, _d;
        const aPriority = (_b = (_a = a.guide) === null || _a === void 0 ? void 0 : _a.priority) !== null && _b !== void 0 ? _b : 0;
        const bPriority = (_d = (_c = b.guide) === null || _c === void 0 ? void 0 : _c.priority) !== null && _d !== void 0 ? _d : 0;
        if (aPriority > 0 || bPriority > 0) {
            return bPriority - aPriority;
        }
        else {
            if (a.guide.type === "point" && b.guide.type !== "point") {
                return -1;
            }
            else if (a.guide.type === "point" && b.guide.type === "point") {
                return 0;
            }
            else {
                return 1;
            }
        }
    }
    // eslint-disable-next-line
    handleDrag(e) {
        var _a, _b;
        const EPSILON = 1e-5;
        switch (this.handle.type) {
            case "line":
                {
                    let minGuide = null;
                    let minDistance = null;
                    let minXGuide = null;
                    let minXDistance = null;
                    let minYGuide = null;
                    let minYDistance = null;
                    for (const g of this.candidates.sort(this.giveProrityToPoint)) {
                        const guide = g.guide;
                        if (this.findClosestSnappingGuide) {
                            if (guide.type == "y") {
                                const dY = Math.abs(guide.value - e.value);
                                if (dY < minYDistance || minYDistance == null) {
                                    minYDistance = dY;
                                    minYGuide = g;
                                }
                            }
                            else if (guide.type == "x") {
                                const dX = Math.abs(guide.value - e.value);
                                if (dX < minXDistance || minXDistance == null) {
                                    minXDistance = dX;
                                    minXGuide = g;
                                }
                            }
                            else {
                                const guide = g.guide;
                                const d = Math.abs(guide.value - e.value);
                                if (d < this.threshold &&
                                    (minDistance == null || d < minDistance - EPSILON)) {
                                    minDistance = d;
                                    minGuide = g;
                                }
                            }
                        }
                    }
                    if (this.findClosestSnappingGuide) {
                        if (((_a = this.handle) === null || _a === void 0 ? void 0 : _a.axis) === "y") {
                            if (minYGuide) {
                                this.currentCandidates = [minYGuide];
                            }
                        }
                        if (((_b = this.handle) === null || _b === void 0 ? void 0 : _b.axis) === "x") {
                            if (minXGuide) {
                                this.currentCandidates = [minXGuide];
                            }
                        }
                    }
                    else {
                        if (minGuide) {
                            this.currentCandidates = [minGuide];
                        }
                        else {
                            this.currentCandidates = null;
                        }
                    }
                }
                break;
            case "point":
                {
                    let minXGuide = null;
                    let minXDistance = null;
                    let minYGuide = null;
                    let minYDistance = null;
                    for (const g of this.candidates.sort(this.giveProrityToPoint)) {
                        const guide = g.guide;
                        if (this.findClosestSnappingGuide) {
                            // Find closest point
                            if (g.guide.type == "point") {
                                const polarGuide = g.guide;
                                const dX = Math.abs(polarGuide.angle - e.x);
                                const dY = Math.abs(polarGuide.radius - e.y);
                                if (dX < minXDistance || minXDistance == null) {
                                    minXDistance = dX;
                                    minXGuide = g;
                                }
                                if (dY < minYDistance || minYDistance == null) {
                                    minYDistance = dY;
                                    minYGuide = g;
                                }
                            }
                            else if (guide.type == "y") {
                                const dY = Math.abs(guide.value - e.y);
                                if (dY < minYDistance || minYDistance == null) {
                                    minYDistance = dY;
                                    minYGuide = g;
                                }
                            }
                            else if (guide.type == "x") {
                                const dX = Math.abs(guide.value - e.x);
                                if (dX < minXDistance || minXDistance == null) {
                                    minXDistance = dX;
                                    minXGuide = g;
                                }
                            }
                        }
                        else {
                            // Filter guides by threshold
                            if (g.guide.type == "point") {
                                const polarGuide = g.guide;
                                const d = Math.sqrt((polarGuide.angle - e.x) *
                                    (polarGuide.angle - e.x) +
                                    (polarGuide.radius - e.y) *
                                        (polarGuide.radius - e.y));
                                if (d < this.threshold &&
                                    (minYDistance == null || d < minYDistance - EPSILON)) {
                                    minYDistance = d;
                                    minYGuide = g;
                                    minXDistance = d;
                                    minXGuide = g;
                                }
                            }
                            else if (guide.type == "x") {
                                const d = Math.abs(guide.value - e.x);
                                if (d < this.threshold &&
                                    (minXDistance == null || d < minXDistance - EPSILON)) {
                                    minXDistance = d;
                                    minXGuide = g;
                                }
                            }
                            else if (guide.type == "y") {
                                const d = Math.abs(guide.value - e.y);
                                if (d < this.threshold &&
                                    (minYDistance == null || d < minYDistance - EPSILON)) {
                                    minYDistance = d;
                                    minYGuide = g;
                                }
                            }
                        }
                    }
                    this.currentCandidates = [];
                    if (minXGuide) {
                        this.currentCandidates.push(minXGuide);
                    }
                    if (minYGuide) {
                        this.currentCandidates.push(minYGuide);
                    }
                }
                break;
        }
    }
    // eslint-disable-next-line
    handleEnd(e) {
        const result = [];
        for (const action of this.handle.actions) {
            const source = action.source || "value";
            if (e[source] === undefined) {
                continue;
            }
            let value = e[source];
            if (action.minimum != null) {
                value = Math.max(action.minimum, value);
            }
            if (action.maximum != null) {
                value = Math.min(action.maximum, value);
            }
            switch (action.type) {
                case "attribute-value-mapping":
                    {
                        result.push({
                            type: "value-mapping",
                            attribute: action.attribute,
                            value,
                        });
                    }
                    break;
                case "property":
                    {
                        result.push({
                            type: "property",
                            property: action.property,
                            field: action.field,
                            value,
                        });
                    }
                    break;
                case "attribute":
                    {
                        let didSnap = false;
                        if (source == "value") {
                            if (this.currentCandidates &&
                                this.currentCandidates.length == 1) {
                                const candidate = this.currentCandidates[0];
                                result.push({
                                    type: "snap",
                                    attribute: action.attribute,
                                    snapElement: candidate.element,
                                    snapAttribute: candidate.guide
                                        .attribute,
                                });
                                didSnap = true;
                            }
                        }
                        if (source == "x" || source == "y") {
                            for (const candidate of this.currentCandidates.sort(this.giveProrityToPoint)) {
                                if (candidate.guide
                                    .type === "point") {
                                    if (source == "x") {
                                        result.push({
                                            type: "snap",
                                            attribute: action.attribute,
                                            snapElement: candidate.element,
                                            snapAttribute: candidate.guide
                                                .angleAttribute,
                                        });
                                        didSnap = true;
                                    }
                                    if (source == "y") {
                                        result.push({
                                            type: "snap",
                                            attribute: action.attribute,
                                            snapElement: candidate.element,
                                            snapAttribute: candidate.guide
                                                .radiusAttribute,
                                        });
                                        didSnap = true;
                                    }
                                }
                                else if (source ==
                                    candidate.guide.type) {
                                    result.push({
                                        type: "snap",
                                        attribute: action.attribute,
                                        snapElement: candidate.element,
                                        snapAttribute: candidate.guide
                                            .attribute,
                                    });
                                    didSnap = true;
                                }
                            }
                        }
                        if (!didSnap) {
                            result.push({
                                type: "move",
                                attribute: action.attribute,
                                value,
                            });
                        }
                    }
                    break;
            }
        }
        // switch (this.handle.type) {
        //     case "line": {
        //         let lineBound = this.handle as Prototypes.Handles.Line;
        //         if (this.currentCandidates && this.currentCandidates.length == 1) {
        //             let candidate = this.currentCandidates[0];
        //             result.push({
        //                 type: "snap",
        //                 attribute: lineBound.attribute,
        //                 snapElement: candidate.element,
        //                 snapAttribute: (candidate.guide as Prototypes.SnappingGuides.Axis).attribute
        //             });
        //         } else {
        //             result.push({
        //                 type: "move",
        //                 attribute: lineBound.attribute,
        //                 value: e.newValue
        //             });
        //         }
        //     } break;
        //     case "relative-line": {
        //         let relativeLine = this.handle as Prototypes.Handles.RelativeLine;
        //         result.push({
        //             type: "move",
        //             attribute: relativeLine.attribute,
        //             value: e.newValue
        //         });
        //     } break;
        //     case "point": {
        //         let pointBound = this.handle as Prototypes.Handles.Point;
        //         let didX: boolean = false;
        //         let didY: boolean = false;
        //         if (this.currentCandidates) {
        //             for (let candidate of this.currentCandidates) {
        //                 let attr: string;
        //                 switch ((candidate.guide as Prototypes.SnappingGuides.Axis).type) {
        //                     case "x": {
        //                         didX = true;
        //                         attr = pointBound.xAttribute;
        //                     } break;
        //                     case "y": {
        //                         didY = true;
        //                         attr = pointBound.yAttribute;
        //                     } break;
        //                 }
        //                 result.push({
        //                     type: "snap",
        //                     attribute: attr,
        //                     snapElement: candidate.element,
        //                     snapAttribute: (candidate.guide as Prototypes.SnappingGuides.Axis).attribute
        //                 });
        //             }
        //             if (!didX) {
        //                 result.push({
        //                     type: "move",
        //                     attribute: pointBound.xAttribute,
        //                     value: e.newXValue
        //                 });
        //             }
        //             if (!didY) {
        //                 result.push({
        //                     type: "move",
        //                     attribute: pointBound.yAttribute,
        //                     value: e.newYValue
        //                 });
        //             }
        //         }
        //     } break;
        // }
        return result;
    }
    getCurrentCandidates() {
        return this.currentCandidates;
    }
}
exports.SnappingSession = SnappingSession;
//# sourceMappingURL=session.js.map
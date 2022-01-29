"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarPlotSegmentPlugin = void 0;
const abstract_1 = require("../abstract");
const common_1 = require("../../common");
const update_attribute_1 = require("../../prototypes/update_attribute");
class PolarPlotSegmentPlugin extends abstract_1.ConstraintPlugin {
    constructor(attrs, chartConstraints, objectID, manager, properties) {
        super();
        this.attrs = attrs;
        this.chartConstraints = chartConstraints;
        this.objectID = objectID;
        this.manager = manager;
        this.properties = properties;
    }
    apply() {
        const { attrs } = this;
        const { angle1, angle2, radial1, radial2, x1, x2, y1, y2 } = attrs;
        attrs.cx = (x2 + x1) / 2;
        attrs.cy = (y2 + y1) / 2;
        const { cx, cy } = attrs;
        const toPoint = (radius, angle) => {
            const radians = common_1.Geometry.degreesToRadians(angle);
            return {
                x: cx + Math.sin(radians) * radius,
                y: cy + Math.cos(radians) * radius,
            };
        };
        const a1r1 = toPoint(radial1, angle1);
        attrs.a1r1x = a1r1.x;
        attrs.a1r1y = a1r1.y;
        const a1r2 = toPoint(radial2, angle1);
        attrs.a1r2x = a1r2.x;
        attrs.a1r2y = a1r2.y;
        const a2r1 = toPoint(radial1, angle2);
        attrs.a2r1x = a2r1.x;
        attrs.a2r1y = a2r1.y;
        const a2r2 = toPoint(radial2, angle2);
        attrs.a2r2x = a2r2.x;
        attrs.a2r2y = a2r2.y;
        // take snapped attributes and apply new value
        [
            "a1r1x",
            "a1r1y",
            "a1r2x",
            "a1r2y",
            "a2r1x",
            "a2r1y",
            "a2r2x",
            "a2r2y",
        ].forEach((attrName) => {
            update_attribute_1.snapToAttribute(this.manager, this.chartConstraints, this.objectID, attrName, attrs[attrName]);
        });
        return true;
    }
}
exports.PolarPlotSegmentPlugin = PolarPlotSegmentPlugin;
//# sourceMappingURL=polar_plotsegment.js.map
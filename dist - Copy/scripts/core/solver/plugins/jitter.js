"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitterPlugin = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const __1 = require("../..");
const abstract_1 = require("../abstract");
class JitterPlugin extends abstract_1.ConstraintPlugin {
    constructor(solver, x1, y1, x2, y2, points, axisOnly, options) {
        super();
        this.solver = solver;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.points = points;
        this.xEnable = axisOnly == null || axisOnly == "x";
        this.yEnable = axisOnly == null || axisOnly == "y";
        this.options = options;
    }
    apply() {
        const x1 = this.solver.getValue(this.x1);
        const x2 = this.solver.getValue(this.x2);
        const y1 = this.solver.getValue(this.y1);
        const y2 = this.solver.getValue(this.y2);
        const nodes = this.points.map(() => {
            const x = __1.getRandom(x1, x2);
            const y = __1.getRandom(y1, y2);
            // Use forceSimulation's default initialization
            return {
                x,
                y,
            };
        });
        for (let i = 0; i < nodes.length; i++) {
            if (this.options.horizontal) {
                this.solver.setValue(this.points[i][0], nodes[i].x);
            }
            if (this.options.vertical) {
                this.solver.setValue(this.points[i][1], nodes[i].y);
            }
        }
        return true;
    }
}
exports.JitterPlugin = JitterPlugin;
//# sourceMappingURL=jitter.js.map
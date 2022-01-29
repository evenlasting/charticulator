"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarCoordinatorPlugin = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const __1 = require("../..");
const polar_coordinator_1 = require("../../prototypes/guides/polar_coordinator");
const update_attribute_1 = require("../../prototypes/update_attribute");
const abstract_1 = require("../abstract");
// Converts Polar coordinates to cartesian coordinates
class PolarCoordinatorPlugin extends abstract_1.ConstraintPlugin {
    constructor(solver, cx, cy, radialVarable, angleVarable, attrs, chartConstraints, coordinatoObjectID, chartMananger) {
        super();
        this.solver = solver;
        this.cx = cx;
        this.cy = cy;
        this.radialVarable = radialVarable;
        this.angleVarable = angleVarable;
        this.attrs = attrs;
        this.chartConstraints = chartConstraints;
        this.coordinatoObjectID = coordinatoObjectID;
        this.chartMananger = chartMananger;
    }
    apply() {
        const cx = this.solver.getValue(this.cx);
        const cy = this.solver.getValue(this.cy);
        const attrs = this.attrs;
        for (let i = 0; i < this.angleVarable.length; i++) {
            const angleAttr = this.solver.attr(attrs, this.angleVarable[i].name, {
                edit: false,
            });
            for (let j = 0; j < this.radialVarable.length; j++) {
                const attrXname = polar_coordinator_1.getPointValueName(i, j, "X");
                const attrYname = polar_coordinator_1.getPointValueName(i, j, "Y");
                const radialAttr = this.solver.attr(attrs, this.radialVarable[j].name, {
                    edit: false,
                });
                const pointX = this.solver.attr(attrs, attrXname, {
                    edit: false,
                });
                const pointY = this.solver.attr(attrs, attrYname, {
                    edit: false,
                });
                const angle = this.solver.getValue(angleAttr);
                const radians = __1.Geometry.degreesToRadians(angle);
                const radius = Math.abs(this.solver.getValue(radialAttr));
                const tx = Math.sin(radians) * radius;
                const ty = Math.cos(radians) * radius;
                this.solver.setValue(pointX, cx + tx);
                this.solver.setValue(pointY, cy + ty);
                // take snapped attributes and apply new value
                update_attribute_1.snapToAttribute(this.chartMananger, this.chartConstraints, this.coordinatoObjectID, attrXname, cx + tx);
                update_attribute_1.snapToAttribute(this.chartMananger, this.chartConstraints, this.coordinatoObjectID, attrYname, cy + ty);
            }
        }
        return true;
    }
}
exports.PolarCoordinatorPlugin = PolarCoordinatorPlugin;
//# sourceMappingURL=polar_coordinator.js.map
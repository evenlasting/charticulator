"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClasses = exports.SnapConstraintClass = exports.ConstraintTypeClass = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../../common");
const solver_1 = require("../../solver");
// Mark-level constraint
class ConstraintTypeClass {
    static register(entry) {
        ConstraintTypeClass._classes.set(entry.type, entry);
    }
    static getClass(type) {
        return ConstraintTypeClass._classes.get(type);
    }
}
exports.ConstraintTypeClass = ConstraintTypeClass;
// Register and get mark class
ConstraintTypeClass._classes = new Map();
class SnapConstraintClass {
    constructor() {
        this.type = "snap";
    }
    buildConstraints(constraint, elements, states, solver) {
        const { attribute, element, targetAttribute, targetElement, } = constraint.attributes;
        let gap = constraint.attributes.gap;
        if (gap == null) {
            gap = 0;
        }
        const idxElement = common_1.getIndexById(elements, element);
        const idxTargetElement = common_1.getIndexById(elements, targetElement);
        const attr = solver.attr(states[idxElement].attributes, attribute);
        const targetAttr = solver.attr(states[idxTargetElement].attributes, targetAttribute);
        solver.addLinear(solver_1.ConstraintStrength.HARD, gap, [
            [1, attr],
            [-1, targetAttr],
        ]);
    }
}
exports.SnapConstraintClass = SnapConstraintClass;
function registerClasses() {
    ConstraintTypeClass.register(new SnapConstraintClass());
}
exports.registerClasses = registerClasses;
//# sourceMappingURL=index.js.map
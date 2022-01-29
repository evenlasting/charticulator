"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const fs = require("fs");
const path = require("path");
const chai_1 = require("chai");
const core_1 = require("../../core");
const migrator_1 = require("../../app/stores/migrator");
/** Test if a deep equals b with tolerance on numeric values */
function expect_deep_approximately_equals(a, b, tol) {
    if (a == null || b == null) {
        // If either of a, b is null/undefined
        chai_1.expect(a).equals(b);
    }
    else if (typeof a == "object" && typeof b == "object") {
        if (a instanceof Array && b instanceof Array) {
            // Both are arrays, recursively test for each item in the arrays
            chai_1.expect(a.length).to.equals(b.length);
            for (let i = 0; i < a.length; i++) {
                expect_deep_approximately_equals(a[i], b[i], tol);
            }
        }
        else if (a instanceof Array || b instanceof Array) {
            // One of them is an array, the other one isn't, error
            throw new Error("type mismatch");
        }
        else {
            // Both are objects, recursively test for each key in the objects
            const keysA = Object.keys(a).sort();
            const keysB = Object.keys(b).sort();
            chai_1.expect(keysA).to.deep.equals(keysB);
            for (const key of keysA) {
                expect_deep_approximately_equals(a[key], b[key], tol);
            }
        }
    }
    else {
        if (typeof a == "number" && typeof b == "number") {
            // If both are numbers, test approximately equals
            chai_1.expect(a).to.approximately(b, tol);
        }
        else {
            // Otherwise, use regular equals
            chai_1.expect(a).equals(b);
        }
    }
}
describe("Chart Solver", () => {
    // The directory containing test cases
    const pathPrefix = "src/tests/unit/charts";
    // Scan for test cases
    const cases = fs.readdirSync(pathPrefix).filter((x) => x.endsWith(".json"));
    // Run tests
    cases.forEach((filename) => {
        it(filename, () => __awaiter(void 0, void 0, void 0, function* () {
            // The solver has to be initialized, other options can be omitted
            yield core_1.initialize();
            let state = JSON.parse(fs.readFileSync(path.join(pathPrefix, filename), "utf-8")).state;
            state = new migrator_1.Migrator().migrate(state, "2.0.1");
            const manager = new core_1.Prototypes.ChartStateManager(state.chart, state.dataset, null, makeDefaultAttributes(state));
            manager.solveConstraints();
            // Solve a second time to converge to higher precision
            // This is necessary because the solver attempts to keep the current values
            // with a weighting mechanism by adding lambda ||x-x0||^2 to the loss function.
            // When starting from scratch, this weighting causes the solved values to bias
            // towards the default values. This bias is in the magnitude of 0.1.
            // A second solveConstraints call can reduce it to 1e-5.
            manager.solveConstraints();
            const solvedState = manager.chartState;
            const expectedState = state.chartState;
            // Test if solvedState deep equals expectedState with tolerance
            expect_deep_approximately_equals(solvedState, expectedState, 1e-5);
        }));
    });
});
function makeDefaultAttributes(state) {
    const defaultAttributes = {};
    const { elements } = state.chart;
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        defaultAttributes[el._id] = core_1.deepClone(state.chartState.elements[i].attributes);
    }
    return defaultAttributes;
}
//# sourceMappingURL=chart-solver.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureColumnsHaveExamples = void 0;
const dataset_1 = require("./dataset");
const exampleCount = 3;
const delim = ",";
function ensureColumnsHaveExamples(table) {
    table.columns.forEach((c) => {
        if (!c.metadata.examples) {
            let examples = [];
            if (c.type === dataset_1.DataType.Boolean) {
                examples = ["true", "false"];
            }
            else {
                const distinct = getDistinctValues(table, c);
                if (c.metadata.kind === dataset_1.DataKind.Ordinal) {
                    distinct.sort();
                }
                examples = distinct.slice(0, exampleCount);
            }
            examples = examples.map((e) => {
                if (e.indexOf(delim) >= 0) {
                    return JSON.stringify(e);
                }
                else {
                    return e;
                }
            });
            c.metadata.examples = examples.join(`${delim} `);
        }
    });
}
exports.ensureColumnsHaveExamples = ensureColumnsHaveExamples;
function getDistinctValues(t, c) {
    const o = {};
    t.rows.forEach((r) => {
        const valueKey = r[c.name].toString();
        o[valueKey] = null;
    });
    return Object.keys(o);
}
//# sourceMappingURL=examples.js.map
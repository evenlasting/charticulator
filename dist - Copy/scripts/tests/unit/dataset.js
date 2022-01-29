"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const chai_1 = require("chai");
const dsv_parser_1 = require("../../core/dataset/dsv_parser");
const localeNumberFormat = { remove: ".", decimal: "," };
describe("Data set tests", () => {
    it("parseDataset method parses csv file", () => {
        const content = `Area,Abstract,Full
    CAT1,167,851.6
    CAT2,126,1105.6
    CAT3,535,425.3
    CAT4,921,737.9
    CAT5,55,544.1
    CAT6,15,739.56`;
        const table = dsv_parser_1.parseDataset("folder/file-!№;%()_{}~,.csv", content, {
            delimiter: ",",
            currency: "$",
            group: ".",
            numberFormat: localeNumberFormat,
        });
        chai_1.expect(table.name).not.contains("/");
        chai_1.expect(table.name).not.contains("-");
        chai_1.expect(table.name).not.contains("№");
        chai_1.expect(table.name).not.contains(";");
        chai_1.expect(table.name).not.contains("%");
        chai_1.expect(table.name).not.contains("(");
        chai_1.expect(table.name).not.contains(")");
        chai_1.expect(table.name).not.contains("{");
        chai_1.expect(table.name).not.contains("}");
        chai_1.expect(table.name).not.contains("~");
        chai_1.expect(table.name).not.contains(",");
        chai_1.expect(table.name).not.contains(".");
        chai_1.expect(table.columns.length).to.equal(3, "table has 3 columns");
        chai_1.expect(table.rows.length).to.equal(6, "table has 6 rows");
    });
});
//# sourceMappingURL=dataset.js.map
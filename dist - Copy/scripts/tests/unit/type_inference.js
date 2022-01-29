"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const chai_1 = require("chai");
const data_types_1 = require("../../core/dataset/data_types");
const dataset_1 = require("../../core/dataset");
const localeNumberFormat = { remove: ",", decimal: "." };
describe("Data Type Inference", () => {
    it("inferColumnType", () => {
        const cases = [
            [["1", "3", "4.5", "23"], dataset_1.DataType.Number],
            [["1990-01-13", "2012-12-30", "12:34:56", "11:05am"], dataset_1.DataType.Date],
            [["true", "true", "false", "yes", "no"], dataset_1.DataType.Boolean],
            [["Hello", "World", "Charticulator"], dataset_1.DataType.String],
            [["2010", "2011", "2013", "2012"], dataset_1.DataType.Number],
            [["Jan", "Feb", "Mar", "Nov"], dataset_1.DataType.String],
        ];
        for (const [values, type] of cases) {
            const inferredType = data_types_1.inferColumnType(values, localeNumberFormat);
            chai_1.expect(inferredType).to.equals(type, values.join(", "));
        }
    });
    it("inferAndConvertColumn", () => {
        const cases = [
            [
                ["1", "3", "4.5", "23", null],
                {
                    type: dataset_1.DataType.Number,
                    values: [1, 3, 4.5, 23, null],
                    metadata: { kind: "numerical" },
                },
            ],
            [
                ["1990-01-13", "2012-12-30", "12:34:56", "11:05am"],
                { type: dataset_1.DataType.Date, metadata: { kind: "temporal" } },
            ],
            [
                ["true", "true", "false", "yes", "no"],
                { type: dataset_1.DataType.Boolean, metadata: { kind: "categorical" } },
            ],
            [
                ["Hello", "World", "Charticulator"],
                { type: dataset_1.DataType.String, metadata: { kind: "categorical" } },
            ],
            [
                ["2010", "2011", "2013", "2012"],
                {
                    type: dataset_1.DataType.String,
                    metadata: {
                        unit: "__year",
                        orderMode: "alphabetically",
                        kind: "ordinal",
                    },
                },
            ],
            [
                ["Jan", "Feb", "MAR", "november", "sept."],
                {
                    type: dataset_1.DataType.String,
                    values: ["Jan", "Feb", "Mar", "Nov", "Sep"],
                    metadata: {
                        kind: "ordinal",
                        order: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                        unit: "__month",
                    },
                },
            ],
        ];
        for (const [values, expectedResult] of cases) {
            const r = data_types_1.inferAndConvertColumn(values, localeNumberFormat);
            if (expectedResult.type) {
                chai_1.expect(r.type).to.equals(expectedResult.type);
            }
            if (expectedResult.metadata) {
                for (const k of Object.keys(expectedResult.metadata)) {
                    chai_1.expect(r.metadata[k]).to.deep.equals(expectedResult.metadata[k]);
                }
            }
        }
    });
});
//# sourceMappingURL=type_inference.js.map
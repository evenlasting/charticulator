"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDefaultDataset = void 0;
const core_1 = require("../core");
const dataset_1 = require("../core/dataset");
const strings_1 = require("../strings");
function makeDefaultDataset() {
    const rows = [];
    const months = strings_1.strings.dataset.months;
    let monthIndex = 0;
    for (const month of months) {
        let cityIndex = 0;
        for (const city of ["City1", "City2", "City3"]) {
            const value = 50 +
                30 *
                    Math.sin(((monthIndex + 0.5) * Math.PI) / 12 + (cityIndex * Math.PI) / 2);
            rows.push({
                _id: "ID" + rows.length,
                Month: month,
                City: city,
                Value: +value.toFixed(1),
            });
            cityIndex += 1;
        }
        monthIndex += 1;
    }
    return {
        tables: [
            {
                name: "Temperature",
                displayName: strings_1.strings.defaultDataset.temperature,
                columns: [
                    {
                        name: "Month",
                        displayName: strings_1.strings.defaultDataset.month,
                        type: core_1.Dataset.DataType.String,
                        metadata: {
                            kind: core_1.Dataset.DataKind.Categorical,
                            order: months,
                        },
                    },
                    {
                        name: "City",
                        displayName: strings_1.strings.defaultDataset.city,
                        type: core_1.Dataset.DataType.String,
                        metadata: { kind: core_1.Dataset.DataKind.Categorical },
                    },
                    {
                        name: "Value",
                        displayName: strings_1.strings.defaultDataset.value,
                        type: core_1.Dataset.DataType.Number,
                        metadata: { kind: core_1.Dataset.DataKind.Numerical, format: ".1f" },
                    },
                ],
                rows,
                type: dataset_1.TableType.Main,
            },
        ],
        name: "demo",
    };
}
exports.makeDefaultDataset = makeDefaultDataset;
//# sourceMappingURL=default_dataset.js.map
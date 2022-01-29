"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDataset = exports.parseHints = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const d3_dsv_1 = require("d3-dsv");
const data_types_1 = require("./data_types");
const dataset_1 = require("./dataset");
const common_1 = require("../common");
function parseHints(hints) {
    const items = hints.match(/ *\*(.*)/);
    if (items) {
        const entries = items[1]
            .trim()
            .split(";")
            .map((x) => x.trim())
            .filter((x) => x != "");
        const result = {};
        for (const entry of entries) {
            const items = entry.split(":").map((x) => x.trim());
            if (items.length == 2) {
                result[items[0]] = items[1];
            }
            else if (items.length == 1) {
                result[items[0]] = "true";
            }
        }
        return result;
    }
    else {
        return {};
    }
}
exports.parseHints = parseHints;
/**
 * Parses data from file. Returns converted rows and list of colum names with types.
 * Calls {@link inferAndConvertColumn} method from {@link "core/dataset/data_types"} for convert types.
 * @param fileName input file name for parsing
 * @param content data of file
 * @param type type of file. *.csv - text with coma delimeter. *.tsv - tab separated text files
 */
function parseDataset(fileName, content, localeFileFormat) {
    let rows;
    const tableName = fileName.replace(/\W/g, "_");
    rows = d3_dsv_1.dsvFormat(localeFileFormat.delimiter).parseRows(content);
    // Remove empty rows if any
    rows = rows.filter((row) => row.length > 0);
    if (rows.length > 0) {
        const header = rows[0];
        // eslint-disable-next-line
        // TODO fix it
        let columnHints;
        let data = rows.slice(1);
        if (data.length > 0 && data[0].every((x) => /^ *\*/.test(x))) {
            columnHints = data[0].map(parseHints);
            data = data.slice(1);
        }
        else {
            // eslint-disable-next-line
            columnHints = header.map(() => ({}));
        }
        let columnValues = header.map((name, index) => {
            const values = data.map((row) => row[index]);
            return data_types_1.inferAndConvertColumn(values, localeFileFormat.numberFormat);
        });
        const additionalColumns = [];
        columnValues.forEach((column, index) => {
            if (column.rawValues) {
                const rawColumn = common_1.deepClone(column);
                rawColumn.metadata.isRaw = true;
                rawColumn.values = rawColumn.rawValues;
                delete rawColumn.rawValues;
                const rawColumnName = header[index] + dataset_1.rawColumnPostFix;
                column.metadata.rawColumnName = rawColumnName;
                delete column.rawValues;
                header.push(rawColumnName);
                additionalColumns.push(rawColumn);
            }
        });
        columnValues = columnValues.concat(additionalColumns);
        const outRows = data.map((row, rindex) => {
            const out = { _id: rindex.toString() };
            columnValues.forEach((column, cindex) => {
                out[header[cindex]] = columnValues[cindex].values[rindex];
                if (columnValues[cindex].rawValues) {
                    out[header[cindex] + dataset_1.rawColumnPostFix] =
                        columnValues[cindex].rawValues[rindex];
                    if (!header.find((h) => h === header[cindex] + dataset_1.rawColumnPostFix)) {
                        header.push(header[cindex] + dataset_1.rawColumnPostFix);
                    }
                }
            });
            return out;
        });
        const columns = columnValues.map((x, i) => ({
            name: header[i],
            displayName: header[i],
            type: x.type,
            metadata: x.metadata,
        }));
        return {
            name: tableName,
            displayName: tableName,
            columns,
            rows: outRows,
            type: null,
            localeNumberFormat: localeFileFormat.numberFormat,
        };
    }
    else {
        return null;
    }
}
exports.parseDataset = parseDataset;
//# sourceMappingURL=dsv_parser.js.map
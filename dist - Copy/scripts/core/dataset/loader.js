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
exports.DatasetLoader = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const dataset_1 = require("./dataset");
const dsv_parser_1 = require("./dsv_parser");
class DatasetLoader {
    loadTextData(url) {
        return fetch(url).then((resp) => resp.text());
    }
    loadDSVFromURL(url, localeFileFormat) {
        return this.loadTextData(url).then((data) => {
            return dsv_parser_1.parseDataset(url, data, localeFileFormat);
        });
    }
    loadDSVFromContents(filename, contents, localeFileFormat) {
        return dsv_parser_1.parseDataset(filename, contents, localeFileFormat);
    }
    loadTableFromSourceSpecification(spec) {
        return __awaiter(this, void 0, void 0, function* () {
            if (spec.url) {
                const tableContent = yield this.loadTextData(spec.url);
                if (spec.url.toLowerCase().endsWith(".tsv")) {
                    spec.localeFileFormat.delimiter = "\t";
                }
                const table = dsv_parser_1.parseDataset(spec.url.split("/").pop(), tableContent, spec.localeFileFormat);
                if (spec.name) {
                    table.name = spec.name;
                }
                return table;
            }
            else if (spec.content) {
                const table = dsv_parser_1.parseDataset(spec.name, spec.content, spec.localeFileFormat);
                table.name = spec.name;
                return table;
            }
            else {
                throw new Error("invalid table specification, url or content must be specified");
            }
        });
    }
    loadDatasetFromSourceSpecification(spec) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load all tables
            const tables = yield Promise.all(spec.tables.map((table) => this.loadTableFromSourceSpecification(table)));
            tables[0].type = dataset_1.TableType.Main;
            if (tables[1]) {
                tables[1].type = dataset_1.TableType.Links;
            }
            // Make dataset struct
            const dataset = { name: spec.name, tables };
            if (!spec.name && tables.length > 0) {
                dataset.name = tables[0].name;
            }
            return dataset;
        });
    }
}
exports.DatasetLoader = DatasetLoader;
//# sourceMappingURL=loader.js.map
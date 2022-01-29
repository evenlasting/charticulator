"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowContext = exports.TableContext = exports.DatasetContext = void 0;
class DatasetContext {
    constructor(dataset) {
        this.dataset = dataset;
        this.fields = {};
        for (const table of dataset.tables) {
            this.fields[table.name] = table.rows;
        }
    }
    getTableContext(table) {
        return new TableContext(this, table);
    }
    getVariable(name) {
        return this.fields[name];
    }
}
exports.DatasetContext = DatasetContext;
class TableContext {
    constructor(parent, table) {
        this.parent = parent;
        this.table = table;
        this.fields = {};
        this.fields.table = table.rows;
    }
    getRowContext(row) {
        return new RowContext(this, row);
    }
    getVariable(name) {
        const r = this.fields[name];
        if (r === undefined) {
            return this.parent.getVariable(name);
        }
    }
}
exports.TableContext = TableContext;
class RowContext {
    constructor(parent, row) {
        this.parent = parent;
        this.row = row;
    }
    getVariable(name) {
        const r = this.row[name];
        if (r === undefined) {
            return this.parent.getVariable(name);
        }
        else {
            return r;
        }
    }
}
exports.RowContext = RowContext;
//# sourceMappingURL=context.js.map
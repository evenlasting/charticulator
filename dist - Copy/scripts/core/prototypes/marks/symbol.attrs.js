"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbolAttributes = exports.symbolTypes = void 0;
const attrs_1 = require("../attrs");
exports.symbolTypes = [
    "circle",
    "cross",
    "diamond",
    "square",
    "star",
    "triangle",
    "wye",
];
exports.symbolAttributes = Object.assign(Object.assign(Object.assign(Object.assign({}, attrs_1.AttrBuilder.point()), attrs_1.AttrBuilder.number("size", false, {
    defaultRange: [0, 200 * Math.PI],
    defaultValue: 60,
})), attrs_1.AttrBuilder.enum("symbol", { defaultRange: exports.symbolTypes })), attrs_1.AttrBuilder.style({ fill: true }));
//# sourceMappingURL=symbol.attrs.js.map
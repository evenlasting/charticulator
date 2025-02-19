"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.textboxAttributes = void 0;
const specification_1 = require("../../specification");
const attrs_1 = require("../attrs");
const defaults_1 = require("../../../app/stores/defaults");
exports.textboxAttributes = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, attrs_1.AttrBuilder.line()), attrs_1.AttrBuilder.center()), attrs_1.AttrBuilder.size()), { text: {
        name: "text",
        type: specification_1.AttributeType.Text,
        solverExclude: true,
        defaultValue: "",
    }, fontFamily: {
        name: "fontFamily",
        type: specification_1.AttributeType.FontFamily,
        solverExclude: true,
        defaultValue: defaults_1.defaultFont,
    }, fontSize: {
        name: "fontSize",
        type: specification_1.AttributeType.Number,
        solverExclude: true,
        defaultRange: [0, 24],
        defaultValue: defaults_1.defaultFontSize,
    }, color: {
        name: "color",
        type: specification_1.AttributeType.Color,
        solverExclude: true,
        defaultValue: null,
    }, outline: {
        name: "outline",
        type: specification_1.AttributeType.Color,
        solverExclude: true,
        defaultValue: null,
    } }), attrs_1.AttrBuilder.opacity()), attrs_1.AttrBuilder.visible());
//# sourceMappingURL=textbox.attrs.js.map
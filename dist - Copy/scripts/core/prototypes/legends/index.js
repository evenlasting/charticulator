"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClasses = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../common");
const custom_legend_1 = require("./custom_legend");
const categorical_legend_1 = require("./categorical_legend");
const color_legend_1 = require("./color_legend");
const numerical_legend_1 = require("./numerical_legend");
function registerClasses() {
    common_1.ObjectClasses.Register(custom_legend_1.CustomLegendClass);
    common_1.ObjectClasses.Register(categorical_legend_1.CategoricalLegendClass);
    common_1.ObjectClasses.Register(color_legend_1.NumericalColorLegendClass);
    common_1.ObjectClasses.Register(numerical_legend_1.NumericalNumberLegendClass);
}
exports.registerClasses = registerClasses;
//# sourceMappingURL=index.js.map
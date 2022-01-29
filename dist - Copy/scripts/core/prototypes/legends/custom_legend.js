"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLegendClass = void 0;
const categorical_legend_1 = require("./categorical_legend");
const strings_1 = require("../../../strings");
class CustomLegendClass extends categorical_legend_1.CategoricalLegendClass {
    getAttributePanelWidgets(manager) {
        const widget = super.getAttributePanelWidgets(manager);
        const scale = this.getScale();
        if (scale) {
            widget.push(manager.vertical(manager.label(strings_1.strings.objects.colors, {
                addMargins: true,
            }), manager.horizontal([1], manager.scaleEditor("mappingOptions", strings_1.strings.objects.legend.editColors))));
        }
        return widget;
    }
}
exports.CustomLegendClass = CustomLegendClass;
CustomLegendClass.classID = "legend.custom";
CustomLegendClass.type = "legend";
CustomLegendClass.metadata = {
    displayName: strings_1.strings.objects.legend.legend,
    iconPath: "CharticulatorLegend",
    creatingInteraction: {
        type: "point",
        mapping: { x: "x", y: "y" },
    },
};
//# sourceMappingURL=custom_legend.js.map
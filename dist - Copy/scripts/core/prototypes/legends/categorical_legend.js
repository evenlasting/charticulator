"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoricalLegendClass = exports.ReservedMappingKeyNamePrefix = void 0;
const Graphics = require("../../graphics");
const legend_1 = require("./legend");
const strings_1 = require("../../../strings");
exports.ReservedMappingKeyNamePrefix = "reserved_";
class CategoricalLegendClass extends legend_1.LegendClass {
    constructor() {
        super(...arguments);
        this.textMeasure = new Graphics.TextMeasurer();
        // private getScaleEditor(
        //   manager: Controls.WidgetManager & CharticulatorPropertyAccessors
        // ) {
        //   const scale = this?.getScale();
        //   if (scale) {
        //     return manager.vertical(
        //       manager.label(strings.objects.colors, {
        //         addMargins: true,
        //       }),
        //       manager.horizontal(
        //         [1],
        //         manager.scaleEditor(
        //           "mappingOptions",
        //           strings.objects.legend.editColors
        //         )
        //       )
        //     );
        //   }
        //   return null;
        // }
    }
    getLegendItems() {
        const scale = this.getScale();
        if (scale) {
            const [scaleObject] = scale;
            const mapping = scaleObject.properties.mapping;
            const items = [];
            for (const key in mapping) {
                if (
                // eslint-disable-next-line
                mapping.hasOwnProperty(key) &&
                    !key.startsWith(exports.ReservedMappingKeyNamePrefix)) {
                    switch (scaleObject.classID) {
                        case "scale.categorical<string,boolean>":
                            {
                                items.push({
                                    type: "boolean",
                                    label: key,
                                    value: mapping[key],
                                });
                            }
                            break;
                        case "scale.categorical<string,number>":
                            {
                                items.push({ type: "number", label: key, value: mapping[key] });
                            }
                            break;
                        case "scale.categorical<string,color>":
                            {
                                items.push({ type: "color", label: key, value: mapping[key] });
                            }
                            break;
                    }
                }
            }
            if (this.object.properties.order) {
                if (this.object.properties.order.length != items.length) {
                    return items;
                }
                else {
                    return this.object.properties.order.map((orderItem) => {
                        return {
                            type: "color",
                            label: orderItem,
                            value: mapping[orderItem],
                        };
                    });
                }
            }
            else {
                return items;
            }
        }
        else {
            return [];
        }
    }
    getLineHeight() {
        return this.object.properties.fontSize + 10;
    }
    getLineWidth() {
        let width = 0;
        const items = this.getLegendItems();
        if (this.object.properties.orientation === "horizontal") {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const metrics = this.textMeasure.measure(item.label);
                width += 10 + metrics.width;
            }
        }
        else {
            width = (items[0] && this.textMeasure.measure(items[0].label).width) || 0;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const metrics = this.textMeasure.measure(item.label);
                if (10 + metrics.width > width) {
                    width = 10 + metrics.width;
                }
            }
        }
        return width;
    }
    getLegendSize() {
        const items = this.getLegendItems();
        if (this.object.properties.orientation === "vertical" ||
            this.object.properties.orientation === undefined) {
            return [
                this.getLineWidth() + this.getLineHeight(),
                items.length * this.getLineHeight(),
            ];
        }
        else {
            return [
                this.getLineWidth() + items.length * this.getLineHeight(),
                this.getLineHeight(),
            ];
        }
    }
    // eslint-disable-next-line
    getGraphics() {
        const fontFamily = this.object.properties.fontFamily;
        const fontSize = this.object.properties.fontSize;
        const lineHeight = this.getLineHeight();
        this.textMeasure.setFontFamily(fontFamily);
        this.textMeasure.setFontSize(fontSize);
        const g = Graphics.makeGroup([]);
        const items = this.getLegendItems();
        const horizontalGap = 10;
        let itemGroupOffset = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const metrics = this.textMeasure.measure(item.label);
            const offsets = Graphics.TextMeasurer.ComputeTextPosition(lineHeight, lineHeight / 2, metrics, "left", "middle", 5, 0);
            const textLabel = Graphics.makeText(offsets[0], offsets[1], item.label, fontFamily, fontSize, { fillColor: this.object.properties.textColor });
            const gItem = Graphics.makeGroup([textLabel]);
            switch (item.type) {
                case "color":
                    {
                        switch (this.object.properties.markerShape) {
                            case "rectangle":
                                gItem.elements.push(Graphics.makeRect(8, 4, lineHeight, lineHeight - 4, {
                                    fillColor: item.value,
                                }));
                                break;
                            case "triangle":
                                gItem.elements.push(Graphics.makePolygon([
                                    {
                                        x: lineHeight / 2 + 4,
                                        y: lineHeight - 4,
                                    },
                                    {
                                        x: 0 + 4 + 2,
                                        y: 0 + 4,
                                    },
                                    {
                                        x: lineHeight + 4 - 2,
                                        y: 0 + 4,
                                    },
                                ], {
                                    fillColor: item.value,
                                }));
                                break;
                            case "circle":
                            default:
                                gItem.elements.push(Graphics.makeCircle(lineHeight / 2, lineHeight / 2, lineHeight / 3, {
                                    fillColor: item.value,
                                }));
                        }
                    }
                    break;
            }
            if (this.object.properties.orientation === "horizontal") {
                gItem.transform = {
                    x: itemGroupOffset,
                    y: 0,
                    angle: 0,
                };
                itemGroupOffset += metrics.width + lineHeight + horizontalGap;
            }
            else {
                gItem.transform = {
                    x: 0,
                    y: lineHeight * (items.length - 1 - i),
                    angle: 0,
                };
            }
            g.elements.push(gItem);
        }
        const { x1, y1 } = this.getLayoutBox();
        g.transform = { x: x1, y: y1, angle: 0 };
        return g;
    }
    getLayoutBox() {
        if (this.object.properties.orientation === "vertical" ||
            this.object.properties.orientation === undefined) {
            return super.getLayoutBox();
        }
        const { x, y } = this.state.attributes;
        const [width, height] = this.getLegendSize();
        let x1, y1, x2, y2;
        switch (this.object.properties.alignX) {
            case "start":
                x1 = x;
                x2 = x + width;
                break;
            case "middle":
                x1 = x - width / 2;
                x2 = x + width / 2;
                break;
            case "end":
                x1 = x - width;
                x2 = x;
                break;
        }
        switch (this.object.properties.alignY) {
            case "start":
                y1 = y;
                y2 = y + height;
                break;
            case "middle":
                y1 = y - height / 2;
                y2 = y + height / 2;
                break;
            case "end":
                y1 = y - height;
                y2 = y;
                break;
        }
        return { x1, y1, x2, y2 };
    }
    getAttributePanelWidgets(manager) {
        const widgets = super.getAttributePanelWidgets(manager);
        return [
            ...widgets,
            manager.verticalGroup({
                header: strings_1.strings.objects.legend.categoricalLegend,
            }, [
                manager.inputSelect({ property: "orientation" }, {
                    type: "radio",
                    showLabel: false,
                    icons: ["AlignHorizontalCenter", "AlignVerticalCenter"],
                    labels: [
                        strings_1.strings.objects.legend.vertical,
                        strings_1.strings.objects.legend.horizontal,
                    ],
                    options: ["vertical", "horizontal"],
                    label: strings_1.strings.objects.legend.orientation,
                }),
            ]),
        ];
    }
}
exports.CategoricalLegendClass = CategoricalLegendClass;
CategoricalLegendClass.classID = "legend.categorical";
CategoricalLegendClass.type = "legend";
CategoricalLegendClass.defaultProperties = Object.assign(Object.assign({}, legend_1.LegendClass.defaultProperties), { orientation: "vertical" });
//# sourceMappingURL=categorical_legend.js.map
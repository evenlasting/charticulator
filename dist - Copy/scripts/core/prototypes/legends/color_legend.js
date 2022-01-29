"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericalColorLegendClass = void 0;
const common_1 = require("../../common");
const Graphics = require("../../graphics");
const axis_1 = require("../plot_segments/axis");
const legend_1 = require("./legend");
class NumericalColorLegendClass extends legend_1.LegendClass {
    getLegendSize() {
        return [100, 100];
    }
    getGraphics() {
        const height = this.getLegendSize()[1];
        const marginLeft = 5;
        const gradientWidth = 12;
        const scale = this.getScale();
        if (!scale) {
            return null;
        }
        const range = scale[0].properties.range;
        const domainMin = scale[0].properties.domainMin;
        const domainMax = scale[0].properties.domainMax;
        const axisRenderer = new axis_1.AxisRenderer();
        axisRenderer.setLinearScale(domainMin, domainMax, 0, height, null);
        axisRenderer.setStyle({
            tickColor: this.object.properties.textColor,
            fontSize: this.object.properties.fontSize,
            fontFamily: this.object.properties.fontFamily,
            lineColor: this.object.properties.textColor,
        });
        const g = Graphics.makeGroup([]);
        g.elements.push(axisRenderer.renderLine(marginLeft + gradientWidth + 2, 0, 90, 1));
        const ticks = height * 2;
        const interp = common_1.interpolateColors(range.colors, range.colorspace);
        for (let i = 0; i < ticks; i++) {
            const t = (i + 0.5) / ticks;
            const color = interp(t);
            const y1 = (i / ticks) * height;
            const y2 = Math.min(height, ((i + 1.5) / ticks) * height);
            g.elements.push(Graphics.makeRect(marginLeft, y1, marginLeft + gradientWidth, y2, {
                fillColor: color,
            }));
        }
        const { x1, y1 } = this.getLayoutBox();
        g.transform = { x: x1, y: y1, angle: 0 };
        return g;
    }
}
exports.NumericalColorLegendClass = NumericalColorLegendClass;
NumericalColorLegendClass.classID = "legend.numerical-color";
NumericalColorLegendClass.type = "legend";
//# sourceMappingURL=color_legend.js.map
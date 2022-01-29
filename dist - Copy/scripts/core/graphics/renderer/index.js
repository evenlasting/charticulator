"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartRenderer = exports.facetRows = void 0;
const common_1 = require("../../common");
const Prototypes = require("../../prototypes");
const coordinate_system_1 = require("../coordinate_system");
const elements_1 = require("../elements");
function facetRows(rows, indices, columns) {
    if (columns == null) {
        return [indices];
    }
    else {
        const facets = new common_1.MultistringHashMap();
        for (const index of indices) {
            const row = rows[index];
            const facetValues = columns.map((c) => row[c]);
            if (facets.has(facetValues)) {
                facets.get(facetValues).push(index);
            }
            else {
                facets.set(facetValues, [index]);
            }
        }
        return Array.from(facets.values());
    }
}
exports.facetRows = facetRows;
/**
 * The class is responsible for rendering the visual part of the chart (coordinates, elements such as glyph marks e.t.c).
 * The module calls methods {@link MarkClass.getGraphics} implemented in each marks (rect, image, text, symbol e.t.c)
 *
 */
class ChartRenderer {
    constructor(manager, renderEvents) {
        this.manager = manager;
        this.renderEvents = renderEvents;
        this.manager = manager;
    }
    /**
     * Render marks in a glyph
     * @returns an array of groups with the same size as glyph.marks
     */
    renderGlyphMarks(plotSegment, plotSegmentState, coordinateSystem, offset, glyph, state, index) {
        return common_1.zipArray(glyph.marks, state.marks).map(([mark, markState]) => {
            if (!mark.properties.visible) {
                return null;
            }
            const cls = this.manager.getMarkClass(markState);
            const g = cls.getGraphics(coordinateSystem, offset, index, this.manager, state.emphasized);
            if (g != null) {
                g.selectable = {
                    plotSegment,
                    glyphIndex: index,
                    rowIndices: plotSegmentState.dataRowIndices[index],
                    enableTooltips: cls.object.properties.enableTooltips,
                    enableContextMenu: cls.object.properties.enableContextMenu,
                    enableSelection: cls.object.properties.enableSelection,
                };
                return elements_1.makeGroup([g]);
            }
            else {
                return null;
            }
        });
    }
    /**
     * Method calls getGraphics method of {@link Mark} objects to get graphical representation of element
     * @param dataset Dataset of charticulator
     * @param chart Chart object
     * @param chartState State of chart and chart elements
     */
    // eslint-disable-next-line
    renderChart(
    // eslint-disable-next-line
    dataset, chart, chartState) {
        const graphics = [];
        // Chart background
        const bg = this.manager.getChartClass(chartState).getBackgroundGraphics();
        if (bg) {
            graphics.push(bg);
        }
        const linkGroup = elements_1.makeGroup([]);
        graphics.push(linkGroup);
        const elementsAndStates = common_1.zipArray(chart.elements, chartState.elements);
        // Render layout graphics
        for (const [element, elementState] of elementsAndStates) {
            if (!element.properties.visible) {
                continue;
            }
            // Render marks if this is a plot segment
            if (Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                const plotSegmentState = elementState;
                const mark = common_1.getById(chart.glyphs, plotSegment.glyph);
                const plotSegmentClass = this.manager.getPlotSegmentClass(plotSegmentState);
                const coordinateSystem = plotSegmentClass.getCoordinateSystem();
                // Render glyphs
                const glyphArrays = [];
                for (const [glyphIndex, glyphState,] of plotSegmentState.glyphs.entries()) {
                    const anchorX = glyphState.marks[0].attributes.x;
                    const anchorY = glyphState.marks[0].attributes.y;
                    const offsetX = glyphState.attributes.x - anchorX;
                    const offsetY = glyphState.attributes.y - anchorY;
                    const g = this.renderGlyphMarks(plotSegment, plotSegmentState, coordinateSystem, { x: offsetX, y: offsetY }, mark, glyphState, glyphIndex);
                    glyphArrays.push(g);
                }
                // Transpose glyphArrays so each mark is in a layer
                const glyphElements = common_1.transpose(glyphArrays).map((x) => elements_1.makeGroup(x));
                const gGlyphs = elements_1.makeGroup(glyphElements);
                gGlyphs.transform = coordinateSystem.getBaseTransform();
                const g = plotSegmentClass.getPlotSegmentGraphics(gGlyphs, this.manager);
                // render plotsegment background elements
                const gBackgroundElements = elements_1.makeGroup([]);
                const plotSegmentBackgroundElements = plotSegmentClass.getPlotSegmentBackgroundGraphics(this.manager);
                gBackgroundElements.elements.push(plotSegmentBackgroundElements);
                const gElement = elements_1.makeGroup([]);
                gElement.elements.push(gBackgroundElements);
                gElement.elements.push(g);
                gElement.key = element._id;
                graphics.push(gElement);
            }
            else if (Prototypes.isType(element.classID, "mark")) {
                const cs = new coordinate_system_1.CartesianCoordinates({ x: 0, y: 0 });
                const gElement = elements_1.makeGroup([]);
                const elementClass = this.manager.getMarkClass(elementState);
                const g = elementClass.getGraphics(cs, { x: 0, y: 0 }, null, this.manager);
                gElement.elements.push(g);
                gElement.key = element._id;
                graphics.push(gElement);
            }
            else {
                const gElement = elements_1.makeGroup([]);
                const elementClass = this.manager.getChartElementClass(elementState);
                const g = elementClass.getGraphics(this.manager);
                gElement.elements.push(g);
                gElement.key = element._id;
                graphics.push(gElement);
            }
        }
        const chartEventHandlerRect = elements_1.makeRect(chartState.attributes.x1, chartState.attributes.y1, chartState.attributes.x2, chartState.attributes.y2, {
            fillColor: null,
            opacity: 1,
        });
        // don't need to handle other events by chart.
        if (chart.properties.enableContextMenu) {
            chartEventHandlerRect.selectable = {
                plotSegment: null,
                glyphIndex: null,
                rowIndices: null,
                enableTooltips: false,
                enableContextMenu: chart.properties.enableContextMenu !== undefined
                    ? chart.properties.enableContextMenu
                    : true,
                enableSelection: false,
            };
        }
        return elements_1.makeGroup([chartEventHandlerRect, ...graphics]);
    }
    renderControls(chart, chartState, zoom) {
        const elementsAndStates = common_1.zipArray(chart.elements, chartState.elements);
        let controls = [];
        // Render control graphics
        for (const [element, elementState] of elementsAndStates) {
            if (!element.properties.visible) {
                continue;
            }
            // Render plotsegment controls
            if (Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegmentState = elementState;
                const plotSegmentClass = this.manager.getPlotSegmentClass(plotSegmentState);
                const plotSegmentBackgroundControlElements = plotSegmentClass.renderControls(this.manager, zoom);
                controls = controls.concat(plotSegmentBackgroundControlElements);
            }
        }
        return controls;
    }
    render() {
        var _a;
        const group = this.renderChart(this.manager.dataset, this.manager.chart, this.manager.chartState);
        if ((_a = this.renderEvents) === null || _a === void 0 ? void 0 : _a.afterRendered) {
            this.renderEvents.afterRendered();
        }
        return group;
    }
}
exports.ChartRenderer = ChartRenderer;
__exportStar(require("./text_measurer"), exports);
//# sourceMappingURL=index.js.map
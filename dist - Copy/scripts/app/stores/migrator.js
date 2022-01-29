"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrator = void 0;
const core_1 = require("../../core");
const dataset_1 = require("../../core/dataset");
const migrator_baseline_1 = require("./migrator_baseline");
const specification_1 = require("../../core/specification");
const prototypes_1 = require("../../core/prototypes");
const utils_1 = require("../utils");
const types_1 = require("../../core/specification/types");
const linear_1 = require("../../core/prototypes/scales/linear");
/** Upgrade old versions of chart spec and state to newer version */
class Migrator {
    // eslint-disable-next-line
    migrate(state, targetVersion) {
        // First, fix version if missing
        if (!state.version) {
            // Initially we didn't have the version field, so fix it.
            state.version = "1.0.0";
        }
        // console.log(`Migrate state from ${state.version} to ${targetVersion}`);
        if (core_1.compareVersion(state.version, "1.3.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.3.0") >= 0) {
            // Major change at version 1.3.0: MainStoreState => AppStoreState
            const stateOld = state;
            state = {
                version: stateOld.version,
                dataset: stateOld.dataset.dataset,
                chart: stateOld.chart.chart,
                chartState: stateOld.chart.chartState,
            };
        }
        if (core_1.compareVersion(state.version, "1.1.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.1.0") >= 0) {
            // Major change in spec from 1.1.0: the dataRowIndices are changed from number[] to number[][]
            state = this.fixDataRowIndices(state);
            state = this.fixDataMappingExpressions(state);
        }
        if (core_1.compareVersion(state.version, "1.4.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.4.0") >= 0) {
            // Major change at version 1.4.0: Links are not automatically sorted in rendering now
            state = this.fixLinkOrder_v130(state);
        }
        if (core_1.compareVersion(state.version, "1.5.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.5.0") >= 0) {
            // Minor change at version 1.5.0: Links are not automatically sorted in rendering now
            state = this.addScaleMappings(state);
        }
        if (core_1.compareVersion(state.version, "1.5.1") < 0 &&
            core_1.compareVersion(targetVersion, "1.5.1") >= 0) {
            // Minor change at version 1.5.1: Links are not automatically sorted in rendering now
            state = this.addTableTypes(state);
        }
        if (core_1.compareVersion(state.version, "1.6.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.6.0") >= 0) {
            // Minor change at version 1.6.0: Links are not automatically sorted in rendering now
            state = this.addOriginDataSet(state);
        }
        if (core_1.compareVersion(state.version, "1.7.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.7.0") >= 0) {
            // Minor change at version 1.7.0: Interactivity properties for marks
            state = this.addInteractivityProperties(state);
            // Minor change at version 1.7.0: Guides now have a baseline prop
            state = migrator_baseline_1.upgradeGuidesToBaseline(state);
        }
        if (core_1.compareVersion(state.version, "1.8.0") < 0 &&
            core_1.compareVersion(targetVersion, "1.8.0") >= 0) {
            // Minor change at version 1.8.0: Add default value for property layout in legend
            state = this.setValueToLayoutPropertyOfLegend(state);
        }
        if (core_1.compareVersion(state.version, "2.0.0") < 0 &&
            core_1.compareVersion(targetVersion, "2.0.0") >= 0) {
            // Major change at version 2.0.0: Add default value for property layout in legend
            state = this.setValueItemShapeOfLegend(state);
        }
        if (core_1.compareVersion(state.version, "2.0.1") < 0 &&
            core_1.compareVersion(targetVersion, "2.0.1") >= 0) {
            // Patch change at version 2.0.1: Add polar/angular legend
            state = this.setPolarAngularLegend(state);
        }
        if (core_1.compareVersion(state.version, "2.0.2") < 0 &&
            core_1.compareVersion(targetVersion, "2.0.2") >= 0) {
            state = this.setAllowFlipToMarks(state);
        }
        if (core_1.compareVersion(state.version, "2.0.4") < 0 &&
            core_1.compareVersion(targetVersion, "2.0.4") >= 0) {
            state = this.setMissedProperties(state);
        }
        if (core_1.compareVersion(state.version, "2.1.0") < 0 &&
            core_1.compareVersion(targetVersion, "2.1.0") >= 0) {
            state = this.setMissedGlyphRectProperties(state);
        }
        // After migration, set version to targetVersion
        state.version = targetVersion;
        return state;
    }
    /**
     * Adds enableTooltips, enableSelection, enableContextMenu properties with default balue true
     * @param state current state
     */
    addInteractivityProperties(state) {
        for (const mark of state.chart.elements) {
            mark.properties.enableTooltips = true;
            mark.properties.enableSelection = true;
            mark.properties.enableContextMenu = true;
        }
        for (const glyph of state.chart.glyphs) {
            for (const mark of glyph.marks) {
                mark.properties.enableTooltips = true;
                mark.properties.enableSelection = true;
                mark.properties.enableContextMenu = true;
            }
        }
        return state;
    }
    addOriginDataSet(state) {
        state.originDataset = core_1.deepClone(state.dataset);
        return state;
    }
    addScaleMappings(state) {
        state.chart.scaleMappings = [];
        return state;
    }
    addTableTypes(state) {
        state.dataset.tables[0].type = dataset_1.TableType.Main;
        if (state.dataset.tables[1]) {
            state.dataset.tables[1].type = dataset_1.TableType.Links;
        }
        // TODO append current mappings
        return state;
    }
    fixDataRowIndices(state) {
        // Convert all data row indices in plot segment states to
        for (const [element, elementState] of core_1.zip(state.chart.elements, state.chartState.elements)) {
            if (core_1.Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegmentState = elementState;
                plotSegmentState.dataRowIndices = plotSegmentState.dataRowIndices.map((i) => [i]);
            }
        }
        return state;
    }
    addAggregationToExpression(expr, valueType) {
        if (valueType == "number") {
            return "avg(" + expr + ")";
        }
        else {
            return "first(" + expr + ")";
        }
    }
    fixAxisDataMapping(mapping) {
        if (!mapping) {
            return;
        }
        mapping.expression = this.addAggregationToExpression(mapping.expression, mapping.valueType);
    }
    fixDataMappingExpressions(state) {
        for (const [element] of core_1.zip(state.chart.elements, state.chartState.elements)) {
            if (core_1.Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                this.fixAxisDataMapping(plotSegment.properties.xData);
                this.fixAxisDataMapping(plotSegment.properties.yData);
                if (plotSegment.properties.sublayout) {
                    const sublayout = plotSegment.properties.sublayout;
                    if (sublayout.order) {
                        const parsed = core_1.Expression.parse(sublayout.order);
                        let expr = null;
                        // This is supposed to be in the form of sortBy((x) => x.Column);
                        if (parsed instanceof core_1.Expression.FunctionCall) {
                            if (parsed.name == "sortBy") {
                                if (parsed.args[0] instanceof core_1.Expression.LambdaFunction) {
                                    const lambda = parsed.args[0];
                                    if (lambda.expr instanceof core_1.Expression.FieldAccess) {
                                        const field = lambda.expr;
                                        const column = field.fields[0];
                                        expr = core_1.Expression.functionCall("first", core_1.Expression.variable(column)).toString();
                                    }
                                }
                            }
                        }
                        if (expr) {
                            sublayout.order = { expression: expr };
                        }
                    }
                }
                if (plotSegment.filter) {
                    if (plotSegment.filter.categories.column) {
                        const column = plotSegment.filter.categories.column;
                        delete plotSegment.filter.categories.column;
                        plotSegment.filter.categories.expression = core_1.Expression.variable(column).toString();
                    }
                }
            }
        }
        // Fix data mapping on glyphs/marks
        for (const glyph of state.chart.glyphs) {
            for (const mark of glyph.marks) {
                for (const key in mark.mappings) {
                    // eslint-disable-next-line
                    if (mark.mappings.hasOwnProperty(key)) {
                        const mapping = mark.mappings[key];
                        if (mapping.type == specification_1.MappingType.scale) {
                            const scaleMapping = mapping;
                            scaleMapping.expression = this.addAggregationToExpression(scaleMapping.expression, scaleMapping.valueType);
                        }
                        if (mapping.type == specification_1.MappingType.scale ||
                            mapping.type == specification_1.MappingType.text) {
                            mapping.table = glyph.table;
                        }
                    }
                }
            }
        }
        // Fix axis data mappings for data-axes
        for (const glyph of state.chart.glyphs) {
            for (const mark of glyph.marks) {
                if (core_1.Prototypes.isType(mark.classID, "mark.data-axis")) {
                    const properties = mark.properties;
                    const valueType = properties.axis.valueType;
                    properties.axis.expression = this.addAggregationToExpression(properties.axis.expression, valueType);
                    if (properties.dataExpressions) {
                        properties.dataExpressions = properties.dataExpressions.map((x, index) => ({
                            name: index.toString(),
                            expression: this.addAggregationToExpression(x, valueType),
                        }));
                    }
                }
            }
        }
        return state;
    }
    fixLinkOrder_v130(state) {
        const linkIndices = [];
        const otherIndices = [];
        for (let i = 0; i < state.chart.elements.length; i++) {
            if (core_1.Prototypes.isType(state.chart.elements[i].classID, "links")) {
                linkIndices.push(i);
            }
            else {
                otherIndices.push(i);
            }
        }
        const allIndices = linkIndices.concat(otherIndices);
        state.chart.elements = allIndices.map((i) => state.chart.elements[i]);
        state.chartState.elements = allIndices.map((i) => state.chartState.elements[i]);
        return state;
    }
    setValueToLayoutPropertyOfLegend(state) {
        for (const element of state.chart.elements) {
            if (core_1.Prototypes.isType(element.classID, "legend.categorical") ||
                core_1.Prototypes.isType(element.classID, "legend.custom")) {
                const legend = element;
                if (legend.properties.orientation === undefined) {
                    legend.properties.orientation = "vertical";
                }
            }
        }
        return state;
    }
    setValueItemShapeOfLegend(state) {
        for (const element of state.chart.elements) {
            if (core_1.Prototypes.isType(element.classID, "legend")) {
                const legend = element;
                if (legend.properties.markerShape === undefined) {
                    legend.properties.markerShape = "circle";
                }
            }
        }
        return state;
    }
    setPolarAngularLegend(state) {
        for (let i = 0; i < state.chart.elements.length; i++) {
            const element = state.chart.elements[i];
            if (core_1.Prototypes.isType(element.classID, "legend")) {
                const attrs = state.chartState.elements[i]
                    .attributes;
                // add new properties
                attrs.cx = 0;
                attrs.cy = 0;
                attrs.radius = 0;
                attrs.startAngle = 0;
                attrs.endAngle = 0;
            }
        }
        return state;
    }
    updateAxis(axis) {
        return Object.assign(Object.assign({}, axis), { side: utils_1.replaceUndefinedByNull(axis.side), type: utils_1.replaceUndefinedByNull(axis.type), visible: utils_1.replaceUndefinedByNull(axis.visible), autoDomainMax: utils_1.replaceUndefinedByNull(axis.autoDomainMax), autoDomainMin: utils_1.replaceUndefinedByNull(axis.autoDomainMin), orderMode: utils_1.replaceUndefinedByNull(axis.orderMode), style: utils_1.replaceUndefinedByNull(axis.style), categories: utils_1.replaceUndefinedByNull(axis.categories), dataKind: utils_1.replaceUndefinedByNull(axis.dataKind), domainMax: utils_1.replaceUndefinedByNull(axis.domainMax), domainMin: utils_1.replaceUndefinedByNull(axis.domainMin), enablePrePostGap: utils_1.replaceUndefinedByNull(axis.enablePrePostGap), expression: utils_1.replaceUndefinedByNull(axis.expression), gapRatio: utils_1.replaceUndefinedByNull(axis.gapRatio), numericalMode: utils_1.replaceUndefinedByNull(axis.numericalMode), order: utils_1.replaceUndefinedByNull(axis.order), rawExpression: utils_1.replaceUndefinedByNull(axis.rawExpression), tickDataExpression: utils_1.replaceUndefinedByNull(axis.tickDataExpression), tickFormat: utils_1.replaceUndefinedByNull(axis.tickFormat), valueType: utils_1.replaceUndefinedByNull(axis.valueType), allowScrolling: utils_1.replaceUndefinedByNull(axis.allowScrolling), windowSize: utils_1.replaceUndefinedByNull(axis.windowSize), barOffset: utils_1.replaceUndefinedByNull(axis.barOffset), offset: utils_1.replaceUndefinedByNull(axis.offset), tickFormatType: utils_1.replaceUndefinedByNull(axis.tickFormatType) });
    }
    setMissedProperties(state) {
        for (const item of prototypes_1.forEachObject(state.chart)) {
            if (item.kind == prototypes_1.ObjectItemKind.Chart) {
                item.object.properties.exposed = true;
            }
            if (item.kind == prototypes_1.ObjectItemKind.ChartElement) {
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment.cartesian")) {
                    const element = item.chartElement;
                    if (element.properties.xData) {
                        element.properties.xData = this.updateAxis(element.properties.xData);
                        if (element.properties.xData === undefined) {
                            element.properties.xData = null;
                        }
                    }
                    if (element.properties.yData) {
                        element.properties.yData = this.updateAxis(element.properties.yData);
                        if (element.properties.yData === undefined) {
                            element.properties.yData = null;
                        }
                    }
                }
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment.polar")) {
                    const element = item.chartElement;
                    if (element.properties.xData) {
                        element.properties.xData = this.updateAxis(element.properties.xData);
                    }
                    if (element.properties.xData === undefined) {
                        element.properties.xData = null;
                    }
                    if (element.properties.yData) {
                        element.properties.yData = this.updateAxis(element.properties.yData);
                    }
                    if (element.properties.yData === undefined) {
                        element.properties.yData = null;
                    }
                }
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment.line")) {
                    const element = item.chartElement;
                    if (element.properties.axis) {
                        element.properties.axis = this.updateAxis(element.properties.axis);
                    }
                }
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment.curve")) {
                    const element = item.chartElement;
                    if (element.properties.xData) {
                        element.properties.xData = this.updateAxis(element.properties.xData);
                    }
                    if (element.properties.xData === undefined) {
                        element.properties.xData = null;
                    }
                    if (element.properties.yData) {
                        element.properties.yData = this.updateAxis(element.properties.yData);
                    }
                    if (element.properties.yData === undefined) {
                        element.properties.yData = null;
                    }
                }
                if (core_1.Prototypes.isType(item.chartElement.classID, "mark.data-axis")) {
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    const element = item.chartElement;
                    if (element.properties.axis) {
                        element.properties.axis = this.updateAxis(element.properties.axis);
                    }
                    if (element.properties.axis === undefined) {
                        element.properties.axis = null;
                    }
                }
            }
            if (item.kind == prototypes_1.ObjectItemKind.Mark) {
                if (core_1.Prototypes.isType(item.mark.classID, "mark.data-axis")) {
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    const element = item.mark;
                    if (element.properties.axis) {
                        element.properties.axis = this.updateAxis(element.properties.axis);
                    }
                    if (element.properties.axis === undefined) {
                        element.properties.axis = null;
                    }
                }
            }
        }
        return state;
    }
    setAllowFlipToMarks(state) {
        for (const item of prototypes_1.forEachObject(state.chart)) {
            if (item.kind == "mark") {
                // legend with column names
                if (core_1.Prototypes.isType(item.mark.classID, "mark.rect")) {
                    item.mark.properties.allowFlipping = true;
                }
            }
        }
        return state;
    }
    setMissedGlyphRectProperties(state) {
        for (const item of prototypes_1.forEachObject(state.chart)) {
            if (item.kind == prototypes_1.ObjectItemKind.Mark) {
                if (core_1.Prototypes.isType(item.mark.classID, "mark.rect")) {
                    item.mark.properties.rx = 0;
                    item.mark.properties.ry = 0;
                }
                if (core_1.Prototypes.isType(item.mark.classID, "mark.symbol")) {
                    item.mark.properties.rotation = 0;
                }
            }
            if (item.kind == prototypes_1.ObjectItemKind.ChartElement) {
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment.cartesian")) {
                    const element = item.chartElement;
                    if (element.properties.xData) {
                        element.properties.xData = this.updateAxis(element.properties.xData);
                        if (element.properties.xData === undefined) {
                            element.properties.xData = null;
                        }
                        element.properties.xData.offset = 0;
                        element.properties.xData.tickFormatType = types_1.TickFormatType.None;
                        element.properties.xData.style.showTicks = true;
                    }
                    if (element.properties.yData) {
                        element.properties.yData = this.updateAxis(element.properties.yData);
                        if (element.properties.yData === undefined) {
                            element.properties.yData = null;
                        }
                        element.properties.yData.offset = 0;
                        element.properties.yData.tickFormatType = types_1.TickFormatType.None;
                        element.properties.yData.style.showTicks = true;
                    }
                }
            }
        }
        //updated visibility number options
        const scales = state.chart.scales;
        if (scales) {
            for (let i = 0; i < scales.length; i++) {
                if (scales[i].classID == "scale.linear<number,boolean>") {
                    const scaleProperties = scales[i].properties;
                    if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) && (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) === "interval") {
                        scaleProperties.mode = linear_1.LinearBooleanScaleMode.Between;
                    }
                    if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) && (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) === "greater") {
                        if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) &&
                            (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) == "true") {
                            scaleProperties.mode =
                                linear_1.LinearBooleanScaleMode.GreaterThanOrEqualTo;
                        }
                        if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) &&
                            (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) == "false") {
                            scaleProperties.mode = linear_1.LinearBooleanScaleMode.GreaterThan;
                        }
                    }
                    if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) && (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.mode) === "less") {
                        if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) &&
                            (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) == "true") {
                            scaleProperties.mode = linear_1.LinearBooleanScaleMode.LessThanOrEqualTo;
                        }
                        if ((scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) &&
                            (scaleProperties === null || scaleProperties === void 0 ? void 0 : scaleProperties.inclusive) == "false") {
                            scaleProperties.mode = linear_1.LinearBooleanScaleMode.LessThan;
                        }
                    }
                }
            }
        }
        return state;
    }
}
exports.Migrator = Migrator;
//# sourceMappingURL=migrator.js.map
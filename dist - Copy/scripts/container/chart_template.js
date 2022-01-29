"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable no-prototype-builtins */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartTemplate = void 0;
const core_1 = require("../core");
const prototypes_1 = require("../core/prototypes");
const group_by_1 = require("../core/prototypes/group_by");
const types_1 = require("../core/specification/types");
const specification_1 = require("../core/specification");
const guides_1 = require("../core/prototypes/guides");
const d3_scale_1 = require("d3-scale");
/** Represents a chart template */
class ChartTemplate {
    /** Create a chart template */
    constructor(template) {
        this.template = template;
        this.columnAssignment = {};
        this.tableAssignment = {};
    }
    getDatasetSchema() {
        return this.template.tables;
    }
    /** Reset slot assignments */
    reset() {
        this.columnAssignment = {};
        this.tableAssignment = {};
    }
    /** Assign a table */
    assignTable(tableName, table) {
        this.tableAssignment[tableName] = table;
    }
    /** Assign an expression to a data mapping slot */
    assignColumn(tableName, columnName, column) {
        if (!this.columnAssignment.hasOwnProperty(tableName)) {
            this.columnAssignment[tableName] = {};
        }
        this.columnAssignment[tableName][columnName] = column;
    }
    /** Get variable map for a given table */
    getVariableMap(table) {
        let variableMap = {};
        if (this.columnAssignment[table]) {
            variableMap = Object.assign({}, this.columnAssignment[table]);
        }
        if (this.tableAssignment) {
            variableMap = Object.assign(Object.assign({}, variableMap), this.tableAssignment);
        }
        return variableMap;
    }
    transformExpression(expr, table) {
        return core_1.Expression.parse(expr)
            .replace(core_1.Expression.variableReplacer(this.getVariableMap(table)))
            .toString();
    }
    transformTextExpression(expr, table) {
        return core_1.Expression.parseTextExpression(expr)
            .replace(core_1.Expression.variableReplacer(this.getVariableMap(table)))
            .toString();
    }
    transformGroupBy(groupBy, table) {
        if (!groupBy) {
            return null;
        }
        if (groupBy.expression) {
            return {
                expression: this.transformExpression(groupBy.expression, table),
            };
        }
    }
    /**
     * Creates instance of chart object from template. Chart objecty can be loaded into container to display it in canvas
     * On editing this method ensure that you made correspond changes in template builder ({@link ChartTemplateBuilder}).
     * Any exposed into template objects should be initialized here
     */
    // eslint-disable-next-line
    instantiate(dataset, inference = true) {
        var _a, _b, _c;
        // Make a copy of the chart spec so we won't touch the original template data
        const chart = core_1.deepClone(this.template.specification);
        // Transform table and expressions with current assignments
        for (const item of prototypes_1.forEachObject(chart)) {
            // Replace table with assigned table
            if (item.kind == "chart-element") {
                // legend with column names
                if (core_1.Prototypes.isType(item.chartElement.classID, "legend.custom")) {
                    const scaleMapping = item.chartElement.mappings
                        .mappingOptions;
                    scaleMapping.expression = this.transformExpression(scaleMapping.expression, scaleMapping.table);
                }
                // Guide
                if (core_1.Prototypes.isType(item.chartElement.classID, "guide.guide")) {
                    const valueProp = this.template.properties.filter((p) => p.objectID === item.chartElement._id &&
                        p.target.attribute === guides_1.GuideAttributeNames.value)[0];
                    if (valueProp) {
                        const valueMapping = {
                            type: specification_1.MappingType.value,
                            value: valueProp.default,
                        };
                        item.chartElement.mappings.value = valueMapping;
                    }
                }
                // PlotSegment
                if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment")) {
                    const plotSegment = item.chartElement;
                    const originalTable = plotSegment.table;
                    plotSegment.table = this.tableAssignment[originalTable];
                    // Also fix filter and gropyBy expressions
                    if (plotSegment.filter) {
                        if (plotSegment.filter.categories) {
                            plotSegment.filter.categories.expression = this.transformExpression(plotSegment.filter.categories.expression, originalTable);
                        }
                        if (plotSegment.filter.expression) {
                            plotSegment.filter.expression = this.transformExpression(plotSegment.filter.expression, originalTable);
                        }
                    }
                    if (plotSegment.groupBy) {
                        if (plotSegment.groupBy.expression) {
                            plotSegment.groupBy.expression = this.transformExpression(plotSegment.groupBy.expression, originalTable);
                        }
                    }
                    if (plotSegment.properties.xData) {
                        if (plotSegment.properties.xData.expression) {
                            plotSegment.properties
                                .xData.expression = this.transformExpression(plotSegment.properties.xData.expression, originalTable);
                        }
                        if (plotSegment.properties.xData.rawExpression) {
                            plotSegment.properties
                                .xData.rawExpression = this.transformExpression(plotSegment.properties.xData.rawExpression, originalTable);
                        }
                    }
                    if (plotSegment.properties.yData) {
                        if (plotSegment.properties.yData.expression) {
                            plotSegment.properties
                                .yData.expression = this.transformExpression(plotSegment.properties.yData.expression, originalTable);
                        }
                        if (plotSegment.properties.yData.rawExpression) {
                            plotSegment.properties
                                .yData.rawExpression = this.transformExpression(plotSegment.properties.yData.rawExpression, originalTable);
                        }
                    }
                    if (plotSegment.properties.axis) {
                        if (plotSegment.properties.axis.expression) {
                            plotSegment.properties
                                .axis.expression = this.transformExpression(plotSegment.properties.axis.expression, originalTable);
                        }
                        if (plotSegment.properties.axis.rawExpression) {
                            plotSegment.properties
                                .axis.rawExpression = this.transformExpression(plotSegment.properties.axis.rawExpression, originalTable);
                        }
                    }
                    if (plotSegment.properties.sublayout) {
                        const expression = (_a = plotSegment.properties
                            .sublayout.order) === null || _a === void 0 ? void 0 : _a.expression;
                        if (expression) {
                            plotSegment.properties
                                .sublayout.order.expression = this.transformExpression(expression, originalTable);
                        }
                    }
                }
                // Links
                if (core_1.Prototypes.isType(item.chartElement.classID, "links")) {
                    if (item.chartElement.classID == "links.through") {
                        const props = item.chartElement
                            .properties;
                        if (props.linkThrough.facetExpressions) {
                            props.linkThrough.facetExpressions = props.linkThrough.facetExpressions.map((x) => this.transformExpression(x, core_1.getById(this.template.specification.elements, props.linkThrough.plotSegment).table));
                        }
                    }
                    if (item.chartElement.classID == "links.table") {
                        const props = item.chartElement
                            .properties;
                        props.linkTable.table = this.tableAssignment[props.linkTable.table];
                    }
                }
            }
            // Glyphs
            if (item.kind == "glyph") {
                item.glyph.table = this.tableAssignment[item.glyph.table];
            }
            if (item.kind == "mark") {
                if (core_1.Prototypes.isType(item.mark.classID, "mark.data-axis")) {
                    try {
                        const glyphId = item.glyph._id;
                        const glyphPlotSegment = [...prototypes_1.forEachObject(chart)].find((item) => item.kind == "chart-element" &&
                            core_1.Prototypes.isType(item.chartElement.classID, "plot-segment") &&
                            item.chartElement.glyph === glyphId);
                        const dataExpressions = item.mark.properties
                            .dataExpressions;
                        // table name in plotSegment can be replaced already
                        const table = Object.keys(this.tableAssignment).find((key) => this.tableAssignment[key] ===
                            glyphPlotSegment.chartElement.table) || glyphPlotSegment.chartElement.table;
                        dataExpressions.forEach((expression) => {
                            expression.expression = this.transformExpression(expression.expression, table);
                        });
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
            }
            // Replace data-mapping expressions with assigned columns
            const mappings = item.object.mappings;
            // eslint-disable-next-line
            for (const [attr, mapping] of prototypes_1.forEachMapping(mappings)) {
                if (mapping.type == specification_1.MappingType.scale) {
                    const scaleMapping = mapping;
                    scaleMapping.expression = this.transformExpression(scaleMapping.expression, scaleMapping.table);
                    scaleMapping.table = this.tableAssignment[scaleMapping.table];
                }
                if (mapping.type == specification_1.MappingType.text) {
                    const textMapping = mapping;
                    textMapping.textExpression = this.transformTextExpression(textMapping.textExpression, textMapping.table);
                    textMapping.table = this.tableAssignment[textMapping.table];
                }
            }
        }
        if (!inference) {
            return {
                chart,
                defaultAttributes: this.template.defaultAttributes,
            };
        }
        const df = new core_1.Prototypes.Dataflow.DataflowManager(dataset);
        const getExpressionVector = (expression, table, groupBy) => {
            const expr = core_1.Expression.parse(expression);
            const tableContext = df.getTable(table);
            const indices = groupBy
                ? new group_by_1.CompiledGroupBy(groupBy, df.cache).groupBy(tableContext)
                : core_1.makeRange(0, tableContext.rows.length).map((x) => [x]);
            return indices.map((is) => expr.getValue(tableContext.getGroupedContext(is)));
        };
        // Perform inferences
        for (const inference of this.template.inference) {
            const object = prototypes_1.findObjectById(chart, inference.objectID);
            if (inference.expression) {
                const expr = this.transformExpression(inference.expression.expression, inference.dataSource.table);
                prototypes_1.setProperty(object, inference.expression.property, expr);
            }
            if (inference.axis) {
                const axis = inference.axis;
                if (axis.type == "default") {
                    continue;
                }
                const expression = this.transformExpression(inference.axis.expression, inference.dataSource.table);
                const axisDataBinding = prototypes_1.getProperty(object, axis.property);
                axisDataBinding.expression = expression;
                if (inference.autoDomainMin || inference.autoDomainMax) {
                    // disableAuto flag responsible for disabling/enabling configulration scale domains when new data is coming
                    // If disableAuto is true, the same scales will be used for data
                    // Example: If disableAuto is true, axis values will be same for all new data sets.
                    let vector = getExpressionVector(expression, this.tableAssignment[inference.dataSource.table], this.transformGroupBy(inference.dataSource.groupBy, inference.dataSource.table));
                    if (inference.axis.additionalExpressions) {
                        for (const item of inference.axis.additionalExpressions) {
                            const expr = this.transformExpression(item, inference.dataSource.table);
                            vector = vector.concat(getExpressionVector(expr, this.tableAssignment[inference.dataSource.table], this.transformGroupBy(inference.dataSource.groupBy, inference.dataSource.table)));
                        }
                    }
                    if (axis.type == "categorical") {
                        const scale = new core_1.Scale.CategoricalScale();
                        scale.inferParameters(vector, inference.axis.orderMode || types_1.OrderMode.order);
                        axisDataBinding.categories = new Array(scale.domain.size);
                        const newData = new Array(scale.domain.size);
                        scale.domain.forEach((index, key) => {
                            newData[index] = key;
                        });
                        // try to save given order from template
                        if (axisDataBinding.order &&
                            axisDataBinding.orderMode === types_1.OrderMode.order) {
                            axisDataBinding.order = axisDataBinding.order.filter((value) => scale.domain.has(value));
                            const newItems = newData.filter((category) => !axisDataBinding.order.find((order) => order === category));
                            axisDataBinding.categories = new Array(axisDataBinding.order.length);
                            axisDataBinding.order.forEach((value, index) => {
                                axisDataBinding.categories[index] = value;
                            });
                            axisDataBinding.categories = axisDataBinding.categories.concat(newItems);
                            axisDataBinding.order = axisDataBinding.order.concat(newItems);
                        }
                        else {
                            axisDataBinding.categories = new Array(scale.domain.size);
                            scale.domain.forEach((index, key) => {
                                axisDataBinding.categories[index] = key;
                            });
                        }
                        axisDataBinding.allCategories = core_1.deepClone(axisDataBinding.categories);
                        if (axisDataBinding.allowScrolling) {
                            const start = Math.floor(((axisDataBinding.categories.length -
                                axisDataBinding.windowSize) /
                                100) *
                                axisDataBinding.scrollPosition);
                            axisDataBinding.categories = axisDataBinding.categories.slice(start, start + axisDataBinding.windowSize);
                        }
                    }
                    else if (axis.type == "numerical") {
                        const scale = new core_1.Scale.LinearScale();
                        scale.inferParameters(vector);
                        if (inference.autoDomainMin) {
                            axisDataBinding.dataDomainMin = scale.domainMin;
                            axisDataBinding.domainMin = scale.domainMin;
                        }
                        if (inference.autoDomainMax) {
                            axisDataBinding.dataDomainMax = scale.domainMax;
                            axisDataBinding.domainMax = scale.domainMax;
                        }
                        if (axisDataBinding.allowScrolling) {
                            const scrollScale = d3_scale_1.scaleLinear()
                                .domain([0, 100])
                                .range([
                                axisDataBinding.dataDomainMin,
                                axisDataBinding.dataDomainMax,
                            ]);
                            const start = scrollScale(axisDataBinding.scrollPosition);
                            axisDataBinding.domainMin = start;
                            axisDataBinding.domainMax = start + axisDataBinding.windowSize;
                        }
                        else {
                            if (inference.autoDomainMin) {
                                axisDataBinding.dataDomainMin = scale.domainMin;
                            }
                            if (inference.autoDomainMax) {
                                axisDataBinding.dataDomainMax = scale.domainMax;
                            }
                        }
                        if (axis.defineCategories) {
                            axisDataBinding.categories = core_1.defineCategories(vector);
                        }
                    }
                }
            }
            if (inference.scale) {
                // uses disableAutoMin disableAutoMax for handle old templates
                // copy old parameters to new
                if (inference.autoDomainMin == null &&
                    inference.disableAutoMin != null) {
                    inference.autoDomainMin = !inference.disableAutoMin;
                }
                // copy old parameters to new
                if (inference.autoDomainMax == null &&
                    inference.disableAutoMax != null) {
                    inference.autoDomainMax = !inference.disableAutoMax;
                }
                if (inference.autoDomainMin || inference.autoDomainMax) {
                    const scale = inference.scale;
                    const expressions = scale.expressions.map((x) => this.transformExpression(x, inference.dataSource.table));
                    const vectors = expressions.map((x) => getExpressionVector(x, this.tableAssignment[inference.dataSource.table], this.transformGroupBy(inference.dataSource.groupBy, inference.dataSource.table)));
                    if (inference.autoDomainMin &&
                        object.properties.domainMin !== undefined) {
                        vectors.push([object.properties.domainMin]);
                    }
                    if (inference.autoDomainMax &&
                        object.properties.domainMax != undefined) {
                        vectors.push([object.properties.domainMax]);
                    }
                    const vector = vectors.reduce((a, b) => a.concat(b), []);
                    const scaleClass = core_1.Prototypes.ObjectClasses.Create(null, object, {
                        attributes: {},
                    });
                    if (object.classID === "scale.categorical<string,color>") {
                        scaleClass.inferParameters(vector, {
                            reuseRange: true,
                            extendScaleMin: true,
                            extendScaleMax: true,
                        });
                    }
                    else {
                        scaleClass.inferParameters(vector, {
                            extendScaleMax: inference.autoDomainMax,
                            extendScaleMin: inference.autoDomainMin,
                            reuseRange: true,
                            rangeNumber: [
                                (_b = object.mappings.rangeMin) === null || _b === void 0 ? void 0 : _b.value,
                                (_c = object.mappings.rangeMax) === null || _c === void 0 ? void 0 : _c.value,
                            ],
                        });
                    }
                }
            }
            if (inference.nestedChart) {
                const { nestedChart } = inference;
                const columnNameMap = {};
                Object.keys(nestedChart.columnNameMap).forEach((key) => {
                    const newKey = this.columnAssignment[inference.dataSource.table][key];
                    columnNameMap[newKey] = nestedChart.columnNameMap[key];
                });
                prototypes_1.setProperty(object, "columnNameMap", columnNameMap);
            }
        }
        return {
            chart,
            defaultAttributes: this.template.defaultAttributes,
        };
    }
    static SetChartProperty(chart, objectID, property, value) {
        const obj = core_1.Prototypes.findObjectById(chart, objectID);
        if (!obj) {
            return;
        }
        core_1.Prototypes.setProperty(obj, property, value);
    }
    static GetChartProperty(chart, objectID, property) {
        const obj = core_1.Prototypes.findObjectById(chart, objectID);
        if (!obj) {
            return null;
        }
        return core_1.Prototypes.getProperty(obj, property);
    }
    static SetChartAttributeMapping(chart, objectID, attribute, value) {
        const obj = core_1.Prototypes.findObjectById(chart, objectID);
        if (!obj) {
            return;
        }
        obj.mappings[attribute] = value;
    }
    static GetChartAttributeMapping(chart, objectID, attribute) {
        const obj = core_1.Prototypes.findObjectById(chart, objectID);
        if (!obj) {
            return null;
        }
        return obj.mappings[attribute];
    }
}
exports.ChartTemplate = ChartTemplate;
//# sourceMappingURL=chart_template.js.map
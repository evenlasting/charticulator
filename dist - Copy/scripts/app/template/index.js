"use strict";
/**
 * The {@link ChartTemplateBuilder} creates tempate ({@link ChartTemplate}) from the current chart.
 * {@link ChartTemplate} contains simplified version of {@link Chart} object in {@link ChartTemplate.specification} property.
 * Tempate can be exported as *.tmplt file (JSON format). It also uses on export to HTML file or on export as Power BI visual.
 *
 * Template can be loaded into container outside of Charticulator app to visualize with custom dataset.
 *
 * @packageDocumentation
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartTemplateBuilder = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const core_1 = require("../../core");
const dataset_1 = require("../../core/dataset");
const prototypes_1 = require("../../core/prototypes");
const specification_1 = require("../../core/specification");
/** Class builds the template from given {@link Specification.Chart} object  */
class ChartTemplateBuilder {
    constructor(chart, dataset, manager, version) {
        this.chart = chart;
        this.dataset = dataset;
        this.manager = manager;
        this.version = version;
        this.usedColumns = {};
    }
    reset() {
        this.template = {
            specification: core_1.deepClone(this.chart),
            defaultAttributes: {},
            tables: [],
            inference: [],
            properties: [],
            version: this.version,
        };
        this.tableColumns = {};
        this.objectVisited = {};
    }
    addTable(table) {
        // eslint-disable-next-line
        if (!this.tableColumns.hasOwnProperty(table)) {
            this.tableColumns[table] = new Set();
        }
    }
    addColumn(table, columnName) {
        if (table == null) {
            table = this.dataset.tables[0].name;
        }
        const tableObject = core_1.getByName(this.dataset.tables, table);
        if (tableObject) {
            const column = core_1.getByName(tableObject.columns, columnName);
            if (column) {
                if (column.metadata.isRaw) {
                    const notRawColumn = tableObject.columns.find((col) => col.metadata.rawColumnName === column.name);
                    // eslint-disable-next-line
                    if (this.tableColumns.hasOwnProperty(table)) {
                        this.tableColumns[table].add(notRawColumn.name);
                    }
                    else {
                        this.tableColumns[table] = new Set([notRawColumn.name]);
                    }
                }
                // eslint-disable-next-line
                if (this.tableColumns.hasOwnProperty(table)) {
                    this.tableColumns[table].add(columnName);
                }
                else {
                    this.tableColumns[table] = new Set([columnName]);
                }
            }
        }
    }
    addColumnsFromExpression(table, expr, textExpression) {
        if (expr) {
            let ex;
            if (textExpression) {
                ex = core_1.Expression.parseTextExpression(expr);
            }
            else {
                ex = core_1.Expression.parse(expr);
            }
            ex.replace((e) => {
                if (e instanceof core_1.Expression.Variable) {
                    this.addColumn(table, e.name);
                }
            });
        }
    }
    propertyToString(property) {
        let pn;
        if (typeof property == "string" || typeof property == "number") {
            pn = property.toString();
        }
        else {
            pn = property.property;
            if (property.field) {
                if (typeof property.field == "string" ||
                    typeof property.field == "number") {
                    pn += "." + property.field.toString();
                }
                else {
                    pn += "." + property.field.join(".");
                }
            }
            if (property.subfield) {
                if (typeof property.subfield == "string" ||
                    typeof property.subfield == "number") {
                    pn += "." + property.subfield.toString();
                }
                else {
                    pn += "." + property.subfield.join(".");
                }
            }
        }
        return pn;
    }
    // eslint-disable-next-line
    addObject(table, objectClass) {
        // Visit a object only once
        if (this.objectVisited[objectClass.object._id]) {
            return;
        }
        this.objectVisited[objectClass.object._id] = true;
        const template = this.template;
        // Get template inference data
        const params = objectClass.getTemplateParameters();
        if (params && params.inferences) {
            for (const inference of params.inferences) {
                if (inference.axis) {
                    this.addColumnsFromExpression(inference.dataSource.table, inference.axis.expression);
                }
                if (inference.scale) {
                    // Find all objects that use the scale
                    const expressions = new Set();
                    let table = null;
                    let groupBy = null;
                    for (const item of core_1.Prototypes.forEachObject(this.template.specification)) {
                        for (const [, mapping] of core_1.Prototypes.forEachMapping(item.object.mappings)) {
                            if (mapping.type == specification_1.MappingType.scale) {
                                const scaleMapping = mapping;
                                if (scaleMapping.scale == inference.objectID) {
                                    expressions.add(scaleMapping.expression);
                                    if (item.kind == "glyph" || item.kind == "mark") {
                                        table = item.glyph.table;
                                        // Find the plot segment
                                        for (const ps of core_1.Prototypes.forEachObject(this.template.specification)) {
                                            if (ps.kind == "chart-element" &&
                                                core_1.Prototypes.isType(ps.object.classID, "plot-segment") &&
                                                item.glyph._id === ps.chartElement.glyph) {
                                                groupBy = ps.chartElement
                                                    .groupBy;
                                                break; // TODO: for now, we assume it's the first one
                                            }
                                        }
                                    }
                                    else if (item.kind == "chart-element" &&
                                        core_1.Prototypes.isType(item.chartElement.classID, "legend.custom")) {
                                        // don't add column names legend expression into inferences
                                        expressions.delete(scaleMapping.expression);
                                    }
                                    else if (item.kind == "chart-element" &&
                                        core_1.Prototypes.isType(item.chartElement.classID, "links")) {
                                        const linkTable = item.object.properties.linkTable;
                                        const defaultTable = this.dataset.tables[0];
                                        table = (linkTable && linkTable.table) || defaultTable.name;
                                    }
                                    else {
                                        table = this.dataset.tables.find((table) => table.type === dataset_1.TableType.Main).name;
                                    }
                                }
                            }
                        }
                    }
                    if (expressions.size == 0) {
                        // Scale not used
                        continue;
                    }
                    inference.scale.expressions = Array.from(expressions);
                    if (!inference.dataSource) {
                        inference.dataSource = {
                            table,
                            groupBy,
                        };
                    }
                }
                if (inference.expression) {
                    this.addColumnsFromExpression(inference.dataSource.table, inference.expression.expression);
                }
                if (inference.nestedChart) {
                    const { nestedChart } = inference;
                    Object.keys(nestedChart.columnNameMap).forEach((key) => {
                        this.addColumn(inference.dataSource.table, key);
                    });
                }
                if (inference.axis) {
                    const templateObject = core_1.Prototypes.findObjectById(this.chart, inference.objectID);
                    if (templateObject.properties[inference.axis.property].autoDomainMin !== "undefined") {
                        inference.autoDomainMin = templateObject.properties[inference.axis.property].autoDomainMin;
                    }
                    if (templateObject.properties[inference.axis.property].autoDomainMax !== "undefined") {
                        inference.autoDomainMax = templateObject.properties[inference.axis.property].autoDomainMax;
                    }
                    if (inference.autoDomainMax === undefined) {
                        inference.autoDomainMax = true;
                    }
                    if (inference.autoDomainMax === undefined) {
                        inference.autoDomainMax = true;
                    }
                }
                template.inference.push(inference);
            }
        }
        if (params && params.properties) {
            for (const property of params.properties) {
                // Make a default display name
                let pn = "";
                if (property.target.property) {
                    pn = this.propertyToString(property.target.property);
                }
                else if (property.target.attribute) {
                    pn = property.target.attribute;
                }
                property.displayName = objectClass.object.properties.name + "/" + pn;
                template.properties.push(property);
            }
        }
        // Add filter
        const plotSegmentObj = objectClass.object;
        if (core_1.Prototypes.isType(plotSegmentObj.classID, "plot-segment")) {
            this.addTable(plotSegmentObj.table);
            const filter = plotSegmentObj.filter;
            if (filter) {
                const { categories, expression } = filter;
                if (expression) {
                    this.addColumnsFromExpression(table, expression);
                }
                if (categories) {
                    this.addColumnsFromExpression(table, categories.expression);
                }
            }
            const groupBy = plotSegmentObj.groupBy;
            if (groupBy && groupBy.expression) {
                this.addColumnsFromExpression(table, groupBy.expression);
            }
        }
        // Get mappings
        for (const [, mapping] of core_1.Prototypes.forEachMapping(objectClass.object.mappings)) {
            if (mapping.type == specification_1.MappingType.scale) {
                const scaleMapping = mapping;
                this.addColumnsFromExpression(scaleMapping.table, scaleMapping.expression);
            }
            if (mapping.type == specification_1.MappingType.text) {
                const textMapping = mapping;
                this.addColumnsFromExpression(textMapping.table, textMapping.textExpression, true);
            }
        }
    }
    /**
     * Builds template.
     * All exposed objects should be initialized in {@link ChartTemplate} class
     * @returns JSON structure of template
     */
    // eslint-disable-next-line
    build() {
        var _a, _b, _c, _d, _e;
        this.reset();
        const template = this.template;
        for (const elementClass of this.manager.getElements()) {
            let table = null;
            if (core_1.Prototypes.isType(elementClass.object.classID, "plot-segment")) {
                const plotSegment = elementClass.object;
                table = plotSegment.table;
            }
            if (core_1.Prototypes.isType(elementClass.object.classID, "links")) {
                if (core_1.Prototypes.isType(elementClass.object.classID, "links.through")) {
                    const facetExpressions = elementClass.object.properties
                        .linkThrough.facetExpressions;
                    const mainTable = this.dataset.tables.find((table) => table.type === dataset_1.TableType.Main);
                    this.addTable(mainTable.name);
                    for (const expression of facetExpressions) {
                        this.addColumn(mainTable.name, expression);
                    }
                }
                const linkTable = elementClass.object.properties
                    .linkTable;
                if (linkTable) {
                    const linksTableName = linkTable.table;
                    this.addTable(linksTableName); // TODO get table by type
                    const linksTable = this.dataset.tables.find((table) => table.name === linksTableName);
                    linksTable.columns.forEach((linksColumn) => this.addColumn(linksTableName, linksColumn.name));
                    const table = this.dataset.tables[0];
                    const idColumn = table && table.columns.find((column) => column.name === "id");
                    if (idColumn) {
                        this.addColumn(table.name, idColumn.name);
                    }
                }
            }
            this.addObject(table, elementClass);
            if (core_1.Prototypes.isType(elementClass.object.classID, "plot-segment")) {
                const plotSegmentState = elementClass.state;
                for (const glyph of plotSegmentState.glyphs) {
                    this.addObject(table, this.manager.getClass(glyph));
                    for (const mark of glyph.marks) {
                        this.addObject(table, this.manager.getClass(mark));
                    }
                    // Only one glyph is enough.
                    break;
                }
            }
        }
        for (const scaleState of this.manager.chartState.scales) {
            this.addObject(null, this.manager.getClass(scaleState));
        }
        this.addObject(null, this.manager.getChartClass(this.manager.chartState));
        // need to foreach objects to find all used columns
        try {
            for (const item of prototypes_1.forEachObject(this.manager.chart)) {
                if (item.kind == prototypes_1.ObjectItemKind.ChartElement) {
                    if (core_1.Prototypes.isType(item.chartElement.classID, "legend.custom")) {
                        const scaleMapping = item.chartElement.mappings
                            .mappingOptions;
                        scaleMapping.expression = this.trackColumnFromExpression(scaleMapping.expression, scaleMapping.table);
                    }
                    if (core_1.Prototypes.isType(item.chartElement.classID, "plot-segment")) {
                        const plotSegment = item.chartElement;
                        // need to parse all expression to get column name
                        const originalTable = plotSegment.table;
                        const filter = plotSegment.filter;
                        if (filter && filter.expression) {
                            this.trackColumnFromExpression(filter.expression, originalTable);
                        }
                        const groupBy = plotSegment.groupBy;
                        if (groupBy && groupBy.expression) {
                            this.trackColumnFromExpression(groupBy.expression, originalTable);
                        }
                        const xAxisExpression = (_a = plotSegment.properties.xData) === null || _a === void 0 ? void 0 : _a.expression;
                        if (xAxisExpression) {
                            this.trackColumnFromExpression(xAxisExpression, originalTable);
                        }
                        const yAxisExpression = (_b = plotSegment.properties.yData) === null || _b === void 0 ? void 0 : _b.expression;
                        if (yAxisExpression) {
                            this.trackColumnFromExpression(yAxisExpression, originalTable);
                        }
                        const axisExpression = (_c = plotSegment.properties.axis) === null || _c === void 0 ? void 0 : _c.expression;
                        if (axisExpression) {
                            this.trackColumnFromExpression(axisExpression, originalTable);
                        }
                        const sublayout = (_e = (_d = plotSegment.properties
                            .sublayout) === null || _d === void 0 ? void 0 : _d.order) === null || _e === void 0 ? void 0 : _e.expression;
                        if (sublayout) {
                            this.trackColumnFromExpression(sublayout, originalTable);
                        }
                    }
                    if (core_1.Prototypes.isType(item.chartElement.classID, "links")) {
                        if (item.chartElement.classID == "links.through") {
                            const props = item.chartElement
                                .properties;
                            if (props.linkThrough.facetExpressions) {
                                props.linkThrough.facetExpressions = props.linkThrough.facetExpressions.map((x) => this.trackColumnFromExpression(x, core_1.getById(this.template.specification.elements, props.linkThrough.plotSegment).table));
                            }
                        }
                        if (item.chartElement.classID == "links.table") {
                            const props = item.chartElement
                                .properties;
                            if (!this.usedColumns[props.linkTable.table]) {
                                this.trackTable(props.linkTable.table);
                            }
                        }
                    }
                }
                if (item.kind == "glyph") {
                    if (!this.usedColumns[item.glyph.table]) {
                        this.trackTable(item.glyph.table);
                    }
                }
                if (item.kind === prototypes_1.ObjectItemKind.Mark) {
                    if (core_1.Prototypes.isType(item.mark.classID, "mark.nested-chart")) {
                        const nestedChart = item.mark;
                        const columnNameMap = Object.keys(nestedChart.properties.columnNameMap);
                        const mainTable = this.usedColumns[this.manager.dataset.tables.find((t) => t.type === dataset_1.TableType.Main)
                            .name];
                        columnNameMap.forEach((columnNames) => (mainTable[columnNames] = columnNames));
                    }
                    if (core_1.Prototypes.isType(item.mark.classID, "mark.data-axis")) {
                        try {
                            const glyphId = item.glyph._id;
                            const glyphPlotSegment = [
                                ...prototypes_1.forEachObject(this.manager.chart),
                            ].find((item) => item.kind == prototypes_1.ObjectItemKind.ChartElement &&
                                core_1.Prototypes.isType(item.chartElement.classID, "plot-segment") &&
                                item.chartElement.glyph === glyphId);
                            const dataExpressions = item.mark.properties
                                .dataExpressions;
                            const table = glyphPlotSegment.chartElement.table;
                            dataExpressions.forEach((expression) => {
                                expression.expression = this.trackColumnFromExpression(expression.expression, table);
                            });
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                }
                const mappings = item.object.mappings;
                // eslint-disable-next-line
                for (const [attr, mapping] of prototypes_1.forEachMapping(mappings)) {
                    if (mapping.type == specification_1.MappingType.scale) {
                        const scaleMapping = mapping;
                        scaleMapping.expression = this.trackColumnFromExpression(scaleMapping.expression, scaleMapping.table);
                        if (!this.usedColumns[scaleMapping.table]) {
                            this.trackTable(scaleMapping.table);
                        }
                    }
                    if (mapping.type == specification_1.MappingType.text) {
                        const textMapping = mapping;
                        if (!this.usedColumns[textMapping.table]) {
                            this.trackTable(textMapping.table);
                        }
                        textMapping.textExpression = this.trackColumnFromExpression(textMapping.textExpression, textMapping.table, true);
                    }
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
        // Extract data tables
        // if usedColumns count is 0, error was happened, add all columns as used
        const noUsedColumns = Object.keys(this.usedColumns).length === 0;
        template.tables = this.dataset.tables
            .map((table) => {
            if (
            // eslint-disable-next-line
            this.tableColumns.hasOwnProperty(table.name) &&
                (this.usedColumns[table.name] || noUsedColumns)) {
                return {
                    name: table.name,
                    type: table.type,
                    columns: table.columns
                        .filter((x) => {
                        var _a;
                        return ((this.tableColumns[table.name].has(x.name) && ((_a = this.usedColumns[table.name]) === null || _a === void 0 ? void 0 : _a[x.name])) ||
                            core_1.isReservedColumnName(x.name));
                    })
                        .map((x) => ({
                        displayName: x.displayName || x.name,
                        name: x.name,
                        type: x.type,
                        metadata: x.metadata,
                    })),
                };
            }
            else {
                return null;
            }
        })
            .filter((x) => x != null);
        this.computeDefaultAttributes();
        return template;
    }
    trackColumnFromExpression(expr, table, isText = false) {
        if (isText) {
            return core_1.Expression.parseTextExpression(expr)
                .replace(core_1.Expression.variableReplacer(this.trackTable(table)))
                .toString();
        }
        return core_1.Expression.parse(expr)
            .replace(core_1.Expression.variableReplacer(this.trackTable(table)))
            .toString();
    }
    trackTable(table) {
        if (!this.usedColumns[table]) {
            this.usedColumns[table] = {
                hasOwnProperty: (v) => {
                    this.usedColumns[table][v] = v;
                    return true;
                },
            };
        }
        return this.usedColumns[table];
    }
    /**
     * Computes the default attributes
     */
    computeDefaultAttributes() {
        const counts = {};
        // Go through all the mark instances
        this.manager.enumerateClassesByType("mark", (cls, state) => {
            const { _id } = cls.object;
            // Basic idea is sum up the attributes for each mark object, and then average them at the end
            const totals = (this.template.defaultAttributes[_id] =
                this.template.defaultAttributes[_id] || {});
            Object.keys(state.attributes).forEach((attribute) => {
                // Only support numbers for now
                if (cls.attributes[attribute] &&
                    cls.attributes[attribute].type === "number") {
                    totals[attribute] = totals[attribute] || 0;
                    totals[attribute] += state.attributes[attribute] || 0;
                    counts[_id] = (counts[_id] || 0) + 1;
                }
            });
        });
        // The default attributes are currently totals, now divide each attribute by the count to average them
        Object.keys(this.template.defaultAttributes).forEach((objId) => {
            const attribs = this.template.defaultAttributes[objId];
            Object.keys(attribs).forEach((attribute) => {
                attribs[attribute] = attribs[attribute] / counts[objId];
            });
        });
    }
}
exports.ChartTemplateBuilder = ChartTemplateBuilder;
//# sourceMappingURL=index.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppStore = exports.EditorType = void 0;
const core_1 = require("../../core");
const base_1 = require("../../core/store/base");
const actions_1 = require("../actions");
const indexed_db_1 = require("../backend/indexed_db");
const template_1 = require("../template");
const utils_1 = require("../utils");
const chart_display_1 = require("../views/canvas/chart_display");
const action_handlers_1 = require("./action_handlers");
const defaults_1 = require("./defaults");
const history_manager_1 = require("./history_manager");
const migrator_1 = require("./migrator");
const selection_1 = require("./selection");
const dataset_1 = require("../../core/dataset");
const specification_1 = require("../../core/specification");
const types_1 = require("../../core/specification/types");
const numerical_legend_1 = require("../../core/prototypes/legends/numerical_legend");
const plot_segments_1 = require("../../core/prototypes/plot_segments");
const prototypes_1 = require("../../core/prototypes");
const base_2 = require("../../core/prototypes/plot_segments/region_2d/base");
const data_types_1 = require("../../core/dataset/data_types");
var EditorType;
(function (EditorType) {
    EditorType["Nested"] = "nested";
    EditorType["Embedded"] = "embedded";
    EditorType["NestedEmbedded"] = "nestedembedded";
    EditorType["Chart"] = "chart";
})(EditorType = exports.EditorType || (exports.EditorType = {}));
class AppStore extends base_1.BaseStore {
    constructor(worker, dataset) {
        super(null);
        /** Is this app a nested chart editor? */
        this.editorType = EditorType.Chart;
        /** Should we disable the FileView */
        this.disableFileView = false;
        this.selectedGlyphIndex = {};
        this.localeFileFormat = {
            delimiter: ",",
            numberFormat: {
                remove: ",",
                decimal: ".",
            },
            currency: '["$", ""]',
            group: "[3]",
        };
        this.actionHandlers = new action_handlers_1.ActionHandlerRegistry();
        this.propertyExportName = new Map();
        this.registeredExportTemplateTargets = new Map();
        this.preSolveValues = [];
        this.getDataKindByType = (type) => {
            switch (type) {
                case types_1.AxisDataBindingType.Categorical:
                    return specification_1.DataKind.Categorical;
                case types_1.AxisDataBindingType.Numerical:
                    return specification_1.DataKind.Numerical;
                case types_1.AxisDataBindingType.Default:
                    return specification_1.DataKind.Categorical;
                default:
                    return specification_1.DataKind.Categorical;
            }
        };
        /** Register action handlers */
        action_handlers_1.registerActionHandlers(this.actionHandlers);
        this.worker = worker;
        this.backend = new indexed_db_1.IndexedDBBackend();
        this.historyManager = new history_manager_1.HistoryManager();
        this.dataset = dataset;
        this.newChartEmpty();
        this.solveConstraintsAndUpdateGraphics();
        this.messageState = new Map();
        this.registerExportTemplateTarget("Charticulator Template", (template) => {
            return {
                getProperties: () => {
                    var _a;
                    return [
                        {
                            displayName: "Name",
                            name: "name",
                            type: "string",
                            default: ((_a = template.specification.properties) === null || _a === void 0 ? void 0 : _a.name) || "template",
                        },
                    ];
                },
                getFileName: (props) => `${props.name}.tmplt`,
                generate: () => {
                    return new Promise((resolve) => {
                        const r = utils_1.b64EncodeUnicode(JSON.stringify(template, null, 2));
                        resolve(r);
                    });
                },
            };
        });
    }
    setPropertyExportName(propertyName, value) {
        this.propertyExportName.set(`${propertyName}`, value);
    }
    getPropertyExportName(propertyName) {
        return this.propertyExportName.get(`${propertyName}`);
    }
    saveState() {
        return {
            version: CHARTICULATOR_PACKAGE.version,
            dataset: this.dataset,
            chart: this.chart,
            chartState: this.chartState,
        };
    }
    saveDecoupledState() {
        const state = this.saveState();
        return core_1.deepClone(state);
    }
    loadState(state) {
        this.currentSelection = null;
        this.selectedGlyphIndex = {};
        this.dataset = state.dataset;
        this.originDataset = state.dataset;
        this.chart = state.chart;
        this.chartState = state.chartState;
        this.version = state.version;
        this.chartManager = new core_1.Prototypes.ChartStateManager(this.chart, this.dataset, this.chartState, {}, {}, this.chartManager.getOriginChart());
        this.chartManager.onUpdate(() => {
            this.solveConstraintsAndUpdateGraphics();
        });
        this.emit(AppStore.EVENT_DATASET);
        this.emit(AppStore.EVENT_GRAPHICS);
        this.emit(AppStore.EVENT_SELECTION);
    }
    saveHistory() {
        this.historyManager.addState(this.saveDecoupledState());
        try {
            this.emit(AppStore.EVENT_GRAPHICS);
        }
        catch (ex) {
            console.error(ex);
        }
    }
    renderSVG() {
        const svg = '<?xml version="1.0" standalone="no"?>' +
            chart_display_1.renderChartToString(this.dataset, this.chart, this.chartState);
        return svg;
    }
    renderLocalSVG() {
        return __awaiter(this, void 0, void 0, function* () {
            const svg = yield chart_display_1.renderChartToLocalString(this.dataset, this.chart, this.chartState);
            return '<?xml version="1.0" standalone="no"?>' + svg;
        });
    }
    handleAction(action) {
        this.actionHandlers.handleAction(this, action);
    }
    backendOpenChart(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chart = yield this.backend.get(id);
            this.currentChartID = id;
            this.historyManager.clear();
            const state = new migrator_1.Migrator().migrate(chart.data.state, CHARTICULATOR_PACKAGE.version);
            this.loadState(state);
            (_a = this.chartManager) === null || _a === void 0 ? void 0 : _a.resetDifference();
        });
    }
    // removes unused scale objecs
    updateChartState() {
        function hasMappedProperty(mappings, scaleId) {
            for (const map in mappings) {
                if (mappings[map].type === specification_1.MappingType.scale ||
                    mappings[map].type === specification_1.MappingType.expressionScale) {
                    if (mappings[map].scale === scaleId) {
                        return true;
                    }
                }
            }
            return false;
        }
        const chart = this.chart;
        function scaleFilter(scale) {
            return !(chart.elements.find((element) => {
                const mappings = element.mappings;
                if (mappings) {
                    return hasMappedProperty(mappings, scale._id);
                }
                return false;
            }) != null ||
                chart.glyphs.find((glyph) => {
                    return (glyph.marks.find((mark) => {
                        const mappings = mark.mappings;
                        if (mappings) {
                            return hasMappedProperty(mappings, scale._id);
                        }
                        return false;
                    }) != null);
                }));
        }
        chart.scales
            .filter(scaleFilter)
            .forEach((scale) => this.chartManager.removeScale(scale));
        chart.scaleMappings = chart.scaleMappings.filter((scaleMapping) => chart.scales.find((scale) => scale._id === scaleMapping.scale));
    }
    backendSaveChart() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentChartID != null) {
                const chart = yield this.backend.get(this.currentChartID);
                this.updateChartState();
                chart.data.state = this.saveState();
                const svg = utils_1.stringToDataURL("image/svg+xml", yield this.renderLocalSVG());
                const png = yield utils_1.renderDataURLToPNG(svg, {
                    mode: "thumbnail",
                    thumbnail: [200, 150],
                });
                chart.metadata.thumbnail = png.toDataURL();
                yield this.backend.put(chart.id, chart.data, chart.metadata);
                (_a = this.chartManager) === null || _a === void 0 ? void 0 : _a.resetDifference();
                this.emit(AppStore.EVENT_GRAPHICS);
                this.emit(AppStore.EVENT_SAVECHART);
            }
        });
    }
    backendSaveChartAs(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateChartState();
            const state = this.saveState();
            const svg = utils_1.stringToDataURL("image/svg+xml", yield this.renderLocalSVG());
            const png = yield utils_1.renderDataURLToPNG(svg, {
                mode: "thumbnail",
                thumbnail: [200, 150],
            });
            const id = yield this.backend.create("chart", {
                state,
                name,
            }, {
                name,
                dataset: this.dataset.name,
                thumbnail: png.toDataURL(),
            });
            this.currentChartID = id;
            this.emit(AppStore.EVENT_GRAPHICS);
            this.emit(AppStore.EVENT_SAVECHART);
            return id;
        });
    }
    setPageText(pageText) {
        this.pageText = pageText;
    }
    setupNestedEditor(callback, type) {
        this.editorType = type;
        this.disableFileView = true;
        this.emit(AppStore.EVENT_IS_NESTED_EDITOR);
        this.addListener(AppStore.EVENT_NESTED_EDITOR_EDIT, () => {
            this.updateChartState();
            callback(this.chart);
        });
    }
    registerExportTemplateTarget(name, ctor) {
        this.registeredExportTemplateTargets.set(name, ctor);
    }
    unregisterExportTemplateTarget(name) {
        this.registeredExportTemplateTargets.delete(name);
    }
    listExportTemplateTargets() {
        const r = [];
        this.registeredExportTemplateTargets.forEach((x, i) => {
            r.push(i);
        });
        return r;
    }
    createExportTemplateTarget(name, template) {
        return this.registeredExportTemplateTargets.get(name)(template);
    }
    getTable(name) {
        if (this.dataset != null) {
            return this.dataset.tables.filter((d) => d.name == name)[0];
        }
        else {
            return null;
        }
    }
    getTables() {
        return this.dataset.tables;
    }
    getColumnVector(table, columnName) {
        return table.rows.map((d) => d[columnName]);
    }
    saveSelectionState() {
        const selection = {};
        if (this.currentSelection instanceof selection_1.ChartElementSelection) {
            selection.selection = {
                type: "chart-element",
                chartElementID: this.currentSelection.chartElement._id,
            };
        }
        if (this.currentSelection instanceof selection_1.GlyphSelection) {
            selection.selection = {
                type: "glyph",
                glyphID: this.currentSelection.glyph._id,
            };
        }
        if (this.currentSelection instanceof selection_1.MarkSelection) {
            selection.selection = {
                type: "mark",
                glyphID: this.currentSelection.glyph._id,
                markID: this.currentSelection.mark._id,
            };
        }
        if (this.currentGlyph) {
            selection.currentGlyphID = this.currentGlyph._id;
        }
        return selection;
    }
    loadSelectionState(selectionState) {
        if (selectionState == null) {
            return;
        }
        const selection = selectionState.selection;
        if (selection != null) {
            if (selection.type == "chart-element") {
                const chartElement = core_1.getById(this.chart.elements, selection.chartElementID);
                if (chartElement) {
                    this.currentSelection = new selection_1.ChartElementSelection(chartElement);
                }
            }
            if (selection.type == "glyph") {
                const glyphID = selection.glyphID;
                const glyph = core_1.getById(this.chart.glyphs, glyphID);
                const plotSegment = core_1.getById(this.chart.elements, selection.chartElementID);
                if (plotSegment && glyph) {
                    this.currentSelection = new selection_1.GlyphSelection(plotSegment, glyph);
                    this.currentGlyph = glyph;
                }
            }
            if (selection.type == "mark") {
                const glyphID = selection.glyphID;
                const markID = selection.markID;
                const glyph = core_1.getById(this.chart.glyphs, glyphID);
                const plotSegment = core_1.getById(this.chart.elements, selection.chartElementID);
                if (plotSegment && glyph) {
                    const mark = core_1.getById(glyph.marks, markID);
                    if (mark) {
                        this.currentSelection = new selection_1.MarkSelection(plotSegment, glyph, mark);
                        this.currentGlyph = glyph;
                    }
                }
            }
        }
        if (selectionState.currentGlyphID) {
            const glyph = core_1.getById(this.chart.glyphs, selectionState.currentGlyphID);
            if (glyph) {
                this.currentGlyph = glyph;
            }
        }
        this.emit(AppStore.EVENT_SELECTION);
    }
    setSelectedGlyphIndex(plotSegmentID, glyphIndex) {
        this.selectedGlyphIndex[plotSegmentID] = glyphIndex;
    }
    getSelectedGlyphIndex(plotSegmentID) {
        const plotSegment = this.chartManager.getClassById(plotSegmentID);
        if (!plotSegment) {
            return 0;
        }
        // eslint-disable-next-line
        if (this.selectedGlyphIndex.hasOwnProperty(plotSegmentID)) {
            const idx = this.selectedGlyphIndex[plotSegmentID];
            if (idx >= plotSegment.state.dataRowIndices.length) {
                this.selectedGlyphIndex[plotSegmentID] = 0;
                return 0;
            }
            else {
                return idx;
            }
        }
        else {
            this.selectedGlyphIndex[plotSegmentID] = 0;
            return 0;
        }
    }
    getMarkIndex(mark) {
        return this.chart.glyphs.indexOf(mark);
    }
    forAllGlyph(glyph, callback) {
        for (const [element, elementState] of core_1.zipArray(this.chart.elements, this.chartState.elements)) {
            if (core_1.Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                const plotSegmentState = elementState;
                if (plotSegment.glyph == glyph._id) {
                    for (const glyphState of plotSegmentState.glyphs) {
                        callback(glyphState, plotSegment, plotSegmentState);
                    }
                }
            }
        }
    }
    addPresolveValue(strength, state, attr, value) {
        this.preSolveValues.push([strength, state, attr, value]);
    }
    /** Given the current selection, find a reasonable plot segment for a glyph */
    findPlotSegmentForGlyph(glyph) {
        if (this.currentSelection instanceof selection_1.MarkSelection ||
            this.currentSelection instanceof selection_1.GlyphSelection) {
            if (this.currentSelection.glyph == glyph) {
                return this.currentSelection.plotSegment;
            }
        }
        if (this.currentSelection instanceof selection_1.ChartElementSelection) {
            if (core_1.Prototypes.isType(this.currentSelection.chartElement.classID, "plot-segment")) {
                const plotSegment = this.currentSelection
                    .chartElement;
                if (plotSegment.glyph == glyph._id) {
                    return plotSegment;
                }
            }
        }
        for (const elem of this.chart.elements) {
            if (core_1.Prototypes.isType(elem.classID, "plot-segment")) {
                const plotSegment = elem;
                if (plotSegment.glyph == glyph._id) {
                    return plotSegment;
                }
            }
        }
    }
    // eslint-disable-next-line
    scaleInference(context, options) {
        var _a;
        // Figure out the source table
        let tableName = null;
        if (context.glyph) {
            tableName = context.glyph.table;
        }
        if (context.chart) {
            tableName = context.chart.table;
        }
        // Figure out the groupBy
        let groupBy = null;
        if (context.glyph) {
            // Find plot segments that use the glyph.
            this.chartManager.enumeratePlotSegments((cls) => {
                if (cls.object.glyph == context.glyph._id) {
                    groupBy = cls.object.groupBy;
                }
            });
        }
        let table = this.getTable(tableName);
        // compares the ranges of two expression to determine similarity
        const compareDomainRanges = (scaleID, expression) => {
            const scaleClass = this.chartManager.getClassById(scaleID);
            // compare only numerical scales
            if (!core_1.Prototypes.isType(scaleClass.object.classID, "scale.linear<number,number>")) {
                return false;
            }
            const values = this.chartManager.getGroupedExpressionVector(table.name, groupBy, expression);
            const min = Math.min(...values);
            const max = Math.min(...values);
            const domainMin = scaleClass.object.properties.domainMin;
            const domainMax = scaleClass.object.properties.domainMax;
            const domainRange = Math.abs(domainMin - domainMax) * 2;
            if (domainMin - domainRange < min && min < domainMax + domainRange) {
                return true;
            }
            if (domainMin - domainRange < max && max < domainMax + domainRange) {
                return true;
            }
            return false;
        };
        // If there is an existing scale on the same column in the table, return that one
        if (!((_a = options.hints) === null || _a === void 0 ? void 0 : _a.newScale)) {
            const getExpressionUnit = (expr) => {
                const parsed = core_1.Expression.parse(expr);
                // In the case of an aggregation function
                if (parsed instanceof core_1.Expression.FunctionCall) {
                    const args0 = parsed.args[0];
                    if (args0 instanceof core_1.Expression.Variable) {
                        const column = core_1.getByName(table.columns, args0.name);
                        if (column) {
                            return column.metadata.unit;
                        }
                    }
                }
                return null; // unit is unknown
            };
            const findScale = (mappings) => {
                for (const name in mappings) {
                    // eslint-disable-next-line
                    if (!mappings.hasOwnProperty(name)) {
                        continue;
                    }
                    if (mappings[name].type == specification_1.MappingType.scale) {
                        const scaleMapping = mappings[name];
                        if (scaleMapping.scale != null) {
                            if ((compareDomainRanges(scaleMapping.scale, options.expression) ||
                                scaleMapping.expression == options.expression) &&
                                (core_1.compareMarkAttributeNames(options.markAttribute, scaleMapping.attribute) ||
                                    !options.markAttribute ||
                                    !scaleMapping.attribute)) {
                                const scaleObject = core_1.getById(this.chart.scales, scaleMapping.scale);
                                if (scaleObject.outputType == options.outputType) {
                                    return scaleMapping.scale;
                                }
                            }
                            // TODO: Fix this part
                            if (getExpressionUnit(scaleMapping.expression) ==
                                getExpressionUnit(options.expression) &&
                                getExpressionUnit(scaleMapping.expression) != null) {
                                const scaleObject = core_1.getById(this.chart.scales, scaleMapping.scale);
                                if (scaleObject.outputType == options.outputType) {
                                    return scaleMapping.scale;
                                }
                            }
                        }
                    }
                }
                return null;
            };
            for (const element of this.chart.elements) {
                if (core_1.Prototypes.isType(element.classID, "plot-segment")) {
                    const plotSegment = element;
                    if (plotSegment.table != table.name) {
                        continue;
                    }
                    const glyph = core_1.getById(this.chart.glyphs, plotSegment.glyph);
                    if (!glyph) {
                        continue;
                    }
                    for (const element of glyph.marks) {
                        const foundScale = findScale(element.mappings);
                        if (foundScale) {
                            return foundScale;
                        }
                    }
                }
                else {
                    const foundScale = findScale(element.mappings);
                    if (foundScale) {
                        return foundScale;
                    }
                }
            }
            if (this.chart.scaleMappings) {
                for (const scaleMapping of this.chart.scaleMappings) {
                    if ((compareDomainRanges(scaleMapping.scale, options.expression) ||
                        scaleMapping.expression == options.expression) &&
                        ((scaleMapping.attribute &&
                            core_1.compareMarkAttributeNames(scaleMapping.attribute, options.markAttribute)) ||
                            !scaleMapping.attribute)) {
                        const scaleObject = core_1.getById(this.chart.scales, scaleMapping.scale);
                        if (scaleObject && scaleObject.outputType == options.outputType) {
                            return scaleMapping.scale;
                        }
                    }
                }
            }
        }
        const values = this.chartManager.getGroupedExpressionVector(table.name, groupBy, options.expression);
        // Infer a new scale for this item
        const scaleClassID = core_1.Prototypes.Scales.inferScaleType((values === null || values === void 0 ? void 0 : values.length) > 0 &&
            typeof values[0] === "string" &&
            !data_types_1.isBase64Image(values[0])
            ? specification_1.DataType.String
            : options.valueType, (values === null || values === void 0 ? void 0 : values.length) > 0 && typeof values[0] === "string"
            ? specification_1.DataKind.Categorical
            : options.valueKind, 
        // options.valueKind,
        options.outputType);
        if (scaleClassID != null) {
            const newScale = this.chartManager.createObject(scaleClassID);
            newScale.properties.name = this.chartManager.findUnusedName("Scale");
            newScale.inputType = options.valueType;
            newScale.outputType = options.outputType;
            this.chartManager.addScale(newScale);
            const scaleClass = this.chartManager.getClassById(newScale._id);
            const parentMainTable = this.getTables().find((table) => table.type === dataset_1.TableType.ParentMain);
            if (parentMainTable) {
                table = parentMainTable;
            }
            let rangeImage = null;
            if (scaleClassID === "scale.categorical<image,image>" &&
                options.valueType === specification_1.DataType.Image) {
                rangeImage = this.chartManager.getGroupedExpressionVector(table.name, groupBy, options.expression);
                scaleClass.inferParameters(this.chartManager.getGroupedExpressionVector(table.name, groupBy, `first(${core_1.ImageKeyColumn})` // get ID column values for key
                ), Object.assign(Object.assign({}, options.hints), { extendScaleMax: true, extendScaleMin: true, rangeImage }));
            }
            else {
                scaleClass.inferParameters(this.chartManager.getGroupedExpressionVector(table.name, groupBy, options.expression), Object.assign(Object.assign({}, options.hints), { extendScaleMax: true, extendScaleMin: true, rangeImage }));
            }
            return newScale._id;
        }
        else {
            return null;
        }
    }
    isLegendExistForScale(scale) {
        // See if we already have a legend
        for (const element of this.chart.elements) {
            if (core_1.Prototypes.isType(element.classID, "legend")) {
                if (element.properties.scale == scale) {
                    return true;
                }
            }
        }
        return false;
    }
    // eslint-disable-next-line
    toggleLegendForScale(scale, mapping, plotSegment) {
        const scaleObject = core_1.getById(this.chartManager.chart.scales, scale);
        // See if we already have a legend
        for (const element of this.chart.elements) {
            if (core_1.Prototypes.isType(element.classID, "legend")) {
                if (element.properties.scale == scale) {
                    this.chartManager.removeChartElement(element);
                    return;
                }
            }
        }
        let newLegend;
        // Categorical-color scale
        if (scaleObject.classID == "scale.categorical<string,color>") {
            if (mapping && mapping.valueIndex != undefined) {
                newLegend = this.chartManager.createObject(`legend.custom`);
            }
            else {
                newLegend = this.chartManager.createObject(`legend.categorical`);
            }
            newLegend.properties.scale = scale;
            newLegend.mappings.x = {
                type: specification_1.MappingType.parent,
                parentAttribute: "x2",
            };
            newLegend.mappings.y = {
                type: specification_1.MappingType.parent,
                parentAttribute: "y2",
            };
            this.chartManager.chart.mappings.marginRight = {
                type: specification_1.MappingType.value,
                value: 100,
            };
        }
        // Numerical-color scale
        if (scaleObject.classID == "scale.linear<number,color>" ||
            scaleObject.classID == "scale.linear<integer,color>") {
            newLegend = this.chartManager.createObject(`legend.numerical-color`);
            newLegend.properties.scale = scale;
            newLegend.mappings.x = {
                type: specification_1.MappingType.parent,
                parentAttribute: "x2",
            };
            newLegend.mappings.y = {
                type: specification_1.MappingType.parent,
                parentAttribute: "y2",
            };
            this.chartManager.chart.mappings.marginRight = {
                type: specification_1.MappingType.value,
                value: 100,
            };
        }
        // Numerical-number scale
        if (scaleObject.classID == "scale.linear<number,number>" ||
            scaleObject.classID == "scale.linear<integer,number>") {
            if (!plotSegment) {
                console.log("Numerical-number legend needs plot segment parameter.");
                return;
            }
            newLegend = this.chartManager.createObject(`legend.numerical-number`);
            const properties = newLegend.properties;
            properties.scale = scale;
            let legendAttributes = [
                numerical_legend_1.NumericalNumberLegendAttributeNames.x1,
                numerical_legend_1.NumericalNumberLegendAttributeNames.y1,
                numerical_legend_1.NumericalNumberLegendAttributeNames.x2,
                numerical_legend_1.NumericalNumberLegendAttributeNames.y2,
            ];
            let targetAttributes;
            if (prototypes_1.isType(plotSegment.object.classID, "plot-segment.polar")) {
                switch (mapping.attribute) {
                    case "height": {
                        // radial
                        targetAttributes = ["a1r1x", "a1r1y", "a1r2x", "a1r2y"];
                        properties.axis.side = "default";
                        break;
                    }
                    case "width": {
                        // angular
                        legendAttributes = [
                            numerical_legend_1.NumericalNumberLegendAttributeNames.cx,
                            numerical_legend_1.NumericalNumberLegendAttributeNames.cy,
                            numerical_legend_1.NumericalNumberLegendAttributeNames.radius,
                            numerical_legend_1.NumericalNumberLegendAttributeNames.startAngle,
                            numerical_legend_1.NumericalNumberLegendAttributeNames.endAngle,
                        ];
                        targetAttributes = ["cx", "cy", "radial2", "angle1", "angle2"];
                        properties.axis.side = "default";
                        properties.polarAngularMode = true;
                        break;
                    }
                }
            }
            else {
                switch (mapping.attribute) {
                    case "height": {
                        targetAttributes = ["x1", "y1", "x1", "y2"];
                        properties.axis.side = "default";
                        break;
                    }
                    case "width": {
                        targetAttributes = ["x1", "y1", "x2", "y1"];
                        properties.axis.side = "opposite";
                        break;
                    }
                    default: {
                        targetAttributes = ["x1", "y1", "x1", "y2"];
                        properties.axis.side = "default";
                        break;
                    }
                }
            }
            legendAttributes.forEach((attribute, i) => {
                // //snap legend to plot segment
                this.chartManager.chart.constraints.push({
                    type: "snap",
                    attributes: {
                        element: newLegend._id,
                        attribute,
                        targetElement: plotSegment.object._id,
                        targetAttribute: targetAttributes[i],
                        gap: 0,
                    },
                });
            });
        }
        if (newLegend) {
            const mappingOptions = {
                type: specification_1.MappingType.scale,
                table: mapping.table,
                expression: mapping.expression,
                valueType: mapping.valueType,
                scale: scaleObject._id,
                allowSelectValue: mapping && mapping.valueIndex != undefined,
            };
            newLegend.mappings.mappingOptions = mappingOptions;
            this.chartManager.addChartElement(newLegend);
        }
    }
    getRepresentativeGlyphState(glyph) {
        // Is there a plot segment using this glyph?
        for (const element of this.chart.elements) {
            if (core_1.Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                if (plotSegment.glyph == glyph._id) {
                    const state = this.chartManager.getClassById(plotSegment._id)
                        .state;
                    return state.glyphs[0];
                }
            }
        }
        return null;
    }
    solveConstraintsAndUpdateGraphics(mappingOnly = false) {
        this.solveConstraintsInWorker(mappingOnly).then(() => {
            this.emit(AppStore.EVENT_GRAPHICS);
        });
    }
    solveConstraintsInWorker(mappingOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.solverStatus = {
                solving: true,
            };
            this.emit(AppStore.EVENT_SOLVER_STATUS);
            yield this.worker.solveChartConstraints(this.chart, this.chartState, this.dataset, this.preSolveValues, mappingOnly);
            this.preSolveValues = [];
            this.solverStatus = {
                solving: false,
            };
            this.emit(AppStore.EVENT_SOLVER_STATUS);
        });
    }
    newChartEmpty() {
        this.currentSelection = null;
        this.selectedGlyphIndex = {};
        this.currentTool = null;
        this.currentToolOptions = null;
        this.chart = defaults_1.createDefaultChart(this.dataset, this.editorType === EditorType.Chart);
        this.chartManager = new core_1.Prototypes.ChartStateManager(this.chart, this.dataset);
        this.chartManager.onUpdate(() => {
            this.solveConstraintsAndUpdateGraphics();
        });
        this.chartState = this.chartManager.chartState;
    }
    deleteSelection() {
        const sel = this.currentSelection;
        this.currentSelection = null;
        this.emit(AppStore.EVENT_SELECTION);
        if (sel instanceof selection_1.ChartElementSelection) {
            new actions_1.Actions.DeleteChartElement(sel.chartElement).dispatch(this.dispatcher);
        }
        if (sel instanceof selection_1.MarkSelection) {
            new actions_1.Actions.RemoveMarkFromGlyph(sel.glyph, sel.mark).dispatch(this.dispatcher);
        }
        if (sel instanceof selection_1.GlyphSelection) {
            new actions_1.Actions.RemoveGlyph(sel.glyph).dispatch(this.dispatcher);
        }
    }
    handleEscapeKey() {
        if (this.currentTool) {
            this.currentTool = null;
            this.emit(AppStore.EVENT_CURRENT_TOOL);
            return;
        }
        if (this.currentSelection) {
            new actions_1.Actions.ClearSelection().dispatch(this.dispatcher);
        }
    }
    getClosestSnappingGuide(point) {
        const chartClass = this.chartManager.getChartClass(this.chartManager.chartState);
        const boundsGuides = chartClass.getSnappingGuides();
        let chartGuides = boundsGuides.map((bounds) => {
            return {
                element: null,
                guide: bounds,
            };
        });
        const elements = this.chartManager.chart.elements;
        const elementStates = this.chartManager.chartState.elements;
        core_1.zipArray(elements, elementStates).forEach(([layout, layoutState]) => {
            const layoutClass = this.chartManager.getChartElementClass(layoutState);
            chartGuides = chartGuides.concat(layoutClass.getSnappingGuides().map((bounds) => {
                return {
                    element: layout,
                    guide: bounds,
                };
            }));
        });
        let minYDistance = null;
        let minXDistance = null;
        let minYGuide = null;
        let minXGuide = null;
        for (const g of chartGuides) {
            const guide = g.guide;
            // Find closest point
            if (guide.type == "y") {
                const dY = Math.abs(guide.value - point.y);
                if (dY < minYDistance || minYDistance == null) {
                    minYDistance = dY;
                    minYGuide = g;
                }
            }
            else if (guide.type == "x") {
                const dX = Math.abs(guide.value - point.x);
                if (dX < minXDistance || minXDistance == null) {
                    minXDistance = dX;
                    minXGuide = g;
                }
            }
        }
        return [minXGuide, minYGuide];
    }
    buildChartTemplate() {
        const builder = new template_1.ChartTemplateBuilder(this.chart, this.dataset, this.chartManager, CHARTICULATOR_PACKAGE.version);
        const template = builder.build();
        return template;
    }
    verifyUserExpressionWithTable(inputString, table, options = {}) {
        if (table != null) {
            const dfTable = this.chartManager.dataflow.getTable(table);
            const rowIterator = function* () {
                for (let i = 0; i < dfTable.rows.length; i++) {
                    yield dfTable.getRowContext(i);
                }
            };
            return core_1.Expression.verifyUserExpression(inputString, Object.assign({ data: rowIterator() }, options));
        }
        else {
            return core_1.Expression.verifyUserExpression(inputString, Object.assign({}, options));
        }
    }
    // eslint-disable-next-line
    updateScales() {
        try {
            const updatedScales = [];
            // eslint-disable-next-line
            const updateScalesInternal = (scaleId, mappings, context) => {
                if (updatedScales.find((scale) => scale === scaleId)) {
                    return;
                }
                const scale = core_1.Prototypes.findObjectById(this.chart, scaleId);
                // prevent updating if auto scale is disabled
                if (!scale.properties.autoDomainMin &&
                    !scale.properties.autoDomainMin) {
                    return;
                }
                const filteredMappings = mappings
                    .flatMap((el) => {
                    return Object.keys(el.mappings).map((key) => {
                        return {
                            element: el,
                            key,
                            mapping: el.mappings[key],
                        };
                    });
                })
                    .filter((mapping) => mapping.mapping.type === specification_1.MappingType.scale &&
                    mapping.mapping.scale === scaleId);
                // Figure out the groupBy
                let groupBy = null;
                if (context.glyph) {
                    // Find plot segments that use the glyph.
                    this.chartManager.enumeratePlotSegments((cls) => {
                        if (cls.object.glyph == context.glyph._id) {
                            groupBy = cls.object.groupBy;
                        }
                    });
                }
                filteredMappings.forEach((mapping) => {
                    var _a, _b;
                    const scaleClass = this.chartManager.getClassById(scaleId);
                    let values = [];
                    let newScale = true;
                    let reuseRange = false;
                    let extendScale = true;
                    // special case for legend to draw column names
                    if (mapping.element.classID === "legend.custom") {
                        const table = this.chartManager.dataflow.getTable(mapping.mapping.table);
                        const parsedExpression = this.chartManager.dataflow.cache.parse(mapping.mapping.expression);
                        values = parsedExpression.getValue(table);
                        newScale = true;
                        extendScale = true;
                        reuseRange = true;
                    }
                    else {
                        if (scale.classID == "scale.categorical<string,color>") {
                            newScale = true;
                            extendScale = true;
                            reuseRange = true;
                        }
                        else {
                            newScale = false;
                            extendScale = true;
                            reuseRange = true;
                        }
                        values = this.chartManager.getGroupedExpressionVector(mapping.mapping.table, groupBy, mapping.mapping.expression);
                    }
                    scaleClass.inferParameters(values, {
                        newScale,
                        reuseRange,
                        extendScaleMax: extendScale,
                        extendScaleMin: extendScale,
                        rangeNumber: [
                            (_a = scale.mappings.rangeMin) === null || _a === void 0 ? void 0 : _a.value,
                            (_b = scale.mappings.rangeMax) === null || _b === void 0 ? void 0 : _b.value,
                        ],
                    });
                    updatedScales.push(scaleId);
                });
            };
            const chartElements = this.chart.elements;
            const legendScales = chartElements
                .filter((el) => core_1.Prototypes.isType(el.classID, "legend"))
                .flatMap((el) => {
                return el.properties.scale;
            });
            legendScales.forEach((scale) => {
                updateScalesInternal(scale, chartElements, {
                    chart: this.chart,
                    glyph: null,
                });
                this.chart.glyphs.forEach((gl) => updateScalesInternal(scale, gl.marks, {
                    chart: this.chart,
                    glyph: gl,
                }));
            });
            const resetOfScales = this.chart.scales.filter((other) => !legendScales.find((l) => l === other._id));
            resetOfScales.forEach((scale) => {
                if (scale.properties.autoDomainMax || scale.properties.autoDomainMin) {
                    updateScalesInternal(scale._id, chartElements, {
                        chart: this.chart,
                        glyph: null,
                    });
                    this.chart.glyphs.forEach((gl) => updateScalesInternal(scale._id, gl.marks, {
                        chart: this.chart,
                        glyph: gl,
                    }));
                }
            });
        }
        catch (ex) {
            console.error("Updating of scales failed with error", ex);
        }
    }
    // eslint-disable-next-line
    updatePlotSegments() {
        // Get plot segments to update with new data
        const plotSegments = this.chart.elements.filter((element) => core_1.Prototypes.isType(element.classID, "plot-segment"));
        // eslint-disable-next-line
        plotSegments.forEach((plot) => {
            const table = this.dataset.tables.find((table) => table.name === plot.table);
            // xData
            const xDataProperty = plot.properties
                .xData;
            if (xDataProperty && xDataProperty.expression) {
                const xData = new actions_1.DragData.DataExpression(table, xDataProperty.expression, xDataProperty.valueType, {
                    kind: xDataProperty.type === "numerical" &&
                        xDataProperty.numericalMode === "temporal"
                        ? specification_1.DataKind.Temporal
                        : xDataProperty.dataKind
                            ? xDataProperty.dataKind
                            : this.getDataKindByType(xDataProperty.type),
                    orderMode: xDataProperty.orderMode
                        ? xDataProperty.orderMode
                        : xDataProperty.valueType === "string"
                            ? types_1.OrderMode.order
                            : null,
                    order: xDataProperty.order !== undefined ? xDataProperty.order : null,
                }, xDataProperty.rawExpression);
                this.bindDataToAxis({
                    property: base_2.PlotSegmentAxisPropertyNames.xData,
                    dataExpression: xData,
                    object: plot,
                    appendToProperty: null,
                    type: xDataProperty.type,
                    numericalMode: xDataProperty.numericalMode,
                    autoDomainMax: xDataProperty.autoDomainMax,
                    autoDomainMin: xDataProperty.autoDomainMin,
                    domainMin: xDataProperty.domainMin,
                    domainMax: xDataProperty.domainMax,
                    defineCategories: true,
                });
            }
            // yData
            const yDataProperty = plot.properties
                .yData;
            if (yDataProperty && yDataProperty.expression) {
                const yData = new actions_1.DragData.DataExpression(table, yDataProperty.expression, yDataProperty.valueType, {
                    kind: yDataProperty.type === "numerical" &&
                        yDataProperty.numericalMode === "temporal"
                        ? specification_1.DataKind.Temporal
                        : yDataProperty.dataKind
                            ? yDataProperty.dataKind
                            : this.getDataKindByType(yDataProperty.type),
                    orderMode: yDataProperty.orderMode
                        ? yDataProperty.orderMode
                        : yDataProperty.valueType === "string"
                            ? types_1.OrderMode.order
                            : null,
                    order: yDataProperty.order !== undefined ? yDataProperty.order : null,
                }, yDataProperty.rawExpression);
                this.bindDataToAxis({
                    property: base_2.PlotSegmentAxisPropertyNames.yData,
                    dataExpression: yData,
                    object: plot,
                    appendToProperty: null,
                    type: yDataProperty.type,
                    numericalMode: yDataProperty.numericalMode,
                    autoDomainMax: yDataProperty.autoDomainMax,
                    autoDomainMin: yDataProperty.autoDomainMin,
                    domainMin: yDataProperty.domainMin,
                    domainMax: yDataProperty.domainMax,
                    defineCategories: true,
                });
            }
            const axisProperty = plot.properties
                .axis;
            if (axisProperty && axisProperty.expression) {
                const axisData = new actions_1.DragData.DataExpression(table, axisProperty.expression !== undefined
                    ? axisProperty.expression
                    : null, axisProperty.valueType !== undefined ? axisProperty.valueType : null, {
                    kind: axisProperty.type === "numerical" &&
                        axisProperty.numericalMode === "temporal"
                        ? specification_1.DataKind.Temporal
                        : axisProperty.dataKind
                            ? axisProperty.dataKind
                            : this.getDataKindByType(axisProperty.type),
                    orderMode: axisProperty.orderMode
                        ? axisProperty.orderMode
                        : axisProperty.valueType === "string"
                            ? types_1.OrderMode.order
                            : null,
                    order: axisProperty.order !== undefined ? axisProperty.order : null,
                }, axisProperty.rawExpression);
                this.bindDataToAxis({
                    property: base_2.PlotSegmentAxisPropertyNames.axis,
                    dataExpression: axisData,
                    object: plot,
                    appendToProperty: null,
                    type: axisProperty.type,
                    numericalMode: axisProperty.numericalMode
                        ? axisProperty.numericalMode
                        : null,
                    autoDomainMax: axisProperty.autoDomainMax,
                    autoDomainMin: axisProperty.autoDomainMin,
                    domainMin: axisProperty.domainMin,
                    domainMax: axisProperty.domainMax,
                    defineCategories: true,
                });
            }
        });
    }
    updateDataAxes() {
        const mapElementWithTable = (table) => (el) => {
            return {
                table,
                element: el,
            };
        };
        const bindAxis = (dataAxisElement, expression, axisProperty, dataAxis, appendToProperty = null) => {
            const axisData = new actions_1.DragData.DataExpression(this.dataset.tables.find((t) => t.name == dataAxisElement.table), expression, axisProperty.valueType, {
                kind: axisProperty.type === "numerical" &&
                    axisProperty.numericalMode === "temporal"
                    ? specification_1.DataKind.Temporal
                    : axisProperty.dataKind
                        ? axisProperty.dataKind
                        : this.getDataKindByType(axisProperty.type),
                orderMode: axisProperty.orderMode
                    ? axisProperty.orderMode
                    : axisProperty.valueType === "string"
                        ? types_1.OrderMode.order
                        : null,
                order: axisProperty.order,
            }, axisProperty.rawExpression);
            this.bindDataToAxis({
                property: base_2.PlotSegmentAxisPropertyNames.axis,
                dataExpression: axisData,
                object: dataAxis,
                appendToProperty,
                type: axisProperty.type,
                numericalMode: axisProperty.numericalMode,
                autoDomainMax: axisProperty.autoDomainMax,
                autoDomainMin: axisProperty.autoDomainMin,
                domainMin: axisProperty.domainMin,
                domainMax: axisProperty.domainMax,
                defineCategories: false,
            });
        };
        const table = this.dataset.tables.find((t) => t.type === dataset_1.TableType.Main);
        this.chart.elements
            .map(mapElementWithTable(table.name))
            .concat(this.chart.glyphs.flatMap((gl) => gl.marks.map(mapElementWithTable(gl.table))))
            .filter((element) => core_1.Prototypes.isType(element.element.classID, "mark.data-axis"))
            .forEach((dataAxisElement) => {
            const dataAxis = dataAxisElement.element;
            const axisProperty = dataAxis.properties
                .axis;
            if (axisProperty) {
                const expression = axisProperty.expression;
                bindAxis(dataAxisElement, expression, axisProperty, dataAxis);
            }
            const dataExpressions = dataAxis.properties.dataExpressions;
            // remove all and added again
            dataAxis.properties.dataExpressions = [];
            dataExpressions.forEach((dataExpression, index) => {
                const axisProperty = dataAxis.properties
                    .axis;
                if (axisProperty) {
                    const expression = dataExpression.expression;
                    bindAxis(dataAxisElement, expression, axisProperty, dataAxis, "dataExpressions");
                    // save old name/id of expression to hold binding marks to those axis points
                    dataAxis.properties.dataExpressions[index].name =
                        dataExpression.name;
                }
            });
        });
    }
    getBindingByDataKind(kind) {
        switch (kind) {
            case specification_1.DataKind.Numerical:
                return types_1.AxisDataBindingType.Numerical;
            case specification_1.DataKind.Temporal:
            case specification_1.DataKind.Ordinal:
            case specification_1.DataKind.Categorical:
                return types_1.AxisDataBindingType.Categorical;
        }
    }
    // eslint-disable-next-line
    bindDataToAxis(options) {
        var _a;
        const { object, property, appendToProperty, dataExpression } = options;
        this.normalizeDataExpression(dataExpression);
        let groupExpression = dataExpression.expression;
        let valueType = dataExpression.valueType;
        const propertyValue = object.properties[options.property];
        const type = dataExpression.type
            ? options.type
            : this.getBindingByDataKind(options.dataExpression.metadata.kind);
        const rawColumnExpression = dataExpression.rawColumnExpression;
        if (rawColumnExpression &&
            dataExpression.valueType !== specification_1.DataType.Date &&
            (options.dataExpression.metadata.kind === specification_1.DataKind.Ordinal ||
                options.dataExpression.metadata.kind === specification_1.DataKind.Categorical)) {
            groupExpression = rawColumnExpression;
            valueType = specification_1.DataType.String;
        }
        const objectProperties = object.properties[options.property];
        const expression = appendToProperty === "dataExpressions" && propertyValue
            ? propertyValue.expression
            : groupExpression;
        let dataBinding = {
            type: options.type || type,
            // Don't change current expression (use current expression), if user appends data expression ()
            expression: expression,
            rawExpression: dataExpression.rawColumnExpression != undefined
                ? dataExpression.rawColumnExpression
                : expression,
            valueType: valueType !== undefined ? valueType : null,
            gapRatio: (propertyValue === null || propertyValue === void 0 ? void 0 : propertyValue.gapRatio) === undefined ? 0.1 : propertyValue.gapRatio,
            visible: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.visible) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.visible : true,
            side: (propertyValue === null || propertyValue === void 0 ? void 0 : propertyValue.side) || "default",
            style: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.style) ||
                core_1.deepClone(plot_segments_1.defaultAxisStyle),
            numericalMode: options.numericalMode != undefined ? options.numericalMode : null,
            dataKind: dataExpression.metadata.kind != undefined
                ? dataExpression.metadata.kind
                : null,
            order: dataExpression.metadata.order !== undefined
                ? dataExpression.metadata.order
                : null,
            orderMode: dataExpression.metadata.orderMode !== undefined
                ? dataExpression.metadata.orderMode
                : null,
            autoDomainMax: options.autoDomainMax != undefined ? options.autoDomainMax : true,
            autoDomainMin: options.autoDomainMin != undefined ? options.autoDomainMin : true,
            tickFormat: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.tickFormat) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.tickFormat
                : null,
            tickDataExpression: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.tickDataExpression) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.tickDataExpression
                : null,
            tickFormatType: (_a = objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.tickFormatType) !== null && _a !== void 0 ? _a : types_1.TickFormatType.None,
            domainMin: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMin) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMin
                : null,
            domainMax: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMax) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMax
                : null,
            dataDomainMin: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMin) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMin
                : null,
            dataDomainMax: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMax) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.domainMax
                : null,
            enablePrePostGap: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.enablePrePostGap) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.enablePrePostGap
                : null,
            categories: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.categories) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.categories
                : null,
            allCategories: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.allCategories) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.allCategories
                : (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.categories) !== undefined
                    ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.categories
                    : null,
            scrollPosition: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.scrollPosition) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.scrollPosition
                : 0,
            allowScrolling: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.allowScrolling) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.allowScrolling
                : false,
            windowSize: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.windowSize) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.windowSize
                : 10,
            barOffset: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.barOffset) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.barOffset
                : 0,
            offset: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.offset) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.offset
                : 0,
            onTop: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.onTop) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.onTop
                : false,
            enableSelection: (objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.enableSelection) !== undefined
                ? objectProperties === null || objectProperties === void 0 ? void 0 : objectProperties.enableSelection
                : false,
        };
        let expressions = [groupExpression];
        if (appendToProperty) {
            if (object.properties[appendToProperty] == null) {
                object.properties[appendToProperty] = [
                    { name: core_1.uniqueID(), expression: groupExpression },
                ];
            }
            else {
                object.properties[appendToProperty].push({
                    name: core_1.uniqueID(),
                    expression: groupExpression,
                });
            }
            expressions = object.properties[appendToProperty].map((x) => x.expression);
            if (object.properties[property] == null) {
                object.properties[property] = dataBinding;
            }
            else {
                dataBinding = object.properties[property];
            }
        }
        else {
            object.properties[property] = dataBinding;
        }
        const groupBy = this.getGroupingExpression(object);
        let values = [];
        if (appendToProperty == "dataExpressions" &&
            dataBinding.domainMax !== undefined &&
            dataBinding.domainMin !== undefined) {
            // save current range of scale if user adds data
            values = values.concat(dataBinding.domainMax, dataBinding.domainMin);
        }
        for (const expr of expressions) {
            if (expr) {
                const r = this.chartManager.getGroupedExpressionVector(dataExpression.table.name, groupBy, expr);
                values = values.concat(r);
            }
        }
        if (dataExpression.metadata) {
            switch (dataExpression.metadata.kind) {
                case core_1.Specification.DataKind.Categorical:
                case core_1.Specification.DataKind.Ordinal:
                    {
                        dataBinding.type = types_1.AxisDataBindingType.Categorical;
                        dataBinding.valueType = dataExpression.valueType;
                        const { categories, order } = this.getCategoriesForDataBinding(dataExpression.metadata, dataExpression.valueType, values);
                        dataBinding.order = order != undefined ? order : null;
                        dataBinding.allCategories = core_1.deepClone(categories);
                        if (dataBinding.windowSize == null) {
                            dataBinding.windowSize = Math.ceil(categories.length / 10);
                        }
                        dataBinding.categories = categories;
                        if (dataBinding.allowScrolling) {
                            const start = Math.floor(((categories.length - dataBinding.windowSize) / 100) *
                                dataBinding.scrollPosition);
                            dataBinding.categories = categories.slice(start, start + dataBinding.windowSize);
                        }
                    }
                    break;
                case core_1.Specification.DataKind.Numerical:
                    {
                        if (options.numericalMode === types_1.NumericalMode.Logarithmic) {
                            const scale = new core_1.Scale.LogarithmicScale();
                            scale.inferParameters(values);
                            if (dataBinding.autoDomainMin) {
                                dataBinding.domainMin = scale.domainMin;
                            }
                            else {
                                dataBinding.domainMin = options.domainMin;
                            }
                            if (dataBinding.autoDomainMax) {
                                dataBinding.domainMax = scale.domainMax;
                            }
                            else {
                                dataBinding.domainMax = options.domainMax;
                            }
                            dataBinding.type = types_1.AxisDataBindingType.Numerical;
                            dataBinding.numericalMode = types_1.NumericalMode.Logarithmic;
                        }
                        else {
                            const scale = new core_1.Scale.LinearScale();
                            scale.inferParameters(values);
                            if (dataBinding.autoDomainMin) {
                                dataBinding.domainMin = scale.domainMin;
                            }
                            else {
                                dataBinding.domainMin = options.domainMin;
                            }
                            if (dataBinding.autoDomainMax) {
                                dataBinding.domainMax = scale.domainMax;
                            }
                            else {
                                dataBinding.domainMax = options.domainMax;
                            }
                            dataBinding.type = types_1.AxisDataBindingType.Numerical;
                            dataBinding.numericalMode = types_1.NumericalMode.Linear;
                        }
                        if (options.defineCategories) {
                            dataBinding.categories = core_1.defineCategories(values);
                        }
                        if (dataBinding.windowSize == null) {
                            dataBinding.windowSize =
                                (dataBinding.domainMax - dataBinding.domainMin) / 10;
                            dataBinding.dataDomainMin = dataBinding.domainMin;
                            dataBinding.dataDomainMax = dataBinding.domainMax;
                        }
                    }
                    break;
                case core_1.Specification.DataKind.Temporal:
                    {
                        const scale = new core_1.Scale.DateScale();
                        scale.inferParameters(values, false);
                        if (dataBinding.autoDomainMin) {
                            dataBinding.domainMin = scale.domainMin;
                        }
                        else {
                            dataBinding.domainMin = options.domainMin;
                        }
                        if (dataBinding.autoDomainMax) {
                            dataBinding.domainMax = scale.domainMax;
                        }
                        else {
                            dataBinding.domainMax = options.domainMax;
                        }
                        dataBinding.type = types_1.AxisDataBindingType.Numerical;
                        dataBinding.numericalMode = types_1.NumericalMode.Temporal;
                        const { categories } = this.getCategoriesForDataBinding(dataExpression.metadata, dataExpression.valueType, values);
                        dataBinding.allCategories = core_1.deepClone(categories);
                        dataBinding.categories = categories;
                        if (dataBinding.allowScrolling) {
                            const start = Math.floor(((categories.length - dataBinding.windowSize) / 100) *
                                dataBinding.scrollPosition);
                            dataBinding.categories = categories.slice(start, start + dataBinding.windowSize);
                        }
                    }
                    break;
            }
        }
        // Adjust sublayout option if current option is not available
        const props = object.properties;
        if (props.sublayout) {
            if (props.sublayout.type == base_2.Region2DSublayoutType.DodgeX ||
                props.sublayout.type == base_2.Region2DSublayoutType.DodgeY ||
                props.sublayout.type == base_2.Region2DSublayoutType.Grid) {
                if (props.xData && props.xData.type == "numerical") {
                    props.sublayout.type = base_2.Region2DSublayoutType.Overlap;
                }
                if (props.yData && props.yData.type == "numerical") {
                    props.sublayout.type = base_2.Region2DSublayoutType.Overlap;
                }
            }
        }
    }
    /**
     * Due to undefined "value" will not saved after JSON.stringfy, need to update all undefined "values" to null
     * deepClone uses JSON.stringfy to create copy of object. If object losses some property after copy
     * the function expect_deep_approximately_equals gives difference for identical tempalte/chart state
     * See {@link ChartStateManager.hasUnsavedChanges} for details
     * @param dataExpression Data expression for axis
     */
    normalizeDataExpression(dataExpression) {
        if (dataExpression.metadata) {
            if (dataExpression.metadata.order === undefined) {
                dataExpression.metadata.order = null;
            }
            if (dataExpression.metadata.orderMode === undefined) {
                dataExpression.metadata.orderMode = null;
            }
            if (dataExpression.metadata.rawColumnName === undefined) {
                dataExpression.metadata.rawColumnName = null;
            }
            if (dataExpression.metadata.unit === undefined) {
                dataExpression.metadata.unit = null;
            }
            if (dataExpression.metadata.kind === undefined) {
                dataExpression.metadata.kind = null;
            }
            if (dataExpression.metadata.isRaw === undefined) {
                dataExpression.metadata.isRaw = null;
            }
            if (dataExpression.metadata.format === undefined) {
                dataExpression.metadata.format = null;
            }
            if (dataExpression.metadata.examples === undefined) {
                dataExpression.metadata.examples = null;
            }
            if (dataExpression.scaleID === undefined) {
                dataExpression.scaleID = null;
            }
            if (dataExpression.type === undefined) {
                dataExpression.type = null;
            }
            if (dataExpression.rawColumnExpression === undefined) {
                dataExpression.rawColumnExpression = null;
            }
            if (dataExpression.valueType === undefined) {
                dataExpression.valueType = null;
            }
        }
    }
    getCategoriesForDataBinding(metadata, type, values) {
        let categories;
        let order;
        if (metadata.order && metadata.orderMode === types_1.OrderMode.order) {
            categories = metadata.order.slice();
            const scale = new core_1.Scale.CategoricalScale();
            scale.inferParameters(values, metadata.orderMode);
            const newData = new Array(scale.length);
            scale.domain.forEach((index, x) => (newData[index] = x.toString()));
            metadata.order = metadata.order.filter((value) => scale.domain.has(value));
            const newItems = newData.filter((category) => !metadata.order.find((order) => order === category));
            categories = new Array(metadata.order.length);
            metadata.order.forEach((value, index) => {
                categories[index] = value;
            });
            categories = categories.concat(newItems);
            order = metadata.order.concat(newItems);
        }
        else {
            let orderMode = types_1.OrderMode.alphabetically;
            const scale = new core_1.Scale.CategoricalScale();
            if (metadata.orderMode) {
                orderMode = metadata.orderMode;
            }
            if (type === "number") {
                values = values.sort((a, b) => a - b);
                orderMode = types_1.OrderMode.order;
            }
            scale.inferParameters(values, orderMode);
            categories = new Array(scale.length);
            scale.domain.forEach((index, x) => (categories[index] = x.toString()));
        }
        return { categories, order };
    }
    getGroupingExpression(object) {
        let groupBy = null;
        if (core_1.Prototypes.isType(object.classID, "plot-segment")) {
            groupBy = object.groupBy;
        }
        else {
            // Find groupBy for data-driven guide
            if (core_1.Prototypes.isType(object.classID, "mark")) {
                for (const glyph of this.chart.glyphs) {
                    if (glyph.marks.indexOf(object) >= 0) {
                        // Found the glyph
                        this.chartManager.enumeratePlotSegments((cls) => {
                            if (cls.object.glyph == glyph._id) {
                                groupBy = cls.object.groupBy;
                            }
                        });
                    }
                }
            }
        }
        return groupBy;
    }
    getLocaleFileFormat() {
        return this.localeFileFormat;
    }
    setLocaleFileFormat(value) {
        this.localeFileFormat = value;
    }
    checkColumnsMapping(column, tableType, dataset) {
        const unmappedColumns = [];
        const dataTable = dataset.tables.find((t) => t.type === tableType);
        const found = dataTable === null || dataTable === void 0 ? void 0 : dataTable.columns.find((c) => c.name === column.name);
        if (!found) {
            unmappedColumns.push(column);
        }
        return unmappedColumns;
    }
    setProperty(config) {
        if (config.property === "name" &&
            this.chartManager.isNameUsed(config.value)) {
            return;
        }
        this.saveHistory();
        if (config.field == null) {
            config.object.properties[config.property] = config.value;
        }
        else {
            const obj = config.object.properties[config.property];
            config.object.properties[config.property] = core_1.setField(obj, config.field, config.value);
        }
        if (config.noUpdateState) {
            this.emit(AppStore.EVENT_GRAPHICS);
        }
        else {
            this.solveConstraintsAndUpdateGraphics(config.noComputeLayout);
        }
    }
}
exports.AppStore = AppStore;
AppStore.EVENT_IS_NESTED_EDITOR = "is-nested-editor";
AppStore.EVENT_NESTED_EDITOR_EDIT = "nested-editor-edit";
AppStore.EVENT_NESTED_EDITOR_CLOSE = "nested-editor-close";
/** Fires when the dataset changes */
AppStore.EVENT_DATASET = "dataset";
/** Fires when the chart state changes */
AppStore.EVENT_GRAPHICS = "graphics";
/** Fires when the selection changes */
AppStore.EVENT_SELECTION = "selection";
/** Fires when the current tool changes */
AppStore.EVENT_CURRENT_TOOL = "current-tool";
/** Fires when solver status changes */
AppStore.EVENT_SOLVER_STATUS = "solver-status";
/** Fires when the chart was saved */
AppStore.EVENT_SAVECHART = "savechart";
/** Fires when user clicks Edit nested chart for embedded editor */
AppStore.EVENT_OPEN_NESTED_EDITOR = "openeditor";
//# sourceMappingURL=app_store.js.map
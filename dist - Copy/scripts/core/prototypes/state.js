"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartStateManager = exports.defaultDifferenceApproximation = void 0;
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../common");
const Expression = require("../expression");
const specification_1 = require("../specification");
const Prototypes = require("./index");
const index_1 = require("./index");
const cache_1 = require("./cache");
const dataflow_1 = require("./dataflow");
const filter_1 = require("./filter");
const object_1 = require("./object");
const solver_1 = require("../solver");
const utils_1 = require("../../app/utils");
const types_1 = require("../specification/types");
exports.defaultDifferenceApproximation = 0.01;
/** Handles the life cycle of states and the dataflow */
class ChartStateManager {
    constructor(chart, dataset, state = null, defaultAttributes = {}, options = {}, chartOrigin) {
        this.classCache = new cache_1.ObjectClassCache();
        this.idIndex = new Map();
        this.onUpdateListeners = [];
        this.chart = chart;
        this.chartOrigin = chartOrigin ? chartOrigin : common_1.deepClone(chart);
        this.dataset = dataset;
        this.dataflow = new dataflow_1.DataflowManager(dataset);
        this.options = options;
        if (state == null) {
            this.initialize(defaultAttributes);
        }
        else {
            this.setState(state);
        }
    }
    getOriginChart() {
        return this.chartOrigin;
    }
    updateState(chart, dataset, state) {
        this.chart = chart;
        this.dataset = dataset;
        this.chartState = state;
        this.initialize({});
    }
    resetDifference() {
        this.chartOrigin = common_1.deepClone(this.chart);
    }
    onUpdate(callback) {
        this.onUpdateListeners.push(callback);
    }
    clearOnUpdateListener(callback) {
        const index = this.onUpdateListeners.findIndex((func) => func === callback);
        if (index != -1) {
            this.onUpdateListeners = [
                ...this.onUpdateListeners.slice(0, index),
                ...this.onUpdateListeners.slice(index + 1, this.onUpdateListeners.length),
            ];
        }
    }
    // eslint-disable-next-line max-lines-per-function
    hasUnsavedChanges() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const origin = this.chartOrigin;
        const chart = this.chart;
        const currentProperties = chart.properties;
        const originProperties = origin.properties;
        try {
            utils_1.expect_deep_approximately_equals(currentProperties, originProperties, exports.defaultDifferenceApproximation, true);
        }
        catch (_l) {
            return true;
        }
        if (origin.constraints.length !== chart.constraints.length) {
            return true;
        }
        else {
            for (let index = 0; index < origin.constraints.length; index++) {
                const originConstringts = origin.constraints[index];
                const current = chart.constraints[index];
                utils_1.expect_deep_approximately_equals(originConstringts, current, exports.defaultDifferenceApproximation, true);
            }
        }
        const chartElements = [...index_1.forEachObject(chart)];
        const originElements = [...index_1.forEachObject(origin)];
        // forEachObject retuns all objects in the chart
        // if any object was added or removed to the chart it means chart has changes
        // don't need to compare in details
        if (chartElements.length != originElements.length) {
            return true;
        }
        else {
            for (let index = 0; index < chartElements.length; index++) {
                const currentElement = chartElements[index];
                const originElement = originElements[index];
                if (currentElement.kind != originElement.kind) {
                    return true;
                }
                if (((_a = currentElement.glyph) === null || _a === void 0 ? void 0 : _a.classID) != ((_b = originElement.glyph) === null || _b === void 0 ? void 0 : _b.classID)) {
                    return true;
                }
                if (((_c = currentElement.object) === null || _c === void 0 ? void 0 : _c._id) != ((_d = originElement.object) === null || _d === void 0 ? void 0 : _d._id)) {
                    return true;
                }
                if (((_e = currentElement.scale) === null || _e === void 0 ? void 0 : _e._id) != ((_f = originElement.scale) === null || _f === void 0 ? void 0 : _f._id)) {
                    return true;
                }
                if (currentElement.kind == index_1.ObjectItemKind.ChartElement &&
                    currentElement.kind == index_1.ObjectItemKind.ChartElement) {
                    if (currentElement.chartElement && originElement.chartElement) {
                        if (currentElement.chartElement._id != originElement.chartElement._id) {
                            return true;
                        }
                        if (currentElement.chartElement.classID !=
                            originElement.chartElement.classID) {
                            return true;
                        }
                    }
                    if (Prototypes.isType(currentElement.chartElement.classID, "plot-segment") &&
                        Prototypes.isType(originElement.chartElement.classID, "plot-segment")) {
                        const currentPlotSegment = currentElement.chartElement;
                        const originPlotSegment = originElement.chartElement;
                        if (currentPlotSegment.glyph != originPlotSegment.glyph) {
                            return true;
                        }
                        if (currentPlotSegment.table != originPlotSegment.table) {
                            return true;
                        }
                        try {
                            utils_1.expect_deep_approximately_equals(currentPlotSegment.filter, originPlotSegment.filter, exports.defaultDifferenceApproximation, true);
                            utils_1.expect_deep_approximately_equals(currentPlotSegment.groupBy, originPlotSegment.groupBy, exports.defaultDifferenceApproximation, true);
                            utils_1.expect_deep_approximately_equals(currentPlotSegment.order, originPlotSegment.order, exports.defaultDifferenceApproximation, true);
                            utils_1.expect_deep_approximately_equals(currentPlotSegment.mappings, originPlotSegment.mappings, exports.defaultDifferenceApproximation, true);
                            utils_1.expect_deep_approximately_equals(currentPlotSegment.properties, originPlotSegment.properties, exports.defaultDifferenceApproximation, true);
                        }
                        catch (ex) {
                            console.log(ex);
                            return true;
                        }
                    }
                    try {
                        const currentProperties = currentElement.chartElement.properties;
                        const originProperties = originElement.chartElement.properties;
                        utils_1.expect_deep_approximately_equals(currentProperties, originProperties, exports.defaultDifferenceApproximation, true);
                    }
                    catch (ex) {
                        console.log(ex);
                        return true;
                    }
                }
                if (currentElement.kind == index_1.ObjectItemKind.Glyph &&
                    originElement.kind == index_1.ObjectItemKind.Glyph) {
                    if (currentElement.glyph.table != originElement.glyph.table) {
                        return true;
                    }
                }
                if (currentElement.kind == index_1.ObjectItemKind.Mark &&
                    originElement.kind == index_1.ObjectItemKind.Mark) {
                    if (((_g = currentElement.mark) === null || _g === void 0 ? void 0 : _g.classID) != ((_h = originElement.mark) === null || _h === void 0 ? void 0 : _h.classID)) {
                        return true;
                    }
                    try {
                        const currentProperties = currentElement.mark.properties;
                        const originProperties = originElement.mark.properties;
                        utils_1.expect_deep_approximately_equals(currentProperties, originProperties, exports.defaultDifferenceApproximation, true);
                    }
                    catch (ex) {
                        console.log(ex);
                        return true;
                    }
                }
                try {
                    const currentMappings = currentElement.object.mappings;
                    const originMappings = originElement.object.mappings;
                    utils_1.expect_deep_approximately_equals(currentMappings, originMappings, exports.defaultDifferenceApproximation, true);
                }
                catch (ex) {
                    console.log(ex);
                    return true;
                }
                //scale mappings
                try {
                    const currentProperties = (_j = currentElement.object) === null || _j === void 0 ? void 0 : _j.properties;
                    const originProperties = (_k = originElement.object) === null || _k === void 0 ? void 0 : _k.properties;
                    utils_1.expect_deep_approximately_equals(currentProperties, originProperties, exports.defaultDifferenceApproximation, true);
                }
                catch (ex) {
                    console.log(ex);
                    return true;
                }
            }
        }
        return false;
    }
    /** Set an existing state */
    setState(state) {
        this.chartState = state;
        this.rebuildID2Object();
        this.initializeCache();
    }
    /** Set a new dataset, this will reset the state */
    setDataset(dataset) {
        this.dataset = dataset;
        this.dataflow = new dataflow_1.DataflowManager(dataset);
        this.initialize({});
    }
    /** Get data table by name */
    getTable(name) {
        return this.dataflow.getTable(name);
    }
    /** Get an object by its unique ID */
    getObjectById(id) {
        return this.idIndex.get(id)[0];
    }
    /** Get a chart-level element or scale by its id */
    getClassById(id) {
        // eslint-disable-next-line
        const [object, state] = this.idIndex.get(id);
        return this.classCache.getClass(state);
    }
    /** Get classes for chart elements */
    getElements() {
        return common_1.zipArray(this.chart.elements, this.chartState.elements).map(
        // eslint-disable-next-line
        ([element, elementState]) => {
            return this.classCache.getClass(elementState);
        });
    }
    /** Create an empty chart state using chart and dataset */
    createChartState() {
        const chart = this.chart;
        // Build the state hierarchy
        const elementStates = chart.elements.map((element) => {
            // Initialie the element state
            const elementState = {
                attributes: {},
            };
            // Special case for plot segment
            if (Prototypes.isType(element.classID, "plot-segment")) {
                this.mapPlotSegmentState(element, elementState);
            }
            return elementState;
        });
        const scaleStates = chart.scales.map(() => {
            const state = {
                attributes: {},
            };
            return state;
        });
        return {
            elements: elementStates,
            scales: scaleStates,
            scaleMappings: chart.scaleMappings,
            attributes: {},
        };
    }
    /** Initialize the object class cache */
    initializeCache() {
        this.classCache = new cache_1.ObjectClassCache();
        const chartClass = this.classCache.createChartClass(null, this.chart, this.chartState);
        chartClass.setDataflow(this.dataflow);
        chartClass.setManager(this);
        for (const [scale, scaleState] of common_1.zip(this.chart.scales, this.chartState.scales)) {
            this.classCache.createScaleClass(chartClass, scale, scaleState);
        }
        for (const [element, elementState] of common_1.zip(this.chart.elements, this.chartState.elements)) {
            this.classCache.createChartElementClass(chartClass, element, elementState);
            // For plot segment, handle data mapping
            if (Prototypes.isType(element.classID, "plot-segment")) {
                this.initializePlotSegmentCache(element, elementState);
            }
        }
    }
    /** Enumerate all object classes */
    enumerateClasses(callback) {
        const chartClass = this.classCache.getChartClass(this.chartState);
        callback(chartClass, this.chartState);
        // eslint-disable-next-line
        for (const [scale, scaleState] of common_1.zip(this.chart.scales, this.chartState.scales)) {
            const scaleClass = this.classCache.getClass(scaleState);
            callback(scaleClass, scaleState);
        }
        for (const [element, elementState] of common_1.zip(this.chart.elements, this.chartState.elements)) {
            const elementClass = this.classCache.getClass(elementState);
            callback(elementClass, elementState);
            // For plot segment, handle data mapping
            if (Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                const plotSegmentState = elementState;
                const glyph = (this.getObjectById(plotSegment.glyph));
                for (const glyphState of plotSegmentState.glyphs) {
                    const glyphClass = this.classCache.getClass(glyphState);
                    callback(glyphClass, glyphState);
                    // eslint-disable-next-line
                    for (const [mark, markState] of common_1.zip(glyph.marks, glyphState.marks)) {
                        const markClass = this.classCache.getClass(markState);
                        callback(markClass, markState);
                    }
                }
            }
        }
    }
    /** Enumerate classes, only return a specific type */
    enumerateClassesByType(type, callback) {
        this.enumerateClasses((cls, state) => {
            if (Prototypes.isType(cls.object.classID, type)) {
                callback(cls, state);
            }
        });
    }
    enumeratePlotSegments(callback) {
        for (const [element, elementState] of common_1.zip(this.chart.elements, this.chartState.elements)) {
            const elementClass = this.classCache.getClass(elementState);
            if (Prototypes.isType(element.classID, "plot-segment")) {
                callback(elementClass);
            }
        }
    }
    /** Initialize the chart state with default parameters */
    initializeState(defaultAttributes = {}) {
        this.enumerateClasses((cls) => {
            cls.initializeState();
            const attributesToAdd = defaultAttributes[cls.object._id];
            if (attributesToAdd) {
                cls.state.attributes = Object.assign(Object.assign({}, cls.state.attributes), attributesToAdd);
            }
        });
    }
    /** Recreate the chart state from scratch */
    initialize(defaultAttributes) {
        this.chartState = this.createChartState();
        this.rebuildID2Object();
        this.initializeCache();
        this.initializeState(defaultAttributes);
    }
    /** Rebuild id to object map */
    rebuildID2Object() {
        this.idIndex.clear();
        // Chart elements
        for (const [element, elementState] of common_1.zipArray(this.chart.elements, this.chartState.elements)) {
            this.idIndex.set(element._id, [element, elementState]);
        }
        // Scales
        for (const [scale, scaleState] of common_1.zipArray(this.chart.scales, this.chartState.scales)) {
            this.idIndex.set(scale._id, [scale, scaleState]);
        }
        // Glyphs
        for (const glyph of this.chart.glyphs) {
            this.idIndex.set(glyph._id, [glyph, null]);
            for (const element of glyph.marks) {
                this.idIndex.set(element._id, [element, null]);
            }
        }
    }
    /** Test if a name is already used */
    isNameUsed(candidate) {
        const chart = this.chart;
        const names = new Set();
        for (const scale of chart.scales) {
            names.add(scale.properties.name);
        }
        for (const element of chart.elements) {
            names.add(element.properties.name);
        }
        for (const mark of chart.glyphs) {
            names.add(mark.properties.name);
            for (const element of mark.marks) {
                names.add(element.properties.name);
            }
        }
        return names.has(candidate);
    }
    /** Find an unused name given a prefix, will try prefix1, prefix2, and so on. */
    findUnusedName(prefix) {
        for (let i = 1;; i++) {
            const candidate = prefix + i.toString();
            if (!this.isNameUsed(candidate)) {
                return candidate;
            }
        }
    }
    /** Create a new object */
    createObject(classID, ...args) {
        let namePrefix = "Object";
        const metadata = object_1.ObjectClasses.GetMetadata(classID);
        if (metadata && metadata.displayName) {
            namePrefix = metadata.displayName;
        }
        const object = object_1.ObjectClasses.CreateDefault(classID, ...args);
        const name = this.findUnusedName(namePrefix);
        object.properties.name = name;
        return object;
    }
    /** Add a new glyph */
    addGlyph(classID, table) {
        const newGlyph = {
            _id: common_1.uniqueID(),
            classID,
            properties: { name: this.findUnusedName("Glyph") },
            table,
            marks: [
                {
                    _id: common_1.uniqueID(),
                    classID: "mark.anchor",
                    properties: { name: "Anchor" },
                    mappings: {
                        x: {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "icx",
                        },
                        y: {
                            type: specification_1.MappingType.parent,
                            parentAttribute: "icy",
                        },
                    },
                },
            ],
            mappings: {},
            constraints: [],
        };
        this.idIndex.set(newGlyph._id, [newGlyph, null]);
        this.idIndex.set(newGlyph.marks[0]._id, [newGlyph.marks[0], null]);
        this.chart.glyphs.push(newGlyph);
        return newGlyph;
    }
    /** Remove a glyph */
    removeGlyph(glyph) {
        const idx = this.chart.glyphs.indexOf(glyph);
        if (idx < 0) {
            return;
        }
        this.idIndex.delete(glyph._id);
        for (const element of glyph.marks) {
            this.idIndex.delete(element._id);
        }
        this.chart.glyphs.splice(idx, 1);
        // Delete all plot segments using this glyph
        const elementsToDelete = [];
        for (const element of this.chart.elements) {
            if (Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                if (plotSegment.glyph == glyph._id) {
                    elementsToDelete.push(plotSegment);
                }
            }
        }
        for (const plotSegment of elementsToDelete) {
            this.removeChartElement(plotSegment);
        }
    }
    /** Add a new element to a glyph */
    addMarkToGlyph(mark, glyph) {
        glyph.marks.push(mark);
        // Create element state in all plot segments using this glyph
        this.enumeratePlotSegments((plotSegmentClass) => {
            if (plotSegmentClass.object.glyph == glyph._id) {
                for (const glyphState of plotSegmentClass.state.glyphs) {
                    const glyphClass = this.classCache.getGlyphClass(glyphState);
                    const markState = {
                        attributes: {},
                    };
                    glyphState.marks.push(markState);
                    const markClass = this.classCache.createMarkClass(glyphClass, mark, markState);
                    markClass.initializeState();
                }
            }
        });
    }
    /** Remove an element from a glyph */
    removeMarkFromGlyph(mark, glyph) {
        const idx = glyph.marks.indexOf(mark);
        if (idx < 0) {
            return;
        }
        glyph.marks.splice(idx, 1);
        glyph.constraints = this.validateConstraints(glyph.constraints, glyph.marks);
        this.idIndex.delete(mark._id);
        // Remove the element state from all elements using this glyph
        this.enumeratePlotSegments((plotSegmentClass) => {
            if (plotSegmentClass.object.glyph == glyph._id) {
                for (const glyphState of plotSegmentClass.state.glyphs) {
                    glyphState.marks.splice(idx, 1);
                }
            }
        });
    }
    /** Add a chart element */
    addChartElement(element, index = null) {
        const elementState = {
            attributes: {},
        };
        if (Prototypes.isType(element.classID, "plot-segment")) {
            this.mapPlotSegmentState(element, elementState);
        }
        if (index != null && index >= 0 && index <= this.chart.elements.length) {
            this.chart.elements.splice(index, 0, element);
            this.chartState.elements.splice(index, 0, elementState);
        }
        else {
            this.chart.elements.push(element);
            this.chartState.elements.push(elementState);
        }
        const elementClass = this.classCache.createChartElementClass(this.classCache.getChartClass(this.chartState), element, elementState);
        if (Prototypes.isType(element.classID, "plot-segment")) {
            this.initializePlotSegmentCache(element, elementState);
        }
        elementClass.initializeState();
        if (Prototypes.isType(element.classID, "plot-segment")) {
            this.initializePlotSegmentState(elementClass);
        }
        this.idIndex.set(element._id, [element, elementState]);
    }
    reorderArray(array, fromIndex, toIndex) {
        const x = array.splice(fromIndex, 1)[0];
        if (fromIndex < toIndex) {
            array.splice(toIndex - 1, 0, x);
        }
        else {
            array.splice(toIndex, 0, x);
        }
    }
    reorderChartElement(fromIndex, toIndex) {
        if (toIndex == fromIndex || toIndex == fromIndex + 1) {
            return;
        } // no effect
        this.reorderArray(this.chart.elements, fromIndex, toIndex);
        this.reorderArray(this.chartState.elements, fromIndex, toIndex);
    }
    reorderGlyphElement(glyph, fromIndex, toIndex) {
        if (toIndex == fromIndex || toIndex == fromIndex + 1) {
            return;
        } // no effect
        for (const [element, elementState] of common_1.zip(this.chart.elements, this.chartState.elements)) {
            if (Prototypes.isType(element.classID, "plot-segment")) {
                const plotSegment = element;
                const plotSegmentState = elementState;
                if (plotSegment.glyph == glyph._id) {
                    for (const glyphState of plotSegmentState.glyphs) {
                        this.reorderArray(glyphState.marks, fromIndex, toIndex);
                    }
                }
            }
        }
        this.reorderArray(glyph.marks, fromIndex, toIndex);
    }
    applyScrollingFilter(data, tableName) {
        var _a;
        const filteredIndices = [];
        // TODO fix expression (get column name from expression properly)
        const table = this.getTable(tableName);
        //in default we dont have expression, we should return all rows
        if (data.type === types_1.AxisDataBindingType.Default) {
            return table.rows.map((row, id) => id);
        }
        const parsed = (_a = Expression.parse(data === null || data === void 0 ? void 0 : data.expression)) === null || _a === void 0 ? void 0 : _a.args[0];
        if (data.type === types_1.AxisDataBindingType.Categorical) {
            for (let i = 0; i < table.rows.length; i++) {
                const rowContext = table.getRowContext(i);
                if (data.categories.find((category) => category === parsed.getStringValue(rowContext)) !== undefined ||
                    !data.allCategories) {
                    filteredIndices.push(i);
                }
            }
        }
        else if (data.type === types_1.AxisDataBindingType.Numerical) {
            for (let i = 0; i < table.rows.length; i++) {
                const rowContext = table.getRowContext(i);
                const value = parsed.getValue(rowContext);
                if (data.domainMin < data.domainMax) {
                    if (value >= data.domainMin && value <= data.domainMax) {
                        filteredIndices.push(i);
                    }
                }
                else {
                    if (value >= data.domainMax && value <= data.domainMin) {
                        filteredIndices.push(i);
                    }
                }
            }
        }
        return filteredIndices;
    }
    /**
     * Map/remap plot segment glyphs
     * @param plotSegment
     * @param plotSegmentState
     */
    mapPlotSegmentState(plotSegment, plotSegmentState) {
        const glyphObject = (common_1.getById(this.chart.glyphs, plotSegment.glyph));
        const table = this.getTable(glyphObject.table);
        const index2ExistingGlyphState = new Map();
        if (plotSegmentState.dataRowIndices) {
            for (const [rowIndex, glyphState] of common_1.zip(plotSegmentState.dataRowIndices, plotSegmentState.glyphs)) {
                index2ExistingGlyphState.set(rowIndex.join(","), glyphState);
            }
        }
        let filteredIndices = table.rows.map((r, i) => i);
        // scrolling filters
        if (plotSegment.properties.xData && plotSegment.properties.yData) {
            const dataX = plotSegment.properties.xData;
            const filteredIndicesX = this.applyScrollingFilter(dataX, plotSegment.table);
            const dataY = plotSegment.properties.yData;
            const filteredIndicesY = this.applyScrollingFilter(dataY, plotSegment.table);
            filteredIndices = filteredIndicesX.filter((value) => filteredIndicesY.includes(value));
        }
        else {
            if (plotSegment.properties.xData) {
                const data = plotSegment.properties.xData;
                filteredIndices = this.applyScrollingFilter(data, plotSegment.table);
            }
            if (plotSegment.properties.yData) {
                const data = plotSegment.properties.yData;
                filteredIndices = this.applyScrollingFilter(data, plotSegment.table);
            }
        }
        if (plotSegment.properties.axis) {
            const data = plotSegment.properties.axis;
            filteredIndices = this.applyScrollingFilter(data, plotSegment.table);
        }
        plotSegmentState.dataRowIndices = filteredIndices.map((i) => [i]);
        if (plotSegment.filter) {
            const filter = new filter_1.CompiledFilter(plotSegment.filter, this.dataflow.cache);
            filteredIndices = filteredIndices.filter((i) => {
                return filter.filter(table.getRowContext(i));
            });
        }
        if (plotSegment.groupBy) {
            if (plotSegment.groupBy.expression) {
                const expr = this.dataflow.cache.parse(plotSegment.groupBy.expression);
                const groups = new Map();
                plotSegmentState.dataRowIndices = [];
                for (const i of filteredIndices) {
                    const groupBy = expr.getStringValue(table.getRowContext(i));
                    if (groups.has(groupBy)) {
                        groups.get(groupBy).push(i);
                    }
                    else {
                        const g = [i];
                        groups.set(groupBy, g);
                        plotSegmentState.dataRowIndices.push(g);
                    }
                }
            }
            else {
                // TODO: emit error
            }
        }
        else {
            plotSegmentState.dataRowIndices = filteredIndices.map((i) => [i]);
        }
        // Resolve filter
        plotSegmentState.glyphs = plotSegmentState.dataRowIndices.map((rowIndex) => {
            if (index2ExistingGlyphState.has(rowIndex.join(","))) {
                return index2ExistingGlyphState.get(rowIndex.join(","));
            }
            else {
                const glyphState = {
                    marks: glyphObject.marks.map(() => {
                        const elementState = {
                            attributes: {},
                        };
                        return elementState;
                    }),
                    attributes: {},
                };
                return glyphState;
            }
        });
    }
    initializePlotSegmentCache(element, elementState) {
        const plotSegment = element;
        const plotSegmentState = elementState;
        const plotSegmentClass = this.classCache.getPlotSegmentClass(plotSegmentState);
        const glyph = this.getObjectById(plotSegment.glyph);
        for (const glyphState of plotSegmentState.glyphs) {
            if (this.classCache.hasClass(glyphState)) {
                continue;
            }
            const glyphClass = this.classCache.createGlyphClass(plotSegmentClass, glyph, glyphState);
            for (const [mark, markState] of common_1.zip(glyph.marks, glyphState.marks)) {
                this.classCache.createMarkClass(glyphClass, mark, markState);
            }
        }
    }
    initializePlotSegmentState(plotSegmentClass) {
        const glyph = (this.getObjectById(plotSegmentClass.object.glyph));
        for (const glyphState of plotSegmentClass.state.glyphs) {
            const glyphClass = this.classCache.getGlyphClass(glyphState);
            glyphClass.initializeState();
            // eslint-disable-next-line
            for (const [mark, markState] of common_1.zip(glyph.marks, glyphState.marks)) {
                const markClass = this.classCache.getMarkClass(markState);
                markClass.initializeState();
            }
        }
    }
    triggerUpdateListeners() {
        this.onUpdateListeners.forEach((listener) => listener(this.chart));
    }
    /** Remove a chart element */
    removeChartElement(element) {
        const idx = this.chart.elements.indexOf(element);
        if (idx < 0) {
            return;
        }
        this.chart.elements.splice(idx, 1);
        this.chartState.elements.splice(idx, 1);
        this.idIndex.delete(element._id);
        this.chart.constraints = this.validateConstraints(this.chart.constraints, this.chart.elements);
    }
    remapPlotSegmentGlyphs(plotSegment) {
        const idx = this.chart.elements.indexOf(plotSegment);
        if (idx < 0) {
            return;
        }
        const plotSegmentState = (this.chartState.elements[idx]);
        this.mapPlotSegmentState(plotSegment, plotSegmentState);
        this.initializePlotSegmentCache(plotSegment, plotSegmentState);
        this.solveConstraints();
        this.triggerUpdateListeners();
    }
    /** Add a new scale */
    addScale(scale) {
        const scaleState = {
            attributes: {},
        };
        this.chart.scales.push(scale);
        this.chartState.scales.push(scaleState);
        const scaleClass = this.classCache.createScaleClass(this.classCache.getChartClass(this.chartState), scale, scaleState);
        scaleClass.initializeState();
        this.idIndex.set(scale._id, [scale, scaleState]);
    }
    /** Remove a scale */
    removeScale(scale) {
        const idx = this.chart.scales.indexOf(scale);
        if (idx < 0) {
            return;
        }
        this.chart.scales.splice(idx, 1);
        this.chartState.scales.splice(idx, 1);
        this.idIndex.delete(scale._id);
    }
    getMarkClass(state) {
        return this.classCache.getMarkClass(state);
    }
    getGlyphClass(state) {
        return this.classCache.getGlyphClass(state);
    }
    getChartElementClass(state) {
        return this.classCache.getChartElementClass(state);
    }
    getPlotSegmentClass(state) {
        return this.classCache.getPlotSegmentClass(state);
    }
    getScaleClass(state) {
        return this.classCache.getScaleClass(state);
    }
    getChartClass(state) {
        return this.classCache.getChartClass(state);
    }
    getClass(state) {
        return this.classCache.getClass(state);
    }
    findGlyphState(plotSegment, glyph, glyphIndex = 0) {
        if (glyphIndex == null) {
            glyphIndex = 0;
        }
        const plotSegmentClass = (this.getClassById(plotSegment._id));
        return plotSegmentClass.state.glyphs[glyphIndex];
    }
    findMarkState(plotSegment, glyph, mark, glyphIndex = 0) {
        const markIndex = glyph.marks.indexOf(mark);
        return this.findGlyphState(plotSegment, glyph, glyphIndex).marks[markIndex];
    }
    /** Remove constraints that relate to non-existant element */
    validateConstraints(constraints, elements) {
        const elementIDs = new Set();
        for (const e of elements) {
            elementIDs.add(e._id);
        }
        return constraints.filter((constraint) => {
            switch (constraint.type) {
                case "snap": {
                    return (elementIDs.has(constraint.attributes.element) &&
                        elementIDs.has(constraint.attributes.targetElement));
                }
                default:
                    return true;
            }
        });
    }
    resolveResource(description) {
        const m = description.match(/^resource:([.*]+)$/);
        if (m && this.chart.resources) {
            const id = m[1];
            for (const item of this.chart.resources) {
                if (item.id == id) {
                    return item.data;
                }
            }
        }
        else {
            return description;
        }
    }
    /** Get chart-level data context for a given table */
    getChartDataContext(tableName) {
        if (tableName == null) {
            return null;
        }
        const table = this.dataflow.getTable(tableName);
        return table.getGroupedContext(common_1.makeRange(0, table.rows.length));
    }
    /** Get glyph-level data context for the glyphIndex-th glyph */
    getGlpyhDataContext(plotSegment, glyphIndex) {
        const table = this.dataflow.getTable(plotSegment.table);
        const plotSegmentClass = (this.getClassById(plotSegment._id));
        const indices = plotSegmentClass.state.dataRowIndices[glyphIndex];
        return table.getGroupedContext(indices);
    }
    /** Get all glyph-level data contexts for a given plot segment */
    getGlpyhDataContexts(plotSegment, 
    // eslint-disable-next-line
    glyphIndex) {
        const table = this.dataflow.getTable(plotSegment.table);
        const plotSegmentClass = (this.getClassById(plotSegment._id));
        return plotSegmentClass.state.dataRowIndices.map((indices) => table.getGroupedContext(indices));
    }
    getGroupedExpressionVector(tableName, groupBy, expression) {
        const expr = this.dataflow.cache.parse(expression);
        const table = this.dataflow.getTable(tableName);
        if (!table) {
            return [];
        }
        const indices = [];
        for (let i = 0; i < table.rows.length; i++) {
            indices.push(i);
        }
        if (groupBy && groupBy.expression) {
            const groupExpression = this.dataflow.cache.parse(groupBy.expression);
            const groups = common_1.gather(indices, (i) => groupExpression.getStringValue(table.getRowContext(i)));
            return groups.map((g) => expr.getValue(table.getGroupedContext(g)));
        }
        else {
            return indices.map((i) => expr.getValue(table.getGroupedContext([i])));
        }
    }
    solveConstraints(additional = null, mappingOnly = false) {
        if (mappingOnly) {
            const solver = new solver_1.ChartConstraintSolver("glyphs");
            solver.setup(this);
            solver.destroy();
        }
        else {
            const iterations = additional != null ? 2 : 1;
            const phases = ["chart", "glyphs"];
            for (let i = 0; i < iterations; i++) {
                for (const phase of phases) {
                    const solver = new solver_1.ChartConstraintSolver(phase);
                    solver.setup(this);
                    if (additional) {
                        additional(solver);
                    }
                    solver.solve();
                    solver.destroy();
                }
                additional = null;
            }
        }
    }
}
exports.ChartStateManager = ChartStateManager;
//# sourceMappingURL=state.js.map
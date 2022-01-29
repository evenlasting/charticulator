"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendCreationPanel = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const core_1 = require("../../../core");
const context_component_1 = require("../../context_component");
const data_field_selector_1 = require("../dataset/data_field_selector");
const radio_control_1 = require("./radio_control");
const dataset_1 = require("../../../core/dataset");
const specification_1 = require("../../../core/specification");
const react_1 = require("@fluentui/react");
const strings_1 = require("../../../strings");
class LegendCreationPanel extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = this.getDefaultState();
    }
    getDefaultState() {
        return {
            legendDataSource: "columnValues",
            errorReport: null,
            legendType: "color",
        };
    }
    // eslint-disable-next-line
    render() {
        return (React.createElement("div", { className: "charticulator__link-type-table" },
            React.createElement("div", { className: "el-row" },
                React.createElement(react_1.Label, null, strings_1.strings.legendCreator.legendType),
                React.createElement(radio_control_1.PanelRadioControl, { options: ["columnValues", "columnNames"], labels: ["Column values", "Column names"], value: this.state.legendDataSource, onChange: (newValue) => this.setState({ legendDataSource: newValue }), showText: true })),
            this.state.legendDataSource == "columnValues" ? (React.createElement("div", null,
                React.createElement(react_1.Label, null, strings_1.strings.legendCreator.connectBy),
                React.createElement("div", { className: "el-row" },
                    React.createElement(data_field_selector_1.DataFieldSelector, { multiSelect: false, ref: (e) => (this.groupBySelector = e), kinds: [
                            core_1.Specification.DataKind.Categorical,
                            core_1.Specification.DataKind.Numerical,
                            core_1.Specification.DataKind.Temporal,
                            core_1.Specification.DataKind.Ordinal,
                        ], datasetStore: this.store, nullDescription: "(select column to create legend)" })))) : (React.createElement("div", null,
                React.createElement(react_1.Label, null, strings_1.strings.legendCreator.connectBy),
                React.createElement("div", { className: "el-row" },
                    React.createElement(data_field_selector_1.DataFieldSelector, { multiSelect: true, ref: (e) => (this.groupBySelector = e), kinds: [
                            core_1.Specification.DataKind.Categorical,
                            core_1.Specification.DataKind.Numerical,
                            core_1.Specification.DataKind.Temporal,
                            core_1.Specification.DataKind.Ordinal,
                        ], datasetStore: this.store, nullDescription: "(select column names to create legend)" })))),
            React.createElement("div", { className: "el-row" },
                React.createElement(react_1.PrimaryButton, { text: strings_1.strings.legendCreator.createLegend, 
                    // eslint-disable-next-line
                    onClick: () => {
                        var _a;
                        const columns = this.groupBySelector
                            ? this.groupBySelector.value
                                ? this.groupBySelector.props.multiSelect
                                    ? this.groupBySelector.value
                                    : [this.groupBySelector.value]
                                : []
                            : [];
                        let attributeType = specification_1.AttributeType.Color;
                        if (this.state.legendDataSource === "columnNames") {
                            const valueType = core_1.Specification.DataType.String;
                            const valueKind = core_1.Specification.DataKind.Categorical;
                            const outputType = core_1.Specification.AttributeType.Color;
                            const scaleClassID = core_1.Prototypes.Scales.inferScaleType(valueType, valueKind, outputType);
                            const tableName = this.store.dataset.tables.find((t) => t.type === dataset_1.TableType.Main).name;
                            const table = this.store.chartManager.dataflow.getTable(tableName);
                            const data = columns
                                .map((ex) => {
                                const index = table.columns.findIndex((col) => col.name == ex.columnName);
                                return `get(get(${ex.table}.columns, ${index}), "displayName")`;
                            })
                                .filter((v) => v != null);
                            const expression = `list(${data
                                .map((ex) => {
                                return `${ex}`;
                            })
                                .join(",")})`;
                            const parsedExpression = this.store.chartManager.dataflow.cache.parse(expression);
                            const expressionData = parsedExpression.getValue(table);
                            const newScale = this.store.chartManager.createObject(scaleClassID);
                            newScale.properties.name = this.store.chartManager.findUnusedName("Scale");
                            newScale.inputType = valueType;
                            newScale.outputType = outputType;
                            this.store.chartManager.addScale(newScale);
                            const scaleClass = this.store.chartManager.getClassById(newScale._id);
                            scaleClass.inferParameters(expressionData, {});
                            const newLegend = this.store.chartManager.createObject(`legend.custom`);
                            newLegend.properties.scale = newScale._id;
                            newLegend.mappings.x = {
                                type: specification_1.MappingType.parent,
                                parentAttribute: "x2",
                            };
                            newLegend.mappings.y = {
                                type: specification_1.MappingType.parent,
                                parentAttribute: "y2",
                            };
                            this.store.chartManager.addChartElement(newLegend);
                            this.store.chartManager.chart.mappings.marginRight = {
                                type: specification_1.MappingType.value,
                                value: 100,
                            };
                            const mappingOptions = {
                                type: specification_1.MappingType.scale,
                                table: tableName,
                                expression,
                                valueType,
                                scale: newScale._id,
                                allowSelectValue: true,
                            };
                            if (!newLegend.mappings) {
                                newLegend.mappings = {};
                            }
                            newLegend.mappings.mappingOptions = mappingOptions;
                        }
                        else {
                            const kind = this.groupBySelector
                                .value.metadata.kind;
                            switch (kind) {
                                case dataset_1.DataKind.Numerical:
                                case dataset_1.DataKind.Temporal:
                                    attributeType = specification_1.AttributeType.Number;
                                    break;
                                case dataset_1.DataKind.Ordinal:
                                    attributeType = specification_1.AttributeType.Text;
                                    break;
                            }
                        }
                        if (this.state.legendDataSource === "columnValues") {
                            const aggregation = core_1.Expression.getDefaultAggregationFunction(columns[0].type, (_a = columns[0].metadata) === null || _a === void 0 ? void 0 : _a.kind);
                            const aggregatedExpression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(columns[0].expression)).toString();
                            const table = columns[0].table;
                            const inferred = this.store.scaleInference({ chart: { table } }, {
                                expression: aggregatedExpression,
                                valueType: columns[0].type,
                                valueKind: columns[0].metadata.kind,
                                outputType: attributeType,
                                hints: {},
                            });
                            const scaleObject = core_1.getById(this.store.chartManager.chart.scales, inferred);
                            let newLegend = null;
                            switch (scaleObject.classID) {
                                case "scale.categorical<string,color>":
                                    newLegend = this.store.chartManager.createObject(`legend.categorical`);
                                    newLegend.properties.scale = inferred;
                                    newLegend.mappings.x = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "x2",
                                    };
                                    newLegend.mappings.y = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "y2",
                                    };
                                    this.store.chartManager.addChartElement(newLegend);
                                    this.store.chartManager.chart.mappings.marginRight = {
                                        type: specification_1.MappingType.value,
                                        value: 100,
                                    };
                                    break;
                                case "scale.linear<number,color>":
                                case "scale.linear<integer,color>":
                                    newLegend = this.store.chartManager.createObject(`legend.numerical-color`);
                                    newLegend.properties.scale = inferred;
                                    newLegend.mappings.x = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "x2",
                                    };
                                    newLegend.mappings.y = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "y2",
                                    };
                                    this.store.chartManager.addChartElement(newLegend);
                                    this.store.chartManager.chart.mappings.marginRight = {
                                        type: specification_1.MappingType.value,
                                        value: 100,
                                    };
                                    break;
                                case "scale.linear<number,number>":
                                case "scale.linear<integer,number>":
                                    newLegend = this.store.chartManager.createObject(`legend.numerical-number`);
                                    newLegend.properties.scale = inferred;
                                    newLegend.mappings.x1 = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "x1",
                                    };
                                    newLegend.mappings.y1 = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "y1",
                                    };
                                    newLegend.mappings.x2 = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "x1",
                                    };
                                    newLegend.mappings.y2 = {
                                        type: specification_1.MappingType.parent,
                                        parentAttribute: "y2",
                                    };
                                    this.store.chartManager.addChartElement(newLegend);
                            }
                            newLegend.mappings.mappingOptions = {
                                type: specification_1.MappingType.scale,
                                table,
                                expression: aggregatedExpression,
                                valueType: columns[0].type,
                                scale: inferred,
                            };
                        }
                        this.store.solveConstraintsAndUpdateGraphics();
                        this.props.onFinish();
                    } }),
                this.state.errorReport ? (React.createElement("span", null, this.state.errorReport)) : null)));
    }
}
exports.LegendCreationPanel = LegendCreationPanel;
//# sourceMappingURL=legend_creator.js.map
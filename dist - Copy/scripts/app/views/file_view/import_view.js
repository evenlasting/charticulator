"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileViewImport = exports.MappingMode = void 0;
const React = require("react");
const components_1 = require("../../components");
const context_component_1 = require("../../context_component");
const controls_1 = require("../panels/widgets/controls");
const dataset_1 = require("../../../core/dataset/dataset");
const strings_1 = require("../../../strings");
var MappingMode;
(function (MappingMode) {
    MappingMode[MappingMode["ImportTemplate"] = 0] = "ImportTemplate";
    MappingMode[MappingMode["ImportDataset"] = 1] = "ImportDataset";
})(MappingMode = exports.MappingMode || (exports.MappingMode = {}));
class FileViewImport extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = {
            columnMappings: new Map(),
        };
    }
    // eslint-disable-next-line
    render() {
        const tables = this.props.tables;
        const newMapping = new Map(this.state.columnMappings);
        const getDefaultValue = (name) => () => {
            const mapped = newMapping.get(name);
            if (mapped) {
                return mapped;
            }
            return strings_1.strings.templateImport.unmapped;
        };
        const onChange = (columnName) => (value) => {
            newMapping.set(columnName, value);
            this.setState({
                columnMappings: newMapping,
            });
        };
        // eslint-disable-next-line no-debugger
        // debugger;
        tables.forEach((table, tableIndex) => {
            var _a;
            const filteredByTableColumns = (_a = this.props.datasetTables[tableIndex]) === null || _a === void 0 ? void 0 : _a.columns;
            if (!filteredByTableColumns) {
                return;
            }
            const usedColumns = new Set();
            // match columns by name and type
            table.columns.forEach((column) => {
                filteredByTableColumns.forEach((pbiColumn) => {
                    if (pbiColumn.displayName === column.name &&
                        (column.type === pbiColumn.type ||
                            column.type === dataset_1.DataType.String) &&
                        !newMapping.get(column.name)) {
                        newMapping.set(column.name, pbiColumn.name);
                        usedColumns.add(pbiColumn);
                    }
                });
            });
            // match columns by type
            table.columns.forEach((column) => {
                // Set default column by type
                if (!newMapping.get(column.name)) {
                    filteredByTableColumns.forEach((pbiColumn) => {
                        if (column.type === pbiColumn.type && !usedColumns.has(pbiColumn)) {
                            newMapping.set(column.name, pbiColumn.name);
                            usedColumns.add(pbiColumn);
                        }
                    });
                }
            });
        });
        return (React.createElement(components_1.FloatingPanel, { floatInCenter: true, scroll: true, peerGroup: "import", title: strings_1.strings.templateImport.title, closeButtonIcon: "ChromeClose", height: 600, width: 800, onClose: this.props.onClose },
            React.createElement("section", { className: "charticulator__file-view-mapping_view" },
                React.createElement("section", null,
                    tables &&
                        tables.map((table) => {
                            return (React.createElement("div", { className: "charticulator__file-view-mapping_table", key: table.name },
                                React.createElement("h4", null, this.props.mode === MappingMode.ImportTemplate
                                    ? strings_1.strings.templateImport.usbtitleImportTemplate
                                    : strings_1.strings.templateImport.usbtitleImportData),
                                React.createElement("table", { className: "charticulator__file-view-mapping_table" },
                                    React.createElement("thead", null,
                                        React.createElement("tr", { className: "charticulator__file-view-mapping_rows" },
                                            React.createElement("th", { className: "charticulator__file-view-mapping_row_item" }, this.props.mode === MappingMode.ImportTemplate
                                                ? strings_1.strings.templateImport.columnNameTemplate
                                                : strings_1.strings.templateImport.columnNameChart),
                                            React.createElement("th", { className: "charticulator__file-view-mapping_row_item" }, strings_1.strings.templateImport.dataType),
                                            React.createElement("th", { className: "charticulator__file-view-mapping_row_item" }, strings_1.strings.templateImport.examples),
                                            React.createElement("th", { className: "charticulator__file-view-mapping_row_item" }, strings_1.strings.templateImport.mapped))),
                                    React.createElement("tbody", null, table.columns.map((column) => {
                                        const datasetTable = this.props.datasetTables.find((t) => t.name ===
                                            (this.props.tableMapping.get(table.name) ||
                                                table.name));
                                        const optionValues = (datasetTable === null || datasetTable === void 0 ? void 0 : datasetTable.columns.filter((pbiColumn) => pbiColumn.type === column.type ||
                                            column.type === dataset_1.DataType.String).map((pbiColumn) => {
                                            return pbiColumn.displayName;
                                        })) || [];
                                        return (React.createElement(React.Fragment, { key: `${table.name}-${column.name}` },
                                            React.createElement("tr", { className: "charticulator__file-view-mapping_rows" },
                                                " ",
                                                React.createElement("td", { className: "charticulator__file-view-mapping_row_item" }, column.name),
                                                React.createElement("td", { className: "charticulator__file-view-mapping_row_item" }, strings_1.strings.typeDisplayNames[column.type]),
                                                React.createElement("td", { className: "charticulator__file-view-mapping_row_item" }, column.metadata.examples),
                                                React.createElement("td", { className: "charticulator__file-view-mapping_row_item" },
                                                    React.createElement(controls_1.Select, { labels: optionValues, icons: null, options: optionValues, value: getDefaultValue(column.name)().toString(), showText: true, onChange: onChange(column.name) })))));
                                    })))));
                        }),
                    React.createElement("div", { className: "charticulator__file-view-mapping_row_button_toolbar" },
                        React.createElement(components_1.ButtonRaised, { onClick: () => {
                                this.props.onClose();
                            }, text: strings_1.strings.button.cancel }),
                        React.createElement(components_1.ButtonRaised, { onClick: () => {
                                if (this.props.unmappedColumns.filter((unmapped) => this.state.columnMappings.get(unmapped.name) ===
                                    undefined).length === 0) {
                                    this.props.onSave(this.state.columnMappings);
                                }
                            }, text: strings_1.strings.templateImport.save, disabled: this.props.unmappedColumns.filter((unmapped) => this.state.columnMappings.get(unmapped.name) === undefined).length !== 0 }))))));
    }
}
exports.FileViewImport = FileViewImport;
//# sourceMappingURL=import_view.js.map
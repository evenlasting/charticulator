"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnView = exports.ColumnViewState = exports.ColumnViewProps = exports.ColumnsView = exports.DatasetView = void 0;
/**
 * See {@link DatasetView} or {@link TableView}
 * @packageDocumentation
 * @preferred
 */
const React = require("react");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const components_1 = require("../../components");
const controllers_1 = require("../../controllers");
const globals = require("../../globals");
const R = require("../../resources");
const stores_1 = require("../../stores");
const utils_1 = require("../../utils");
const controls_1 = require("../panels/widgets/controls");
const common_1 = require("./common");
const table_view_1 = require("./table_view");
const dataset_1 = require("../../../core/dataset");
const specification_1 = require("../../../core/specification");
const template_1 = require("../../template");
const container_1 = require("../../../container");
const import_view_1 = require("../file_view/import_view");
const strings_1 = require("../../../strings");
const app_store_1 = require("../../stores/app_store");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("../panels/widgets/controls/fluentui_customized_components");
/**
 * Component for displaying dataset on the left side of app
 *
 * ![Mark widgets](media://dataset_view.png)
 */
class DatasetView extends React.Component {
    componentDidMount() {
        this.props.store.addListener(stores_1.AppStore.EVENT_DATASET, () => this.forceUpdate());
    }
    render() {
        const tables = this.props.store.getTables();
        const mainTables = [dataset_1.TableType.Main, dataset_1.TableType.Links, dataset_1.TableType.Image];
        return (React.createElement("div", { className: "charticulator__dataset-view" }, tables
            .filter((table) => mainTables.find((m) => m === table.type))
            .map((table, idx) => (React.createElement(ColumnsView, { key: `t${idx}`, table: table, store: this.props.store })))));
    }
    onImportConnections() {
        alert(strings_1.strings.error.notImplemented);
    }
}
exports.DatasetView = DatasetView;
const buttonStyles = {
    root: {
        height: `${fluentui_customized_components_1.defultBindButtonSize}px`,
        width: `${fluentui_customized_components_1.defultBindButtonSize}px`,
        minWidth: `${fluentui_customized_components_1.defultBindButtonSize}px`,
        padding: "0px",
        border: "none",
    },
};
class ColumnsView extends React.Component {
    constructor(props) {
        super(props);
        this.popupController = new controllers_1.PopupController();
        this.state = {
            selectedColumn: null,
            tableViewIsOpened: false,
        };
    }
    // eslint-disable-next-line
    render() {
        const table = this.props.table;
        return (React.createElement(React.Fragment, null,
            React.createElement(controllers_1.PopupContainer, { controller: this.popupController }),
            React.createElement("div", { className: "charticulator__dataset-view-columns" },
                React.createElement("h2", { className: "el-title" },
                    React.createElement("span", { className: "el-text" }, dataset_1.tableTypeName[this.props.table.type]),
                    this.props.store.editorType === app_store_1.EditorType.Chart ? (React.createElement(react_1.DefaultButton, { iconProps: {
                            iconName: "general/replace",
                        }, styles: buttonStyles, title: strings_1.strings.dataset.replaceWithCSV, 
                        // eslint-disable-next-line
                        onClick: () => {
                            // eslint-disable-next-line
                            utils_1.showOpenFileDialog(["csv"]).then((file) => {
                                const loader = new core_1.Dataset.DatasetLoader();
                                const reader = new FileReader();
                                // eslint-disable-next-line
                                reader.onload = () => {
                                    const newTable = loader.loadDSVFromContents(table.name, reader.result, this.props.store.getLocaleFileFormat());
                                    newTable.displayName = utils_1.getFileNameWithoutExtension(file.name);
                                    newTable.name = table.name;
                                    newTable.type = table.type;
                                    const store = this.props.store;
                                    const newDataset = {
                                        name: store.dataset.name,
                                        tables: store.dataset.tables.map((x) => {
                                            if (x.name == table.name) {
                                                return newTable;
                                            }
                                            else {
                                                return x;
                                            }
                                        }),
                                    };
                                    {
                                        const builder = new template_1.ChartTemplateBuilder(store.chart, store.dataset, store.chartManager, CHARTICULATOR_PACKAGE.version);
                                        const template = builder.build();
                                        let unmappedColumns = [];
                                        template.tables[0].columns.forEach((column) => {
                                            unmappedColumns = unmappedColumns.concat(store.checkColumnsMapping(column, dataset_1.TableType.Main, newDataset));
                                        });
                                        if (template.tables[1]) {
                                            template.tables[1].columns.forEach((column) => {
                                                unmappedColumns = unmappedColumns.concat(store.checkColumnsMapping(column, dataset_1.TableType.Links, newDataset));
                                            });
                                        }
                                        const tableMapping = new Map();
                                        tableMapping.set(template.tables[0].name, store.dataset.tables[0].name);
                                        if (template.tables[1] && store.dataset.tables[1]) {
                                            tableMapping.set(template.tables[1].name, store.dataset.tables[1].name);
                                        }
                                        // eslint-disable-next-line
                                        const loadTemplateIntoState = (store, tableMapping, columnMapping, template) => {
                                            const templateInstance = new container_1.ChartTemplate(template);
                                            for (const table of templateInstance.getDatasetSchema()) {
                                                templateInstance.assignTable(table.name, tableMapping.get(table.name) || table.name);
                                                for (const column of table.columns) {
                                                    templateInstance.assignColumn(table.name, column.name, columnMapping.get(column.name) || column.name);
                                                }
                                            }
                                            const instance = templateInstance.instantiate(newDataset, false // no scale inference
                                            );
                                            store.dispatcher.dispatch(new actions_1.Actions.ImportChartAndDataset(instance.chart, newDataset, {}));
                                            store.dispatcher.dispatch(new actions_1.Actions.ReplaceDataset(newDataset));
                                        };
                                        if (unmappedColumns.length > 0) {
                                            this.popupController.showModal((context) => {
                                                return (React.createElement(controllers_1.ModalView, { context: context },
                                                    React.createElement("div", { onClick: (e) => e.stopPropagation() },
                                                        React.createElement(import_view_1.FileViewImport, { mode: import_view_1.MappingMode.ImportDataset, tables: template.tables, datasetTables: newDataset.tables, tableMapping: tableMapping, unmappedColumns: unmappedColumns, onSave: (mapping) => {
                                                                loadTemplateIntoState(store, tableMapping, mapping, template);
                                                                // TODO check mappings
                                                                context.close();
                                                            }, onClose: () => {
                                                                context.close();
                                                            } }))));
                                            }, { anchor: null });
                                        }
                                        else {
                                            store.dispatcher.dispatch(new actions_1.Actions.ReplaceDataset(newDataset));
                                        }
                                    }
                                };
                                reader.readAsText(file);
                            });
                        } })) : null,
                    React.createElement(react_1.DefaultButton, { iconProps: {
                            iconName: "More",
                        }, styles: buttonStyles, id: `charticulator__dataset-view-detail-${this.props.table.displayName}`, title: strings_1.strings.dataset.showDataValues, 
                        // ={false}
                        onClick: () => {
                            this.setState({
                                tableViewIsOpened: !this.state.tableViewIsOpened,
                            });
                        } }),
                    this.state.tableViewIsOpened ? (React.createElement(react_1.Callout, { target: `#charticulator__dataset-view-detail-${this.props.table.displayName}`, onDismiss: () => {
                            this.setState({
                                tableViewIsOpened: false,
                            });
                        } },
                        React.createElement("div", { className: "charticulator__dataset-view-detail" },
                            React.createElement("h2", null, table.displayName || table.name),
                            React.createElement("p", null, strings_1.strings.dataset.dimensions(table.rows.length, table.columns.length)),
                            React.createElement(table_view_1.TableView, { table: table, onTypeChange: this.props.store.editorType === app_store_1.EditorType.Chart
                                    ? (column, type) => {
                                        const store = this.props.store;
                                        store.dispatcher.dispatch(new actions_1.Actions.ConvertColumnDataType(table.name, column, type));
                                    }
                                    : null })))) : null),
                React.createElement("p", { className: "el-details" }, table.displayName || table.name),
                table.columns
                    .filter((c) => !c.metadata.isRaw)
                    .map((c, idx) => (React.createElement(ColumnView, { key: `t${idx}`, store: this.props.store, table: this.props.table, column: c }))))));
    }
}
exports.ColumnsView = ColumnsView;
class ColumnViewProps {
}
exports.ColumnViewProps = ColumnViewProps;
class ColumnViewState {
}
exports.ColumnViewState = ColumnViewState;
class ColumnView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelected: null,
            isExpanded: false,
        };
    }
    renderDerivedColumns() {
        const c = this.props.column;
        const derivedColumns = common_1.type2DerivedColumns[c.type];
        if (!derivedColumns) {
            return null;
        }
        return (React.createElement("div", { className: "charticulator__dataset-view-derived-fields" }, derivedColumns.map((desc) => {
            const expr = core_1.Expression.functionCall(desc.function, core_1.Expression.variable(this.props.column.name)).toString();
            const lambdaExpr = core_1.Expression.lambda(["x"], core_1.Expression.functionCall(desc.function, core_1.Expression.fields(core_1.Expression.variable("x"), this.props.column.name))).toString();
            const type = desc.type;
            return this.renderColumnControl(desc.name, R.getSVGIcon(common_1.kind2Icon[desc.metadata.kind]), expr, lambdaExpr, type, null, desc.metadata, undefined, expr, desc.displayName);
        })));
    }
    applyAggregation(expr, type, kind) {
        const aggregation = core_1.Expression.getDefaultAggregationFunction(type, kind);
        return core_1.Expression.functionCall(aggregation, core_1.Expression.parse(expr)).toString();
    }
    renderColumnControl(label, icon, expr, lambdaExpr, type, additionalElement = null, metadata, onColumnKindChanged, rawColumnExpr, displayLabel) {
        let anchor;
        const onClickHandler = () => {
            if (!onColumnKindChanged) {
                return;
            }
            globals.popupController.popupAt((context) => (React.createElement(controllers_1.PopupView, { key: label, context: context },
                React.createElement("div", null,
                    React.createElement(controls_1.DropdownListView, { selected: type, list: utils_1.getConvertableDataKind(type).map((type) => {
                            return {
                                name: type.toString(),
                                text: type.toString(),
                                url: R.getSVGIcon(common_1.kind2Icon[type]),
                            };
                        }), context: context, onClick: (value) => {
                            onColumnKindChanged(label, value);
                        }, onClose: () => {
                            anchor === null || anchor === void 0 ? void 0 : anchor.focus();
                        } })))), {
                anchor,
                alignX: controllers_1.PopupAlignment.Outer,
                alignY: controllers_1.PopupAlignment.StartInner,
            });
        };
        return (React.createElement("div", { tabIndex: 0, key: label, className: "click-handler", ref: (e) => (anchor = e), onClick: onClickHandler, onKeyPress: (e) => {
                if (e.key === "Enter") {
                    onClickHandler();
                }
            } },
            React.createElement(components_1.DraggableElement, { key: expr, className: utils_1.classNames("charticulator__dataset-view-column", [
                    "is-active",
                    this.state.isSelected == expr,
                ]), onDragStart: () => this.setState({ isSelected: expr }), onDragEnd: () => this.setState({ isSelected: null }), dragData: () => {
                    this.setState({ isSelected: expr });
                    const r = new actions_1.DragData.DataExpression(this.props.table, this.applyAggregation(expr, type, metadata.kind), type, metadata, rawColumnExpr
                        ? this.applyAggregation(rawColumnExpr, specification_1.DataType.String, metadata.kind)
                        : this.applyAggregation(expr, type, metadata.kind));
                    return r;
                }, renderDragElement: () => [
                    React.createElement("span", { className: "dragging-table-cell" }, expr),
                    { x: -10, y: -8 },
                ] },
                React.createElement(components_1.SVGImageIcon, { url: icon }),
                React.createElement("span", { className: "el-text" }, displayLabel !== null && displayLabel !== void 0 ? displayLabel : label),
                additionalElement)));
    }
    // eslint-disable-next-line
    render() {
        const c = this.props.column;
        const derivedColumnsControl = this.renderDerivedColumns();
        if (derivedColumnsControl != null) {
            return (React.createElement("div", null,
                this.renderColumnControl(c.name, R.getSVGIcon(common_1.kind2Icon[c.metadata.kind]), core_1.Expression.variable(c.name).toString(), core_1.Expression.lambda(["x"], core_1.Expression.fields(core_1.Expression.variable("x"), c.name)).toString(), c.type, React.createElement(components_1.ButtonFlat, { title: strings_1.strings.dataset.showDerivedFields, stopPropagation: true, url: this.state.isExpanded
                        ? R.getSVGIcon("ChevronDown")
                        : R.getSVGIcon("ChevronLeft"), onClick: () => {
                        this.setState({ isExpanded: !this.state.isExpanded });
                    } }), c.metadata, (column, type) => {
                    c.metadata.kind = type;
                    this.forceUpdate();
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.UpdatePlotSegments());
                }, core_1.Expression.variable(c.metadata.rawColumnName || c.name).toString(), c.displayName),
                this.state.isExpanded ? derivedColumnsControl : null));
        }
        else {
            return this.renderColumnControl(c.name, R.getSVGIcon(common_1.kind2Icon[c.metadata.kind]), core_1.Expression.variable(c.name).toString(), core_1.Expression.lambda(["x"], core_1.Expression.fields(core_1.Expression.variable("x"), c.name)).toString(), c.type, null, c.metadata, (column, type) => {
                c.metadata.kind = type;
                this.props.store.dispatcher.dispatch(new actions_1.Actions.UpdatePlotSegments());
                this.forceUpdate();
            }, core_1.Expression.variable(c.metadata.rawColumnName || c.name).toString(), c.displayName);
        }
    }
}
exports.ColumnView = ColumnView;
//# sourceMappingURL=dataset_view.js.map
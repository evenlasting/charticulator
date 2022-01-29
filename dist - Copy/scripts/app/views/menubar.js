"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuBar = exports.HelpButton = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const globals = require("../globals");
const R = require("../resources");
const react_1 = require("@fluentui/react");
const core_1 = require("../../core");
const actions_1 = require("../actions");
const components_1 = require("../components");
const context_component_1 = require("../context_component");
const controllers_1 = require("../controllers");
const file_view_1 = require("./file_view");
const stores_1 = require("../stores");
const utils_1 = require("../utils");
const container_1 = require("../../container");
const dataset_1 = require("../../core/dataset");
const import_view_1 = require("./file_view/import_view");
const strings_1 = require("../../strings");
const main_view_1 = require("../main_view");
const config_1 = require("../config");
const app_store_1 = require("../stores/app_store");
const delete_dialog_1 = require("./panels/delete_dialog");
class HelpButton extends React.Component {
    render() {
        var _a;
        const contactUsLinkProps = {
            onClick: (_a = this.props.handlers) === null || _a === void 0 ? void 0 : _a.onContactUsLink,
        };
        if (!contactUsLinkProps.onClick) {
            contactUsLinkProps.href =
                config_1.getConfig().ContactUsHref || "mailto:charticulator@microsoft.com";
        }
        return (React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/help"), title: strings_1.strings.menuBar.help, ref: "helpButton", onClick: () => {
                globals.popupController.popupAt((context) => {
                    return (React.createElement(controllers_1.PopupView, { context: context, className: "charticulator__menu-popup" },
                        React.createElement("div", { className: "charticulator__menu-dropdown", onClick: () => context.close() },
                            React.createElement("div", { className: "el-item" },
                                React.createElement("a", { target: "_blank", href: "https://charticulator.com/docs/getting-started.html" }, strings_1.strings.help.gettingStarted)),
                            React.createElement("div", { className: "el-item" },
                                React.createElement("a", { target: "_blank", href: "https://charticulator.com/gallery/index.html" }, strings_1.strings.help.gallery)),
                            this.props.hideReportIssues ? null : (React.createElement("div", { className: "el-item" },
                                React.createElement("a", { target: "_blank", href: "https://github.com/Microsoft/charticulator/issues/new" }, strings_1.strings.help.issues))),
                            React.createElement("div", { className: "el-item" },
                                React.createElement("a", { target: "_blank", href: "https://charticulator.com/" }, strings_1.strings.help.home)),
                            React.createElement("div", { className: "el-item" },
                                React.createElement("a", Object.assign({}, contactUsLinkProps), strings_1.strings.help.contact)),
                            React.createElement("div", { className: "el-item-version" }, strings_1.strings.help.version(CHARTICULATOR_PACKAGE.version)))));
                }, {
                    anchor: ReactDOM.findDOMNode(this.refs.helpButton),
                    alignX: controllers_1.PopupAlignment.EndInner,
                });
            } }));
    }
}
exports.HelpButton = HelpButton;
class MenuBar extends context_component_1.ContextedComponent {
    constructor(props, context) {
        super(props, context);
        this.popupController = new controllers_1.PopupController();
        this.keyboardMap = {
            "ctrl-z": "undo",
            "ctrl-y": "redo",
            "ctrl-s": "save",
            "ctrl-shift-s": "export",
            "ctrl-n": "new",
            "ctrl-o": "open",
            backspace: "delete",
            delete: "delete",
            escape: "escape",
        };
        this.onKeyDown = (e) => {
            if (e.target == document.body) {
                let prefix = "";
                if (e.shiftKey) {
                    prefix = "shift-" + prefix;
                }
                if (e.ctrlKey || e.metaKey) {
                    prefix = "ctrl-" + prefix;
                }
                const name = `${prefix}${e.key}`.toLowerCase();
                if (this.keyboardMap[name]) {
                    const command = this.keyboardMap[name];
                    switch (command) {
                        case "new":
                            {
                                this.showFileModalWindow(file_view_1.MainTabs.open);
                            }
                            break;
                        case "open":
                            {
                                this.showFileModalWindow(file_view_1.MainTabs.open);
                            }
                            break;
                        case "save":
                            {
                                if (this.context.store.editorType == app_store_1.EditorType.Nested ||
                                    this.context.store.editorType == app_store_1.EditorType.Embedded ||
                                    this.context.store.editorType == app_store_1.EditorType.NestedEmbedded) {
                                    this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_EDIT);
                                }
                                else {
                                    if (this.context.store.currentChartID) {
                                        this.dispatch(new actions_1.Actions.Save());
                                    }
                                    else {
                                        this.showFileModalWindow(file_view_1.MainTabs.save);
                                    }
                                }
                            }
                            break;
                        case "export":
                            {
                                this.showFileModalWindow(file_view_1.MainTabs.export);
                            }
                            break;
                        case "undo":
                            {
                                new actions_1.Actions.Undo().dispatch(this.context.store.dispatcher);
                            }
                            break;
                        case "redo":
                            {
                                new actions_1.Actions.Redo().dispatch(this.context.store.dispatcher);
                            }
                            break;
                        case "delete":
                            {
                                this.store.deleteSelection();
                            }
                            break;
                        case "escape":
                            {
                                this.store.handleEscapeKey();
                            }
                            break;
                    }
                    e.preventDefault();
                }
            }
        };
        this.state = {
            showSaveDialog: false,
        };
    }
    componentDidMount() {
        window.addEventListener("keydown", this.onKeyDown);
        this.editor = this.context.store.addListener(stores_1.AppStore.EVENT_IS_NESTED_EDITOR, () => this.forceUpdate());
        this.graphics = this.context.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => this.forceUpdate());
    }
    componentWillUnmount() {
        window.removeEventListener("keydown", this.onKeyDown);
        this.editor.remove();
        this.graphics.remove();
    }
    hideFileModalWindow() {
        globals.popupController.reset();
    }
    showFileModalWindow(defaultTab = file_view_1.MainTabs.open) {
        if (this.context.store.disableFileView) {
            return;
        }
        globals.popupController.showModal((context) => {
            return (React.createElement(controllers_1.ModalView, { context: context },
                React.createElement(file_view_1.FileView, { backend: this.context.store.backend, defaultTab: defaultTab, store: this.context.store, onClose: () => context.close() })));
        }, { anchor: null });
    }
    renderSaveNested() {
        return (React.createElement(React.Fragment, null,
            React.createElement(react_1.Dialog, { dialogContentProps: {
                    title: strings_1.strings.dialogs.saveChanges.saveChangesTitle,
                    subText: strings_1.strings.dialogs.saveChanges.saveChanges("chart"),
                }, hidden: !this.state.showSaveDialog, minWidth: "80%", onDismiss: () => {
                    this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_CLOSE);
                } },
                React.createElement(react_1.DialogFooter, null,
                    React.createElement(react_1.PrimaryButton, { styles: container_1.primaryButtonStyles, onClick: () => {
                            this.setState({
                                showSaveDialog: false,
                            });
                            this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_EDIT);
                            setTimeout(() => this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_CLOSE));
                        }, text: strings_1.strings.menuBar.saveButton }),
                    React.createElement(react_1.DefaultButton, { onClick: () => {
                            this.setState({
                                showSaveDialog: false,
                            });
                            this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_CLOSE);
                        }, text: strings_1.strings.menuBar.dontSaveButton }))),
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/save"), text: strings_1.strings.menuBar.saveNested, title: strings_1.strings.menuBar.save, onClick: () => {
                    this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_EDIT);
                    this.setState({
                        showSaveDialog: false,
                    });
                } }),
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/cross"), text: strings_1.strings.menuBar.closeNested, title: strings_1.strings.menuBar.closeNested, onClick: () => {
                    if (this.store.chartManager.hasUnsavedChanges()) {
                        this.setState({
                            showSaveDialog: true,
                        });
                    }
                    else {
                        this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_CLOSE);
                        this.setState({
                            showSaveDialog: false,
                        });
                    }
                } }),
            React.createElement("span", { className: "charticulator__menu-bar-separator" })));
    }
    // eslint-disable-next-line
    renderImportButton(props) {
        var _a;
        return (React.createElement(React.Fragment, null,
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/import-template"), text: "", title: strings_1.strings.menuBar.importTemplate, onClick: ((_a = props.handlers) === null || _a === void 0 ? void 0 : _a.onImportTemplateClick) ||
                    // eslint-disable-next-line
                    (() => {
                        const inputElement = document.createElement("input");
                        inputElement.type = "file";
                        let file = null;
                        inputElement.accept = ["tmplt", "json"]
                            .map((x) => "." + x)
                            .join(",");
                        // eslint-disable-next-line
                        inputElement.onchange = () => {
                            if (inputElement.files.length == 1) {
                                file = inputElement.files[0];
                                if (file) {
                                    // eslint-disable-next-line
                                    utils_1.readFileAsString(file).then((str) => {
                                        const data = JSON.parse(str);
                                        let unmappedColumns = [];
                                        data.tables[0].columns.forEach((column) => {
                                            unmappedColumns = unmappedColumns.concat(this.store.checkColumnsMapping(column, dataset_1.TableType.Main, this.store.dataset));
                                        });
                                        if (data.tables[1]) {
                                            data.tables[1].columns.forEach((column) => {
                                                unmappedColumns = unmappedColumns.concat(this.store.checkColumnsMapping(column, dataset_1.TableType.Links, this.store.dataset));
                                            });
                                        }
                                        const tableMapping = new Map();
                                        tableMapping.set(data.tables[0].name, this.store.dataset.tables[0].name);
                                        if (data.tables[1] && this.store.dataset.tables[1]) {
                                            tableMapping.set(data.tables[1].name, this.store.dataset.tables[1].name);
                                        }
                                        const loadTemplateIntoState = (tableMapping, columnMapping) => {
                                            const template = new container_1.ChartTemplate(data);
                                            for (const table of template.getDatasetSchema()) {
                                                template.assignTable(table.name, tableMapping.get(table.name) || table.name);
                                                for (const column of table.columns) {
                                                    template.assignColumn(table.name, column.name, columnMapping.get(column.name) || column.name);
                                                }
                                            }
                                            const instance = template.instantiate(this.store.dataset, false // no scale inference
                                            );
                                            this.store.dispatcher.dispatch(new actions_1.Actions.ImportChartAndDataset(instance.chart, this.store.dataset, {}));
                                            this.store.dispatcher.dispatch(new actions_1.Actions.ReplaceDataset(this.store.dataset));
                                        };
                                        if (unmappedColumns.length > 0) {
                                            // mapping show dialog then call loadTemplateIntoState
                                            this.popupController.showModal((context) => {
                                                return (React.createElement(controllers_1.ModalView, { context: context },
                                                    React.createElement("div", { onClick: (e) => e.stopPropagation() },
                                                        React.createElement(import_view_1.FileViewImport, { mode: import_view_1.MappingMode.ImportTemplate, tables: data.tables, datasetTables: this.store.dataset.tables, tableMapping: tableMapping, unmappedColumns: unmappedColumns, onSave: (mapping) => {
                                                                loadTemplateIntoState(tableMapping, mapping);
                                                                context.close();
                                                            }, onClose: () => {
                                                                context.close();
                                                            } }))));
                                            }, { anchor: null });
                                        }
                                        else {
                                            loadTemplateIntoState(tableMapping, new Map());
                                        }
                                    });
                                }
                            }
                        };
                        inputElement.click();
                    }) })));
    }
    renderExportButton(props) {
        var _a;
        return (React.createElement(React.Fragment, null,
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/export-template"), text: "", title: strings_1.strings.menuBar.exportTemplate, onClick: ((_a = props.handlers) === null || _a === void 0 ? void 0 : _a.onExportTemplateClick) ||
                    (() => {
                        const template = core_1.deepClone(this.store.buildChartTemplate());
                        const target = this.store.createExportTemplateTarget(strings_1.strings.menuBar.defaultTemplateName, template);
                        const targetProperties = {};
                        for (const property of target.getProperties()) {
                            targetProperties[property.name] =
                                this.store.getPropertyExportName(property.name) ||
                                    property.default;
                        }
                        this.dispatch(new actions_1.Actions.ExportTemplate("", target, targetProperties));
                    }) })));
    }
    renderSaveEmbedded() {
        const hasUnsavedChanges = this.store.chartManager.hasUnsavedChanges();
        return (React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/save"), text: strings_1.strings.menuBar.saveButton, disabled: !hasUnsavedChanges, title: strings_1.strings.menuBar.save, onClick: () => {
                this.context.store.dispatcher.dispatch(new actions_1.Actions.UpdatePlotSegments());
                this.context.store.dispatcher.dispatch(new actions_1.Actions.UpdateDataAxis());
                this.context.store.emit(stores_1.AppStore.EVENT_NESTED_EDITOR_EDIT);
            } }));
    }
    renderDelete() {
        return React.createElement(delete_dialog_1.DeleteDialog, { context: this.context });
    }
    renderNewOpenSave() {
        return (React.createElement(React.Fragment, null,
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/new"), title: strings_1.strings.menuBar.new, onClick: () => {
                    this.showFileModalWindow(file_view_1.MainTabs.new);
                } }),
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/open"), title: strings_1.strings.menuBar.open, onClick: () => {
                    this.showFileModalWindow(file_view_1.MainTabs.open);
                } }),
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/save"), title: strings_1.strings.menuBar.save, text: strings_1.strings.menuBar.saveButton, onClick: () => {
                    if (this.context.store.currentChartID) {
                        this.dispatch(new actions_1.Actions.Save());
                    }
                    else {
                        this.showFileModalWindow(file_view_1.MainTabs.save);
                    }
                } }),
            this.renderImportButton(this.props),
            React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/export"), title: strings_1.strings.menuBar.export, onClick: () => {
                    this.showFileModalWindow(file_view_1.MainTabs.export);
                } })));
    }
    toolbarButtons(props) {
        return (React.createElement(React.Fragment, null,
            this.context.store.editorType === app_store_1.EditorType.Chart
                ? this.renderNewOpenSave()
                : null,
            this.context.store.editorType === app_store_1.EditorType.Embedded &&
                props.alignSaveButton === props.alignButtons
                ? this.renderSaveEmbedded()
                : null,
            this.context.store.editorType === app_store_1.EditorType.Embedded ||
                this.context.store.editorType === app_store_1.EditorType.NestedEmbedded ? (React.createElement(React.Fragment, null,
                React.createElement("span", { className: "charticulator__menu-bar-separator" }),
                this.renderImportButton(props),
                this.renderExportButton(props))) : null,
            React.createElement("span", { className: "charticulator__menu-bar-separator" }),
            this.props.undoRedoLocation === main_view_1.UndoRedoLocation.MenuBar ? (React.createElement(React.Fragment, null,
                React.createElement(components_1.MenuButton, { url: R.getSVGIcon("Undo"), title: strings_1.strings.menuBar.undo, disabled: this.context.store.historyManager.statesBefore.length === 0, onClick: () => new actions_1.Actions.Undo().dispatch(this.context.store.dispatcher) }),
                React.createElement(components_1.MenuButton, { url: R.getSVGIcon("Redo"), title: strings_1.strings.menuBar.redo, disabled: this.context.store.historyManager.statesAfter.length === 0, onClick: () => new actions_1.Actions.Redo().dispatch(this.context.store.dispatcher) }))) : null,
            React.createElement("span", { className: "charticulator__menu-bar-separator" }),
            this.renderDelete()));
    }
    toolbarTabButtons(props) {
        var _a;
        return (React.createElement(React.Fragment, null, (_a = props.tabButtons) === null || _a === void 0 ? void 0 : _a.map((button) => {
            return (React.createElement(React.Fragment, null,
                React.createElement("span", { className: "charticulator__menu-bar-separator" }),
                React.createElement(components_1.MenuButton, { url: R.getSVGIcon(button.icon), title: button.tooltip, onClick: button.onClick, text: button.text, disabled: !button.active })));
        })));
    }
    render() {
        var _a;
        return (React.createElement(React.Fragment, null,
            React.createElement(controllers_1.PopupContainer, { controller: this.popupController }),
            React.createElement("section", { className: "charticulator__menu-bar" },
                React.createElement("div", { className: "charticulator__menu-bar-left" },
                    this.context.store.editorType === app_store_1.EditorType.Embedded ||
                        this.context.store.editorType ===
                            app_store_1.EditorType.NestedEmbedded ? null : (React.createElement(components_1.AppButton, { name: this.props.name, title: strings_1.strings.menuBar.home, onClick: () => this.showFileModalWindow(file_view_1.MainTabs.open) })),
                    this.props.alignButtons === main_view_1.PositionsLeftRight.Left ? (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "charticulator__menu-bar-separator" }),
                        this.toolbarButtons(this.props))) : null,
                    this.context.store.editorType === app_store_1.EditorType.Embedded &&
                        this.props.alignSaveButton == main_view_1.PositionsLeftRight.Left &&
                        this.props.alignSaveButton !== this.props.alignButtons
                        ? this.renderSaveEmbedded()
                        : null,
                    this.context.store.editorType === app_store_1.EditorType.Embedded &&
                        this.props.tabButtons
                        ? this.toolbarTabButtons(this.props)
                        : null,
                    this.context.store.editorType === app_store_1.EditorType.Nested ||
                        this.context.store.editorType === app_store_1.EditorType.NestedEmbedded
                        ? this.renderSaveNested()
                        : null),
                React.createElement("div", { className: "charticulator__menu-bar-center el-text" },
                    React.createElement("p", { className: utils_1.classNames("charticulator__menu-bar-center", [
                            "nested-chart",
                            this.context.store.editorType === app_store_1.EditorType.NestedEmbedded,
                        ]) }, `${(_a = this.context.store.chart) === null || _a === void 0 ? void 0 : _a.properties.name}${this.context.store.editorType === app_store_1.EditorType.Embedded ||
                        this.context.store.editorType === app_store_1.EditorType.NestedEmbedded
                        ? " - " + this.props.name || strings_1.strings.app.name
                        : ""}`)),
                React.createElement("div", { className: "charticulator__menu-bar-right" },
                    this.props.alignButtons === main_view_1.PositionsLeftRight.Right ? (React.createElement(React.Fragment, null,
                        this.toolbarButtons(this.props),
                        React.createElement("span", { className: "charticulator__menu-bar-separator" }))) : null,
                    (this.context.store.editorType === app_store_1.EditorType.Embedded ||
                        this.context.store.editorType === app_store_1.EditorType.NestedEmbedded) &&
                        this.props.alignSaveButton == main_view_1.PositionsLeftRight.Right &&
                        this.props.alignSaveButton !== this.props.alignButtons
                        ? this.renderSaveEmbedded()
                        : null,
                    React.createElement(HelpButton, { handlers: this.props.handlers, hideReportIssues: false })))));
    }
}
exports.MenuBar = MenuBar;
//# sourceMappingURL=menubar.js.map
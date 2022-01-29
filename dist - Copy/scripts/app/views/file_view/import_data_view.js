"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDataView = exports.FileUploader = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const R = require("../../resources");
const globals = require("../../globals");
const config_1 = require("../../config");
const core_1 = require("../../../core");
const utils_1 = require("../../utils");
const index_1 = require("../../components/index");
const icons_1 = require("../../components/icons");
const table_view_1 = require("../dataset/table_view");
const controllers_1 = require("../../controllers");
const dataset_1 = require("../../../core/dataset");
const stores_1 = require("../../stores");
const actions_1 = require("../../actions/actions");
const strings_1 = require("../../../strings");
const react_1 = require("@fluentui/react");
class FileUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            draggingOver: false,
            filename: props.filename,
        };
    }
    reset() {
        this.inputElement.value = null;
        this.setState({
            filename: null,
        });
    }
    onInputChange() {
        if (this.inputElement.files.length == 1) {
            this.setState({
                filename: this.inputElement.files[0].name,
            });
            if (this.props.onChange) {
                this.props.onChange(this.inputElement.files[0]);
            }
        }
    }
    showOpenFile() {
        this.reset();
        this.inputElement.click();
    }
    isDataTransferValid(dt) {
        if (dt && dt.items.length == 1) {
            if (dt.items[0].kind == "file") {
                return true;
            }
        }
        return false;
    }
    getFileFromDataTransfer(dt) {
        if (dt && dt.items.length == 1) {
            if (dt.items[0].kind == "file") {
                const file = dt.items[0].getAsFile();
                const ext = utils_1.getExtensionFromFileName(file.name);
                if (this.props.extensions.indexOf(ext) >= 0) {
                    return file;
                }
                else {
                    return null;
                }
            }
        }
        if (dt && dt.files.length == 1) {
            return dt.files[0];
        }
        return null;
    }
    render() {
        return (React.createElement("div", { tabIndex: 0, className: utils_1.classNames("charticulator__file-uploader", ["is-dragging-over", this.state.draggingOver], ["is-active", this.state.filename != null]), onClick: () => this.showOpenFile(), onKeyPress: (e) => {
                if (e.key === "Enter") {
                    this.showOpenFile();
                }
            }, onDragOver: (e) => {
                e.preventDefault();
                if (this.isDataTransferValid(e.dataTransfer)) {
                    this.setState({
                        draggingOver: true,
                    });
                }
            }, onDragLeave: () => {
                this.setState({
                    draggingOver: false,
                });
            }, onDragExit: () => {
                this.setState({
                    draggingOver: false,
                });
            }, onDrop: (e) => {
                e.preventDefault();
                this.setState({
                    draggingOver: false,
                });
                const file = this.getFileFromDataTransfer(e.dataTransfer);
                if (file != null) {
                    this.setState({
                        filename: file.name,
                    });
                    if (this.props.onChange) {
                        this.props.onChange(file);
                    }
                }
            } },
            React.createElement("input", { style: { display: "none" }, accept: this.props.extensions.map((x) => "." + x).join(","), ref: (e) => (this.inputElement = e), type: "file", onChange: () => this.onInputChange() }),
            this.state.filename == null ? (React.createElement("span", { className: "charticulator__file-uploader-prompt" },
                React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("toolbar/import") }),
                strings_1.strings.fileImport.fileUpload)) : (React.createElement("span", { className: "charticulator__file-uploader-filename" }, this.state.filename))));
    }
}
exports.FileUploader = FileUploader;
class ImportDataView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTable: null,
            imagesTable: null,
            linkTable: null,
            dataTableOrigin: null,
            linkTableOrigin: null,
        };
        this.props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => {
            if (this.isComponentMounted) {
                this.forceUpdate();
            }
        });
    }
    componentDidMount() {
        this.isComponentMounted = true;
    }
    componentWillUnmount() {
        this.isComponentMounted = false;
    }
    loadFileAsTable(file) {
        return utils_1.readFileAsString(file).then((contents) => {
            const localeFileFormat = this.props.store.getLocaleFileFormat();
            const ext = utils_1.getExtensionFromFileName(file.name);
            const filename = utils_1.getFileNameWithoutExtension(file.name);
            const loader = new core_1.Dataset.DatasetLoader();
            switch (ext) {
                case "csv": {
                    const table = loader.loadDSVFromContents(filename, contents, localeFileFormat);
                    // if table contains images split to separate table
                    const keyAndImageColumns = table.columns.filter((column) => column.name === core_1.ImageKeyColumn ||
                        column.type === core_1.Dataset.DataType.Image);
                    if (keyAndImageColumns.length === 2) {
                        const imagesIds = table.rows.map((row) => row === null || row === void 0 ? void 0 : row[core_1.ImageKeyColumn]);
                        const uniqueIds = [...new Set(imagesIds)];
                        const rows = uniqueIds.map((imageId) => {
                            return table.rows.find((row) => row[core_1.ImageKeyColumn] === imageId);
                        });
                        const imageTable = Object.assign(Object.assign({}, table), { name: table.name + "Images", displayName: table.displayName + "Images", columns: keyAndImageColumns, rows: rows.map((row) => {
                                const imageRow = {
                                    _id: row["_id"],
                                };
                                keyAndImageColumns.forEach((column) => {
                                    imageRow[column.name] = row[column.name];
                                });
                                return imageRow;
                            }) });
                        table.columns = table.columns.filter((column) => column.type !== core_1.Dataset.DataType.Image &&
                            column.displayName !== core_1.ImageKeyColumn);
                        return [table, imageTable];
                    }
                    return [table, null];
                }
                case "tsv": {
                    return [
                        loader.loadDSVFromContents(filename, contents, {
                            delimiter: "\t",
                            numberFormat: localeFileFormat.numberFormat,
                            currency: null,
                            group: null,
                        }),
                        null,
                    ];
                }
            }
        });
    }
    renderTable(table, onTypeChange) {
        return (React.createElement("div", { className: "wide-content" },
            React.createElement(table_view_1.TableView, { table: table, maxRows: 5, onTypeChange: onTypeChange })));
    }
    // eslint-disable-next-line
    render() {
        let sampleDatasetDiv;
        const sampleDatasets = config_1.getConfig().SampleDatasets;
        return (React.createElement("div", { className: "charticulator__import-data-view" },
            sampleDatasets != null ? (React.createElement("div", { ref: (e) => (sampleDatasetDiv = e) },
                React.createElement(index_1.ButtonRaised, { text: strings_1.strings.fileImport.loadSample, onClick: () => {
                        globals.popupController.popupAt((context) => {
                            return (React.createElement(controllers_1.PopupView, { context: context },
                                React.createElement("div", { className: "charticulator__sample-dataset-list" }, sampleDatasets.map((dataset) => {
                                    return (React.createElement("div", { className: "charticulator__sample-dataset-list-item", key: dataset.name, onClick: () => {
                                            Promise.all(dataset.tables.map((table, index) => {
                                                const loader = new core_1.Dataset.DatasetLoader();
                                                return loader
                                                    .loadDSVFromURL(table.url, this.props.store.getLocaleFileFormat())
                                                    .then((r) => {
                                                    r.name = table.name;
                                                    r.displayName = table.name;
                                                    r.type =
                                                        index == 0
                                                            ? dataset_1.TableType.Main
                                                            : dataset_1.TableType.Links; // assumes there are two tables only
                                                    return r;
                                                });
                                            })).then((tables) => {
                                                context.close();
                                                const ds = {
                                                    name: dataset.name,
                                                    tables,
                                                };
                                                this.props.onConfirmImport(ds);
                                            });
                                        } },
                                        React.createElement("div", { className: "el-title" }, dataset.name),
                                        React.createElement("div", { className: "el-description" }, dataset.description)));
                                }))));
                        }, { anchor: sampleDatasetDiv });
                    } }))) : null,
            React.createElement("h2", null,
                "Data",
                this.state.dataTable ? ": " + this.state.dataTable.name : null),
            this.state.dataTable ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "charticulator__import-data-view-table" },
                    this.renderTable(this.state.dataTable, (column, type) => {
                        const dataColumn = this.state.dataTable.columns.find((col) => col.name === column);
                        const dataTableError = utils_1.convertColumns(this.state.dataTable, dataColumn, this.state.dataTableOrigin, type);
                        if (dataTableError) {
                            this.props.store.dispatcher.dispatch(new actions_1.AddMessage("parsingDataError", {
                                text: dataTableError,
                            }));
                        }
                        else {
                            this.setState({
                                dataTable: this.state.dataTable,
                            });
                            dataColumn.type = type;
                            dataColumn.metadata.kind = utils_1.getPreferredDataKind(type);
                        }
                    }),
                    React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileImport.removeButtonText, iconProps: {
                            iconName: "ChromeClose",
                        }, styles: core_1.primaryButtonStyles, title: strings_1.strings.fileImport.removeButtonTitle, onClick: () => {
                            this.setState({
                                dataTable: null,
                                dataTableOrigin: null,
                            });
                        } })),
                this.state.imagesTable ? (React.createElement("div", { className: "charticulator__import-data-view-table" }, this.renderTable(this.state.imagesTable, (column, type) => {
                    const dataColumn = this.state.imagesTable.columns.find((col) => col.name === column);
                    const dataTableError = utils_1.convertColumns(this.state.imagesTable, dataColumn, this.state.dataTableOrigin, type);
                    if (dataTableError) {
                        this.props.store.dispatcher.dispatch(new actions_1.AddMessage("parsingDataError", {
                            text: dataTableError,
                        }));
                    }
                    else {
                        this.setState({
                            imagesTable: this.state.imagesTable,
                        });
                        dataColumn.type = type;
                        dataColumn.metadata.kind = utils_1.getPreferredDataKind(type);
                    }
                }))) : null)) : (React.createElement(FileUploader, { extensions: ["csv", "tsv"], onChange: (file) => {
                    this.loadFileAsTable(file).then(([table, imageTable]) => {
                        table.type = dataset_1.TableType.Main;
                        if (imageTable) {
                            imageTable.type = dataset_1.TableType.Image;
                        }
                        this.checkKeyColumn(table, this.state.linkTable);
                        this.setState({
                            dataTable: table,
                            dataTableOrigin: core_1.deepClone(table),
                            imagesTable: imageTable,
                        });
                    });
                } })),
            React.createElement("h2", null,
                strings_1.strings.fileImport.links,
                this.state.linkTable ? ": " + this.state.linkTable.name : null),
            this.state.linkTable ? (React.createElement("div", { className: "charticulator__import-data-view-table" },
                this.renderTable(this.state.linkTable, (column, type) => {
                    const dataColumn = this.state.linkTable.columns.find((col) => col.name === column);
                    const linkTableError = utils_1.convertColumns(this.state.linkTable, dataColumn, this.state.dataTableOrigin, type);
                    if (linkTableError) {
                        this.props.store.dispatcher.dispatch(new actions_1.AddMessage("parsingDataError", {
                            text: linkTableError,
                        }));
                    }
                    this.setState({
                        linkTable: this.state.linkTable,
                        linkTableOrigin: this.state.linkTable,
                    });
                }),
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileImport.removeButtonText, iconProps: {
                        iconName: "ChromeClose",
                    }, title: strings_1.strings.fileImport.removeButtonTitle, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.setState({
                            linkTable: null,
                            linkTableOrigin: null,
                        });
                        this.checkSourceAndTargetColumns(null);
                        this.checkKeyColumn(this.state.dataTable, null);
                    } }))) : (React.createElement(FileUploader, { extensions: ["csv", "tsv"], onChange: (file) => {
                    this.loadFileAsTable(file).then(([table]) => {
                        table.type = dataset_1.TableType.Links;
                        this.checkSourceAndTargetColumns(table);
                        this.checkKeyColumn(this.state.dataTable, table);
                        this.setState({
                            linkTable: table,
                            linkTableOrigin: core_1.deepClone(table),
                        });
                    });
                } })),
            React.createElement("div", { className: "el-actions" },
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileImport.doneButtonText, iconProps: {
                        iconName: "CheckMark",
                    }, styles: core_1.primaryButtonStyles, title: strings_1.strings.fileImport.doneButtonTitle, disabled: this.state.dataTable == null ||
                        this.props.store.messageState.get("noID") !== undefined ||
                        this.props.store.messageState.get("noSourceOrTargetID") !==
                            undefined, onClick: () => {
                        if (this.state.dataTable != null &&
                            this.props.store.messageState.get("noID") === undefined &&
                            this.props.store.messageState.get("noSourceOrTargetID") ===
                                undefined) {
                            const dataset = {
                                name: this.state.dataTable.name,
                                tables: [this.state.dataTable, this.state.imagesTable].filter((table) => table != null),
                            };
                            if (this.state.linkTable != null) {
                                dataset.tables.push(this.state.linkTable);
                            }
                            this.props.onConfirmImport(dataset);
                        }
                    } })),
            React.createElement("div", { className: "charticulator__credits" },
                React.createElement("p", { dangerouslySetInnerHTML: {
                        __html: config_1.getConfig().LegalNotices &&
                            config_1.getConfig().LegalNotices.privacyStatementHTML,
                    } }))));
    }
    checkSourceAndTargetColumns(table) {
        const countOfKeyColumns = table &&
            table.columns.filter((column) => column.name === core_1.LinkSourceKeyColumn ||
                column.name === core_1.LinkTargetKeyColumn).length;
        if (table && countOfKeyColumns < 2) {
            this.props.store.dispatcher.dispatch(new actions_1.AddMessage("noSourceOrTargetID", {
                text: strings_1.strings.fileImport.messageNoSourceOrTargetID(core_1.LinkSourceKeyColumn, core_1.LinkTargetKeyColumn),
            }));
        }
        else {
            this.props.store.dispatcher.dispatch(new actions_1.RemoveMessage("noSourceOrTargetID"));
        }
    }
    checkKeyColumn(mainTable, linksTable) {
        const isKeyColumn = mainTable &&
            mainTable.columns.find((column) => column.name === core_1.KeyColumn);
        if (!isKeyColumn && linksTable) {
            this.props.store.dispatcher.dispatch(new actions_1.AddMessage("noID", {
                text: strings_1.strings.fileImport.messageNoID(core_1.KeyColumn),
            }));
        }
        else {
            this.props.store.dispatcher.dispatch(new actions_1.RemoveMessage("noID"));
        }
    }
}
exports.ImportDataView = ImportDataView;
//# sourceMappingURL=import_data_view.js.map
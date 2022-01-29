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
exports.FileViewOpen = void 0;
const FileSaver = require("file-saver");
const React = require("react");
const R = require("../../resources");
const components_1 = require("../../components");
const actions_1 = require("../../actions");
const utils_1 = require("../../utils");
const strings_1 = require("../../../strings");
const react_1 = require("@fluentui/react");
const core_1 = require("../../../core");
class FileViewOpen extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            chartList: [],
            chartCount: 0,
        };
    }
    componentDidMount() {
        this.updateChartList();
    }
    updateChartList() {
        const store = this.props.store;
        store.backend.list("chart", "timeCreated", 0, 1000).then((result) => {
            this.setState({
                chartList: result.items,
                chartCount: result.totalCount,
            });
        });
    }
    // eslint-disable-next-line
    renderChartList() {
        const store = this.props.store;
        const backend = store.backend;
        if (this.state.chartList == null) {
            return (React.createElement("p", { className: "loading-indicator" },
                React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("loading") }),
                " ",
                strings_1.strings.app.loading));
        }
        else {
            if (this.state.chartCount == 0) {
                return React.createElement("p", null, strings_1.strings.fileOpen.noChart);
            }
            else {
                return (React.createElement("ul", { className: "chart-list" }, this.state.chartList.map((chart) => {
                    return (React.createElement("li", { key: chart.id, tabIndex: 0, onClick: () => {
                            this.props.store.dispatcher.dispatch(new actions_1.Actions.Open(chart.id, (error) => {
                                if (error) {
                                    // TODO: add error reporting
                                }
                                else {
                                    this.props.onClose();
                                }
                            }));
                        }, onKeyPress: (e) => {
                            if (e.key === "Enter") {
                                this.props.store.dispatcher.dispatch(new actions_1.Actions.Open(chart.id, (error) => {
                                    if (error) {
                                        // TODO: add error reporting
                                    }
                                    else {
                                        this.props.onClose();
                                    }
                                }));
                            }
                        } },
                        React.createElement("div", { className: "thumbnail" },
                            React.createElement("img", { src: chart.metadata.thumbnail })),
                        React.createElement("div", { className: "description" },
                            React.createElement("div", { className: "name", onClick: (e) => e.stopPropagation() },
                                React.createElement(components_1.EditableTextView, { text: chart.metadata.name, onEdit: (newText) => {
                                        backend.get(chart.id).then((chart) => {
                                            chart.metadata.name = newText;
                                            backend
                                                .put(chart.id, chart.data, chart.metadata)
                                                .then(() => {
                                                this.updateChartList();
                                            });
                                        });
                                    } })),
                            React.createElement("div", { className: "metadata" }, chart.metadata.dataset),
                            React.createElement("div", { className: "footer" },
                                React.createElement("div", { className: "metadata" }, new Date(chart.metadata.timeCreated).toLocaleString()),
                                React.createElement("div", { className: "actions" },
                                    React.createElement(components_1.ButtonFlat, { url: R.getSVGIcon("toolbar/trash"), title: strings_1.strings.fileOpen.delete, stopPropagation: true, onClick: () => {
                                            if (confirm(strings_1.strings.fileOpen.deleteConfirmation(chart.metadata.name))) {
                                                backend.delete(chart.id).then(() => {
                                                    this.updateChartList();
                                                });
                                            }
                                        } }),
                                    React.createElement(components_1.ButtonFlat, { url: R.getSVGIcon("toolbar/copy"), title: strings_1.strings.fileOpen.copy, stopPropagation: true, onClick: () => {
                                            backend.get(chart.id).then((chart) => {
                                                backend
                                                    .create("chart", chart.data, chart.metadata)
                                                    .then(() => {
                                                    this.updateChartList();
                                                });
                                            });
                                        } }),
                                    React.createElement(components_1.ButtonFlat, { url: R.getSVGIcon("toolbar/download"), title: strings_1.strings.fileOpen.download, stopPropagation: true, onClick: () => {
                                            backend.get(chart.id).then((chart) => {
                                                const blob = new Blob([
                                                    JSON.stringify(chart.data, null, 2),
                                                ]);
                                                FileSaver.saveAs(blob, chart.metadata.name.replace(
                                                // eslint-disable-next-line
                                                /[^0-9a-zA-Z\ \.\-\_]+/g, "_") + ".chart");
                                            });
                                        } }))))));
                })));
            }
        }
    }
    render() {
        return (React.createElement("section", { className: "charticulator__file-view-content is-fix-width" },
            React.createElement("h1", null, strings_1.strings.mainTabs.open),
            React.createElement("div", { style: { marginBottom: "12px" } },
                React.createElement(react_1.DefaultButton, { iconProps: {
                        iconName: "OpenFolderHorizontal",
                    }, styles: core_1.primaryButtonStyles, text: strings_1.strings.fileOpen.open, onClick: () => __awaiter(this, void 0, void 0, function* () {
                        const file = yield utils_1.showOpenFileDialog(["chart"]);
                        const str = yield utils_1.readFileAsString(file);
                        const data = JSON.parse(str);
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.Load(data.state));
                        this.props.onClose();
                    }) })),
            this.renderChartList()));
    }
}
exports.FileViewOpen = FileViewOpen;
//# sourceMappingURL=open_view.js.map
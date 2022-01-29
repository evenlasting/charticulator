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
exports.FileView = exports.CurrentChartView = exports.MainTabs = void 0;
/**
 * Components to save, open, create, export charts.
 *
 * ![File view](media://file_view.png)
 *
 * * {@link "app/views/file_view/new_view"} / {@link "app/views/file_view/import_data_view"} - component with two file inputs for main table data and links table data
 *
 * ![File view](media://file_view_new.png)
 *
 * * {@link "app/views/file_view/open_view"}
 *
 * ![File view](media://file_view_open.png)
 *
 * * {@link "app/views/file_view/save_view"}
 *
 * ![File view](media://file_view_save.png)
 *
 * * {@link "app/views/file_view/export_view"}
 *
 * ![File view](media://file_view_export.png)
 *
 * @packageDocumentation
 * @preferred
 */
const React = require("react");
const R = require("../../resources");
const components_1 = require("../../components");
const utils_1 = require("../../utils");
const export_view_1 = require("./export_view");
const new_view_1 = require("./new_view");
const open_view_1 = require("./open_view");
const save_view_1 = require("./save_view");
const options_view_1 = require("./options_view");
const strings_1 = require("../../../strings");
const context_component_1 = require("../../context_component");
var MainTabs;
(function (MainTabs) {
    MainTabs["about"] = "about";
    MainTabs["export"] = "export";
    MainTabs["new"] = "new";
    MainTabs["open"] = "open";
    MainTabs["options"] = "options";
    MainTabs["save"] = "save";
})(MainTabs = exports.MainTabs || (exports.MainTabs = {}));
const tabOrder = [
    MainTabs.new,
    MainTabs.open,
    MainTabs.save,
    MainTabs.export,
    MainTabs.options,
    null,
    MainTabs.about,
];
class CurrentChartView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            svgDataURL: null,
        };
        this.renderImage();
    }
    renderImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const svg = yield this.props.store.renderLocalSVG();
            this.setState({
                svgDataURL: utils_1.stringToDataURL("image/svg+xml", svg),
            });
        });
    }
    render() {
        return (React.createElement("div", { className: "current-chart-view" },
            React.createElement("img", { src: this.state.svgDataURL })));
    }
}
exports.CurrentChartView = CurrentChartView;
class FileView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: this.props.defaultTab || MainTabs.open,
        };
    }
    componentDidMount() {
        setTimeout(() => {
            var _a;
            (_a = this.buttonBack) === null || _a === void 0 ? void 0 : _a.focus();
        }, 100);
    }
    switchTab(currentTab) {
        this.setState({ currentTab });
    }
    renderContent() {
        switch (this.state.currentTab) {
            case MainTabs.new: {
                return (React.createElement(new_view_1.FileViewNew, { store: this.props.store, onClose: this.props.onClose }));
            }
            case MainTabs.save: {
                return (React.createElement(save_view_1.FileViewSaveAs, { store: this.props.store, onClose: this.props.onClose }));
            }
            case MainTabs.export: {
                return (React.createElement(export_view_1.FileViewExport, { store: this.props.store, onClose: this.props.onClose }));
            }
            case MainTabs.options: {
                return React.createElement(options_view_1.FileViewOptionsView, { onClose: this.props.onClose });
            }
            case MainTabs.about: {
                return (React.createElement("iframe", { className: "charticulator__file-view-about", src: "about.html", style: { flex: "1" } }));
            }
            case MainTabs.open:
            default: {
                return (React.createElement(open_view_1.FileViewOpen, { store: this.props.store, onClose: this.props.onClose }));
            }
        }
    }
    render() {
        return (React.createElement(context_component_1.MainReactContext.Provider, { value: { store: this.props.store } },
            React.createElement("div", { className: "charticulator__file-view" },
                React.createElement("div", { className: "charticulator__file-view-tabs" },
                    React.createElement("div", { ref: (r) => (this.buttonBack = r), tabIndex: 0, className: "el-button-back", onClick: () => this.props.onClose(), onKeyPress: (e) => {
                            if (e.key === "Enter") {
                                this.props.onClose();
                            }
                        } },
                        React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("toolbar/back") })),
                    tabOrder.map((t, index) => t === null ? (React.createElement("div", { key: index, className: "el-sep" })) : (React.createElement("div", { tabIndex: 0, key: index, className: utils_1.classNames("el-tab", [
                            "active",
                            this.state.currentTab == t,
                        ]), onClick: () => this.switchTab(t), onKeyPress: (e) => {
                            if (e.key === "Enter") {
                                this.switchTab(t);
                            }
                        } }, strings_1.strings.mainTabs[t])))),
                React.createElement(components_1.TelemetryContext.Consumer, null, (telemetryRecorder) => {
                    return (React.createElement(components_1.ErrorBoundary, { telemetryRecorder: telemetryRecorder }, this.renderContent()));
                }))));
    }
}
exports.FileView = FileView;
//# sourceMappingURL=index.js.map
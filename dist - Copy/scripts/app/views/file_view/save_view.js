"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileViewSaveAs = void 0;
const React = require("react");
const R = require("../../resources");
const _1 = require(".");
const components_1 = require("../../components");
const actions_1 = require("../../actions");
const strings_1 = require("../../../strings");
const react_1 = require("@fluentui/react");
const container_1 = require("../../../container");
class FileViewSaveAs extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    render() {
        let inputSaveChartName;
        return (React.createElement("section", { className: "charticulator__file-view-content is-fix-width" },
            React.createElement("h1", null, strings_1.strings.mainTabs.save),
            React.createElement("section", null,
                React.createElement(_1.CurrentChartView, { store: this.props.store }),
                React.createElement("div", { className: "form-group" },
                    React.createElement("input", { ref: (e) => (inputSaveChartName = e), type: "text", required: true, defaultValue: this.props.store.dataset.name }),
                    React.createElement("label", null, strings_1.strings.fileSave.chartName),
                    React.createElement("i", { className: "bar" })),
                React.createElement("div", { className: "buttons" },
                    React.createElement("span", { className: "el-progress" }, this.state.saving ? (React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("loading") })) : null),
                    React.createElement(react_1.DefaultButton, { iconProps: {
                            iconName: "Save",
                        }, styles: container_1.primaryButtonStyles, text: strings_1.strings.fileSave.saveButton, onClick: () => {
                            const name = inputSaveChartName.value.trim();
                            this.setState({
                                saving: true,
                            }, () => {
                                this.props.store.dispatcher.dispatch(new actions_1.Actions.SaveAs(name, (error) => {
                                    if (error) {
                                        this.setState({
                                            saving: true,
                                            error: error.message,
                                        });
                                    }
                                    else {
                                        this.props.onClose();
                                    }
                                }));
                            });
                        } })),
                this.state.error ? (React.createElement("div", { className: "error" }, this.state.error)) : null)));
    }
}
exports.FileViewSaveAs = FileViewSaveAs;
//# sourceMappingURL=save_view.js.map
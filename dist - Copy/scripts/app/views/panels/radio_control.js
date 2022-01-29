"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelRadioControl = void 0;
const React = require("react");
const utils_1 = require("../../utils");
const react_1 = require("@fluentui/react");
class PanelRadioControl extends React.Component {
    render() {
        const mainClass = this.props.asList
            ? "charticulator-panel-list-view"
            : "charticulator-panel-list-view is-inline";
        return (React.createElement("span", { className: mainClass }, this.props.options.map((option, index) => {
            return (React.createElement(react_1.DefaultButton, { className: utils_1.classNames("el-item", [
                    "is-active",
                    this.props.value == option,
                ]), key: option, onClick: () => {
                    if (this.props) {
                        this.props.onChange(option);
                    }
                }, iconProps: this.props.icons
                    ? {
                        iconName: this.props.icons[index],
                    }
                    : null, text: this.props.labels && this.props.showText
                    ? this.props.labels[index]
                    : null }));
        })));
    }
}
exports.PanelRadioControl = PanelRadioControl;
//# sourceMappingURL=radio_control.js.map
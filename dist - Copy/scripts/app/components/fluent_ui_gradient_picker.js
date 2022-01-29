"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentUIGradientPicker = exports.Colorspace = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const custom_gradient_menu_1 = require("./gradient/custom_gradient_menu");
const gradient_palettes_1 = require("./gradient/gradient_palettes");
var Colorspace;
(function (Colorspace) {
    Colorspace["LAB"] = "lab";
    Colorspace["HCL"] = "hcl";
})(Colorspace = exports.Colorspace || (exports.Colorspace = {}));
class FluentUIGradientPicker extends React.Component {
    constructor(props) {
        super(props);
        this.selectGradient = this.selectGradient.bind(this);
        this.state = {
            currentTab: "palettes",
            currentGradient: this.props.defaultValue || {
                colorspace: Colorspace.LAB,
                colors: [
                    { r: 0, g: 0, b: 0 },
                    { r: 255, g: 255, b: 255 },
                ],
            },
        };
    }
    selectGradient(gradient, emit = false) {
        this.setState({
            currentGradient: gradient,
        }, () => {
            if (emit) {
                if (this.props.onPick) {
                    this.props.onPick(gradient);
                }
            }
        });
    }
    render() {
        return (React.createElement("div", { className: "gradient-picker" },
            React.createElement(react_1.Pivot, { "aria-label": "Basic Pivot Example" },
                React.createElement(react_1.PivotItem, { headerText: "Palettes" },
                    React.createElement(gradient_palettes_1.GradientPalettes, { selectGradient: this.selectGradient })),
                React.createElement(react_1.PivotItem, { headerText: "Custom" },
                    React.createElement(custom_gradient_menu_1.CustomGradientMenu, { currentGradient: this.state.currentGradient, selectGradient: this.selectGradient })))));
    }
}
exports.FluentUIGradientPicker = FluentUIGradientPicker;
//# sourceMappingURL=fluent_ui_gradient_picker.js.map
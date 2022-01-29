"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputColorGradient = exports.InputColor = void 0;
const React = require("react");
const globals = require("../../../../globals");
const core_1 = require("../../../../../core");
const components_1 = require("../../../../components");
const popup_controller_1 = require("../../../../controllers/popup_controller");
const input_text_1 = require("./input_text");
const strings_1 = require("../../../../../strings");
const utils_1 = require("../../../../utils");
class InputColor extends React.Component {
    render() {
        let hex = "";
        if (this.props.defaultValue) {
            hex = core_1.colorToHTMLColorHEX(this.props.defaultValue);
        }
        let colorButton;
        return (React.createElement("span", { className: "charticulator__widget-control-input-color" },
            React.createElement("span", { className: "el-color-display", style: { backgroundColor: hex == "" ? "transparent" : hex }, ref: (e) => (colorButton = e), onClick: () => {
                    const { alignX, } = utils_1.getAligntment(colorButton);
                    globals.popupController.popupAt((context) => {
                        return (React.createElement(popup_controller_1.PopupView, { context: context },
                            React.createElement(components_1.ColorPicker, { store: this.props.store, allowNull: true, onPick: (color) => {
                                    if (color == null) {
                                        this.props.onEnter(null);
                                        context.close();
                                    }
                                    else {
                                        this.props.onEnter(color);
                                    }
                                } })));
                    }, { anchor: colorButton, alignX });
                } }),
            React.createElement(input_text_1.InputText, { defaultValue: hex, placeholder: this.props.allowNull ? strings_1.strings.core.none : "", onEnter: (newValue) => {
                    newValue = newValue.trim();
                    if (newValue == "") {
                        if (this.props.allowNull) {
                            return this.props.onEnter(null);
                        }
                        else {
                            return false;
                        }
                    }
                    const color = core_1.colorFromHTMLColor(newValue);
                    if (!color) {
                        return false;
                    }
                    return this.props.onEnter(color);
                } })));
    }
}
exports.InputColor = InputColor;
class InputColorGradient extends React.Component {
    render() {
        let colorButton;
        return (React.createElement("span", { className: "charticulator__widget-control-input-color-gradient" },
            React.createElement("span", { className: "el-color-gradient-display", ref: (e) => (colorButton = e), onClick: () => {
                    globals.popupController.popupAt((context) => {
                        return (React.createElement(popup_controller_1.PopupView, { context: context },
                            React.createElement(components_1.GradientPicker, { defaultValue: this.props.defaultValue, onPick: (gradient) => {
                                    this.props.onEnter(gradient);
                                } })));
                    }, { anchor: colorButton });
                } },
                React.createElement(components_1.GradientView, { gradient: this.props.defaultValue }))));
    }
}
exports.InputColorGradient = InputColorGradient;
//# sourceMappingURL=input_color.js.map
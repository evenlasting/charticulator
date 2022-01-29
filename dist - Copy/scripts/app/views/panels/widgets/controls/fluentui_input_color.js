"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputColorGradient = exports.FluentInputColor = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const globals = require("../../../../globals");
const core_1 = require("../../../../../core");
const components_1 = require("../../../../components");
const popup_controller_1 = require("../../../../controllers/popup_controller");
const fluentui_color_picker_1 = require("../../../../components/fluentui_color_picker");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
const strings_1 = require("../../../../../strings");
const fluent_ui_gradient_picker_1 = require("../../../../components/fluent_ui_gradient_picker");
const ID_PREFIX = "id_";
class FluentInputColor extends React.Component {
    constructor(props) {
        super(props);
        let hex = "";
        if (this.props.defaultValue) {
            hex = core_1.colorToHTMLColorHEX(this.props.defaultValue);
        }
        this.state = { open: false, color: hex, value: hex };
    }
    componentWillReceiveProps(nextProps) {
        let hex = "";
        if (nextProps.defaultValue) {
            hex = core_1.colorToHTMLColorHEX(nextProps.defaultValue);
        }
        if (hex !== this.state.value) {
            this.setState({
                value: hex,
            });
        }
    }
    render() {
        var _a;
        let hex = "";
        if (this.props.defaultValue) {
            hex = core_1.colorToHTMLColorHEX(this.props.defaultValue);
        }
        const pickerId = this.props.labelKey.replace(/\W/g, "_");
        const picker = (React.createElement("span", { className: "el-color-display", style: {
                backgroundColor: hex == "" ? "transparent" : hex,
                marginTop: this.props.noDefaultMargin ? 0 : null,
                marginRight: 5,
            }, id: ID_PREFIX + pickerId, onClick: () => {
                this.setState({ open: !this.state.open });
            } }));
        return (React.createElement("span", { className: "charticulator__widget-control-input-color" },
            this.props.pickerBeforeTextField && picker,
            React.createElement(fluentui_customized_components_1.FluentTextField, null,
                React.createElement(react_1.TextField, { label: this.props.label, onRenderLabel: fluentui_customized_components_1.labelRender, onChange: (event, newValue) => {
                        newValue = newValue.trim();
                        if (newValue == "") {
                            if (this.props.allowNull) {
                                return this.props.onEnter(null);
                            }
                            else {
                                return false;
                            }
                        }
                        this.setState({
                            value: newValue,
                        });
                        try {
                            const color = core_1.parseColorOrThrowException(newValue);
                            if (color) {
                                return this.props.onEnter(color);
                            }
                            else {
                                return false;
                            }
                        }
                        catch (ex) {
                            //ignore
                        }
                    }, placeholder: this.props.allowNull ? strings_1.strings.core.none : "", value: this.state.value, onKeyDown: (e) => {
                        if (this.props.stopPropagation) {
                            e.stopPropagation();
                        }
                    }, styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { fieldGroup: Object.assign(Object.assign({}, fluentui_customized_components_1.defultComponentsHeight), { width: this.props.width }), root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight), subComponentStyles: {
                            label: Object.assign({}, fluentui_customized_components_1.defaultLabelStyle),
                        } }), underlined: (_a = this.props.underline) !== null && _a !== void 0 ? _a : false })),
            !this.props.pickerBeforeTextField && picker,
            this.state.open && (React.createElement(react_1.Callout, { target: `#${ID_PREFIX}${pickerId}`, onDismiss: () => this.setState({ open: !this.state.open }) },
                React.createElement(fluentui_color_picker_1.ColorPicker, { store: this.props.store, allowNull: true, onPick: (color) => {
                        if (color == null) {
                            this.props.onEnter(null);
                        }
                        else {
                            this.props.onEnter(color);
                        }
                        this.setState({ open: !this.state.open });
                    }, defaultValue: core_1.colorFromHTMLColor(hex), parent: this })))));
    }
}
exports.FluentInputColor = FluentInputColor;
class InputColorGradient extends React.Component {
    render() {
        let colorButton;
        return (React.createElement("span", { className: "charticulator__widget-control-input-color-gradient" },
            React.createElement("span", { className: "el-color-gradient-display", ref: (e) => (colorButton = e), onClick: () => {
                    globals.popupController.popupAt((context) => {
                        return (React.createElement(popup_controller_1.PopupView, { context: context },
                            React.createElement(fluent_ui_gradient_picker_1.FluentUIGradientPicker, { defaultValue: this.props.defaultValue, onPick: (gradient) => {
                                    this.props.onEnter(gradient);
                                } })));
                    }, { anchor: colorButton });
                } },
                React.createElement(components_1.GradientView, { gradient: this.props.defaultValue }))));
    }
}
exports.InputColorGradient = InputColorGradient;
//# sourceMappingURL=fluentui_input_color.js.map
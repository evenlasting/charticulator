"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentValueEditor = void 0;
const react_1 = require("@fluentui/react");
const React = require("react");
const core_1 = require("../../../../core");
const fluentui_color_picker_1 = require("../../../components/fluentui_color_picker");
const context_component_1 = require("../../../context_component");
const controls_1 = require("./controls");
const fluentui_input_expression_1 = require("./controls/fluentui_input_expression");
const strings_1 = require("../../../../strings");
const fluentui_customized_components_1 = require("./controls/fluentui_customized_components");
const fluentui_image_1 = require("./controls/fluentui_image");
const fluentui_input_number_1 = require("./controls/fluentui_input_number");
class FluentValueEditor extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = {
            open: false,
            value: "",
        };
    }
    emitClearValue() {
        this.props.onClear();
    }
    emitSetValue(value) {
        this.props.onEmitValue(value);
    }
    emitMapping(mapping) {
        this.props.onEmitMapping(mapping);
    }
    componentWillReceiveProps(nextProps) {
        let hex = "";
        if (this.props.type === core_1.Specification.AttributeType.Color &&
            nextProps.value) {
            hex = core_1.colorToHTMLColorHEX(nextProps.value);
        }
        if (hex !== this.state.value) {
            this.setState({
                value: hex,
            });
        }
    }
    render() {
        var _a, _b;
        const value = this.props.value;
        let placeholderText = this.props.placeholder || strings_1.strings.core.none;
        if (this.props.defaultValue != null) {
            placeholderText = this.props.defaultValue.toString();
        }
        switch (this.props.type) {
            case core_1.Specification.AttributeType.Number: {
                let numberOptions = this.props.numberOptions;
                if (!numberOptions) {
                    numberOptions = {
                        digits: 2,
                    };
                }
                return (React.createElement(fluentui_input_number_1.FluentInputNumber, Object.assign({ label: this.props.label, stopPropagation: this.props.stopPropagation, placeholder: this.props.placeholder, defaultValue: this.props.value, onEnter: (newValue) => {
                        if (newValue == null) {
                            this.emitClearValue();
                            return true;
                        }
                        if (newValue == newValue) {
                            this.emitSetValue(newValue);
                            return true;
                        }
                        else {
                            return false;
                        }
                    } }, numberOptions)));
            }
            case core_1.Specification.AttributeType.Color: {
                const color = value;
                const hex = core_1.colorToHTMLColorHEX(color);
                return (React.createElement("span", { className: "el-color-value" },
                    React.createElement(fluentui_customized_components_1.FluentTextField, null,
                        React.createElement(react_1.TextField, { styles: fluentui_customized_components_1.defaultStyle, label: this.props.label, placeholder: this.props.placeholder, onRenderLabel: fluentui_customized_components_1.labelRender, value: this.state.value, type: "text", onChange: (event, newValue) => {
                                newValue = newValue.trim();
                                if (newValue == "") {
                                    this.emitClearValue();
                                }
                                else {
                                    this.setState({
                                        value: newValue,
                                    });
                                    try {
                                        const color = core_1.parseColorOrThrowException(newValue);
                                        if (color) {
                                            this.emitSetValue(color);
                                        }
                                        else {
                                            return false;
                                        }
                                    }
                                    catch (ex) {
                                        //ignore
                                    }
                                }
                            }, onKeyDown: (e) => {
                                if (this.props.stopPropagation) {
                                    e.stopPropagation();
                                }
                            } })),
                    React.createElement("span", { className: "el-color-item", style: { backgroundColor: hex }, id: "color_picker", onClick: () => {
                            this.setState({ open: !this.state.open });
                        } }),
                    this.state.open && (React.createElement(react_1.Callout, { target: `#color_picker`, onDismiss: () => this.setState({ open: !this.state.open }) },
                        React.createElement(fluentui_color_picker_1.ColorPicker, { store: this.store, allowNull: true, defaultValue: core_1.colorFromHTMLColor(hex), onPick: (color) => {
                                if (color == null) {
                                    this.emitClearValue();
                                }
                                else {
                                    this.emitSetValue(color);
                                }
                                this.setState({ open: !this.state.open });
                            }, parent: this })))));
            }
            case core_1.Specification.AttributeType.FontFamily:
                return (React.createElement(controls_1.FluentComboBoxFontFamily, { label: this.props.label, defaultValue: value, onEnter: (value) => {
                        this.emitSetValue(value);
                        return true;
                    } }));
            case core_1.Specification.AttributeType.Text: {
                const str = value;
                if (this.props.onEmitMapping) {
                    return (React.createElement(fluentui_input_expression_1.FluentInputExpression, { label: this.props.label, textExpression: true, validate: (value) => this.context.store.verifyUserExpressionWithTable(value, this.props.getTable(), { textExpression: true, expectedTypes: ["string"] }), defaultValue: new core_1.Expression.TextExpression([
                            { string: str },
                        ]).toString(), placeholder: placeholderText, allowNull: true, onEnter: (newValue) => {
                            if (newValue == null || newValue.trim() == "") {
                                this.emitClearValue();
                            }
                            else {
                                if (core_1.Expression.parseTextExpression(newValue).isTrivialString()) {
                                    this.emitMapping({
                                        type: "value",
                                        value: newValue,
                                    });
                                }
                                else {
                                    this.emitMapping({
                                        type: "text",
                                        table: this.props.getTable(),
                                        textExpression: newValue,
                                    });
                                }
                            }
                            return true;
                        }, stopPropagation: this.props.stopPropagation }));
                }
                else {
                    return (React.createElement(React.Fragment, null,
                        React.createElement(react_1.TextField, { label: this.props.label, defaultValue: str, onRenderLabel: fluentui_customized_components_1.labelRender, placeholder: placeholderText, onChange: (event, newValue) => {
                                if (newValue == null) {
                                    this.emitClearValue();
                                }
                                else {
                                    this.emitSetValue(newValue);
                                }
                                return true;
                            }, styles: fluentui_customized_components_1.defaultStyle, onKeyDown: (e) => {
                                if (this.props.stopPropagation) {
                                    e.stopPropagation();
                                }
                            } })));
                }
            }
            case core_1.Specification.AttributeType.Enum: {
                const str = value;
                const strings = this.props.hints.rangeEnum;
                return (React.createElement(react_1.Dropdown, { styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { title: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle.title), { lineHeight: fluentui_customized_components_1.defultBindButtonSize.height }) }), label: this.props.label, onRenderLabel: fluentui_customized_components_1.labelRender, selectedKey: str, options: strings.map((str) => {
                        return {
                            key: str,
                            text: str,
                        };
                    }), onChange: (event, value) => {
                        if (value == null) {
                            this.emitClearValue();
                        }
                        else {
                            this.emitSetValue(value.key);
                        }
                        return true;
                    } }));
            }
            case core_1.Specification.AttributeType.Boolean: {
                const boolean = value;
                if (this.props.onEmitMapping) {
                    return (React.createElement(React.Fragment, null,
                        React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, strings_1.strings.objects.visibleOn.visibility),
                        React.createElement(react_1.DefaultButton, { styles: {
                                root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
                                menuIcon: { display: "none !important" },
                            }, text: strings_1.strings.attributesPanel.conditionedBy, menuProps: {
                                items: (_a = this.props.mainMenuItems) !== null && _a !== void 0 ? _a : [],
                                onRenderMenuList: (_b = this.props.menuRender) !== null && _b !== void 0 ? _b : null,
                            } })));
                }
                else {
                    return (React.createElement(React.Fragment, null,
                        React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, strings_1.strings.objects.visibleOn.visibility),
                        React.createElement(react_1.DefaultButton, { checked: false, iconProps: {
                                iconName: boolean ? "CheckboxComposite" : "Checkbox",
                            }, onClick: () => {
                                this.emitSetValue(!boolean);
                            } })));
                }
            }
            case core_1.Specification.AttributeType.Image: {
                const str = value;
                return (React.createElement(fluentui_image_1.InputImage, { label: this.props.label, value: str, onChange: (newValue) => {
                        if (newValue == null) {
                            this.emitClearValue();
                        }
                        else {
                            this.emitSetValue(newValue);
                        }
                        return true;
                    } }));
            }
        }
        return React.createElement("span", null, "(not implemented)");
    }
}
exports.FluentValueEditor = FluentValueEditor;
//# sourceMappingURL=fluentui_value_editor.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueEditor = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const strings_1 = require("../../../../strings");
const core_1 = require("../../../../core");
const specification_1 = require("../../../../core/specification");
const components_1 = require("../../../components");
const context_component_1 = require("../../../context_component");
const controllers_1 = require("../../../controllers");
const globals = require("../../../globals");
const controls_1 = require("./controls");
const utils_1 = require("../../../utils");
class ValueEditor extends context_component_1.ContextedComponent {
    emitClearValue() {
        this.props.onClear();
    }
    emitSetValue(value) {
        this.props.onEmitValue(value);
    }
    emitMapping(mapping) {
        this.props.onEmitMapping(mapping);
    }
    // eslint-disable-next-line
    render() {
        const value = this.props.value;
        let placeholderText = this.props.placeholder || strings_1.strings.core.none;
        if (this.props.defaultValue != null) {
            placeholderText = this.props.defaultValue.toString();
        }
        switch (this.props.type) {
            case core_1.Specification.AttributeType.Number: {
                const number = value;
                let numberOptions = this.props.numberOptions;
                if (!numberOptions) {
                    numberOptions = {};
                }
                return (React.createElement(controls_1.InputNumber, Object.assign({ defaultValue: number, placeholder: placeholderText }, numberOptions, { onEnter: (newValue) => {
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
                    } })));
            }
            case core_1.Specification.AttributeType.Color: {
                const color = value;
                const hex = core_1.colorToHTMLColorHEX(color);
                let colorItem;
                return (React.createElement("span", { className: "el-color-value" },
                    React.createElement("span", { className: "el-color-item", ref: (e) => (colorItem = e), style: { backgroundColor: hex }, onClick: () => {
                            const { alignX, } = utils_1.getAligntment(colorItem);
                            globals.popupController.popupAt((context) => (React.createElement(controllers_1.PopupView, { context: context },
                                React.createElement(components_1.ColorPicker, { store: this.store, defaultValue: color, allowNull: true, onPick: (color) => {
                                        if (color == null) {
                                            this.emitClearValue();
                                            context.close();
                                        }
                                        else {
                                            this.emitSetValue(color);
                                        }
                                    } }))), { anchor: colorItem, alignX: alignX });
                        } }),
                    React.createElement(controls_1.InputText, { defaultValue: hex, onEnter: (newValue) => {
                            newValue = newValue.trim();
                            if (newValue == "") {
                                this.emitClearValue();
                            }
                            else {
                                const newColor = core_1.colorFromHTMLColor(newValue);
                                if (newColor) {
                                    this.emitSetValue(newColor);
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                        } })));
            }
            case core_1.Specification.AttributeType.FontFamily:
                return (React.createElement(controls_1.ComboBoxFontFamily, { defaultValue: value, onEnter: (value) => {
                        this.emitSetValue(value);
                        return true;
                    } }));
            case core_1.Specification.AttributeType.Text: {
                const str = value;
                if (this.props.onEmitMapping) {
                    return (React.createElement(controls_1.InputExpression, { textExpression: true, validate: (value) => this.context.store.verifyUserExpressionWithTable(value, this.props.getTable(), { textExpression: true, expectedTypes: ["string"] }), defaultValue: new core_1.Expression.TextExpression([
                            { string: str },
                        ]).toString(), placeholder: placeholderText, allowNull: true, onEnter: (newValue) => {
                            if (newValue == null || newValue.trim() == "") {
                                this.emitClearValue();
                            }
                            else {
                                if (core_1.Expression.parseTextExpression(newValue).isTrivialString()) {
                                    this.emitMapping({
                                        type: specification_1.MappingType.value,
                                        value: newValue,
                                    });
                                }
                                else {
                                    this.emitMapping({
                                        type: specification_1.MappingType.text,
                                        table: this.props.getTable(),
                                        textExpression: newValue,
                                    });
                                }
                            }
                            return true;
                        } }));
                }
                else {
                    return (React.createElement(controls_1.InputText, { defaultValue: str, placeholder: placeholderText, onEnter: (newValue) => {
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
            case core_1.Specification.AttributeType.Enum: {
                const str = value;
                const strings = this.props.hints.rangeEnum;
                return (React.createElement(controls_1.ComboBox, { defaultValue: str, onEnter: (newValue) => {
                        if (newValue == null) {
                            this.emitClearValue();
                        }
                        else {
                            this.emitSetValue(newValue);
                        }
                        return true;
                    }, options: strings || [] }));
            }
            case core_1.Specification.AttributeType.Boolean: {
                const boolean = value;
                let ref;
                if (this.props.onEmitMapping) {
                    return (React.createElement(controls_1.Button, { active: false, text: "Conditioned by...", ref: (e) => (ref = ReactDOM.findDOMNode(e)), onClick: () => {
                            this.props.onBeginDataFieldSelection(this.props.anchorReference || ref);
                        } }));
                }
                else {
                    return (React.createElement(controls_1.Button, { active: false, icon: boolean ? "checkbox/checked" : "checkbox/empty", ref: (e) => (ref = ReactDOM.findDOMNode(e)), onClick: () => {
                            this.emitSetValue(!boolean);
                        } }));
                }
            }
            case core_1.Specification.AttributeType.Image: {
                const str = value;
                return (React.createElement(controls_1.InputImage, { value: str, onChange: (newValue) => {
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
exports.ValueEditor = ValueEditor;
//# sourceMappingURL=value_editor.js.map
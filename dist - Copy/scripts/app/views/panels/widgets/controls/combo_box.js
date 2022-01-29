"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentComboBoxFontFamily = exports.ComboBoxFontFamily = exports.ComboBox = void 0;
const React = require("react");
const R = require("../../../../resources");
const globals = require("../../../../globals");
const components_1 = require("../../../../components");
const controllers_1 = require("../../../../controllers");
const utils_1 = require("../../../../utils");
const react_1 = require("@fluentui/react");
const core_1 = require("../../../../../core");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
class ComboBox extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            value: this.props.defaultValue,
        };
        this.handleChange = (e) => {
            this.setState({
                value: e.target.value,
            });
        };
        this.handleFocus = () => {
            this.refInput.select();
        };
        this.handleBlur = () => {
            this.tryEmitValue(this.refInput.value);
        };
        this.handleKeydown = (e) => {
            if (e.key == "Enter") {
                this.tryEmitValue(this.refInput.value);
            }
            else if (e.key == "Escape") {
                this.reset();
            }
        };
    }
    componentWillReceiveProps(newProps) {
        this.setState({
            value: newProps.defaultValue,
        });
    }
    tryEmitValue(val) {
        if (!this.props.onEnter) {
            return;
        }
        const ok = this.props.onEnter(val);
        if (ok) {
            this.setState({
                value: val,
            });
        }
    }
    reset() {
        this.setState({
            value: this.props.defaultValue,
        });
    }
    renderOptions(onSelect) {
        const renderOptionItem = this.props.renderOptionItem ||
            ((x, props) => (React.createElement("span", { className: utils_1.classNames("el-default-option-item", [
                    "is-active",
                    props.selected,
                ]), onClick: props.onClick }, x)));
        return (React.createElement("span", { className: "charticulator__widget-control-combo-box-suggestions" }, this.props.options.map((x) => (React.createElement("span", { className: "charticulator__widget-control-combo-box-suggestions-option", key: x }, renderOptionItem(x, {
            onClick: () => {
                if (onSelect) {
                    onSelect();
                }
                this.tryEmitValue(x);
            },
            selected: this.state.value == x,
        }))))));
    }
    render() {
        return (React.createElement("span", { className: "charticulator__widget-control-combo-box", ref: (e) => (this.refContainer = e) },
            this.props.optionsOnly ? (React.createElement("span", { className: "el-value" }, this.state.value)) : (React.createElement("input", { ref: (e) => (this.refInput = e), className: "el-input", value: this.state.value, onChange: this.handleChange, onKeyDown: this.handleKeydown, onFocus: this.handleFocus, onBlur: this.handleBlur })),
            React.createElement("span", { className: "el-dropdown", onClick: () => {
                    globals.popupController.popupAt((context) => {
                        return (React.createElement(controllers_1.PopupView, { className: "charticulator__widget-control-combo-box-popup", context: context, width: this.refContainer.getBoundingClientRect().width }, this.renderOptions(() => context.close())));
                    }, { anchor: this.refContainer });
                } },
                React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("general/dropdown") }))));
    }
}
exports.ComboBox = ComboBox;
class ComboBoxFontFamily extends React.Component {
    render() {
        return (React.createElement(ComboBox, { defaultValue: this.props.defaultValue, options: core_1.fontList, renderOptionItem: (x, props) => (React.createElement("span", Object.assign({ className: utils_1.classNames("el-default-option-item", [
                    "is-active",
                    props.selected,
                ]), style: { fontFamily: x } }, props), x)), onEnter: this.props.onEnter, onCancel: this.props.onCancel }));
    }
}
exports.ComboBoxFontFamily = ComboBoxFontFamily;
exports.FluentComboBoxFontFamily = (props) => {
    const [currentValue, setCurrentValue] = React.useState(props.defaultValue);
    const optionsWithCustomStyling = React.useMemo(() => {
        const cuurentFontList = [...new Set([...core_1.fontList, currentValue])];
        return cuurentFontList.map((fontName) => ({
            key: fontName,
            text: fontName,
            styles: {
                optionText: {
                    fontFamily: fontName,
                },
                root: Object.assign(Object.assign({}, fluentui_customized_components_1.defultComponentsHeight), { minHeight: fluentui_customized_components_1.defultComponentsHeight.height }),
            },
        }));
    }, [currentValue]);
    const onCancel = React.useCallback(() => { var _a; return (_a = props.onCancel) === null || _a === void 0 ? void 0 : _a.call(props); }, [props]);
    const onEnter = React.useCallback((event, value) => {
        var _a, _b, _c;
        const currentInputValue = event.target.value;
        const currentFontValue = (_b = (_a = value === null || value === void 0 ? void 0 : value.key) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : (currentInputValue.length > 0 ? currentInputValue : props.defaultValue);
        setCurrentValue(currentFontValue);
        (_c = props.onEnter) === null || _c === void 0 ? void 0 : _c.call(props, currentFontValue);
    }, [props]);
    return (React.createElement(react_1.ComboBox, { styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight) }), selectedKey: currentValue, label: props.label, onRenderLabel: ({ props }) => (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, props.label)), autoComplete: "on", options: optionsWithCustomStyling, onChange: onEnter, onAbort: onCancel, allowFreeform: true }));
};
//# sourceMappingURL=combo_box.js.map
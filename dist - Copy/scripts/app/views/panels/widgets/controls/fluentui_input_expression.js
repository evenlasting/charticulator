"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentInputExpression = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const core_1 = require("../../../../../core");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
exports.FluentInputExpression = (props) => {
    const [value, setValue] = React.useState(props.defaultValue);
    const [errorIndicator, setErrorIndicator] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);
    React.useEffect(() => {
        if (props.value) {
            setValue(props.value);
        }
    }, [props.value]);
    const doEnter = React.useCallback(() => {
        var _a, _b;
        if (props.allowNull && (value === null || value === void 0 ? void 0 : value.trim()) == "") {
            setValue("");
            setErrorIndicator(false);
            setErrorMessage(null);
            (_a = props.onEnter) === null || _a === void 0 ? void 0 : _a.call(props, null);
        }
        else {
            const result = props.validate(core_1.replaceTabBySymbol(core_1.replaceNewLineBySymbol(value)));
            if (result.pass) {
                setValue(result.formatted);
                setErrorIndicator(false);
                setErrorMessage(null);
                (_b = props.onEnter) === null || _b === void 0 ? void 0 : _b.call(props, result.formatted);
            }
            else {
                setErrorIndicator(true);
                setErrorMessage(result.error);
            }
        }
    }, [setValue, setErrorIndicator, setErrorMessage, props, value]);
    const doCancel = React.useCallback(() => {
        var _a;
        setValue(props.defaultValue || "");
        setErrorIndicator(false);
        setErrorMessage(null);
        (_a = props.onCancel) === null || _a === void 0 ? void 0 : _a.call(props);
    }, [props, setValue, setErrorIndicator, setErrorMessage]);
    return (React.createElement("span", { className: "charticulator__widget-control-input-expression" },
        React.createElement(react_1.TextField, { styles: fluentui_customized_components_1.defaultStyle, label: props.label, onRenderLabel: fluentui_customized_components_1.labelRender, placeholder: props.placeholder, type: "text", onGetErrorMessage: () => {
                var _a;
                const validateResults = (_a = props.validate) === null || _a === void 0 ? void 0 : _a.call(props, value);
                if (!validateResults.pass) {
                    return validateResults.error;
                }
            }, value: core_1.replaceSymbolByTab(core_1.replaceSymbolByNewLine(value || props.defaultValue)), onChange: (event, newValue) => {
                // Check for parse errors while input
                if (props.allowNull && newValue.trim() == "") {
                    setValue(newValue);
                    setErrorIndicator(false);
                }
                else {
                    const result = core_1.Expression.verifyUserExpression(core_1.replaceTabBySymbol(core_1.replaceNewLineBySymbol(newValue)), {
                        textExpression: props.textExpression,
                    });
                    setValue(newValue);
                    setErrorIndicator(!result.pass);
                }
            }, onBlur: () => {
                doEnter();
            }, onFocus: (e) => {
                e.target.select();
            }, onKeyDown: (e) => {
                if (e.key == "Enter") {
                    doEnter();
                }
                if (e.key == "Escape") {
                    doCancel();
                }
                if (props.stopPropagation) {
                    e.stopPropagation();
                }
            } })));
};
//# sourceMappingURL=fluentui_input_expression.js.map
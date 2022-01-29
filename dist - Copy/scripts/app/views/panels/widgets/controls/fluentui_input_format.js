"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentInputFormat = void 0;
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const react_1 = require("@fluentui/react");
const React = require("react");
const core_1 = require("../../../../../core");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
exports.FluentInputFormat = (props) => {
    const [value, setValue] = React.useState(props.defaultValue);
    const doEnter = React.useCallback(() => {
        if (props.allowNull && value.trim() == "") {
            setValue("");
            props.onEnter(null);
        }
        else {
            const result = props.validate(core_1.replaceTabBySymbol(core_1.replaceNewLineBySymbol(value)));
            if (result.pass) {
                setValue(result.formatted);
                props.onEnter(result.formatted);
            }
        }
    }, [props, value]);
    const doCancel = React.useCallback(() => {
        setValue(props.defaultValue || "");
        if (props.onCancel) {
            props.onCancel();
        }
    }, [props]);
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
                }
                else {
                    core_1.Expression.verifyUserExpression(core_1.replaceTabBySymbol(core_1.replaceNewLineBySymbol(newValue)), {
                        textExpression: props.textExpression,
                    });
                    setValue(newValue);
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
            } })));
};
//# sourceMappingURL=fluentui_input_format.js.map
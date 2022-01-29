"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentInputNumber = void 0;
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const react_1 = require("@fluentui/react");
const React = require("react");
const core_1 = require("../../../../../core");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
exports.FluentInputNumber = (props) => {
    const [value, setValue] = React.useState(props.defaultValue);
    React.useEffect(() => {
        setValue(props.defaultValue);
    }, [props.defaultValue]);
    const formatNumber = (value) => {
        if (value == null) {
            return "";
        }
        if (value != value) {
            return "N/A";
        }
        if (props.percentage) {
            return core_1.prettyNumber(value * 100, props.digits != null ? props.digits : 2);
        }
        else {
            return core_1.prettyNumber(value, props.digits != null ? props.digits : 2);
        }
    };
    const parseNumber = (str) => {
        str = str.trim();
        if (str == "" || isNaN(+str)) {
            return null;
        }
        if (props.percentage) {
            str = str.replace(/%$/, "");
            return +str / 100;
        }
        else {
            return +str;
        }
    };
    const reportValue = (value) => {
        if (value == null) {
            return props.onEnter(value);
        }
        else {
            if (props.minimum != null) {
                value = Math.max(props.minimum, value);
            }
            if (props.maximum != null) {
                value = Math.min(props.maximum, value);
            }
            return props.onEnter(value);
        }
    };
    const renderSlider = () => {
        let sliderMin = 0;
        let sliderMax = 1;
        if (props.minimum != null) {
            sliderMin = props.minimum;
        }
        if (props.maximum != null) {
            sliderMax = props.maximum;
        }
        if (props.percentage) {
            sliderMax = 1;
            sliderMin = 0;
        }
        if (props.sliderRange != null) {
            sliderMin = props.sliderRange[0];
            sliderMax = props.sliderRange[1];
        }
        return (React.createElement(react_1.Slider, { styles: {
                root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
                slideBox: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
            }, min: sliderMin, max: sliderMax, value: +value, showValue: true, step: props.percentage ? 0.01 : props.step != undefined ? props.step : 1, onChange: (newValue) => {
                setValue(+newValue.toFixed(4));
                reportValue(newValue);
            } }));
    };
    const renderUpdown = () => {
        const tick = props.updownTick || 0.1;
        return (React.createElement(React.Fragment, null,
            React.createElement(react_1.SpinButton, { label: !props.showSlider ? props.label : null, labelPosition: react_1.Position.top, value: formatNumber(+value), iconProps: props.updownStyle == "font"
                    ? {
                        iconName: "Font",
                    }
                    : null, step: tick, onIncrement: (value) => {
                    if (reportValue(parseNumber(value) + tick)) {
                        setValue(parseNumber(value) + tick);
                    }
                }, onDecrement: (value) => {
                    if (reportValue(parseNumber(value) - tick)) {
                        setValue(parseNumber(value) - tick);
                    }
                }, onValidate: (value) => {
                    const num = parseNumber(value);
                    if (reportValue(num)) {
                        let val = num;
                        if (props.minimum != null) {
                            val = Math.max(props.minimum, num);
                        }
                        if (props.maximum != null) {
                            val = Math.min(props.maximum, num);
                        }
                        setValue(val);
                        return formatNumber(parseNumber(value));
                    }
                }, styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { label: {
                        lineHeight: "unset",
                        fontWeight: fluentui_customized_components_1.defaultFontWeight,
                        height: 25,
                    }, spinButtonWrapper: {
                        height: fluentui_customized_components_1.defaultStyle.fieldGroup.height,
                        lineHeight: fluentui_customized_components_1.defaultStyle.fieldGroup.lineHeight,
                    } }) })));
    };
    return (React.createElement(React.Fragment, null,
        props.showSlider ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, props.label)) : null,
        React.createElement(fluentui_customized_components_1.FluentRowLayout, null,
            React.createElement(fluentui_customized_components_1.FluentLayoutItem, { flex: 1 }, props.showUpdown ? (renderUpdown()) : (React.createElement(fluentui_customized_components_1.PlaceholderStyle, null,
                React.createElement(react_1.TextField, { styles: fluentui_customized_components_1.defaultStyle, onRenderLabel: fluentui_customized_components_1.labelRender, label: !props.showSlider ? props.label : null, placeholder: props.placeholder, value: typeof value === "string" &&
                        (value.indexOf(".") === value.length - 1 ||
                            (value.indexOf("-") === 0 &&
                                value.length === 1))
                        ? value
                        : value == null
                            ? null
                            : formatNumber(+value), onChange: (event, str) => {
                        if ((str != "" && str.indexOf(".") === str.length - 1) ||
                            (str.indexOf("-") === 0 && str.length === 1)) {
                            setValue(str);
                        }
                        else {
                            const num = parseNumber(str);
                            if (reportValue(num)) {
                                setValue(num);
                            }
                        }
                    }, onKeyDown: (e) => {
                        if (props.stopPropagation) {
                            e.stopPropagation();
                        }
                    }, suffix: props.percentage ? "%" : undefined })))),
            props.showSlider ? (React.createElement(fluentui_customized_components_1.FluentLayoutItem, { flex: 2 }, renderSlider())) : null)));
};
//# sourceMappingURL=fluentui_input_number.js.map
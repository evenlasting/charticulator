"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileViewOptions = exports.FileViewOptionsView = void 0;
const React = require("react");
const react_1 = require("react");
const common_1 = require("../../../core/common");
const strings_1 = require("../../../strings");
const context_component_1 = require("../../context_component");
const globals_1 = require("../../globals");
const hooks_1 = require("../../utils/hooks");
// eslint-disable-next-line
exports.FileViewOptionsView = () => {
    const { store } = react_1.useContext(context_component_1.MainReactContext);
    const localeFileFormat = store.getLocaleFileFormat();
    const [numberFormatRemove, setNumberFormatRemove] = hooks_1.useLocalStorage(localeFileFormat.numberFormat.remove, globals_1.LocalStorageKeys.NumberFormatRemove);
    const [delimiterSymbol, setDelimiterSymbol] = hooks_1.useLocalStorage(localeFileFormat.delimiter, globals_1.LocalStorageKeys.DelimiterSymbol);
    // const [currencySymbol, setCurrencySymbol] = useLocalStorage<string>(
    //   localeFileFormat.currency,
    //   LocalStorageKeys.CurrencySymbol
    // );
    // const [groupSymbol, setGroupSymbol] = useLocalStorage<string>(
    //   localeFileFormat.group,
    //   LocalStorageKeys.GroupSymbol
    // );
    const changeLocaleFileFormat = (localeFileFormat) => {
        store.setLocaleFileFormat(localeFileFormat);
        store.solveConstraintsAndUpdateGraphics();
    };
    return (React.createElement("section", { className: "charticulator__file-view-content" },
        React.createElement("h1", null, strings_1.strings.mainTabs.options),
        React.createElement("div", null,
            React.createElement("h2", null, strings_1.strings.options.fileFormat),
            React.createElement("div", null,
                React.createElement("div", { className: "form-group" },
                    React.createElement("select", { onChange: (e) => {
                            changeLocaleFileFormat(Object.assign(Object.assign({}, localeFileFormat), { delimiter: e.target.options[e.target.selectedIndex].value }));
                            setDelimiterSymbol(e.target.options[e.target.selectedIndex].value);
                        }, value: delimiterSymbol },
                        React.createElement("option", { value: "," }, strings_1.strings.options.comma),
                        React.createElement("option", { value: ";" }, strings_1.strings.options.semicolon)),
                    React.createElement("label", null, strings_1.strings.options.delimiter)),
                React.createElement("div", { className: "form-group" },
                    React.createElement("select", { onChange: (e) => {
                            const isDecimalDot = e.target.options[e.target.selectedIndex].value === ","; // values is removeal
                            changeLocaleFileFormat(Object.assign(Object.assign({}, localeFileFormat), { numberFormat: {
                                    decimal: isDecimalDot ? "." : ",",
                                    remove: isDecimalDot ? "," : ".",
                                } }));
                            setNumberFormatRemove(isDecimalDot ? "," : ".");
                            common_1.setFormatOptions({
                                decimal: isDecimalDot ? "." : ",",
                                thousands: isDecimalDot ? "," : ".",
                                currency: common_1.parseSafe(localeFileFormat.currency, common_1.defaultCurrency),
                                grouping: common_1.parseSafe(localeFileFormat.group, common_1.defaultDigitsGroup),
                            });
                        }, value: numberFormatRemove },
                        React.createElement("option", { value: "," }, strings_1.strings.options.numberFormatDot),
                        React.createElement("option", { value: "." }, strings_1.strings.options.numberFormatComma)),
                    React.createElement("label", null, strings_1.strings.options.numberFormat))))));
};
// TODO create HOC
class FileViewOptions extends React.Component {
    render() {
        return (React.createElement(exports.FileViewOptionsView, { onClose: this.props.onClose }));
    }
}
exports.FileViewOptions = FileViewOptions;
//# sourceMappingURL=options_view.js.map
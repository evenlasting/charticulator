"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPickerButton = exports.PickerType = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const styles_1 = require("./styles");
var PickerType;
(function (PickerType) {
    PickerType["HCL"] = "hcl";
    PickerType["HSV"] = "hsv";
})(PickerType = exports.PickerType || (exports.PickerType = {}));
class ColorPickerButton extends React.Component {
    render() {
        const text = this.props.type === PickerType.HCL ? "HCL Picker" : "HSV Picker";
        return (React.createElement(react_1.DefaultButton, { text: text, onClick: this.props.onClick, checked: this.props.state.currentPicker == this.props.type, styles: styles_1.defaultPaletteButtonsStyles }));
    }
}
exports.ColorPickerButton = ColorPickerButton;
//# sourceMappingURL=color_pickers.js.map
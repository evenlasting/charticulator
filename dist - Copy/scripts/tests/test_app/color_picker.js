"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.GradientPickerTestView = exports.ColorPickerTestView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const components_1 = require("../../app/components");
class ColorPickerTestView extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("div", { style: {
                    background: "#eee",
                    border: "10px solid #aaa",
                    display: "inline-block",
                } },
                React.createElement(components_1.ColorPicker, { defaultValue: { r: 117, g: 232, b: 75 }, allowNull: true, onPick: (value) => {
                        console.log(value);
                    } }))));
    }
}
exports.ColorPickerTestView = ColorPickerTestView;
class GradientPickerTestView extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("div", { style: {
                    background: "#eee",
                    border: "10px solid #aaa",
                    width: "300px",
                    display: "inline-block",
                } },
                React.createElement(components_1.GradientPicker, null))));
    }
}
exports.GradientPickerTestView = GradientPickerTestView;
function register(f) {
    f("ColorPicker", ColorPickerTestView);
    f("GradientPicker", GradientPickerTestView);
}
exports.register = register;
//# sourceMappingURL=color_picker.js.map
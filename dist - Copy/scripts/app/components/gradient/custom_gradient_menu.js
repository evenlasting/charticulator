"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomGradientMenu = void 0;
const React = require("react");
const object_list_editor_1 = require("../../views/panels/object_list_editor");
const core_1 = require("../../../core");
const fluentui_color_picker_1 = require("../fluentui_color_picker");
const react_1 = require("@fluentui/react");
const styles_1 = require("./styles");
const gradient_palettes_1 = require("./gradient_palettes");
const custom_gradient_buttons_1 = require("./custom_gradient_buttons");
class CustomGradientMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPickerOpen: false,
            currentItemId: "",
            currentColor: null,
            currentItemIdx: null,
        };
    }
    render() {
        const currentGradient = this.props.currentGradient;
        return (React.createElement("div", null,
            React.createElement("div", null,
                React.createElement(gradient_palettes_1.GradientView, { gradient: currentGradient })),
            React.createElement("div", null,
                React.createElement(object_list_editor_1.ReorderListView, { enabled: true, onReorder: (dragIndex, dropIndex) => {
                        const newGradient = core_1.deepClone(currentGradient);
                        object_list_editor_1.ReorderListView.ReorderArray(newGradient.colors, dragIndex, dropIndex);
                        this.props.selectGradient(newGradient, true);
                    } },
                    currentGradient.colors.map((color, i) => {
                        return (React.createElement(styles_1.ColorRowWrapper, { key: `m${i}` },
                            React.createElement("div", null,
                                React.createElement(styles_1.ColorCell, { id: `color_${i}`, onClick: () => {
                                        this.changeColorPickerState(`color_${i}`, color, i);
                                    }, "$color": fluentui_color_picker_1.colorToCSS(color) })),
                            React.createElement(react_1.TextField, { defaultValue: core_1.colorToHTMLColorHEX(color), onChange: (event, value) => {
                                    if (value) {
                                        const newColor = core_1.colorFromHTMLColor(value);
                                        const newGradient = core_1.deepClone(currentGradient);
                                        newGradient.colors[i] = newColor;
                                        this.props.selectGradient(newGradient, true);
                                    }
                                }, underlined: true, styles: styles_1.colorTextInputStyles }),
                            React.createElement(react_1.DefaultButton, { iconProps: {
                                    iconName: "ChromeClose",
                                }, styles: styles_1.deleteColorStyles, onClick: () => {
                                    if (currentGradient.colors.length > 1) {
                                        const newGradient = core_1.deepClone(this.props.currentGradient);
                                        newGradient.colors.splice(i, 1);
                                        this.props.selectGradient(newGradient, true);
                                    }
                                } })));
                    }),
                    this.renderColorPicker())),
            React.createElement(custom_gradient_buttons_1.CustomGradientButtons, { selectGradient: this.props.selectGradient, currentGradient: currentGradient })));
    }
    changeColorPickerState(id, color, idx) {
        this.setState({
            isPickerOpen: !this.state.isPickerOpen,
            currentItemId: id,
            currentColor: color,
            currentItemIdx: idx,
        });
    }
    renderColorPicker() {
        return (React.createElement(React.Fragment, null, this.state.isPickerOpen && (React.createElement(react_1.Callout, { target: `#${this.state.currentItemId}`, onDismiss: () => this.changeColorPickerState(this.state.currentItemId, null, null), alignTargetEdge: true },
            React.createElement(fluentui_color_picker_1.ColorPicker, { defaultValue: this.state.currentColor, onPick: (color) => {
                    const newGradient = core_1.deepClone(this.props.currentGradient);
                    newGradient.colors[this.state.currentItemIdx] = color;
                    this.props.selectGradient(newGradient, true);
                }, parent: this })))));
    }
}
exports.CustomGradientMenu = CustomGradientMenu;
//# sourceMappingURL=custom_gradient_menu.js.map
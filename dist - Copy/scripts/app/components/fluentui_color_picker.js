"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPicker = exports.colorToCSS = void 0;
const React = require("react");
const resources_1 = require("../resources");
const react_1 = require("@fluentui/react");
const color_grid_1 = require("./colors/color_grid");
const null_button_1 = require("./colors/null_button");
const color_pickers_1 = require("./colors/color_pickers");
const palette_list_1 = require("./colors/palette_list");
const app_store_1 = require("../stores/app_store");
const input_colors_pickers_1 = require("./colors/input_colors_pickers");
const styles_1 = require("./colors/styles");
function colorToCSS(color) {
    return `rgb(${color.r.toFixed(0)},${color.g.toFixed(0)},${color.b.toFixed(0)})`;
}
exports.colorToCSS = colorToCSS;
class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        resources_1.addPowerBIThemeColors();
        if (this.props.defaultValue) {
            const colorCSS = colorToCSS(this.props.defaultValue);
            let matchedPalette = null;
            for (const p of resources_1.predefinedPalettes.filter((x) => x.type == "palette")) {
                for (const g of p.colors) {
                    for (const c of g) {
                        if (colorToCSS(c) == colorCSS) {
                            matchedPalette = p;
                            break;
                        }
                    }
                    if (matchedPalette) {
                        break;
                    }
                }
                if (matchedPalette) {
                    break;
                }
            }
            if (matchedPalette) {
                this.state = {
                    currentPalette: matchedPalette,
                    currentPicker: null,
                    currentColor: this.props.defaultValue,
                };
            }
            else {
                this.state = {
                    currentPalette: null,
                    currentPicker: color_pickers_1.PickerType.HCL,
                    currentColor: this.props.defaultValue,
                };
            }
        }
        else {
            this.state = {
                currentPalette: resources_1.predefinedPalettes.filter((x) => x.name == "Palette/ColorBrewer")[0],
                currentPicker: null,
            };
        }
    }
    render() {
        var _a, _b, _c;
        const editorType = (_c = (_b = (_a = this.props) === null || _a === void 0 ? void 0 : _a.store) === null || _b === void 0 ? void 0 : _b.editorType) !== null && _c !== void 0 ? _c : app_store_1.EditorType.Chart;
        const isWeb = editorType === app_store_1.EditorType.Chart || editorType === app_store_1.EditorType.Nested;
        const pickersSection = (React.createElement(React.Fragment, null,
            React.createElement(styles_1.PickersSectionWrapper, null,
                React.createElement(styles_1.PickersSection, null,
                    React.createElement(react_1.Label, null, "Color Picker"),
                    React.createElement(color_pickers_1.ColorPickerButton, { state: this.state, onClick: () => this.setState({
                            currentPalette: null,
                            currentPicker: color_pickers_1.PickerType.HCL,
                        }), type: color_pickers_1.PickerType.HCL }),
                    React.createElement(color_pickers_1.ColorPickerButton, { state: this.state, onClick: () => this.setState({
                            currentPalette: null,
                            currentPicker: color_pickers_1.PickerType.HSV,
                        }), type: color_pickers_1.PickerType.HSV }),
                    React.createElement(palette_list_1.PaletteList, { palettes: resources_1.predefinedPalettes.filter((x) => x.type == "palette"), selected: this.state.currentPalette, onClick: (p) => {
                            var _a;
                            this.setState({ currentPalette: p, currentPicker: null });
                            (_a = this.props.parent) === null || _a === void 0 ? void 0 : _a.forceUpdate();
                        } })),
                React.createElement(null_button_1.NullButton, { allowNull: this.props.allowNull, onPick: this.props.onPick }))));
        const colorsSection = (React.createElement(styles_1.ColorsSectionWrapper, null,
            this.state.currentPalette != null ? (React.createElement(color_grid_1.ColorGrid, { colors: this.state.currentPalette.colors, defaultValue: this.state.currentColor, onClick: (c) => {
                    this.props.onPick(c);
                    this.setState({ currentColor: c });
                } })) : null,
            this.state.currentPicker == color_pickers_1.PickerType.HCL ? (React.createElement(input_colors_pickers_1.HCLColorPicker, { defaultValue: this.state.currentColor || { r: 0, g: 0, b: 0 }, onChange: (c) => {
                    this.props.onPick(c);
                    this.setState({ currentColor: c });
                } })) : null,
            this.state.currentPicker == color_pickers_1.PickerType.HSV ? (React.createElement(input_colors_pickers_1.HSVColorPicker, { defaultValue: this.state.currentColor || { r: 0, g: 0, b: 0 }, onChange: (c) => {
                    this.props.onPick(c);
                    this.setState({ currentColor: c });
                } })) : null));
        return (React.createElement(React.Fragment, null,
            React.createElement(styles_1.ColorsPickerWrapper, null,
                React.createElement(styles_1.ColorsPickerLeftSectionWrapper, null, isWeb ? pickersSection : colorsSection),
                isWeb ? colorsSection : pickersSection)));
    }
}
exports.ColorPicker = ColorPicker;
//# sourceMappingURL=fluentui_color_picker.js.map
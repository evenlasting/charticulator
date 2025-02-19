"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradientView = exports.GradientPicker = void 0;
const React = require("react");
const core_1 = require("../../core");
const resources_1 = require("../resources");
const fluentui_color_picker_1 = require("./fluentui_color_picker");
const color_space_picker_1 = require("./color_space_picker");
const tabs_view_1 = require("./tabs_view");
const object_list_editor_1 = require("../views/panels/object_list_editor");
const controls_1 = require("../views/panels/widgets/controls");
const react_1 = require("@fluentui/react");
const fluent_ui_gradient_picker_1 = require("./fluent_ui_gradient_picker");
class GradientPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: "palettes",
            currentGradient: this.props.defaultValue || {
                colorspace: fluent_ui_gradient_picker_1.Colorspace.LAB,
                colors: [
                    { r: 0, g: 0, b: 0 },
                    { r: 255, g: 255, b: 255 },
                ],
            },
            isPickerOpen: false,
            currentItemId: "",
            currentColor: null,
            currentItemIdx: null,
        };
    }
    selectGradient(gradient, emit = false) {
        this.setState({
            currentGradient: gradient,
        }, () => {
            if (emit) {
                if (this.props.onPick) {
                    this.props.onPick(gradient);
                }
            }
        });
    }
    renderGradientPalettes() {
        const items = resources_1.predefinedPalettes.filter((x) => x.type == "sequential" || x.type == "diverging");
        const groups = [];
        const group2Index = new Map();
        for (const p of items) {
            const groupName = p.name.split("/")[0];
            let group;
            if (group2Index.has(groupName)) {
                group = groups[group2Index.get(groupName)][1];
            }
            else {
                group = [];
                group2Index.set(groupName, groups.length);
                groups.push([groupName, group]);
            }
            group.push(p);
        }
        return (React.createElement("section", { className: "palettes" },
            React.createElement("ul", null, groups.map((group, index) => {
                return (React.createElement("li", { key: `m${index}` },
                    React.createElement("div", { className: "label" }, group[0]),
                    React.createElement("ul", null, group[1].map((x) => {
                        const gradient = {
                            colors: x.colors[0],
                            colorspace: fluent_ui_gradient_picker_1.Colorspace.LAB,
                        };
                        return (React.createElement("li", { key: x.name, className: "item", onClick: () => this.selectGradient(gradient, true) },
                            React.createElement(GradientView, { gradient: gradient }),
                            React.createElement("label", null, x.name.split("/")[1])));
                    }))));
            }))));
    }
    changeColorPickerState(id, color, idx) {
        this.setState(Object.assign(Object.assign({}, this.state), { isPickerOpen: !this.state.isPickerOpen, currentItemId: id, currentColor: color, currentItemIdx: idx }));
    }
    renderColorPicker() {
        return (React.createElement(React.Fragment, null, this.state.isPickerOpen && (React.createElement(react_1.Callout, { target: `#${this.state.currentItemId}`, onDismiss: () => this.changeColorPickerState(this.state.currentItemId, null, null), alignTargetEdge: true },
            React.createElement(fluentui_color_picker_1.ColorPicker, { defaultValue: this.state.currentColor, onPick: (color) => {
                    const newGradient = core_1.deepClone(this.state.currentGradient);
                    newGradient.colors[this.state.currentItemIdx] = color;
                    this.selectGradient(newGradient, true);
                }, parent: this })))));
    }
    // eslint-disable-next-line
    render() {
        return (React.createElement("div", { className: "gradient-picker" },
            React.createElement(tabs_view_1.TabsView, { tabs: GradientPicker.tabs, currentTab: this.state.currentTab, onSelect: (tab) => this.setState({ currentTab: tab }) }),
            this.state.currentTab == "palettes"
                ? this.renderGradientPalettes()
                : null,
            this.state.currentTab == "custom" ? (React.createElement("section", { className: "gradient-editor" },
                React.createElement("div", { className: "row" },
                    React.createElement(GradientView, { gradient: this.state.currentGradient })),
                React.createElement("div", { className: "colors-scroll" },
                    React.createElement(object_list_editor_1.ReorderListView, { enabled: true, onReorder: (dragIndex, dropIndex) => {
                            const newGradient = core_1.deepClone(this.state.currentGradient);
                            object_list_editor_1.ReorderListView.ReorderArray(newGradient.colors, dragIndex, dropIndex);
                            this.selectGradient(newGradient, true);
                        } },
                        this.state.currentGradient.colors.map((color, i) => {
                            return (React.createElement("div", { className: "color-row", key: `m${i}` },
                                React.createElement("span", { id: `color_${i}`, className: "color-item", style: { background: fluentui_color_picker_1.colorToCSS(color) }, onClick: () => {
                                        this.changeColorPickerState(`color_${i}`, color, i);
                                    } }),
                                React.createElement(color_space_picker_1.InputField, { defaultValue: core_1.colorToHTMLColorHEX(color), onEnter: (value) => {
                                        const newColor = core_1.colorFromHTMLColor(value);
                                        const newGradient = core_1.deepClone(this.state.currentGradient);
                                        newGradient.colors[i] = newColor;
                                        this.selectGradient(newGradient, true);
                                        return true;
                                    } }),
                                React.createElement(controls_1.Button, { icon: "ChromeClose", onClick: () => {
                                        if (this.state.currentGradient.colors.length > 1) {
                                            const newGradient = core_1.deepClone(this.state.currentGradient);
                                            newGradient.colors.splice(i, 1);
                                            this.selectGradient(newGradient, true);
                                        }
                                    } })));
                        }),
                        this.renderColorPicker())),
                React.createElement("div", { className: "row" },
                    React.createElement(controls_1.Button, { icon: "general/plus", text: "Add", onClick: () => {
                            const newGradient = core_1.deepClone(this.state.currentGradient);
                            newGradient.colors.push({ r: 150, g: 150, b: 150 });
                            this.selectGradient(newGradient, true);
                        } }),
                    " ",
                    React.createElement(controls_1.Button, { icon: "Sort", text: "Reverse", onClick: () => {
                            const newGradient = core_1.deepClone(this.state.currentGradient);
                            newGradient.colors.reverse();
                            this.selectGradient(newGradient, true);
                        } }),
                    " ",
                    React.createElement(react_1.Dropdown, { options: [
                            { key: fluent_ui_gradient_picker_1.Colorspace.HCL, text: "HCL" },
                            { key: fluent_ui_gradient_picker_1.Colorspace.LAB, text: "Lab" },
                        ], onChange: (event, option) => {
                            if (option) {
                                const newGradient = core_1.deepClone(this.state.currentGradient);
                                newGradient.colorspace = option.key;
                                this.selectGradient(newGradient, true);
                            }
                        } })))) : null));
    }
}
exports.GradientPicker = GradientPicker;
GradientPicker.tabs = [
    { name: "palettes", label: "Palettes" },
    { name: "custom", label: "Custom" },
];
class GradientView extends React.PureComponent {
    componentDidMount() {
        this.componentDidUpdate();
    }
    componentDidUpdate() {
        // Chrome doesn't like get/putImageData in this method
        // Doing so will cause the popup editor to not layout, although any change in its style will fix
        setTimeout(() => {
            if (!this.refCanvas || !this.props.gradient) {
                return;
            }
            const ctx = this.refCanvas.getContext("2d");
            const width = this.refCanvas.width;
            const height = this.refCanvas.height;
            const scale = core_1.interpolateColors(this.props.gradient.colors, this.props.gradient.colorspace);
            const data = ctx.getImageData(0, 0, width, height);
            for (let i = 0; i < data.width; i++) {
                const t = i / (data.width - 1);
                const c = scale(t);
                for (let y = 0; y < data.height; y++) {
                    let ptr = (i + y * data.width) * 4;
                    data.data[ptr++] = c.r;
                    data.data[ptr++] = c.g;
                    data.data[ptr++] = c.b;
                    data.data[ptr++] = 255;
                }
            }
            ctx.putImageData(data, 0, 0);
        }, 0);
    }
    render() {
        return (React.createElement("span", { className: "gradient-view" },
            React.createElement("canvas", { ref: (e) => (this.refCanvas = e), width: 50, height: 2 })));
    }
}
exports.GradientView = GradientView;
//# sourceMappingURL=gradient_picker.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorFilterTestView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const core_1 = require("../../../core");
const renderer_1 = require("../../../app/renderer");
const graphics_1 = require("../../../core/graphics");
class ColorFilterTestView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slider1: 200,
            slider2: 200,
        };
    }
    render() {
        const colors = [
            "#000000",
            "#0f0f0f",
            "#191919",
            "#222222",
            "#2b2b2b",
            "#343434",
            "#3e3e3e",
            "#484848",
            "#525252",
            "#5c5c5c",
            "#676767",
            "#717171",
            "#7c7c7c",
            "#888888",
            "#939393",
            "#9e9e9e",
            "#aaaaaa",
            "#b6b6b6",
            "#c2c2c2",
            "#cecece",
            "#dadada",
            "#e6e6e6",
            "#f2f2f2",
            "#ffffff",
            "#1f77b4",
            "#aec7e8",
            "#ff7f0e",
            "#ffbb78",
            "#2ca02c",
            "#98df8a",
            "#d62728",
            "#ff9896",
            "#9467bd",
            "#c5b0d5",
            "#8c564b",
            "#c49c94",
            "#e377c2",
            "#f7b6d2",
            "#7f7f7f",
            "#c7c7c7",
            "#bcbd22",
            "#dbdb8d",
            "#17becf",
            "#9edae5",
        ].map((x) => core_1.colorFromHTMLColor(x));
        const elements = colors.map((color, i) => {
            const x = (i % 4) * 150;
            const y = Math.floor(i / 4) * 50;
            const style = {
                fillColor: color,
            };
            return graphics_1.makeGroup([
                graphics_1.makeRect(x, y, x + 60, y + 40, style),
                graphics_1.makeRect(x + 70, y, x + 130, y + 40, Object.assign(Object.assign({}, style), { colorFilter: {
                        saturation: { multiply: this.state.slider1 / 1000 },
                        lightness: { add: 0.01, pow: this.state.slider2 / 1000 },
                    } })),
            ]);
        });
        return (React.createElement("div", null,
            React.createElement("div", null, "Check saturation function with colors"),
            React.createElement("div", null,
                "Saturation = ",
                React.createElement("input", { type: "range", min: 1, max: 1000, value: this.state.slider1, onChange: (e) => {
                        this.setState({ slider1: +e.target.value });
                    } }),
                " " + (this.state.slider1 / 1000).toFixed(3)),
            React.createElement("div", null,
                "Lightness.pow = ",
                React.createElement("input", { type: "range", min: 0, max: 1000, value: this.state.slider2, onChange: (e) => {
                        this.setState({ slider2: +e.target.value });
                    } }),
                " " + (this.state.slider2 / 1000).toFixed(3)),
            React.createElement("svg", { width: 600, height: 600 },
                React.createElement("g", { transform: "translate(0, 599)" }, renderer_1.renderGraphicalElementSVG(core_1.Graphics.makeGroup([...elements]))))));
    }
}
exports.ColorFilterTestView = ColorFilterTestView;
//# sourceMappingURL=colorFilter.js.map
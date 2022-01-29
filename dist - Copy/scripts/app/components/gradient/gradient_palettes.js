"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradientView = exports.GradientPalettes = void 0;
const React = require("react");
const resources_1 = require("../../resources");
const styles_1 = require("./styles");
const react_1 = require("@fluentui/react");
const core_1 = require("../../../core");
const fluent_ui_gradient_picker_1 = require("../fluent_ui_gradient_picker");
class GradientPalettes extends React.Component {
    render() {
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
        return (React.createElement(styles_1.TabWrapper, null, groups.map((group, index) => {
            return (React.createElement("div", { key: `group-section-${index}` },
                React.createElement(react_1.Label, null, group[0]),
                group[1].map((x) => {
                    const gradient = {
                        colors: x.colors[0],
                        colorspace: fluent_ui_gradient_picker_1.Colorspace.LAB,
                    };
                    return (React.createElement(styles_1.PalettesWrapper, { key: x.name, onClick: () => this.props.selectGradient(gradient, true) },
                        React.createElement(GradientView, { gradient: gradient }),
                        React.createElement(react_1.Label, { styles: styles_1.colorPalettesLabelStyles }, x.name.split("/")[1])));
                })));
        })));
    }
}
exports.GradientPalettes = GradientPalettes;
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
        return (React.createElement(styles_1.ColorGradientWrapper, { className: "gradient-view" },
            React.createElement("canvas", { ref: (e) => (this.refCanvas = e), height: 2, style: { width: "100%" } })));
    }
}
exports.GradientView = GradientView;
//# sourceMappingURL=gradient_palettes.js.map
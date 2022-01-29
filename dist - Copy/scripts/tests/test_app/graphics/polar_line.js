"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarLineTestView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const core_1 = require("../../../core");
const renderer_1 = require("../../../app/renderer");
class PolarLineTestView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slider1: 0,
            slider2: 0,
        };
    }
    render() {
        const paths = [];
        let gridIndex = 0;
        const dAngle = this.state.slider2;
        const testAngles = (angle1, angle2) => {
            angle1 += dAngle;
            angle2 += dAngle;
            const r = 40;
            const cx = 50 + (gridIndex % 6) * 100 - 300;
            const cy = 50 + Math.floor(gridIndex / 6) * 100 - 300;
            gridIndex += 1;
            const path2 = core_1.Graphics.makePath({
                strokeColor: { r: 0, g: 0, b: 0 },
                fillColor: { r: 0, g: 255, b: 0 },
                fillOpacity: 0.1,
            });
            path2.polarLineTo(cx, cy, angle1, r, angle2, r, true);
            path2.polarLineTo(cx, cy, angle2, r, angle2, r - 10, false);
            path2.polarLineTo(cx, cy, angle2, r - 10, angle1, r - 10, false);
            path2.polarLineTo(cx, cy, angle1, r - 10, angle1, r, false);
            path2.closePath();
            paths.push(path2.path);
        };
        testAngles(0, this.state.slider1 - 500);
        testAngles(0, 180);
        testAngles(0, 270);
        testAngles(0, 360);
        testAngles(0, 200);
        testAngles(0, 400);
        testAngles(0, -90);
        testAngles(0, -180);
        testAngles(0, -270);
        testAngles(0, -360);
        testAngles(0, -200);
        testAngles(0, -400);
        return (React.createElement("div", null,
            React.createElement("div", null,
                React.createElement("input", { type: "range", min: 0, max: 1000, value: this.state.slider1, onChange: (e) => {
                        this.setState({ slider1: +e.target.value });
                    } }),
                React.createElement("input", { type: "range", min: 0, max: 1000, value: this.state.slider2, onChange: (e) => {
                        this.setState({ slider2: +e.target.value });
                    } })),
            React.createElement("svg", { width: 600, height: 300 },
                React.createElement("g", { transform: "translate(300, 0)" }, renderer_1.renderGraphicalElementSVG(core_1.Graphics.makeGroup([...paths]))))));
    }
}
exports.PolarLineTestView = PolarLineTestView;
//# sourceMappingURL=polar_line.js.map
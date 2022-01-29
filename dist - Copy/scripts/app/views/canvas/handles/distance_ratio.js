"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceRatioHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const core_1 = require("../../../../core");
const utils_1 = require("../../../utils");
const renderer_1 = require("../../../renderer");
const common_1 = require("./common");
class DistanceRatioHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newValue: this.props.handle.value,
        };
    }
    clip(v) {
        const min = this.props.handle.clipRange[0];
        const max = this.props.handle.clipRange[1];
        if (v < min) {
            v = min;
        }
        if (v > max) {
            v = max;
        }
        if (v < 0.05) {
            v = 0;
        }
        return v;
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.margin);
        this.hammer.add(new Hammer.Pan({ threshold: 1 }));
        let context = null;
        let oldValue = 0;
        this.hammer.on("panstart", () => {
            context = new common_1.HandlesDragContext();
            oldValue = this.props.handle.value;
            this.setState({
                dragging: true,
                newValue: oldValue,
            });
            if (this.props.onDragStart) {
                this.props.onDragStart(this.props.handle, context);
            }
        });
        this.hammer.on("pan", (e) => {
            if (context) {
                const cc = this.refs.centerCircle.getBoundingClientRect();
                const px = e.center.x - (cc.left + cc.width / 2);
                const py = e.center.y - (cc.top + cc.height / 2);
                let d = Math.sqrt(px * px + py * py) / this.props.zoom.scale;
                d =
                    (d - this.props.handle.startDistance) /
                        (this.props.handle.endDistance - this.props.handle.startDistance);
                d = this.clip(d);
                const newValue = d;
                this.setState({
                    newValue,
                });
                context.emit("drag", { value: newValue });
            }
        });
        this.hammer.on("panend", (e) => {
            if (context) {
                const cc = this.refs.centerCircle.getBoundingClientRect();
                const px = e.center.x - (cc.left + cc.width / 2);
                const py = e.center.y - (cc.top + cc.height / 2);
                let d = Math.sqrt(px * px + py * py) / this.props.zoom.scale;
                d =
                    (d - this.props.handle.startDistance) /
                        (this.props.handle.endDistance - this.props.handle.startDistance);
                d = this.clip(d);
                const newValue = d;
                // if (this.props.handle.range) {
                //     newValue = Math.min(this.props.handle.range[1], Math.max(newValue, this.props.handle.range[0]));
                // }
                context.emit("end", { value: newValue });
                this.setState({
                    dragging: false,
                });
                context = null;
            }
        });
    }
    componentWillUnmount() {
        this.hammer.destroy();
    }
    render() {
        const { handle } = this.props;
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        const cx = fX(handle.cx);
        const cy = fY(handle.cy);
        const d1 = handle.startDistance * this.props.zoom.scale;
        const d2 = handle.endDistance * this.props.zoom.scale;
        const fRadius = (x) => x * (d2 - d1) + d1;
        const makePath = (value) => {
            const path = core_1.Graphics.makePath();
            path.polarLineTo(0, 0, 90 - handle.startAngle, fRadius(value), 90 - handle.endAngle, fRadius(value), true);
            return renderer_1.renderSVGPath(path.path.cmds);
        };
        const px = (value) => {
            const alpha = core_1.Geometry.degreesToRadians(90 - handle.startAngle);
            return Math.cos(alpha) * fRadius(value);
        };
        const py = (value) => {
            const alpha = core_1.Geometry.degreesToRadians(90 - handle.startAngle);
            return -Math.sin(alpha) * fRadius(value);
        };
        return (React.createElement("g", { ref: "margin", className: utils_1.classNames("handle", "handle-distance", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
            React.createElement("g", { transform: `translate(${cx},${cy})` },
                React.createElement("circle", { ref: "centerCircle", cx: 0, cy: 0, r: 0 }),
                React.createElement("path", { d: makePath(handle.value), className: "element-line handle-ghost" }),
                React.createElement("path", { d: makePath(handle.value), className: "element-line handle-highlight" }),
                handle.value == 0 ? (React.createElement("circle", { cx: px(handle.value), cy: py(handle.value), r: 3, className: "element-shape handle-highlight" })) : null),
            this.state.dragging ? (React.createElement("g", { transform: `translate(${cx},${cy})` },
                React.createElement("path", { d: makePath(this.state.newValue), className: "element-line handle-hint" }),
                this.state.newValue == 0 ? (React.createElement("circle", { cx: px(this.state.newValue), cy: py(this.state.newValue), r: 3, className: "element-shape handle-hint" })) : null)) : null));
    }
}
exports.DistanceRatioHandleView = DistanceRatioHandleView;
//# sourceMappingURL=distance_ratio.js.map
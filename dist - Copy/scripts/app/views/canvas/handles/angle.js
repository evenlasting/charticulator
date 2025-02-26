"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngleHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const utils_1 = require("../../../utils");
const common_1 = require("./common");
class AngleHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newValue: this.props.handle.value,
        };
    }
    clipAngle(v) {
        v = Math.round(v / 15) * 15;
        const min = this.props.handle.clipAngles[0];
        const max = this.props.handle.clipAngles[1];
        if (min != null) {
            while (v >= min) {
                v -= 360;
            }
            while (v <= min) {
                v += 360;
            }
        }
        if (max != null) {
            while (v <= max) {
                v += 360;
            }
            while (v >= max) {
                v -= 360;
            }
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
                const newValue = this.clipAngle((Math.atan2(-px, py) / Math.PI) * 180 + 180);
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
                const newValue = this.clipAngle((Math.atan2(-px, py) / Math.PI) * 180 + 180);
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
    // eslint-disable-next-line
    render() {
        const { handle } = this.props;
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        const cx = fX(handle.cx);
        const cy = fY(handle.cy);
        const radius = handle.radius * this.props.zoom.scale + 10;
        let shapeF = AngleHandleView.shapeCircle;
        if (handle.icon == "<") {
            shapeF = AngleHandleView.shapeLeft;
        }
        if (handle.icon == ">") {
            shapeF = AngleHandleView.shapeRight;
        }
        return (React.createElement("g", { ref: "margin", className: utils_1.classNames("handle", "handle-angle", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
            React.createElement("g", { transform: `translate(${cx},${cy}) rotate(${180 + handle.value})` },
                React.createElement("circle", { ref: "centerCircle", cx: 0, cy: 0, r: 0 }),
                React.createElement("line", { x1: 0, y1: 0, x2: 0, y2: radius, className: "element-line handle-ghost" }),
                React.createElement("path", { d: shapeF(9), transform: `translate(0,${radius})`, className: "element-shape handle-ghost" }),
                React.createElement("line", { x1: 0, y1: 0, x2: 0, y2: radius, className: "element-line handle-highlight" }),
                React.createElement("path", { d: shapeF(5), transform: `translate(0,${radius})`, className: "element-shape handle-highlight" })),
            this.state.dragging ? (React.createElement("g", { transform: `translate(${cx},${cy}) rotate(${180 + this.state.newValue})` },
                React.createElement("line", { x1: 0, y1: 0, x2: 0, y2: radius, className: "element-line handle-hint" }),
                React.createElement("path", { d: shapeF(5), transform: `translate(0,${radius})`, className: "element-shape handle-hint" }))) : null));
        // let x: number, y: number;
        // let nx: number, ny: number;
        // let shape: string;
        // let scale = this.props.handle.total || 1;
        // switch (handle.axis) {
        //     case "x": {
        //         x = fX(handle.x + handle.value * handle.sign * scale);
        //         y = fY(handle.y);
        //         nx = fX(handle.x + this.state.newValue * handle.sign * scale);
        //         ny = fY(handle.y);
        //         shape = "M0,0l5,12.72l-10,0Z";
        //     } break;
        //     case "y": {
        //         x = fX(handle.x);
        //         y = fY(handle.y + handle.value * handle.sign * scale);
        //         nx = fX(handle.x);
        //         ny = fY(handle.y + this.state.newValue * handle.sign * scale);
        //         shape = "M0,0l-12.72,5l0,-10Z";
        //     } break;
        // }
        // return (
        //     <g ref="margin" className={classNames("handle", "handle-gap-" + handle.axis, ["active", this.state.dragging], ["visible", handle.visible || this.props.visible])}>
        //         <path className="element-shape handle-ghost"
        //             transform={`translate(${x.toFixed(6)},${y.toFixed(6)})`}
        //             d={shape}
        //         />
        //         <path className="element-shape handle-highlight"
        //             transform={`translate(${x.toFixed(6)},${y.toFixed(6)})`}
        //             d={shape}
        //         />
        //         {this.state.dragging ? (
        //             <path className="element-shape handle-hint"
        //                 transform={`translate(${nx.toFixed(6)},${ny.toFixed(6)})`}
        //                 d={shape}
        //             />
        //         ) : null}
        //     </g>
        // );
    }
}
exports.AngleHandleView = AngleHandleView;
AngleHandleView.shapeCircle = (r) => `M -${r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
AngleHandleView.shapeRight = (r) => `M 0 ${-r} L ${-1.5 * r} 0 L 0 ${r} Z`;
AngleHandleView.shapeLeft = (r) => `M 0 ${-r} L ${1.5 * r} 0 L 0 ${r} Z`;
//# sourceMappingURL=angle.js.map
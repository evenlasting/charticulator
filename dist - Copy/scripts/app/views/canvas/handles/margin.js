"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarginHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const utils_1 = require("../../../utils");
const common_1 = require("./common");
class MarginHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newValue: this.props.handle.value,
        };
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.margin);
        this.hammer.add(new Hammer.Pan({ threshold: 1 }));
        let context = null;
        let oldValue;
        let sign;
        let total;
        let dXIntegrate = 0;
        let dXLast = 0;
        let dYIntegrate = 0;
        let dYLast = 0;
        this.hammer.on("panstart", () => {
            context = new common_1.HandlesDragContext();
            oldValue = this.props.handle.value;
            sign = this.props.handle.sign;
            if (this.props.handle.total != null) {
                total = this.props.handle.total;
            }
            else {
                total = 1;
            }
            dXLast = 0;
            dYLast = 0;
            dXIntegrate = 0;
            dYIntegrate = 0;
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
                dXIntegrate += (e.deltaX - dXLast) / this.props.zoom.scale;
                dYIntegrate += -(e.deltaY - dYLast) / this.props.zoom.scale;
                dXLast = e.deltaX;
                dYLast = e.deltaY;
                let newValue = ((this.props.handle.axis == "x" ? dXIntegrate : dYIntegrate) * sign) /
                    total +
                    oldValue;
                if (this.props.handle.range) {
                    newValue = Math.min(this.props.handle.range[1], Math.max(newValue, this.props.handle.range[0]));
                }
                this.setState({
                    newValue,
                });
                context.emit("drag", { value: newValue });
            }
        });
        this.hammer.on("panend", (e) => {
            if (context) {
                dXIntegrate += (e.deltaX - dXLast) / this.props.zoom.scale;
                dYIntegrate += -(e.deltaY - dYLast) / this.props.zoom.scale;
                dXLast = e.deltaX;
                dYLast = e.deltaY;
                let newValue = ((this.props.handle.axis == "x" ? dXIntegrate : dYIntegrate) * sign) /
                    total +
                    oldValue;
                if (this.props.handle.range) {
                    newValue = Math.min(this.props.handle.range[1], Math.max(newValue, this.props.handle.range[0]));
                }
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
        let x, y;
        let nx, ny;
        let shape;
        const scale = this.props.handle.total || 1;
        switch (handle.axis) {
            case "x":
                {
                    x = fX(handle.x + handle.value * handle.sign * scale);
                    y = fY(handle.y);
                    nx = fX(handle.x + this.state.newValue * handle.sign * scale);
                    ny = fY(handle.y);
                    shape = "M0,0l5,12.72l-10,0Z";
                }
                break;
            case "y":
                {
                    x = fX(handle.x);
                    y = fY(handle.y + handle.value * handle.sign * scale);
                    nx = fX(handle.x);
                    ny = fY(handle.y + this.state.newValue * handle.sign * scale);
                    shape = "M0,0l-12.72,5l0,-10Z";
                }
                break;
        }
        return (React.createElement("g", { ref: "margin", className: utils_1.classNames("handle", "handle-gap-" + handle.axis, ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
            React.createElement("path", { className: "element-shape handle-ghost", transform: `translate(${x.toFixed(6)},${y.toFixed(6)})`, d: shape }),
            React.createElement("path", { className: "element-shape handle-highlight", transform: `translate(${x.toFixed(6)},${y.toFixed(6)})`, d: shape }),
            this.state.dragging ? (React.createElement("path", { className: "element-shape handle-hint", transform: `translate(${nx.toFixed(6)},${ny.toFixed(6)})`, d: shape })) : null));
    }
}
exports.MarginHandleView = MarginHandleView;
//# sourceMappingURL=margin.js.map
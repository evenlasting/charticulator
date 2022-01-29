"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const core_1 = require("../../../../core");
const utils_1 = require("../../../utils");
const common_1 = require("./common");
const POINT_SIZE = 3;
const POINT_GHOST_SIZE = 6;
class PointHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newXValue: this.props.handle.x,
            newYValue: this.props.handle.y,
        };
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.circle);
        this.hammer.add(new Hammer.Pan());
        let context = null;
        let oldXValue;
        let oldYValue;
        let dXIntegrate = 0;
        let dXLast = 0;
        let dYIntegrate = 0;
        let dYLast = 0;
        this.hammer.on("panstart", () => {
            context = new common_1.HandlesDragContext();
            oldXValue = this.props.handle.x;
            oldYValue = this.props.handle.y;
            dXLast = 0;
            dYLast = 0;
            dXIntegrate = 0;
            dYIntegrate = 0;
            this.setState({
                dragging: true,
                newXValue: oldXValue,
                newYValue: oldYValue,
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
                const newXValue = dXIntegrate + oldXValue;
                const newYValue = dYIntegrate + oldYValue;
                this.setState({
                    newXValue,
                    newYValue,
                });
                context.emit("drag", { x: newXValue, y: newYValue });
            }
        });
        this.hammer.on("panend", (e) => {
            if (context) {
                dXIntegrate += (e.deltaX - dXLast) / this.props.zoom.scale;
                dYIntegrate += -(e.deltaY - dYLast) / this.props.zoom.scale;
                dXLast = e.deltaX;
                dYLast = e.deltaY;
                const newXValue = dXIntegrate + oldXValue;
                const newYValue = dYIntegrate + oldYValue;
                context.emit("end", { x: newXValue, y: newYValue });
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
        const { x, y } = core_1.Geometry.applyZoom(this.props.zoom, {
            x: handle.x,
            y: -handle.y,
        });
        const { x: hx, y: hy } = core_1.Geometry.applyZoom(this.props.zoom, {
            x: this.state.newXValue,
            y: -this.state.newYValue,
        });
        return (React.createElement("g", { ref: "circle", className: utils_1.classNames("handle", "handle-point", ["active", this.state.dragging], ["snapped", this.props.snapped], ["visible", handle.visible || this.props.visible]) },
            React.createElement("circle", { className: "element-shape handle-ghost", cx: x, cy: y, r: POINT_GHOST_SIZE }),
            React.createElement("circle", { className: "element-shape handle-highlight", cx: x, cy: y, r: POINT_SIZE }),
            this.state.dragging ? (React.createElement("g", null,
                React.createElement("line", { className: `element-line handle-hint`, x1: hx, y1: hy, x2: x, y2: y }),
                React.createElement("circle", { className: `element-shape handle-hint`, cx: hx, cy: hy, r: POINT_SIZE }))) : null));
    }
}
exports.PointHandleView = PointHandleView;
//# sourceMappingURL=point.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GapRatioHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const core_1 = require("../../../../core");
const utils_1 = require("../../../utils");
const renderer_1 = require("../../../renderer");
const common_1 = require("./common");
class GapRatioHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newValue: this.props.handle.value,
        };
    }
    // eslint-disable-next-line
    componentDidMount() {
        this.hammer = new Hammer(this.refs.line);
        this.hammer.add(new Hammer.Pan({ threshold: 1 }));
        let context = null;
        let oldValue;
        let xStart = 0;
        let yStart = 0;
        let dXIntegrate = 0;
        let dXLast = 0;
        let dYIntegrate = 0;
        let dYLast = 0;
        let scale = 1 / this.props.handle.scale;
        const getNewValue = () => {
            const cs = this.props.handle.coordinateSystem;
            if (cs == null || cs instanceof core_1.Graphics.CartesianCoordinates) {
                if (this.props.handle.axis == "x") {
                    return oldValue + scale * dXIntegrate;
                }
                if (this.props.handle.axis == "y") {
                    return oldValue + scale * dYIntegrate;
                }
            }
            if (cs instanceof core_1.Graphics.PolarCoordinates) {
                if (this.props.handle.axis == "x") {
                    const getAngle = (x, y) => {
                        return 90 - (Math.atan2(y, x) / Math.PI) * 180;
                    };
                    const angle0 = getAngle(xStart, yStart);
                    let angle1 = getAngle(xStart + dXIntegrate, yStart + dYIntegrate);
                    if (angle1 > angle0 + 180) {
                        angle1 -= 360;
                    }
                    if (angle1 < angle0 - 180) {
                        angle1 += 360;
                    }
                    return oldValue + scale * (angle1 - angle0);
                }
                if (this.props.handle.axis == "y") {
                    const nX = xStart + dXIntegrate;
                    const nY = yStart + dYIntegrate;
                    const radius0 = Math.sqrt(xStart * xStart + yStart * yStart);
                    const radius1 = Math.sqrt(nX * nX + nY * nY);
                    return oldValue + scale * (radius1 - radius0);
                }
            }
            return oldValue;
        };
        this.hammer.on("panstart", (e) => {
            context = new common_1.HandlesDragContext();
            oldValue = this.props.handle.value;
            if (this.refs.cOrigin) {
                const bbox = this.refs.cOrigin.getBoundingClientRect();
                xStart = (e.center.x - e.deltaX - bbox.left) / this.props.zoom.scale;
                yStart = -(e.center.y - e.deltaY - bbox.top) / this.props.zoom.scale;
            }
            else {
                xStart = (e.center.x - e.deltaX) / this.props.zoom.scale;
                yStart = -(e.center.y - e.deltaY) / this.props.zoom.scale;
            }
            dXLast = e.deltaX;
            dYLast = e.deltaY;
            dXIntegrate = e.deltaX / this.props.zoom.scale;
            dYIntegrate = -e.deltaY / this.props.zoom.scale;
            scale = 1 / this.props.handle.scale;
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
                let newValue = getNewValue();
                if (this.props.handle.range) {
                    newValue = Math.min(this.props.handle.range[1], Math.max(newValue, this.props.handle.range[0]));
                }
                else {
                    newValue = Math.min(1, Math.max(newValue, 0));
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
                let newValue = getNewValue();
                if (this.props.handle.range) {
                    newValue = Math.min(this.props.handle.range[1], Math.max(newValue, this.props.handle.range[0]));
                }
                else {
                    newValue = Math.min(1, Math.max(newValue, 0));
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
        const handle = this.props.handle;
        if (handle.coordinateSystem == null ||
            handle.coordinateSystem instanceof core_1.Graphics.CartesianCoordinates) {
            return this.renderCartesian();
        }
        if (handle.coordinateSystem instanceof core_1.Graphics.PolarCoordinates) {
            return this.renderPolar();
        }
        return null;
    }
    // eslint-disable-next-line
    renderPolar() {
        const { handle } = this.props;
        const polar = handle.coordinateSystem;
        const center = core_1.Geometry.applyZoom(this.props.zoom, {
            x: polar.origin.x,
            y: -polar.origin.y,
        });
        switch (handle.axis) {
            case "x": {
                // angular axis
                const pathValue = core_1.Graphics.makePath();
                const pathRegion = core_1.Graphics.makePath();
                const angle = handle.reference + handle.scale * handle.value;
                const angleRef = handle.reference;
                const r1 = handle.span[0] * this.props.zoom.scale, r2 = handle.span[1] * this.props.zoom.scale;
                pathValue.polarLineTo(center.x, -center.y, -angle + 90, r1, -angle + 90, r2, true);
                pathRegion.polarLineTo(center.x, -center.y, -angle + 90, r1, -angle + 90, r2, true);
                pathRegion.polarLineTo(center.x, -center.y, -angle + 90, r2, -angleRef + 90, r2, false);
                pathRegion.polarLineTo(center.x, -center.y, -angleRef + 90, r2, -angleRef + 90, r1, false);
                pathRegion.polarLineTo(center.x, -center.y, -angleRef + 90, r1, -angle + 90, r1, false);
                pathRegion.closePath();
                const pathNew = core_1.Graphics.makePath();
                if (this.state.dragging) {
                    const angleNew = handle.reference + handle.scale * this.state.newValue;
                    pathNew.polarLineTo(center.x, -center.y, -angleNew + 90, r1, -angleNew + 90, r2, true);
                }
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-angular", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("circle", { ref: "cOrigin", cx: center.x, cy: center.y, r: 0 }),
                    React.createElement("g", { ref: "line" },
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathRegion.path.cmds), className: "element-region handle-ghost" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathValue.path.cmds), className: "element-line handle-ghost" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathRegion.path.cmds), className: "element-region handle-highlight" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathValue.path.cmds), className: "element-line handle-highlight" })),
                    this.state.dragging ? (React.createElement("path", { d: renderer_1.renderSVGPath(pathNew.path.cmds), className: "element-line handle-hint" })) : null));
            }
            case "y": {
                const pathValue = core_1.Graphics.makePath();
                const pathRegion = core_1.Graphics.makePath();
                const radius = (handle.reference + handle.scale * handle.value) *
                    this.props.zoom.scale;
                const radiusRef = handle.reference * this.props.zoom.scale;
                const angle1 = handle.span[0], angle2 = handle.span[1];
                pathValue.polarLineTo(center.x, -center.y, -angle1 + 90, radius, -angle2 + 90, radius, true);
                pathRegion.polarLineTo(center.x, -center.y, -angle1 + 90, radius, -angle2 + 90, radius, true);
                pathRegion.polarLineTo(center.x, -center.y, -angle2 + 90, radius, -angle2 + 90, radiusRef, false);
                pathRegion.polarLineTo(center.x, -center.y, -angle2 + 90, radiusRef, -angle1 + 90, radiusRef, false);
                pathRegion.polarLineTo(center.x, -center.y, -angle1 + 90, radiusRef, -angle1 + 90, radius, false);
                pathRegion.closePath();
                const pathNew = core_1.Graphics.makePath();
                if (this.state.dragging) {
                    const radiusNew = (handle.reference + handle.scale * this.state.newValue) *
                        this.props.zoom.scale;
                    pathNew.polarLineTo(center.x, -center.y, -angle1 + 90, radiusNew, -angle2 + 90, radiusNew, true);
                }
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-radial", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("circle", { ref: "cOrigin", cx: center.x, cy: center.y, r: 0 }),
                    React.createElement("g", { ref: "line" },
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathRegion.path.cmds), className: "element-region handle-ghost" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathValue.path.cmds), className: "element-line handle-ghost" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathRegion.path.cmds), className: "element-region handle-highlight" }),
                        React.createElement("path", { d: renderer_1.renderSVGPath(pathValue.path.cmds), className: "element-line handle-highlight" })),
                    this.state.dragging ? (React.createElement("path", { d: renderer_1.renderSVGPath(pathNew.path.cmds), className: "element-line handle-hint" })) : null));
            }
        }
    }
    // eslint-disable-next-line
    renderCartesian() {
        const { handle } = this.props;
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        switch (handle.axis) {
            case "x": {
                const fxRef = fX(handle.reference);
                const fxVal = fX(handle.reference + handle.scale * handle.value);
                const fy1 = fY(handle.span[0]);
                const fy2 = fY(handle.span[1]);
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-x", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("g", { ref: "line" },
                        React.createElement("line", { className: "element-line handle-ghost", x1: fxVal, x2: fxVal, y1: fy1, y2: fy2 }),
                        React.createElement("rect", { className: "element-region handle-ghost", x: Math.min(fxRef, fxVal), width: Math.abs(fxRef - fxVal), y: Math.min(fy1, fy2), height: Math.abs(fy2 - fy1) }),
                        React.createElement("line", { className: "element-line handle-highlight", x1: fxVal, x2: fxVal, y1: fy1, y2: fy2 }),
                        React.createElement("rect", { className: "element-region handle-highlight", x: Math.min(fxRef, fxVal), width: Math.abs(fxRef - fxVal), y: Math.min(fy1, fy2), height: Math.abs(fy2 - fy1) })),
                    this.state.dragging ? (React.createElement("g", null,
                        React.createElement("line", { className: `element-line handle-hint`, x1: fX(handle.reference + handle.scale * this.state.newValue), x2: fX(handle.reference + handle.scale * this.state.newValue), y1: fY(handle.span[0]), y2: fY(handle.span[1]) }))) : null));
            }
            case "y": {
                const fyRef = fY(handle.reference);
                const fyVal = fY(handle.reference + handle.scale * handle.value);
                const fx1 = fX(handle.span[0]);
                const fx2 = fX(handle.span[1]);
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-y", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("g", { ref: "line" },
                        React.createElement("line", { className: "element-line handle-ghost", y1: fyVal, y2: fyVal, x1: fx1, x2: fx2 }),
                        React.createElement("rect", { className: "element-region handle-ghost", y: Math.min(fyRef, fyVal), height: Math.abs(fyRef - fyVal), x: Math.min(fx1, fx2), width: Math.abs(fx2 - fx1) }),
                        React.createElement("line", { className: "element-line handle-highlight", y1: fyVal, y2: fyVal, x1: fx1, x2: fx2 }),
                        React.createElement("rect", { className: "element-region handle-highlight", y: Math.min(fyRef, fyVal), height: Math.abs(fyRef - fyVal), x: Math.min(fx1, fx2), width: Math.abs(fx2 - fx1) })),
                    this.state.dragging ? (React.createElement("g", null,
                        React.createElement("line", { className: `element-line handle-hint`, y1: fY(handle.reference + handle.scale * this.state.newValue), y2: fY(handle.reference + handle.scale * this.state.newValue), x1: fx1, x2: fx2 }))) : null));
            }
        }
    }
}
exports.GapRatioHandleView = GapRatioHandleView;
//# sourceMappingURL=gap_ratio.js.map
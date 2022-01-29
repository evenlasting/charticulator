"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputCurveHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const core_1 = require("../../../../core");
const globals = require("../../../globals");
const R = require("../../../resources");
const utils_1 = require("../../../utils");
const controllers_1 = require("../../../controllers");
const components_1 = require("../../../components");
const controls_1 = require("../../panels/widgets/controls");
const common_1 = require("./common");
const strings_1 = require("../../../../strings");
class InputCurveHandleView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            enabled: false,
            drawing: false,
            points: [],
        };
    }
    getPoint(x, y) {
        const bbox = this.refs.interaction.getBoundingClientRect();
        x -= bbox.left;
        y -= bbox.top + bbox.height;
        x /= this.props.zoom.scale;
        y /= -this.props.zoom.scale;
        // Scale x, y
        const w = Math.abs(this.props.handle.x2 - this.props.handle.x1);
        const h = Math.abs(this.props.handle.y2 - this.props.handle.y1);
        return {
            x: (x - w / 2) / (w / 2),
            y: (y - h / 2) / (w / 2),
        };
    }
    getBezierCurvesFromMousePoints(points) {
        if (points.length < 2) {
            return [];
        }
        const segs = [];
        for (let i = 0; i < points.length - 1; i++) {
            segs.push(new core_1.Graphics.LineSegmentParametrization(points[i], points[i + 1]));
        }
        const lp = new core_1.Graphics.MultiCurveParametrization(segs);
        const lpLength = lp.getLength();
        const segments = Math.ceil(lpLength / 0.2);
        const sampleAtS = (s) => {
            const p = lp.getPointAtS(s);
            let tx = 0, ty = 0;
            for (let k = -5; k <= 5; k++) {
                let ks = s + ((k / 40) * lpLength) / segments;
                ks = Math.max(0, Math.min(lpLength, ks));
                const t = lp.getTangentAtS(ks);
                tx += t.x;
                ty += t.y;
            }
            const t = core_1.Geometry.vectorNormalize({ x: tx, y: ty });
            return [p, t];
        };
        let [p0, t0] = sampleAtS(0);
        let s0 = 0;
        const curves = [];
        for (let i = 1; i <= segments; i++) {
            const s = (i / segments) * lpLength;
            const [pi, ti] = sampleAtS(s);
            const ds = (s - s0) / 3;
            curves.push([
                p0,
                core_1.Geometry.vectorAdd(p0, core_1.Geometry.vectorScale(t0, ds)),
                core_1.Geometry.vectorAdd(pi, core_1.Geometry.vectorScale(ti, -ds)),
                pi,
            ]);
            s0 = s;
            p0 = pi;
            t0 = ti;
        }
        return curves;
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.interaction);
        this.hammer.on("panstart", (e) => {
            const x = e.center.x - e.deltaX;
            const y = e.center.y - e.deltaY;
            this.setState({
                drawing: true,
                points: [this.getPoint(x, y)],
            });
        });
        this.hammer.on("pan", (e) => {
            this.state.points.push(this.getPoint(e.center.x, e.center.y));
            this.setState({
                points: this.state.points,
            });
        });
        this.hammer.on("panend", () => {
            const curve = this.getBezierCurvesFromMousePoints(this.state.points);
            const context = new common_1.HandlesDragContext();
            this.props.onDragStart(this.props.handle, context);
            context.emit("end", { value: curve });
            this.setState({
                drawing: false,
                enabled: false,
            });
        });
    }
    componentWillUnmount() {
        this.hammer.destroy();
    }
    renderDrawing() {
        const handle = this.props.handle;
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        const transformPoint = (p) => {
            const scaler = Math.abs(handle.x2 - handle.x1) / 2;
            const x = p.x * scaler + (handle.x1 + handle.x2) / 2;
            const y = p.y * scaler + (handle.y1 + handle.y2) / 2;
            return {
                x: fX(x),
                y: fY(y),
            };
        };
        return (React.createElement("path", { d: "M" +
                this.state.points
                    .map((p) => {
                    const pt = transformPoint(p);
                    return `${utils_1.toSVGNumber(pt.x)},${utils_1.toSVGNumber(pt.y)}`;
                })
                    .join("L"), className: "handle-hint element-line" }));
    }
    renderButton(x, y) {
        const margin = 2;
        const cx = x - 16 - margin;
        const cy = y + 16 + margin;
        return (React.createElement("g", { className: "handle-button", onClick: () => {
                this.setState({ enabled: true });
            } },
            React.createElement("rect", { x: cx - 16, y: cy - 16, width: 32, height: 32 }),
            React.createElement("image", { xlinkHref: R.getSVGIcon("Edit"), x: cx - 12, y: cy - 12, width: 24, height: 24 })));
    }
    // eslint-disable-next-line
    renderSpiralButton(x, y) {
        const margin = 2;
        const cx = x - 16 - margin;
        const cy = y + 16 + margin;
        let anchorElement;
        return (React.createElement("g", { className: "handle-button", 
            // eslint-disable-next-line
            onClick: () => {
                globals.popupController.popupAt(
                // eslint-disable-next-line
                (context) => {
                    let windings = 4;
                    let startAngle = 180;
                    return (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement("div", { style: { padding: "10px" } },
                            React.createElement("div", { className: "charticulator__widget-row" },
                                React.createElement("span", { className: "charticulator__widget-row-label" },
                                    strings_1.strings.handles.windings,
                                    ":"),
                                React.createElement(controls_1.InputNumber, { defaultValue: windings, onEnter: (value) => {
                                        windings = value;
                                        return true;
                                    } })),
                            React.createElement("div", { className: "charticulator__widget-row" },
                                React.createElement("span", { className: "charticulator__widget-row-label" },
                                    strings_1.strings.handles.startAngle,
                                    ":"),
                                React.createElement(controls_1.InputNumber, { defaultValue: startAngle, onEnter: (value) => {
                                        startAngle = value;
                                        return true;
                                    } })),
                            React.createElement("div", { style: { textAlign: "right", marginTop: "10px" } },
                                React.createElement(components_1.ButtonRaised, { text: strings_1.strings.handles.drawSpiral, onClick: () => {
                                        context.close();
                                        // Make sprial and emit.
                                        const dragContext = new common_1.HandlesDragContext();
                                        const curve = [];
                                        this.props.onDragStart(this.props.handle, dragContext);
                                        const thetaStart = core_1.Geometry.degreesToRadians(startAngle);
                                        const thetaEnd = thetaStart + windings * Math.PI * 2;
                                        const N = 64;
                                        const a = 1 / thetaEnd; // r = a theta
                                        const swapXY = (p) => {
                                            return { x: p.y, y: p.x };
                                        };
                                        for (let i = 0; i < N; i++) {
                                            const theta1 = thetaStart + (i / N) * (thetaEnd - thetaStart);
                                            const theta2 = thetaStart +
                                                ((i + 1) / N) * (thetaEnd - thetaStart);
                                            const scaler = 3 / (theta2 - theta1);
                                            const r1 = a * theta1;
                                            const r2 = a * theta2;
                                            const p1 = {
                                                x: r1 * Math.cos(theta1),
                                                y: r1 * Math.sin(theta1),
                                            };
                                            const p2 = {
                                                x: r2 * Math.cos(theta2),
                                                y: r2 * Math.sin(theta2),
                                            };
                                            const cp1 = {
                                                x: p1.x +
                                                    (a *
                                                        (Math.cos(theta1) -
                                                            theta1 * Math.sin(theta1))) /
                                                        scaler,
                                                y: p1.y +
                                                    (a *
                                                        (Math.sin(theta1) +
                                                            theta1 * Math.cos(theta1))) /
                                                        scaler,
                                            };
                                            const cp2 = {
                                                x: p2.x -
                                                    (a *
                                                        (Math.cos(theta2) -
                                                            theta2 * Math.sin(theta2))) /
                                                        scaler,
                                                y: p2.y -
                                                    (a *
                                                        (Math.sin(theta2) +
                                                            theta2 * Math.cos(theta2))) /
                                                        scaler,
                                            };
                                            curve.push([p1, cp1, cp2, p2].map(swapXY));
                                        }
                                        dragContext.emit("end", { value: curve });
                                    } })))));
                }, { anchor: anchorElement });
            } },
            React.createElement("rect", { x: cx - 16, y: cy - 16, width: 32, height: 32, ref: (e) => (anchorElement = e) }),
            React.createElement("image", { xlinkHref: R.getSVGIcon("scaffold/spiral"), x: cx - 12, y: cy - 12, width: 24, height: 24 })));
    }
    render() {
        const handle = this.props.handle;
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        return (React.createElement("g", { className: "handle" },
            React.createElement("rect", { ref: "interaction", style: {
                    pointerEvents: this.state.enabled ? "fill" : "none",
                    cursor: "crosshair",
                }, className: "handle-ghost element-region", x: Math.min(fX(handle.x1), fX(handle.x2)), y: Math.min(fY(handle.y1), fY(handle.y2)), width: Math.abs(fX(handle.x1) - fX(handle.x2)), height: Math.abs(fY(handle.y1) - fY(handle.y2)) }),
            this.state.drawing ? this.renderDrawing() : null,
            !this.state.enabled ? (React.createElement("g", null,
                this.renderSpiralButton(Math.max(fX(handle.x1), fX(handle.x2)) - 38, Math.min(fY(handle.y1), fY(handle.y2))),
                this.renderButton(Math.max(fX(handle.x1), fX(handle.x2)), Math.min(fY(handle.y1), fY(handle.y2))))) : null));
    }
}
exports.InputCurveHandleView = InputCurveHandleView;
//# sourceMappingURL=input_curve.js.map
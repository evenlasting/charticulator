"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAlignmentHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const core_1 = require("../../../../core");
const globals = require("../../../globals");
const utils_1 = require("../../../utils");
const controllers_1 = require("../../../controllers");
const components_1 = require("../../../components");
const common_1 = require("./common");
const types_1 = require("../../../../core/specification/types");
class TextAlignmentHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            dragging: false,
            newAlignment: props.handle.alignment,
            newRotation: props.handle.rotation,
        };
    }
    getRelativePoint(px, py) {
        const anchorBounds = this.anchorCircle.getBoundingClientRect();
        const x = px - (anchorBounds.left + anchorBounds.width / 2);
        const y = py - (anchorBounds.top + anchorBounds.height / 2);
        return { x: x / this.props.zoom.scale, y: -y / this.props.zoom.scale };
    }
    // eslint-disable-next-line
    componentDidMount() {
        this.hammer = new Hammer(this.container);
        this.hammer.add(new Hammer.Pan({ threshold: 1 }));
        this.hammer.add(new Hammer.Tap());
        let mode = null;
        let startX = 0;
        let startY = 0;
        let sumDeltaX = 0, dXLast = 0;
        let sumDeltaY = 0, dYLast = 0;
        let p0;
        let previousAlignment;
        let previousRotation;
        let context = null;
        const newStateFromMoveAndRotate = (dx, dy, newRotation, snapping) => {
            const rect = this.getRectFromAlignment(previousAlignment, previousRotation);
            const acx = rect.cx - this.props.handle.anchorX;
            const acy = rect.cy - this.props.handle.anchorY;
            const newAlignment = {
                x: previousAlignment.x,
                y: previousAlignment.y,
                xMargin: previousAlignment.xMargin,
                yMargin: previousAlignment.yMargin,
            };
            const cos = Math.cos(core_1.Geometry.degreesToRadians(newRotation));
            const sin = Math.sin(core_1.Geometry.degreesToRadians(newRotation));
            const pdx = dx * cos + dy * sin;
            const pdy = -dx * sin + dy * cos;
            const pcx = acx * cos + acy * sin;
            const pcy = -acx * sin + acy * cos;
            const npcx = pcx + pdx;
            const npcy = pcy + pdy;
            if (snapping && Math.abs(npcy) < 5 / this.props.zoom.scale) {
                newAlignment.y = types_1.TextAlignmentVertical.Middle;
            }
            else if (npcy < 0) {
                newAlignment.y = types_1.TextAlignmentVertical.Top;
                newAlignment.yMargin = -npcy - this.props.handle.textHeight / 2;
                if (Math.abs(newAlignment.yMargin) < 5 / this.props.zoom.scale) {
                    newAlignment.yMargin = 0;
                }
            }
            else {
                newAlignment.y = types_1.TextAlignmentVertical.Bottom;
                newAlignment.yMargin = npcy - this.props.handle.textHeight / 2;
                if (Math.abs(newAlignment.yMargin) < 5 / this.props.zoom.scale) {
                    newAlignment.yMargin = 0;
                }
            }
            if (snapping && Math.abs(npcx) < 5 / this.props.zoom.scale) {
                newAlignment.x = types_1.TextAlignmentHorizontal.Middle;
            }
            else if (npcx < 0) {
                newAlignment.x = types_1.TextAlignmentHorizontal.Right;
                newAlignment.xMargin = -npcx - this.props.handle.textWidth / 2;
                if (Math.abs(newAlignment.xMargin) < 5 / this.props.zoom.scale) {
                    newAlignment.xMargin = 0;
                }
            }
            else {
                newAlignment.x = types_1.TextAlignmentHorizontal.Left;
                newAlignment.xMargin = npcx - this.props.handle.textWidth / 2;
                if (Math.abs(newAlignment.xMargin) < 5 / this.props.zoom.scale) {
                    newAlignment.xMargin = 0;
                }
            }
            return [newAlignment, newRotation];
        };
        const handleRotation = (p1, commit = false) => {
            const rect = this.getRectFromAlignment(previousAlignment, previousRotation);
            const ox = rect.cx - this.props.handle.anchorX;
            const oy = rect.cy - this.props.handle.anchorY;
            let newRotation = (Math.atan2(p1.y - oy, p1.x - ox) / Math.PI) * 180 + 180;
            newRotation = Math.round(newRotation / 15) * 15;
            const newAlignment = newStateFromMoveAndRotate(0, 0, newRotation, false)[0];
            if (commit) {
                this.setState({
                    dragging: false,
                });
                context.emit("end", { alignment: newAlignment, rotation: newRotation });
            }
            else {
                this.setState({
                    newAlignment,
                    newRotation,
                });
                context.emit("drag", {
                    alignment: newAlignment,
                    rotation: newRotation,
                });
            }
        };
        const handleAlignment = (p1, commit = false) => {
            const [newAlignment] = newStateFromMoveAndRotate(p1.x - p0.x, p1.y - p0.y, previousRotation, true);
            if (commit) {
                this.setState({
                    dragging: false,
                });
                context.emit("end", {
                    alignment: newAlignment,
                    rotation: previousRotation,
                });
            }
            else {
                this.setState({
                    newAlignment,
                });
                context.emit("drag", {
                    alignment: newAlignment,
                    rotation: previousRotation,
                });
            }
        };
        this.hammer.on("panstart", (e) => {
            const cx = e.center.x - e.deltaX;
            const cy = e.center.y - e.deltaY;
            startX = cx;
            startY = cy;
            dXLast = e.deltaX;
            dYLast = e.deltaY;
            sumDeltaX = e.deltaX;
            sumDeltaY = e.deltaY;
            const el = document.elementFromPoint(cx, cy);
            context = new common_1.HandlesDragContext();
            this.props.onDragStart(this.props.handle, context);
            p0 = this.getRelativePoint(cx, cy);
            const p1 = this.getRelativePoint(cx + e.deltaX, cy + e.deltaY);
            previousAlignment = this.props.handle.alignment;
            previousRotation = this.props.handle.rotation;
            if (el == this.rotationCircle) {
                mode = "rotation";
                handleRotation(p1);
            }
            else {
                mode = "alignment";
                handleAlignment(p1);
            }
            this.setState({
                dragging: true,
                newAlignment: previousAlignment,
                newRotation: previousRotation,
            });
        });
        this.hammer.on("pan", (e) => {
            sumDeltaX += e.deltaX - dXLast;
            sumDeltaY += e.deltaY - dYLast;
            dXLast = e.deltaX;
            dYLast = e.deltaY;
            const cx = startX + sumDeltaX;
            const cy = startY + sumDeltaY;
            // cx = e.center.x;
            // cy = e.center.y;
            const p1 = this.getRelativePoint(cx, cy);
            if (mode == "rotation") {
                handleRotation(p1);
            }
            else {
                handleAlignment(p1);
            }
        });
        this.hammer.on("panend", (e) => {
            sumDeltaX += e.deltaX - dXLast;
            sumDeltaY += e.deltaY - dYLast;
            dXLast = e.deltaX;
            dYLast = e.deltaY;
            const cx = startX + sumDeltaX;
            const cy = startY + sumDeltaY;
            // cx = e.center.x;
            // cy = e.center.y;
            const p1 = this.getRelativePoint(cx, cy);
            if (mode == "rotation") {
                handleRotation(p1, true);
            }
            else {
                handleAlignment(p1, true);
            }
            context = null;
        });
    }
    componentWillUnmount() {
        this.hammer.destroy();
    }
    handleClick() {
        if (this.props.handle.text == null) {
            return;
        }
        globals.popupController.popupAt((context) => {
            return (React.createElement(controllers_1.PopupView, { context: context },
                React.createElement("div", { className: "handle-text-view-popup" },
                    React.createElement(components_1.EditableTextView, { text: this.props.handle.text, autofocus: true, onEdit: (newText) => {
                            const dragContext = new common_1.HandlesDragContext();
                            this.props.onDragStart(this.props.handle, dragContext);
                            dragContext.emit("end", { text: newText });
                            context.close();
                        } }))));
        }, {
            anchor: this.container,
        });
    }
    getRectFromAlignment(alignment, rotation) {
        const cos = Math.cos(core_1.Geometry.degreesToRadians(rotation));
        const sin = Math.sin(core_1.Geometry.degreesToRadians(rotation));
        let dx = 0, dy = 0;
        if (alignment.x == "left") {
            dx = this.props.handle.textWidth / 2 + alignment.xMargin;
        }
        if (alignment.x == "right") {
            dx = -this.props.handle.textWidth / 2 - alignment.xMargin;
        }
        const fx = dx - this.props.handle.textWidth / 2 - 10 / this.props.zoom.scale;
        if (alignment.y == "top") {
            dy = -this.props.handle.textHeight / 2 - alignment.yMargin;
        }
        if (alignment.y == "bottom") {
            dy = +this.props.handle.textHeight / 2 + alignment.yMargin;
        }
        return {
            cx: this.props.handle.anchorX + dx * cos - dy * sin,
            cy: this.props.handle.anchorY + dx * sin + dy * cos,
            fx: this.props.handle.anchorX + fx * cos - dy * sin,
            fy: this.props.handle.anchorY + fx * sin + dy * cos,
            width: this.props.handle.textWidth,
            height: this.props.handle.textHeight,
            rotation,
        };
    }
    renderDragging() {
        if (this.state.dragging) {
            const zoom = this.props.zoom;
            const rect = this.getRectFromAlignment(this.state.newAlignment, this.state.newRotation);
            const p = core_1.Geometry.applyZoom(zoom, { x: rect.cx, y: -rect.cy });
            const margin = 0;
            return (React.createElement("g", null,
                React.createElement("rect", { className: "element-shape handle-hint", transform: `translate(${p.x.toFixed(6)},${p.y.toFixed(6)})rotate(${-rect.rotation})`, x: (-rect.width / 2) * zoom.scale - margin, y: (-rect.height / 2) * zoom.scale - margin, width: rect.width * zoom.scale + margin * 2, height: rect.height * zoom.scale + margin * 2 })));
        }
        else {
            return null;
        }
    }
    render() {
        const handle = this.props.handle;
        const zoom = this.props.zoom;
        const margin = 0;
        const rect = this.getRectFromAlignment(handle.alignment, handle.rotation);
        const p = core_1.Geometry.applyZoom(zoom, { x: rect.cx, y: -rect.cy });
        const anchor = core_1.Geometry.applyZoom(zoom, {
            x: handle.anchorX,
            y: -handle.anchorY,
        });
        const fp = core_1.Geometry.applyZoom(zoom, { x: rect.fx, y: -rect.fy });
        return (React.createElement("g", { className: utils_1.classNames("handle", "handle-text-input", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]), onClick: this.handleClick, ref: (e) => (this.container = e) },
            React.createElement("circle", { className: "element-shape handle-ghost", cx: anchor.x, cy: anchor.y, r: 0, ref: (e) => (this.anchorCircle = e) }),
            React.createElement("g", { transform: `translate(${fp.x - 16},${fp.y - 16})` },
                React.createElement("path", { className: "element-solid handle-highlight", d: "M22.05664,15a.99974.99974,0,0,0-1,1,5.05689,5.05689,0,1,1-6.07794-4.95319v2.38654l6.04468-3.49042L14.9787,6.45245V9.02539A7.05306,7.05306,0,1,0,23.05664,16,.99973.99973,0,0,0,22.05664,15Z" })),
            React.createElement("line", { className: "element-line handle-dashed-highlight", x1: anchor.x, y1: anchor.y, x2: p.x, y2: p.y }),
            React.createElement("rect", { className: "element-shape handle-ghost element-text-rect", transform: `translate(${p.x.toFixed(6)},${p.y.toFixed(6)})rotate(${-rect.rotation})`, x: (-rect.width / 2) * zoom.scale - margin, y: (-rect.height / 2) * zoom.scale - margin, width: rect.width * zoom.scale + margin * 2, height: rect.height * zoom.scale + margin * 2 }),
            React.createElement("circle", { className: "element-shape handle-ghost element-rotation", ref: (e) => (this.rotationCircle = e), cx: fp.x, cy: fp.y, r: 8 }),
            this.renderDragging()));
    }
}
exports.TextAlignmentHandleView = TextAlignmentHandleView;
//# sourceMappingURL=text_alignment.js.map
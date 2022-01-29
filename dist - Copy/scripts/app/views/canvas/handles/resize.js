"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const utils_1 = require("../../../utils");
class ResizeHandleView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            dragging: false,
            newX1: this.props.cx - this.props.width / 2,
            newY1: this.props.cy - this.props.height / 2,
            newX2: this.props.cx + this.props.width / 2,
            newY2: this.props.cy + this.props.height / 2,
        };
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.container);
        this.hammer.add(new Hammer.Pan());
        let oldWidth, oldHeight;
        let dXIntegrate, dYIntegrate;
        let dXLast, dYLast;
        let opX, opY;
        const compute = () => {
            let newWidth = oldWidth + dXIntegrate * opX * 2;
            let newHeight = oldHeight + dYIntegrate * opY * 2;
            if (newWidth < 50) {
                newWidth = 50;
            }
            if (newHeight < 50) {
                newHeight = 50;
            }
            return [newWidth, newHeight];
        };
        this.hammer.on("panstart", (e) => {
            let element = document.elementFromPoint(e.center.x - e.deltaX, e.center.y - e.deltaY);
            oldWidth = this.props.width;
            oldHeight = this.props.height;
            dXIntegrate = e.deltaX / this.props.zoom.scale;
            dXLast = e.deltaX;
            dYIntegrate = -e.deltaY / this.props.zoom.scale;
            dYLast = e.deltaY;
            opX = 0;
            opY = 0;
            while (element) {
                if (element == this.refs.lineX1) {
                    opX = -1;
                }
                if (element == this.refs.lineX2) {
                    opX = 1;
                }
                if (element == this.refs.lineY1) {
                    opY = -1;
                }
                if (element == this.refs.lineY2) {
                    opY = 1;
                }
                if (element == this.refs.cornerX1Y1) {
                    opX = -1;
                    opY = -1;
                }
                if (element == this.refs.cornerX1Y2) {
                    opX = -1;
                    opY = 1;
                }
                if (element == this.refs.cornerX2Y1) {
                    opX = 1;
                    opY = -1;
                }
                if (element == this.refs.cornerX2Y2) {
                    opX = 1;
                    opY = 1;
                }
                element = element.parentElement;
            }
            const [nW, nH] = compute();
            this.setState({
                dragging: true,
                newX1: this.props.cx - nW / 2,
                newY1: this.props.cy - nH / 2,
                newX2: this.props.cx + nW / 2,
                newY2: this.props.cy + nH / 2,
            });
        });
        this.hammer.on("pan", (e) => {
            dXIntegrate += (e.deltaX - dXLast) / this.props.zoom.scale;
            dXLast = e.deltaX;
            dYIntegrate += -(e.deltaY - dYLast) / this.props.zoom.scale;
            dYLast = e.deltaY;
            const [nW, nH] = compute();
            this.setState({
                newX1: this.props.cx - nW / 2,
                newY1: this.props.cy - nH / 2,
                newX2: this.props.cx + nW / 2,
                newY2: this.props.cy + nH / 2,
            });
        });
        this.hammer.on("panend", (e) => {
            dXIntegrate += (e.deltaX - dXLast) / this.props.zoom.scale;
            dXLast = e.deltaX;
            dYIntegrate += -(e.deltaY - dYLast) / this.props.zoom.scale;
            dYLast = e.deltaY;
            const [nW, nH] = compute();
            this.setState({
                dragging: false,
            });
            this.props.onResize(nW, nH);
        });
    }
    componentWillUnmount() {
        this.hammer.destroy();
    }
    // eslint-disable-next-line
    render() {
        const fX = (x) => x * this.props.zoom.scale + this.props.zoom.centerX;
        const fY = (y) => -y * this.props.zoom.scale + this.props.zoom.centerY;
        const x1 = this.props.cx - this.props.width / 2;
        const y1 = this.props.cy - this.props.height / 2;
        const x2 = this.props.cx + this.props.width / 2;
        const y2 = this.props.cy + this.props.height / 2;
        return (React.createElement("g", { className: utils_1.classNames("handle", "handle-resize", [
                "active",
                this.state.dragging,
            ]), ref: "container" },
            React.createElement("g", { ref: "lineY1", style: { cursor: "ns-resize" } },
                React.createElement("line", { className: "element-line handle-ghost", x1: fX(x1), y1: fY(y1), x2: fX(x2), y2: fY(y1) }),
                React.createElement("line", { className: "element-line handle-highlight", x1: fX(x1), y1: fY(y1), x2: fX(x2), y2: fY(y1) })),
            React.createElement("g", { ref: "lineY2", style: { cursor: "ns-resize" } },
                React.createElement("line", { className: "element-line handle-ghost", x1: fX(x1), y1: fY(y2), x2: fX(x2), y2: fY(y2) }),
                React.createElement("line", { className: "element-line handle-highlight", x1: fX(x1), y1: fY(y2), x2: fX(x2), y2: fY(y2) })),
            React.createElement("g", { ref: "lineX1", style: { cursor: "ew-resize" } },
                React.createElement("line", { className: "element-line handle-ghost", x1: fX(x1), y1: fY(y1), x2: fX(x1), y2: fY(y2) }),
                React.createElement("line", { className: "element-line handle-highlight", x1: fX(x1), y1: fY(y1), x2: fX(x1), y2: fY(y2) })),
            React.createElement("g", { ref: "lineX2", style: { cursor: "ew-resize" } },
                React.createElement("line", { className: "element-line handle-ghost", x1: fX(x2), y1: fY(y1), x2: fX(x2), y2: fY(y2) }),
                React.createElement("line", { className: "element-line handle-highlight", x1: fX(x2), y1: fY(y1), x2: fX(x2), y2: fY(y2) })),
            React.createElement("circle", { className: "element-shape handle-ghost", style: { cursor: "nesw-resize" }, ref: "cornerX1Y1", cx: fX(x1), cy: fY(y1), r: 5 }),
            React.createElement("circle", { className: "element-shape handle-ghost", style: { cursor: "nwse-resize" }, ref: "cornerX2Y1", cx: fX(x2), cy: fY(y1), r: 5 }),
            React.createElement("circle", { className: "element-shape handle-ghost", style: { cursor: "nwse-resize" }, ref: "cornerX1Y2", cx: fX(x1), cy: fY(y2), r: 5 }),
            React.createElement("circle", { className: "element-shape handle-ghost", style: { cursor: "nesw-resize" }, ref: "cornerX2Y2", cx: fX(x2), cy: fY(y2), r: 5 }),
            this.state.dragging ? (React.createElement("g", null,
                React.createElement("line", { className: "element-line handle-hint", x1: fX(this.state.newX1), y1: fY(this.state.newY1), x2: fX(this.state.newX2), y2: fY(this.state.newY1) }),
                React.createElement("line", { className: "element-line handle-hint", x1: fX(this.state.newX1), y1: fY(this.state.newY2), x2: fX(this.state.newX2), y2: fY(this.state.newY2) }),
                React.createElement("line", { className: "element-line handle-hint", x1: fX(this.state.newX1), y1: fY(this.state.newY1), x2: fX(this.state.newX1), y2: fY(this.state.newY2) }),
                React.createElement("line", { className: "element-line handle-hint", x1: fX(this.state.newX2), y1: fY(this.state.newY1), x2: fX(this.state.newX2), y2: fY(this.state.newY2) }))) : null));
    }
}
exports.ResizeHandleView = ResizeHandleView;
//# sourceMappingURL=resize.js.map
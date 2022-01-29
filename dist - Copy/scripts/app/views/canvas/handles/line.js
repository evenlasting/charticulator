"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineHandleView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const Hammer = require("hammerjs");
const utils_1 = require("../../../utils");
const common_1 = require("./common");
class LineHandleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            newValue: this.props.handle.value,
        };
    }
    componentDidMount() {
        this.hammer = new Hammer(this.refs.line);
        this.hammer.add(new Hammer.Pan({ threshold: 1 }));
        let context = null;
        let oldValue;
        let dXIntegrate = 0;
        let dXLast = 0;
        let dYIntegrate = 0;
        let dYLast = 0;
        this.hammer.on("panstart", () => {
            context = new common_1.HandlesDragContext();
            oldValue = this.props.handle.value;
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
                const newValue = (this.props.handle.axis == "x" ? dXIntegrate : dYIntegrate) +
                    oldValue;
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
                const newValue = (this.props.handle.axis == "x" ? dXIntegrate : dYIntegrate) +
                    oldValue;
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
        switch (handle.axis) {
            case "x": {
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-x", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("g", { ref: "line" },
                        React.createElement("line", { className: "element-line handle-ghost", x1: fX(handle.value), x2: fX(handle.value), y1: fY(handle.span[0]), y2: fY(handle.span[1]) }),
                        React.createElement("line", { className: "element-line handle-highlight", x1: fX(handle.value), x2: fX(handle.value), y1: fY(handle.span[0]), y2: fY(handle.span[1]) })),
                    this.state.dragging ? (React.createElement("g", null,
                        React.createElement("line", { className: `element-line handle-hint`, x1: fX(this.state.newValue), x2: fX(this.state.newValue), y1: fY(handle.span[0]), y2: fY(handle.span[1]) }))) : null));
            }
            case "y": {
                return (React.createElement("g", { className: utils_1.classNames("handle", "handle-line-y", ["active", this.state.dragging], ["visible", handle.visible || this.props.visible]) },
                    React.createElement("g", { ref: "line" },
                        React.createElement("line", { className: "element-line handle-ghost", y1: fY(handle.value), y2: fY(handle.value), x1: fX(handle.span[0]), x2: fX(handle.span[1]) }),
                        React.createElement("line", { className: "element-line handle-highlight", y1: fY(handle.value), y2: fY(handle.value), x1: fX(handle.span[0]), x2: fX(handle.span[1]) })),
                    this.state.dragging ? (React.createElement("g", null,
                        React.createElement("line", { className: `element-line handle-hint`, y1: fY(this.state.newValue), y2: fY(this.state.newValue), x1: fX(handle.span[0]), x2: fX(handle.span[1]) }))) : null));
            }
        }
    }
}
exports.LineHandleView = LineHandleView;
//# sourceMappingURL=line.js.map
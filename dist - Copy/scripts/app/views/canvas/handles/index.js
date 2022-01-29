"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlesView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const input_curve_1 = require("./input_curve");
const text_alignment_1 = require("./text_alignment");
const point_1 = require("./point");
const distance_ratio_1 = require("./distance_ratio");
const angle_1 = require("./angle");
const margin_1 = require("./margin");
const gap_ratio_1 = require("./gap_ratio");
const relative_line_1 = require("./relative_line");
const line_1 = require("./line");
class HandlesView extends React.Component {
    // eslint-disable-next-line
    renderHandle(handle) {
        let isHandleSnapped = false;
        if (this.props.isAttributeSnapped) {
            for (const action of handle.actions) {
                if (action.type == "attribute") {
                    isHandleSnapped =
                        isHandleSnapped || this.props.isAttributeSnapped(action.attribute);
                }
            }
        }
        switch (handle.type) {
            case "point": {
                return (React.createElement(point_1.PointHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, snapped: isHandleSnapped, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "line": {
                return (React.createElement(line_1.LineHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, snapped: isHandleSnapped, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "relative-line": {
                return (React.createElement(relative_line_1.RelativeLineHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "gap-ratio": {
                return (React.createElement(gap_ratio_1.GapRatioHandleView, { zoom: this.props.zoom, active: this.props.active, visible: false, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "margin": {
                return (React.createElement(margin_1.MarginHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "angle": {
                return (React.createElement(angle_1.AngleHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "distance-ratio": {
                return (React.createElement(distance_ratio_1.DistanceRatioHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "text-alignment": {
                return (React.createElement(text_alignment_1.TextAlignmentHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
            case "input-curve": {
                return (React.createElement(input_curve_1.InputCurveHandleView, { zoom: this.props.zoom, active: this.props.active, visible: this.props.visible, onDragStart: this.props.onDragStart, handle: handle }));
            }
        }
    }
    render() {
        return (React.createElement("g", null, this.props.handles.map((b, idx) => (React.createElement("g", { key: `m${idx}` }, this.renderHandle(b))))));
    }
}
exports.HandlesView = HandlesView;
//# sourceMappingURL=index.js.map
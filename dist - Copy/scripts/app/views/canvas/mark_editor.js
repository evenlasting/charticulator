"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleMarkView = exports.MarkEditorView = void 0;
const React = require("react");
const globals = require("../../globals");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const renderer_1 = require("../../renderer");
const stores_1 = require("../../stores");
const utils_1 = require("../../utils");
const controls_1 = require("../panels/widgets/controls");
const bounding_box_1 = require("./bounding_box");
const creating_component_1 = require("./creating_component");
const dropzone_1 = require("./dropzone");
const handles_1 = require("./handles");
const mark_1 = require("./snapping/mark");
const move_1 = require("./snapping/move");
const context_component_1 = require("../../context_component");
const guides_1 = require("../../../core/prototypes/guides");
const strings_1 = require("../../../strings");
const specification_1 = require("../../../core/specification");
const prototypes_1 = require("../../../core/prototypes");
/**
 * Editor view for glyph
 * ![Mark widgets](media://glyph_editor.png)
 */
class MarkEditorView extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.subs = [];
        this.state = {
            currentCreation: null,
            width: 300,
            height: 300,
        };
        this.resize = () => {
            const bbox = this.refContainer.getBoundingClientRect();
            this.setState({
                width: bbox.width,
                height: this.props.height != null ? this.props.height : bbox.height,
            });
        };
    }
    componentDidMount() {
        const chartStore = this.store;
        this.subs.push(chartStore.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => this.forceUpdate()));
        this.subs.push(chartStore.addListener(stores_1.AppStore.EVENT_SELECTION, () => this.forceUpdate()));
        this.subs.push(chartStore.addListener(stores_1.AppStore.EVENT_CURRENT_TOOL, () => {
            this.setState({
                currentCreation: chartStore.currentTool,
                currentCreationOptions: chartStore.currentToolOptions,
            });
        }));
        this.resizeListenerHandle = globals.resizeListeners.addListener(this.refContainer, this.resize);
        this.resize();
    }
    componentWillUnmount() {
        for (const sub of this.subs) {
            sub.remove();
        }
        this.subs = [];
        globals.resizeListeners.removeListener(this.refContainer, this.resizeListenerHandle);
    }
    getGlyphState(glyph) {
        const chartStore = this.store;
        // Find the plot segment's index
        const layoutIndex = core_1.indexOf(chartStore.chart.elements, (e) => core_1.Prototypes.isType(e.classID, "plot-segment") &&
            e.glyph == glyph._id);
        if (layoutIndex == -1) {
            // Cannot find plot segment, return null
            return null;
        }
        else {
            // Find the selected glyph
            const plotSegmentState = chartStore.chartState.elements[layoutIndex];
            const glyphIndex = chartStore.getSelectedGlyphIndex(chartStore.chart.elements[layoutIndex]._id);
            // If found, use the glyph, otherwise fallback to the first glyph
            if (glyphIndex < 0) {
                return plotSegmentState.glyphs[0];
            }
            else {
                return plotSegmentState.glyphs[glyphIndex];
            }
        }
    }
    render() {
        let currentGlyph = this.store.currentGlyph;
        if (currentGlyph == null ||
            this.store.chart.glyphs.indexOf(currentGlyph) < 0) {
            currentGlyph = this.store.chart.glyphs[0];
        }
        return (React.createElement("div", { className: "mark-editor-view", ref: (e) => (this.refContainer = e) },
            currentGlyph ? (React.createElement(SingleMarkView, { ref: (e) => {
                    this.refSingleMarkView = e;
                }, glyph: currentGlyph, glyphState: this.getGlyphState(currentGlyph), parent: this, width: this.state.width, height: this.state.height - 30 })) : (React.createElement("div", { className: "mark-editor-single-view" },
                React.createElement("div", { className: "mark-view-container", style: {
                        width: this.state.width + "px",
                        height: this.state.height - 24 + "px",
                    } },
                    React.createElement("div", { className: "mark-view-container-notice" }, "No glyph to edit")))),
            React.createElement("div", { className: "canvas-controls" },
                React.createElement("div", { className: "canvas-controls-left" },
                    React.createElement("span", { className: "glyph-tabs" }, this.store.chart.glyphs.map((glyph) => (React.createElement("span", { tabIndex: 0, className: utils_1.classNames("el-item", [
                            "is-active",
                            glyph == currentGlyph,
                        ]), key: glyph._id, onClick: () => {
                            this.dispatch(new actions_1.Actions.SelectGlyph(null, glyph));
                        }, onKeyPress: (e) => {
                            if (e.key === "Enter") {
                                this.dispatch(new actions_1.Actions.SelectGlyph(null, glyph));
                            }
                        } }, glyph.properties.name)))),
                    React.createElement(controls_1.Button, { icon: "general/plus", title: strings_1.strings.canvas.newGlyph, onClick: () => {
                            this.dispatch(new actions_1.Actions.AddGlyph("glyph.rectangle"));
                        } })),
                React.createElement("div", { className: "canvas-controls-right" },
                    React.createElement(controls_1.Button, { icon: "ZoomIn", title: strings_1.strings.canvas.zoomIn, onClick: () => {
                            this.refSingleMarkView.doZoom(1.1);
                        } }),
                    React.createElement(controls_1.Button, { icon: "ZoomOut", title: strings_1.strings.canvas.zoomOut, onClick: () => {
                            this.refSingleMarkView.doZoom(1 / 1.1);
                        } }),
                    React.createElement(controls_1.Button, { icon: "ZoomToFit", title: strings_1.strings.canvas.zoomAuto, onClick: () => {
                            this.refSingleMarkView.doZoomAuto();
                        } }),
                    React.createElement(controls_1.Button, { icon: "rect-zoom", title: "Rectangle zoom", onClick: () => {
                            this.dispatch(new actions_1.Actions.SetCurrentTool("rectangle-zoom"));
                        } })))));
    }
    getCurrentCreation() {
        return this.state.currentCreation;
    }
    getCurrentCreationOptions() {
        return this.state.currentCreationOptions;
    }
}
exports.MarkEditorView = MarkEditorView;
class SingleMarkView extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = this.getDefaultState();
        this.tokens = [];
    }
    getDefaultState() {
        return {
            showIndicator: false,
            showIndicatorActive: false,
            dataForDropZones: false,
            selectedElement: null,
            snappingCandidates: null,
            zoom: {
                centerX: this.props.width / 2,
                centerY: this.props.height / 2,
                scale: 1,
            },
        };
    }
    doZoom(factor) {
        const { scale, centerX, centerY } = this.state.zoom;
        const fixPoint = core_1.Geometry.unapplyZoom(this.state.zoom, {
            x: this.props.width / 2,
            y: this.props.height / 2,
        });
        let newScale = scale * factor;
        newScale = Math.min(20, Math.max(0.05, newScale));
        this.setState({
            zoom: {
                centerX: centerX + (scale - newScale) * fixPoint.x,
                centerY: centerY + (scale - newScale) * fixPoint.y,
                scale: newScale,
            },
        });
    }
    doCustomZoom(cx, cy, width, height) {
        const newCX = this.props.width / 2 - cx;
        const newCY = this.props.height / 2 + cy;
        const newScale = this.props.width > this.props.height
            ? this.props.height / height
            : this.props.width / width;
        this.setState({
            zoom: {
                centerX: newCX,
                centerY: newCY,
                scale: 1,
            },
        });
        this.doZoom(newScale);
    }
    doZoomAuto() {
        const newZoom = this.getFitViewZoom(this.props.width, this.props.height);
        if (!newZoom) {
            return;
        }
        this.setState({
            zoom: newZoom,
        });
    }
    // eslint-disable-next-line
    getFitViewZoom(width, height) {
        const glyphState = this.props.glyphState;
        if (!glyphState) {
            return null;
        }
        const manager = this.store.chartManager;
        // First we compute the maximum bounding box for marks in the glyph
        const boundingRects = [];
        // Get bounding box for each element
        for (const markState of glyphState.marks) {
            const cls = manager.getMarkClass(markState);
            const bbox = cls.getBoundingBox();
            if (bbox) {
                let xBounds = [];
                let yBounds = [];
                switch (bbox.type) {
                    case "anchored-rectangle":
                        {
                            const bboxRect = bbox;
                            const cos = Math.cos(core_1.Geometry.degreesToRadians(bboxRect.rotation));
                            const sin = Math.sin(core_1.Geometry.degreesToRadians(bboxRect.rotation));
                            xBounds = [
                                bboxRect.anchorX +
                                    bboxRect.cx +
                                    (bboxRect.width / 2) * cos +
                                    (bboxRect.height / 2) * sin,
                                bboxRect.anchorX +
                                    bboxRect.cx -
                                    (bboxRect.width / 2) * cos +
                                    (bboxRect.height / 2) * sin,
                                bboxRect.anchorX +
                                    bboxRect.cx +
                                    (bboxRect.width / 2) * cos -
                                    (bboxRect.height / 2) * sin,
                                bboxRect.anchorX +
                                    bboxRect.cx -
                                    (bboxRect.width / 2) * cos -
                                    (bboxRect.height / 2) * sin,
                            ];
                            yBounds = [
                                bboxRect.anchorY +
                                    bboxRect.cy +
                                    (bboxRect.width / 2) * -sin +
                                    (bboxRect.height / 2) * cos,
                                bboxRect.anchorY +
                                    bboxRect.cy -
                                    (bboxRect.width / 2) * -sin +
                                    (bboxRect.height / 2) * cos,
                                bboxRect.anchorY +
                                    bboxRect.cy +
                                    (bboxRect.width / 2) * -sin -
                                    (bboxRect.height / 2) * cos,
                                bboxRect.anchorY +
                                    bboxRect.cy -
                                    (bboxRect.width / 2) * -sin -
                                    (bboxRect.height / 2) * cos,
                            ];
                        }
                        break;
                    case "rectangle":
                        {
                            const bboxRect = bbox;
                            xBounds = [
                                bboxRect.cx + bboxRect.width / 2,
                                bboxRect.cx - bboxRect.width / 2,
                            ];
                            yBounds = [
                                bboxRect.cy + bboxRect.height / 2,
                                bboxRect.cy - bboxRect.height / 2,
                            ];
                        }
                        break;
                    case "circle":
                        {
                            const bboxCircle = bbox;
                            xBounds = [
                                bboxCircle.cx - bboxCircle.radius,
                                bboxCircle.cx + bboxCircle.radius,
                            ];
                            yBounds = [
                                bboxCircle.cy - bboxCircle.radius,
                                bboxCircle.cy + bboxCircle.radius,
                            ];
                        }
                        break;
                    case "line": {
                        const bboxLine = bbox;
                        xBounds = [bboxLine.x1, bboxLine.x2];
                        yBounds = [bboxLine.y1, bboxLine.y2];
                    }
                }
                if (xBounds.length > 0) {
                    // y is the same size
                    boundingRects.push([
                        Math.min(...xBounds),
                        Math.max(...xBounds),
                        Math.min(...yBounds),
                        Math.max(...yBounds),
                    ]);
                }
            }
        }
        // If there's no bounding rect found
        if (boundingRects.length == 0) {
            const cx = 0;
            const cy = 0;
            const { x1, x2, y1, y2 } = glyphState.attributes;
            const overshoot = 0.4;
            const scale1 = width / (1 + Math.abs(x2 - x1) * (1 + overshoot));
            const scale2 = height / (1 + Math.abs(y2 - y1) * (1 + overshoot));
            const scale = Math.min(scale1, scale2);
            const zoom = {
                centerX: width / 2 - cx * scale,
                centerY: height / 2 + cy * scale,
                scale,
            };
            return zoom;
        }
        else {
            const x1 = Math.min(...boundingRects.map((b) => b[0]));
            const x2 = Math.max(...boundingRects.map((b) => b[1]));
            const y1 = Math.min(...boundingRects.map((b) => b[2]));
            const y2 = Math.max(...boundingRects.map((b) => b[3]));
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const overshoot = 0.4;
            const scale1 = width / (1 + Math.abs(x2 - x1) * (1 + overshoot));
            const scale2 = height / (1 + Math.abs(y2 - y1) * (1 + overshoot));
            const scale = Math.min(scale1, scale2);
            const zoom = {
                centerX: width / 2 - cx * scale,
                centerY: height / 2 + cy * scale,
                scale,
            };
            return zoom;
        }
    }
    doAutoFit() {
        const newZoom = this.getFitViewZoom(this.props.width, this.props.height);
        if (!newZoom) {
            return;
        }
        this.setState({
            zoom: newZoom,
        });
    }
    scheduleAutoFit() {
        const token = this.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => {
            this.doAutoFit();
            token.remove();
        });
    }
    getRelativePoint(point) {
        const r = this.refs.canvas.getBoundingClientRect();
        return {
            x: point.x - r.left,
            y: point.y - r.top,
        };
    }
    onDragEnter(ctx) {
        this.dispatch(new actions_1.Actions.SetCurrentTool(null));
        const data = ctx.data;
        if (data instanceof actions_1.DragData.ObjectType) {
            if (core_1.Prototypes.isType(data.classID, "mark") ||
                core_1.Prototypes.isType(data.classID, "guide")) {
                this.setState({
                    showIndicatorActive: true,
                });
                ctx.onLeave(() => {
                    this.setState({
                        showIndicatorActive: false,
                    });
                });
                ctx.onDrop((point) => {
                    point = this.getRelativePoint(point);
                    const attributes = {};
                    const opt = JSON.parse(data.options);
                    this.scheduleAutoFit();
                    for (const key in opt) {
                        // eslint-disable-next-line
                        if (opt.hasOwnProperty(key)) {
                            attributes[key] = opt[key];
                        }
                    }
                    this.dispatch(new actions_1.Actions.AddMarkToGlyph(this.props.glyph, data.classID, core_1.Geometry.unapplyZoom(this.state.zoom, point), {}, attributes));
                });
                return true;
            }
        }
        // if (data instanceof DragData.DropZoneData) {
        //     this.setState({
        //         dataForDropZones: data
        //     });
        //     ctx.onLeave(() => {
        //         this.setState({
        //             dataForDropZones: false
        //         });
        //     });
        //     return true;
        // }
        return false;
    }
    // eslint-disable-next-line
    componentDidMount() {
        this.hammer = new Hammer(this.refs.canvasInteraction);
        this.hammer.add(new Hammer.Tap());
        const pan = new Hammer.Pan();
        const pinch = new Hammer.Pinch();
        pinch.recognizeWith(pan);
        this.hammer.add([pinch]);
        this.hammer.on("tap", () => {
            this.dispatch(new actions_1.Actions.SelectGlyph(null, this.props.glyph));
        });
        let cX = null, cY = 0, cScale = 0;
        let dX0, dY0;
        let fixPoint = null;
        let lastDeltaX, lastDeltaY;
        let lastEventScale = 1;
        this.hammer.on("pinchstart panstart", (e) => {
            fixPoint = core_1.Geometry.unapplyZoom(this.state.zoom, this.getRelativePoint({ x: e.center.x, y: e.center.y }));
            cX = this.state.zoom.centerX;
            cY = this.state.zoom.centerY;
            cScale = this.state.zoom.scale;
            dX0 = 0;
            dY0 = 0;
            lastDeltaX = 0;
            lastDeltaY = 0;
            lastEventScale = 1;
        });
        this.hammer.on("pinch pan", (e) => {
            if (e.type == "pan") {
                e.scale = lastEventScale;
            }
            lastEventScale = e.scale;
            let newScale = cScale * e.scale;
            newScale = Math.min(20, Math.max(0.05, newScale));
            this.setState({
                zoom: {
                    centerX: cX + e.deltaX - dX0 + (cScale - newScale) * fixPoint.x,
                    centerY: cY + e.deltaY - dY0 + (cScale - newScale) * fixPoint.y,
                    scale: newScale,
                },
            });
            lastDeltaX = e.deltaX;
            lastDeltaY = e.deltaY;
        });
        this.refs.canvas.onwheel = (e) => {
            const fixPoint = core_1.Geometry.unapplyZoom(this.state.zoom, this.getRelativePoint({ x: e.pageX, y: e.pageY }));
            const { centerX, centerY, scale } = this.state.zoom;
            let delta = -e.deltaY;
            if (e.deltaMode == e.DOM_DELTA_LINE) {
                delta *= 33.3;
            }
            let newScale = scale * Math.exp(delta / 1000);
            newScale = Math.min(20, Math.max(0.05, newScale));
            this.setState({
                zoom: {
                    centerX: centerX + (scale - newScale) * fixPoint.x,
                    centerY: centerY + (scale - newScale) * fixPoint.y,
                    scale: newScale,
                },
            });
            cX = this.state.zoom.centerX;
            cY = this.state.zoom.centerY;
            dX0 = lastDeltaX;
            dY0 = lastDeltaY;
            cScale = this.state.zoom.scale;
            e.stopPropagation();
            e.preventDefault();
        };
        globals.dragController.registerDroppable(this, this.refs.canvas);
        this.tokens.push(globals.dragController.addListener("sessionstart", () => {
            const session = globals.dragController.getSession();
            if (session && session.data instanceof actions_1.DragData.DropZoneData) {
                this.setState({
                    dataForDropZones: session.data,
                });
            }
            if (session && session.data instanceof actions_1.DragData.ObjectType) {
                if (core_1.Prototypes.isType(session.data.classID, "mark") ||
                    core_1.Prototypes.isType(session.data.classID, "guide")) {
                    this.setState({
                        showIndicator: true,
                    });
                }
            }
        }));
        this.tokens.push(globals.dragController.addListener("sessionend", () => {
            this.setState({
                dataForDropZones: false,
                showIndicator: false,
            });
        }));
    }
    componentWillUnmount() {
        this.hammer.destroy();
        globals.dragController.unregisterDroppable(this);
        this.tokens.forEach((token) => token.remove());
        this.tokens = [];
    }
    renderElement(element, elementState) {
        const chartStore = this.store;
        const elementClass = chartStore.chartManager.getMarkClass(elementState);
        const graphics = elementClass.getGraphics(new core_1.Graphics.CartesianCoordinates(), { x: 0, y: 0 }, 0, chartStore.chartManager);
        if (!graphics) {
            return null;
        }
        return renderer_1.renderGraphicalElementSVG(graphics);
    }
    renderDropIndicator() {
        if (!this.state.showIndicator) {
            return null;
        }
        return (React.createElement("rect", { x: 0, y: 0, width: this.props.width, height: this.props.height, className: utils_1.classNames("drop-indicator", [
                "active",
                this.state.showIndicatorActive,
            ]) }));
    }
    getSnappingGuides() {
        let guides;
        const chartStore = this.store;
        const glyphState = this.props.glyphState;
        if (!glyphState) {
            return [];
        }
        guides = chartStore.chartManager
            .getGlyphClass(glyphState)
            .getAlignmentGuides()
            .map((g) => {
            return { element: null, guide: g };
        });
        for (const [element, elementState] of core_1.zip(this.props.glyph.marks, glyphState.marks)) {
            const elementClass = chartStore.chartManager.getMarkClass(elementState);
            guides = guides.concat(elementClass.getSnappingGuides().map((g) => {
                return { element, guide: g };
            }));
        }
        return guides;
    }
    renderHandles() {
        return (React.createElement("g", null, this.renderElementHandles()));
    }
    // eslint-disable-next-line
    renderBoundsGuides() {
        // eslint-disable-next-line
        return this.getSnappingGuides().map((info, idx) => {
            const theGuide = info.guide;
            if (theGuide.visible) {
                if (theGuide.type == "x") {
                    const guide = theGuide;
                    return (React.createElement("line", { className: utils_1.classNames("mark-guide", [
                            "coordinator",
                            info.guide.visualType ===
                                prototypes_1.SnappingGuidesVisualTypes.Coordinator,
                        ], [
                            "single",
                            info.guide.visualType === prototypes_1.SnappingGuidesVisualTypes.Guide,
                        ]), key: `k${idx}`, x1: guide.value * this.state.zoom.scale + this.state.zoom.centerX, x2: guide.value * this.state.zoom.scale + this.state.zoom.centerX, y1: 0, y2: this.props.height }));
                }
                if (theGuide.type == "y") {
                    const guide = theGuide;
                    return (React.createElement("line", { className: utils_1.classNames("mark-guide", [
                            "coordinator",
                            info.guide.visualType ===
                                prototypes_1.SnappingGuidesVisualTypes.Coordinator,
                        ], [
                            "single",
                            info.guide.visualType === prototypes_1.SnappingGuidesVisualTypes.Guide,
                        ]), key: `k${idx}`, x1: 0, x2: this.props.width, y1: -guide.value * this.state.zoom.scale + this.state.zoom.centerY, y2: -guide.value * this.state.zoom.scale + this.state.zoom.centerY }));
                }
                if (theGuide.type == "point") {
                    const axisGuide = theGuide;
                    return (React.createElement(React.Fragment, null,
                        React.createElement("circle", { className: "mark-guide", key: `ck${idx}`, cx: axisGuide.angle * this.state.zoom.scale +
                                this.state.zoom.centerX, cy: -axisGuide.radius * this.state.zoom.scale +
                                this.state.zoom.centerY, r: Math.abs(3 * this.state.zoom.scale) }),
                        React.createElement("circle", { className: "mark-guide", key: `ck${idx}display`, cx: axisGuide.cx * this.state.zoom.scale + this.state.zoom.centerX, cy: -axisGuide.cy * this.state.zoom.scale +
                                this.state.zoom.centerY, r: Math.abs(axisGuide.visibleRadius * this.state.zoom.scale) }),
                        React.createElement("line", { key: `lk${idx}display`, className: "mark-guide", x1: axisGuide.cx * this.state.zoom.scale + this.state.zoom.centerX, y1: -axisGuide.cy * this.state.zoom.scale +
                                this.state.zoom.centerY, x2: axisGuide.angle * this.state.zoom.scale +
                                this.state.zoom.centerX, y2: -axisGuide.radius * this.state.zoom.scale +
                                this.state.zoom.centerY })));
                }
            }
        });
    }
    renderMarkHandles() {
        const chartStore = this.store;
        const glyphState = this.props.glyphState;
        const markClass = chartStore.chartManager.getGlyphClass(glyphState);
        const handles = markClass.getHandles();
        return handles.map((handle, index) => {
            return (React.createElement(handles_1.HandlesView, { key: `m${index}`, handles: handles, zoom: this.state.zoom, active: false, onDragStart: (bound, ctx) => {
                    const session = new move_1.MoveSnappingSession(bound);
                    ctx.onDrag((e) => {
                        session.handleDrag(e);
                    });
                    ctx.onEnd((e) => {
                        const updates = session.getUpdates(session.handleEnd(e));
                        if (updates) {
                            this.dispatch(new actions_1.Actions.UpdateGlyphAttribute(this.props.glyph, updates));
                        }
                    });
                } }));
        });
    }
    renderAnchorHandles() {
        return core_1.zipArray(this.props.glyph.marks, this.props.glyphState.marks)
            .filter((x) => x[0].classID == "mark.anchor")
            .map(([element, elementState]) => {
            const elementClass = this.store.chartManager.getMarkClass(elementState);
            const bounds = elementClass.getHandles();
            return (React.createElement(handles_1.HandlesView, { key: `m${element._id}`, handles: bounds, zoom: this.state.zoom, active: this.state.selectedElement == element, onDragStart: (bound, ctx) => {
                    const guides = this.getSnappingGuides();
                    const session = new mark_1.MarkSnappingSession(guides, this.props.glyph, element, elementState, bound, 10 / this.state.zoom.scale, bound.options && bound.options.snapToClosestPoint);
                    ctx.onDrag((e) => {
                        session.handleDrag(e);
                        this.setState({
                            snappingCandidates: session.getCurrentCandidates(),
                        });
                    });
                    ctx.onEnd((e) => {
                        this.setState({
                            snappingCandidates: null,
                        });
                        const action = session.getActions(session.handleEnd(e));
                        if (action) {
                            this.dispatch(action);
                        }
                    });
                } }));
        });
    }
    // eslint-disable-next-line
    renderElementHandles() {
        return (core_1.zipArray(this.props.glyph.marks, this.props.glyphState.marks)
            .filter((x) => x[0].classID != "mark.anchor")
            .sort((a, b) => {
            const aSelected = this.store.currentSelection instanceof stores_1.MarkSelection &&
                this.store.currentSelection.mark == a[0];
            const bSelected = this.store.currentSelection instanceof stores_1.MarkSelection &&
                this.store.currentSelection.mark == b[0];
            if (aSelected) {
                return +1;
            }
            if (bSelected) {
                return -1;
            }
            return (this.props.glyph.marks.indexOf(a[0]) -
                this.props.glyph.marks.indexOf(b[0]));
        })
            // eslint-disable-next-line
            .map(([element, elementState]) => {
            const elementClass = this.store.chartManager.getMarkClass(elementState);
            const shouldRenderHandles = this.store.currentSelection instanceof stores_1.MarkSelection &&
                this.store.currentSelection.mark == element;
            if (!shouldRenderHandles) {
                const bbox = elementClass.getBoundingBox();
                if (bbox) {
                    return (React.createElement(bounding_box_1.BoundingBoxView, { key: `m${element._id}`, zoom: this.state.zoom, boundingBox: bbox, onClick: () => {
                            this.dispatch(new actions_1.Actions.SelectMark(null, this.props.glyph, element));
                        } }));
                }
            }
            const handles = elementClass.getHandles();
            const bbox = elementClass.getBoundingBox();
            return (React.createElement("g", { key: `m${element._id}` },
                bbox ? (React.createElement(bounding_box_1.BoundingBoxView, { zoom: this.state.zoom, boundingBox: bbox, active: true })) : null,
                React.createElement(handles_1.HandlesView, { handles: handles, zoom: this.state.zoom, active: false, visible: shouldRenderHandles, isAttributeSnapped: (attribute) => {
                        if (element.mappings[attribute] != null) {
                            return true;
                        }
                        for (const constraint of this.props.glyph.constraints) {
                            if (constraint.type == "snap") {
                                if (constraint.attributes.element == element._id &&
                                    constraint.attributes.attribute == attribute) {
                                    return true;
                                }
                                if (constraint.attributes.targetElement == element._id &&
                                    constraint.attributes.targetAttribute == attribute) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }, onDragStart: (handle, ctx) => {
                        const guides = this.getSnappingGuides();
                        const session = new mark_1.MarkSnappingSession(guides, this.props.glyph, element, elementState, handle, 10 / this.state.zoom.scale, handle.options && handle.options.snapToClosestPoint);
                        ctx.onDrag((e) => {
                            session.handleDrag(e);
                            this.setState({
                                snappingCandidates: session.getCurrentCandidates(),
                            });
                        });
                        ctx.onEnd((e) => {
                            this.setState({
                                snappingCandidates: null,
                            });
                            // if (handle.type == "text-input") {
                            //     let textInput = handle as Prototypes.Handles.TextInput;
                            //     ctx.onEnd(e => {
                            //         let updates: { [name: string]: Specification.Mapping }
                            //         new Actions.SetMarkAttribute(this.props.store.mark, element, textInput.attribute, { type: "value", value: e.newValue } as Specification.ValueMapping).dispatch(this.props.store.dispatcher);
                            //     })
                            // } else if (handle.type == "text-alignment") {
                            //     let textAlignment = handle as Prototypes.Handles.TextAlignment;
                            //     ctx.onEnd(e => {
                            //         new Actions.SetObjectProperty(element, textAlignment.propertyAlignment, null, e.newAlignment).dispatch(this.props.store.dispatcher);
                            //         new Actions.SetObjectProperty(element, textAlignment.propertyRotation, null, e.newRotation).dispatch(this.props.store.dispatcher);
                            //     })
                            // } else {
                            const action = session.getActions(session.handleEnd(e));
                            if (action) {
                                this.dispatch(action);
                            }
                            // }
                        });
                    } })));
            // } else {
            //     let bbox = elementClass.getBoundingBox();
            //     if (bbox) {
            //         return (
            //             <BoundingBoxView
            //                 key={`m${element._id}`}
            //                 zoom={this.state.zoom}
            //                 boundingBox={bbox}
            //                 onClick={() => {
            //                     new Actions.SelectElement(this.props.store.mark, element).dispatch(this.props.store.dispatcher);
            //                 }}
            //             />
            //         );
            //     } else {
            //         let handles = elementClass.getHandles();
            //         return (
            //             <HandlesView
            //                 key={`m${element._id}`}
            //                 handles={handles}
            //                 zoom={this.state.zoom}
            //                 active={true}
            //                 visible={false}
            //                 onDragStart={(handle, ctx) => {
            //                     let guides = this.getSnappingGuides();
            //                     let session = new MarkSnappingSession(guides, this.props.store.mark, element, elementState, handle, 10 / this.state.zoom.scale);
            //                     ctx.onDrag((e) => {
            //                         session.handleDrag(e);
            //                         this.setState({
            //                             snappingCandidates: session.getCurrentCandidates()
            //                         });
            //                     });
            //                     ctx.onEnd((e) => {
            //                         this.setState({
            //                             snappingCandidates: null
            //                         });
            //                         let action = session.getActions(session.handleEnd(e));
            //                         if (action) {
            //                             action.dispatch(this.props.store.dispatcher);
            //                         }
            //                     });
            //                 }}
            //             />
            //         );
            //     }
            // }
        }));
    }
    renderDropZoneForElement(data, element, state) {
        const cls = this.store.chartManager.getMarkClass(state);
        return cls
            .getDropZones()
            .map((zone, idx) => {
            if (zone.accept) {
                if (zone.accept.table) {
                    if (data.table.name != zone.accept.table) {
                        return null;
                    }
                }
                if (zone.accept.kind) {
                    if (data.metadata.kind != zone.accept.kind) {
                        return null;
                    }
                }
            }
            return (React.createElement(dropzone_1.DropZoneView, { key: `m${idx}`, onDragEnter: (data) => {
                    if (data instanceof actions_1.DragData.DataExpression) {
                        if (zone.accept) {
                            if (zone.accept.table) {
                                if (data.table.name != zone.accept.table) {
                                    return null;
                                }
                            }
                            if (zone.accept.kind) {
                                if (data.metadata.kind != zone.accept.kind) {
                                    return null;
                                }
                            }
                        }
                        if (zone.dropAction.scaleInference) {
                            return (point, modifiers) => {
                                if (!zone.dropAction.scaleInference.hints) {
                                    zone.dropAction.scaleInference.hints = {};
                                }
                                zone.dropAction.scaleInference.hints.newScale =
                                    modifiers.shiftKey;
                                this.dispatch(new actions_1.Actions.MapDataToMarkAttribute(this.props.glyph, element, zone.dropAction.scaleInference.attribute, zone.dropAction.scaleInference.attributeType, data.expression, data.valueType, data.metadata, zone.dropAction.scaleInference.hints, data.table.name));
                                return true;
                            };
                        }
                        if (zone.dropAction.axisInference) {
                            return () => {
                                this.dispatch(new actions_1.Actions.BindDataToAxis(element, zone.dropAction.axisInference.property, zone.dropAction.axisInference.appendToProperty, data, false));
                                return true;
                            };
                        }
                    }
                }, zone: zone, zoom: this.state.zoom }));
        });
    }
    renderSnappingGuidesLabels() {
        const allLabels = [];
        // eslint-disable-next-line
        for (const [element, elementState] of core_1.zip(this.props.glyph.marks, this.props.glyphState.marks)) {
            const elementClass = this.store.chartManager.getMarkClass(elementState);
            const guides = elementClass.getSnappingGuides();
            for (const item of guides) {
                if (item.type == "label" || item.type == "point") {
                    allLabels.push(item);
                }
            }
        }
        if (allLabels.length == 0) {
            return null;
        }
        return (React.createElement("g", null, allLabels.map((guide, i) => {
            switch (guide.type) {
                case "point": {
                    const axisGuide = guide;
                    return (React.createElement(React.Fragment, null,
                        React.createElement("circle", { className: "snapping-guide", key: `k${i}`, cx: axisGuide.angle * this.state.zoom.scale +
                                this.state.zoom.centerX, cy: -axisGuide.radius * this.state.zoom.scale +
                                this.state.zoom.centerY, r: Math.abs(5 * this.state.zoom.scale) })));
                }
                case "label": {
                    const label = guide;
                    const x = label.x * this.state.zoom.scale + this.state.zoom.centerX;
                    const y = -label.y * this.state.zoom.scale + this.state.zoom.centerY;
                    return (React.createElement("g", { transform: `translate(${x},${y})`, className: "snapping-guide-label", key: i },
                        React.createElement("circle", { cx: 0, cy: 0, r: 2 }),
                        React.createElement("text", { x: 5, y: 5, transform: `rotate(45)` }, label.text)));
                }
            }
        })));
    }
    renderSnappingGuides() {
        const guides = this.state.snappingCandidates;
        if (!guides || guides.length == 0) {
            return null;
        }
        return guides.map((guide, idx) => {
            const key = `m${idx}`;
            switch (guide.guide.type) {
                case "x": {
                    const axisGuide = guide.guide;
                    return (React.createElement("line", { key: key, className: "snapping-guide", x1: axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerX, x2: axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerX, y1: 0, y2: this.props.height }));
                }
                case "y": {
                    const axisGuide = guide.guide;
                    return (React.createElement("line", { key: key, className: "snapping-guide", y1: -axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerY, y2: -axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerY, x1: 0, x2: this.props.width }));
                }
            }
        });
    }
    renderMarkGuides() {
        const markClass = this.store.chartManager.getGlyphClass(this.props.glyphState);
        const markGuides = markClass.getAlignmentGuides();
        return markGuides.map((theGuide, idx) => {
            if (theGuide.type == "x") {
                const guide = theGuide;
                return (React.createElement("line", { className: "mark-guide", key: `k${idx}`, x1: guide.value * this.state.zoom.scale + this.state.zoom.centerX, x2: guide.value * this.state.zoom.scale + this.state.zoom.centerX, y1: 0, y2: this.props.height }));
            }
            if (theGuide.type == "y") {
                const guide = theGuide;
                return (React.createElement("line", { className: "mark-guide", key: `k${idx}`, y1: -guide.value * this.state.zoom.scale + this.state.zoom.centerY, y2: -guide.value * this.state.zoom.scale + this.state.zoom.centerY, x1: 0, x2: this.props.width }));
            }
        });
    }
    renderAnchor() {
        const { glyph, glyphState } = this.props;
        const anchorIndex = core_1.indexOf(glyph.marks, (x) => x.classID == "mark.anchor");
        let pt = {
            x: glyphState.marks[anchorIndex].attributes.x,
            y: -glyphState.marks[anchorIndex].attributes.y,
        };
        pt = core_1.Geometry.applyZoom(this.state.zoom, pt);
        return (React.createElement("path", { d: `M${pt.x - 5},${pt.y}L${pt.x},${pt.y - 5}L${pt.x + 5},${pt.y}L${pt.x},${pt.y + 5}Z`, className: "mark-anchor" }));
    }
    // eslint-disable-next-line
    renderCreatingComponent() {
        const currentCreation = this.props.parent.getCurrentCreation();
        const currentCreationOptions = this.props.parent.getCurrentCreationOptions();
        if (currentCreation == null) {
            return null;
        }
        const metadata = core_1.Prototypes.ObjectClasses.GetMetadata(currentCreation);
        if (metadata && metadata.creatingInteraction) {
            const classID = currentCreation;
            return (React.createElement(creating_component_1.CreatingComponentFromCreatingInteraction, { width: this.props.width, height: this.props.height, zoom: this.state.zoom, guides: this.getSnappingGuides(), description: metadata.creatingInteraction, onCreate: (mappings, attributes) => {
                    this.dispatch(new actions_1.Actions.SetCurrentTool(null));
                    const opt = JSON.parse(currentCreationOptions);
                    for (const key in opt) {
                        // eslint-disable-next-line
                        if (opt.hasOwnProperty(key)) {
                            attributes[key] = opt[key];
                        }
                    }
                    this.dispatch(new actions_1.Actions.AddMarkToGlyph(this.props.glyph, classID, { x: 0, y: 0 }, mappings, attributes));
                }, onCancel: () => {
                    this.dispatch(new actions_1.Actions.SetCurrentTool(null));
                } }));
        }
        else {
            let onCreate = null;
            let mode = "point";
            const addGuide = (arg, axis, outerAttr, lowAttr, highAttr, baselineLow, baselineMid, baselineHigh) => {
                const pos = arg[0];
                const outer = +this.props.glyphState.attributes[outerAttr];
                const low = +this.props.glyphState.attributes[lowAttr];
                const high = +this.props.glyphState.attributes[highAttr];
                const quarter = outer / 4;
                let rel;
                let baseline;
                if (pos < low + quarter) {
                    // relative to low
                    baseline = baselineLow;
                    rel = pos - low;
                }
                else if (pos < quarter) {
                    // relative to mid
                    baseline = baselineMid;
                    rel = pos;
                }
                else {
                    // relative to high
                    baseline = baselineHigh;
                    rel = pos - high;
                }
                const value = [rel, arg[1]];
                const guideProperties = {
                    axis,
                    baseline,
                };
                this.dispatch(new actions_1.Actions.AddMarkToGlyph(this.props.glyph, "guide.guide", { x: 0, y: 0 }, {
                    value: [
                        value[0],
                        {
                            type: specification_1.MappingType.value,
                            value: value[0],
                        },
                    ],
                }, guideProperties));
            };
            switch (currentCreation) {
                case "guide-x":
                    {
                        mode = "vline";
                        onCreate = (x) => addGuide(x, "x", "width", "ix1", "ix2", "left", "center", "right");
                    }
                    break;
                case "guide-y":
                    {
                        mode = "hline";
                        onCreate = (y) => addGuide(y, "y", "height", "iy1", "iy2", "bottom", "middle", "top");
                    }
                    break;
                case "guide-coordinator-x":
                    {
                        mode = "line";
                        onCreate = (x1, y1, x2, y2) => {
                            this.dispatch(new actions_1.Actions.AddMarkToGlyph(this.props.glyph, "guide.guide-coordinator", { x: 0, y: 0 }, { x1, y1, x2, y2 }, {
                                axis: "x",
                                count: guides_1.GuideCoordinatorClass.defaultAttributes.count,
                            }));
                        };
                    }
                    break;
                case "guide-coordinator-y":
                    {
                        mode = "line";
                        onCreate = (x1, y1, x2, y2) => {
                            this.dispatch(new actions_1.Actions.AddMarkToGlyph(this.props.glyph, "guide.guide-coordinator", { x: 0, y: 0 }, { x1, y1, x2, y2 }, {
                                axis: "y",
                                count: guides_1.GuideCoordinatorClass.defaultAttributes.count,
                            }));
                        };
                    }
                    break;
                // Uncomment to allow polar guide coordinates in mark/glyph editor
                // case "guide-coordinator-polar":
                //   {
                //     mode = "rectangle";
                //     onCreate = (x1, y1, x2, y2) => {
                //       this.dispatch(
                //         new Actions.AddMarkToGlyph(
                //           this.props.glyph,
                //           "guide.guide-coordinator-polar",
                //           { x: 0, y: 0 },
                //           { x1, y1, x2, y2 },
                //           {
                //             axis: "xy",
                //             angularGuidesCount: 4,
                //             radialGuidesCount: 2,
                //             startAngle: 45,
                //             endAngle: 405,
                //             innerRatio: 0.0,
                //             outerRatio: 1,
                //           }
                //         )
                //       );
                //     };
                //   }
                //   break;
                case "rectangle-zoom":
                    {
                        mode = "rectangle";
                        onCreate = (x1, y1, x2, y2) => {
                            const width = Math.abs(x2[0] - x1[0]);
                            const height = Math.abs(y2[0] - y1[0]);
                            const centerX = Math.min(x2[0], x1[0]) + width / 2;
                            const centerY = Math.min(y2[0], y1[0]) + height / 2;
                            this.doCustomZoom(centerX, centerY, width, height);
                        };
                    }
                    break;
            }
            return (React.createElement(creating_component_1.CreatingComponent, { width: this.props.width, height: this.props.height, zoom: this.state.zoom, mode: mode, key: mode, guides: this.getSnappingGuides(), onCreate: (...args) => {
                    this.dispatch(new actions_1.Actions.SetCurrentTool(null));
                    if (onCreate) {
                        onCreate(...args);
                    }
                }, onCancel: () => {
                    this.dispatch(new actions_1.Actions.SetCurrentTool(null));
                } }));
        }
    }
    render() {
        const { glyph, glyphState } = this.props;
        const transform = `translate(${this.state.zoom.centerX},${this.state.zoom.centerY}) scale(${this.state.zoom.scale})`;
        if (!glyphState) {
            return (React.createElement("div", { className: "mark-editor-single-view" },
                React.createElement("div", { className: "mark-view-container" },
                    React.createElement("svg", { className: "canvas-view canvas-view-mark", ref: "canvas", x: 0, y: 0, width: this.props.width - 4, height: this.props.height },
                        React.createElement("rect", { ref: "canvasInteraction", className: "interaction-handler", x: 0, y: 0, width: this.props.width, height: this.props.height })),
                    React.createElement("div", { className: "mark-view-container-notice" }, strings_1.strings.canvas.markContainer))));
        }
        return (React.createElement("div", { className: "mark-editor-single-view" },
            React.createElement("div", { className: "mark-view-container", style: {
                    width: this.props.width,
                    height: this.props.height,
                } },
                React.createElement("svg", { className: "canvas-view canvas-view-mark", ref: "canvas", x: 0, y: 0, width: this.props.width - 4, height: this.props.height },
                    React.createElement("rect", { ref: "canvasInteraction", className: "interaction-handler", x: 0, y: 0, width: this.props.width, height: this.props.height }),
                    this.renderBoundsGuides(),
                    React.createElement("g", { ref: "zoomable", transform: transform, className: "graphics" }, core_1.zipArray(glyph.marks, glyphState.marks).map(([elements, elementState]) => {
                        return (React.createElement("g", { key: `m${elements._id}` }, this.renderElement(elements, elementState)));
                    })),
                    this.renderSnappingGuides(),
                    this.renderSnappingGuidesLabels(),
                    React.createElement("g", null, !this.state.dataForDropZones ? this.renderHandles() : null),
                    React.createElement("g", null, this.state.dataForDropZones
                        ? core_1.zipArray(glyph.marks, glyphState.marks).map(([elements, elementState]) => {
                            return (React.createElement("g", { key: `m${elements._id}` }, this.renderDropZoneForElement(this.state.dataForDropZones, elements, elementState)));
                        })
                        : null),
                    React.createElement("g", null, this.renderDropIndicator()),
                    this.renderCreatingComponent()))));
    }
}
exports.SingleMarkView = SingleMarkView;
//# sourceMappingURL=mark_editor.js.map
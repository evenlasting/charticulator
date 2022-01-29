"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartEditorView = void 0;
const React = require("react");
const R = require("../../resources");
const globals = require("../../globals");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const renderer_1 = require("../../renderer");
const stores_1 = require("../../stores");
const controls_1 = require("../panels/widgets/controls");
const bounding_box_1 = require("./bounding_box");
const creating_component_1 = require("./creating_component");
const dropzone_1 = require("./dropzone");
const editing_link_1 = require("./editing_link");
const handles_1 = require("./handles");
const resize_1 = require("./handles/resize");
const chart_1 = require("./snapping/chart");
const move_1 = require("./snapping/move");
const guides_1 = require("../../../core/prototypes/guides");
const strings_1 = require("../../../strings");
const specification_1 = require("../../../core/specification");
const prototypes_1 = require("../../../core/prototypes");
const utils_1 = require("../../utils");
const fluentui_manager_1 = require("../panels/widgets/fluentui_manager");
const react_1 = require("@fluentui/react");
const text_editor_1 = require("./text_editor");
/**
 * Editor view for chart
 * ![Mark widgets](media://chart_editor.png)
 */
class ChartEditorView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zoom: {
                centerX: 50,
                centerY: 50,
                scale: 1,
            },
            snappingCandidates: null,
            graphics: this.getGraphics(),
            currentCreation: null,
            currentSelection: this.props.store.currentSelection,
            dropZoneData: false,
            viewWidth: 100,
            viewHeight: 100,
            isSolving: false,
            canvasToolbar: true,
        };
        this.tokens = [];
    }
    getRelativePoint(point) {
        const r = this.refs.canvas.getBoundingClientRect();
        return {
            x: point.x - r.left,
            y: point.y - r.top,
        };
    }
    getFitViewZoom(width, height) {
        const chartState = this.props.store.chartState;
        const x1 = chartState.attributes.x1;
        const y1 = chartState.attributes.y1;
        const x2 = chartState.attributes.x2;
        const y2 = chartState.attributes.y2;
        const overshoot = 0.4;
        const scale1 = width / (Math.abs(x2 - x1) * (1 + overshoot));
        const scale2 = height / (Math.abs(y2 - y1) * (1 + overshoot));
        const zoom = {
            centerX: width / 2,
            centerY: height / 2,
            scale: Math.min(scale1, scale2),
        };
        return zoom;
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
            new actions_1.Actions.ClearSelection().dispatch(this.props.store.dispatcher);
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
        this.tokens.push(this.props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, this.updateGraphics.bind(this)));
        this.tokens.push(this.props.store.addListener(stores_1.AppStore.EVENT_SELECTION, this.updateSelection.bind(this)));
        this.tokens.push(this.props.store.addListener(stores_1.AppStore.EVENT_CURRENT_TOOL, () => {
            this.setState({
                currentCreation: this.props.store.currentTool,
                currentCreationOptions: this.props.store.currentToolOptions,
            });
        }));
        // We display the working icon after 200ms.
        let newStateTimer = null;
        this.tokens.push(this.props.store.addListener(stores_1.AppStore.EVENT_SOLVER_STATUS, () => {
            const newState = this.props.store.solverStatus.solving;
            if (newState) {
                if (!newStateTimer) {
                    newStateTimer = setTimeout(() => {
                        this.setState({ isSolving: true });
                    }, 500);
                }
            }
            else {
                if (newStateTimer) {
                    clearTimeout(newStateTimer);
                    newStateTimer = null;
                }
                this.setState({ isSolving: false });
            }
        }));
        const doResize = () => {
            if (!this.refs.canvasContainer) {
                return;
            }
            const rect = this.refs.canvasContainer.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            this.setState({
                viewWidth: width,
                viewHeight: height,
                zoom: this.getFitViewZoom(width, height),
            });
        };
        globals.resizeListeners.addListener(this.refs.canvasContainer, doResize);
        doResize();
        this.tokens.push(globals.dragController.addListener("sessionstart", () => {
            const session = globals.dragController.getSession();
            if (session && session.data instanceof actions_1.DragData.DropZoneData) {
                this.setState({
                    dropZoneData: { data: session.data },
                });
            }
        }));
        this.tokens.push(globals.dragController.addListener("sessionend", () => {
            this.setState({
                dropZoneData: false,
            });
        }));
    }
    componentWillUnmount() {
        this.hammer.destroy();
        this.tokens.forEach((t) => t.remove());
        globals.dragController.unregisterDroppable(this);
    }
    onDragEnter(ctx) {
        new actions_1.Actions.SetCurrentTool(null).dispatch(this.props.store.dispatcher);
        const data = ctx.data;
        if (data instanceof actions_1.DragData.ScaffoldType) {
            this.setState({
                dropZoneData: { layout: data },
            });
            ctx.onLeave(() => {
                this.setState({
                    dropZoneData: false,
                });
            });
            return true;
        }
        return false;
    }
    getGraphics() {
        const renderer = new core_1.Graphics.ChartRenderer(this.props.store.chartManager, this.props.store.renderEvents);
        return renderer.render();
    }
    updateSelection() {
        this.setState({ currentSelection: this.props.store.currentSelection });
        this.setState({
            canvasToolbar: true,
        });
    }
    updateGraphics() {
        this.setState({ graphics: this.getGraphics() });
    }
    renderGraphics() {
        const renderer = new core_1.Graphics.ChartRenderer(this.props.store.chartManager, this.props.store.renderEvents);
        return (React.createElement(React.Fragment, null,
            React.createElement(renderer_1.GraphicalElementDisplay, { element: this.state.graphics }),
            React.createElement("g", { className: "canvas-chart-controls" }, renderer.renderControls(this.props.store.chart, this.props.store.chartState, this.state.zoom))));
    }
    renderEditingLink() {
        const store = this.props.store;
        if (store.currentSelection instanceof stores_1.ChartElementSelection) {
            const element = store.currentSelection.chartElement;
            if (core_1.Prototypes.isType(element.classID, "links")) {
                return (React.createElement(editing_link_1.EditingLink, { width: this.state.viewWidth, height: this.state.viewHeight, zoom: this.state.zoom, store: store, link: element }));
            }
        }
        return null;
    }
    // eslint-disable-next-line
    renderCreatingComponent() {
        if (this.state.currentCreation == null) {
            return null;
        }
        const metadata = core_1.Prototypes.ObjectClasses.GetMetadata(this.state.currentCreation);
        if (metadata && metadata.creatingInteraction) {
            const classID = this.state.currentCreation;
            const options = this.state.currentCreationOptions;
            return (React.createElement(creating_component_1.CreatingComponentFromCreatingInteraction, { width: this.state.viewWidth, height: this.state.viewHeight, zoom: this.state.zoom, guides: this.getSnappingGuides(), description: metadata.creatingInteraction, onCreate: (mappings, attributes) => {
                    new actions_1.Actions.SetCurrentTool(null).dispatch(this.props.store.dispatcher);
                    const opt = JSON.parse(options);
                    for (const key in opt) {
                        // eslint-disable-next-line
                        if (opt.hasOwnProperty(key)) {
                            attributes[key] = opt[key];
                        }
                    }
                    new actions_1.Actions.AddChartElement(classID, mappings, attributes).dispatch(this.props.store.dispatcher);
                }, onCancel: () => {
                    new actions_1.Actions.SetCurrentTool(null).dispatch(this.props.store.dispatcher);
                } }));
        }
        else {
            let onCreate = null;
            let mode = "point";
            const addGuide = (arg, axis, outerAttr, lowMarginAttr, highMarginAttr, baselineLow, baselineMid, baselineHigh) => {
                const outer = +this.props.store.chartState.attributes[outerAttr];
                const lowMargin = +this.props.store.chartState.attributes[lowMarginAttr];
                const highMargin = +this.props.store.chartState.attributes[highMarginAttr];
                const fromCenter = arg[0];
                const abs = outer / 2 + fromCenter;
                const inner = outer - lowMargin - highMargin;
                const half = inner / 2;
                const quarter = half / 2;
                const lowAbs = lowMargin;
                const halfAbs = lowMargin + half;
                const highAbs = outer - highMargin;
                let rel;
                let baseline;
                if (abs < lowAbs + quarter) {
                    // relative to low
                    baseline = baselineLow;
                    rel = abs - lowAbs;
                }
                else if (abs < halfAbs + quarter) {
                    // relative to mid
                    baseline = baselineMid;
                    rel = abs - halfAbs;
                }
                else {
                    // relative to high
                    baseline = baselineHigh;
                    rel = abs - highAbs;
                }
                const value = [rel, arg[1]];
                const guideProperties = {
                    axis,
                    baseline,
                };
                new actions_1.Actions.AddChartElement("guide.guide", {
                    value: [
                        value[0],
                        {
                            type: specification_1.MappingType.value,
                            value: value[0],
                        },
                    ],
                }, guideProperties).dispatch(this.props.store.dispatcher);
            };
            switch (this.state.currentCreation) {
                case "guide-x":
                    {
                        mode = "vline";
                        onCreate = (x) => addGuide(x, "x", "width", "marginLeft", "marginRight", "left", "center", "right");
                    }
                    break;
                case "guide-y":
                    {
                        mode = "hline";
                        onCreate = (y) => addGuide(y, "y", "height", "marginBottom", "marginTop", "bottom", "middle", "top");
                    }
                    break;
                case "guide-coordinator-x":
                    {
                        mode = "line";
                        onCreate = (x1, y1, x2, y2) => {
                            new actions_1.Actions.AddChartElement("guide.guide-coordinator", { x1, y1, x2, y2 }, {
                                axis: "x",
                                count: guides_1.GuideCoordinatorClass.defaultAttributes.count,
                            }).dispatch(this.props.store.dispatcher);
                        };
                    }
                    break;
                case "guide-coordinator-y":
                    {
                        mode = "line";
                        onCreate = (x1, y1, x2, y2) => {
                            new actions_1.Actions.AddChartElement("guide.guide-coordinator", { x1, y1, x2, y2 }, {
                                axis: "y",
                                count: guides_1.GuideCoordinatorClass.defaultAttributes.count,
                            }).dispatch(this.props.store.dispatcher);
                        };
                    }
                    break;
                case "guide-coordinator-polar":
                    {
                        mode = "rectangle";
                        onCreate = (x1, y1, x2, y2) => {
                            new actions_1.Actions.AddChartElement("guide.guide-coordinator-polar", { x1, y1, x2, y2 }, {
                                axis: "xy",
                                angularGuidesCount: 4,
                                radialGuidesCount: 1,
                                startAngle: 0,
                                endAngle: 360,
                                innerRatio: 0.0,
                                outerRatio: 1,
                            }).dispatch(this.props.store.dispatcher);
                        };
                    }
                    break;
                case "rectangle-zoom":
                    {
                        mode = "rectangle";
                        onCreate = (x1, y1, x2, y2) => {
                            console.log(x1, y1, x2, y2);
                            const width = Math.abs(x2[0] - x1[0]);
                            const height = Math.abs(y2[0] - y1[0]);
                            const centerX = Math.min(x2[0], x1[0]) + width / 2;
                            const centerY = Math.min(y2[0], y1[0]) + height / 2;
                            this.doCustomZoom(centerX, centerY, width, height);
                        };
                    }
                    break;
            }
            return (React.createElement(creating_component_1.CreatingComponent, { width: this.state.viewWidth, height: this.state.viewHeight, zoom: this.state.zoom, mode: mode, key: mode, guides: this.getSnappingGuides(), 
                // tslint:disable-next-line
                onCreate: (...args) => {
                    new actions_1.Actions.SetCurrentTool(null).dispatch(this.props.store.dispatcher);
                    // let newArgs = args.map(([value, mapping]) => {
                    //     return [value, mapping || { type: "value", value: value } as Specification.ValueMapping]
                    // }) as [number, Specification.Mapping][];
                    if (onCreate) {
                        onCreate(...args);
                    }
                }, onCancel: () => {
                    new actions_1.Actions.SetCurrentTool(null).dispatch(this.props.store.dispatcher);
                } }));
        }
    }
    doCustomZoom(cx, cy, width, height) {
        const width_main = this.state.viewWidth;
        const height_main = this.state.viewHeight;
        const newCX = width_main / 2 - cx;
        const newCY = height_main / 2 + cy;
        const newScale = width_main > height_main ? height_main / height : width_main / width;
        this.setState({
            zoom: {
                centerX: newCX,
                centerY: newCY,
                scale: 1,
            },
        });
        this.doZoom(newScale);
    }
    renderBoundsGuides() {
        // let chartClass = this.props.store.chartManager.getChartClass(this.props.store.chartState);
        // let boundsGuides = chartClass.getSnappingGuides();
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
                        ]), key: `k${idx}`, x1: guide.value * this.state.zoom.scale + this.state.zoom.centerX, x2: guide.value * this.state.zoom.scale + this.state.zoom.centerX, y1: 0, y2: this.state.viewHeight }));
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
                        ]), key: `k${idx}`, x1: 0, x2: this.state.viewWidth, y1: -guide.value * this.state.zoom.scale + this.state.zoom.centerY, y2: -guide.value * this.state.zoom.scale + this.state.zoom.centerY }));
                }
                if (theGuide.type == "point") {
                    const axisGuide = theGuide;
                    return (React.createElement(React.Fragment, { key: `fk${idx}` },
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
    getSnappingGuides() {
        const chartClass = this.props.store.chartManager.getChartClass(this.props.store.chartState);
        const boundsGuides = chartClass.getSnappingGuides();
        let chartGuides = boundsGuides.map((bounds) => {
            return {
                element: null,
                guide: bounds,
            };
        });
        const elements = this.props.store.chart.elements;
        const elementStates = this.props.store.chartState.elements;
        core_1.zipArray(elements, elementStates).forEach(([layout, layoutState]) => {
            const layoutClass = this.props.store.chartManager.getChartElementClass(layoutState);
            chartGuides = chartGuides.concat(layoutClass.getSnappingGuides().map((bounds) => {
                return {
                    element: layout,
                    guide: bounds,
                };
            }));
        });
        return chartGuides;
    }
    renderChartHandles() {
        const chartClass = this.props.store.chartManager.getChartClass(this.props.store.chartState);
        const handles = chartClass.getHandles();
        return handles.map((handle, index) => {
            return (React.createElement(handles_1.HandlesView, { key: `m${index}`, handles: handles, zoom: this.state.zoom, active: false, onDragStart: (bound, ctx) => {
                    const session = new move_1.MoveSnappingSession(bound);
                    ctx.onDrag((e) => {
                        session.handleDrag(e);
                    });
                    ctx.onEnd((e) => {
                        const updates = session.getUpdates(session.handleEnd(e));
                        if (updates) {
                            for (const name in updates) {
                                // eslint-disable-next-line
                                if (!updates.hasOwnProperty(name)) {
                                    continue;
                                }
                                new actions_1.Actions.SetChartAttribute(name, {
                                    type: specification_1.MappingType.value,
                                    value: updates[name],
                                }).dispatch(this.props.store.dispatcher);
                            }
                        }
                    });
                } }));
        });
    }
    renderMarkHandlesInPlotSegment(plotSegment, plotSegmentState) {
        const bboxViews = [];
        const cs = this.props.store.chartManager
            .getPlotSegmentClass(plotSegmentState)
            .getCoordinateSystem();
        const glyph = core_1.getById(this.props.store.chart.glyphs, plotSegment.glyph);
        plotSegmentState.glyphs.forEach((glyphState, glyphIndex) => {
            const offsetX = glyphState.attributes.x;
            const offsetY = glyphState.attributes.y;
            glyphState.marks.forEach((markState, markIndex) => {
                const mark = glyph.marks[markIndex];
                const markClass = this.props.store.chartManager.getMarkClass(markState);
                if (core_1.Prototypes.isType(mark.classID, guides_1.GuideCoordinatorClass.classID)) {
                    return;
                }
                const bbox = markClass.getBoundingBox();
                let isMarkSelected = false;
                if (this.props.store.currentSelection instanceof stores_1.MarkSelection) {
                    if (this.props.store.currentSelection.plotSegment == plotSegment &&
                        this.props.store.currentSelection.glyph == glyph &&
                        this.props.store.currentSelection.mark == mark) {
                        if (glyphIndex ==
                            this.props.store.getSelectedGlyphIndex(plotSegment._id)) {
                            isMarkSelected = true;
                        }
                    }
                }
                if (bbox) {
                    bboxViews.push(React.createElement(bounding_box_1.BoundingBoxView, { key: glyphIndex + "/" + markIndex, boundingBox: bbox, coordinateSystem: cs, offset: { x: offsetX, y: offsetY }, zoom: this.state.zoom, active: isMarkSelected, onClick: () => {
                            new actions_1.Actions.SelectMark(plotSegment, glyph, mark, glyphIndex).dispatch(this.props.store.dispatcher);
                        } }));
                }
            });
        });
        return React.createElement("g", null, bboxViews);
    }
    // eslint-disable-next-line
    renderLayoutHandles() {
        const elements = this.props.store.chart.elements;
        const elementStates = this.props.store.chartState.elements;
        return core_1.stableSortBy(core_1.zipArray(elements, elementStates), (x) => {
            const [layout] = x;
            const shouldRenderHandles = this.state.currentSelection instanceof stores_1.ChartElementSelection &&
                this.state.currentSelection.chartElement == layout;
            return shouldRenderHandles ? 1 : 0;
        }).map(
        // eslint-disable-next-line
        ([layout, layoutState]) => {
            const layoutClass = this.props.store.chartManager.getChartElementClass(layoutState);
            // Render handles if the chart element is selected
            const shouldRenderHandles = this.state.currentSelection instanceof stores_1.ChartElementSelection &&
                this.state.currentSelection.chartElement == layout;
            const bbox = layoutClass.getBoundingBox();
            if (!shouldRenderHandles) {
                if (bbox) {
                    const bboxView = (React.createElement(bounding_box_1.BoundingBoxView, { key: layout._id, boundingBox: bbox, zoom: this.state.zoom, onClick: () => {
                            new actions_1.Actions.SelectChartElement(layout, null).dispatch(this.props.store.dispatcher);
                        } }));
                    if (core_1.Prototypes.isType(layout.classID, "plot-segment")) {
                        return (React.createElement("g", { key: layout._id },
                            this.renderMarkHandlesInPlotSegment(layout, layoutState),
                            bboxView));
                    }
                    else {
                        return bboxView;
                    }
                }
            }
            const handles = layoutClass.getHandles();
            return (React.createElement("g", { key: `m${layout._id}` },
                bbox ? (React.createElement(bounding_box_1.BoundingBoxView, { zoom: this.state.zoom, boundingBox: bbox, active: true })) : null,
                core_1.Prototypes.isType(layout.classID, "plot-segment")
                    ? this.renderMarkHandlesInPlotSegment(layout, layoutState)
                    : null,
                React.createElement(handles_1.HandlesView, { handles: handles, zoom: this.state.zoom, active: false, visible: shouldRenderHandles, isAttributeSnapped: (attribute) => {
                        if (layout.mappings[attribute] != null) {
                            return true;
                        }
                        for (const constraint of this.props.store.chart.constraints) {
                            if (constraint.type == "snap") {
                                if (constraint.attributes.element == layout._id &&
                                    constraint.attributes.attribute == attribute) {
                                    return true;
                                }
                                if (constraint.attributes.targetElement == layout._id &&
                                    constraint.attributes.targetAttribute == attribute) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }, onDragStart: (handle, ctx) => {
                        const guides = this.getSnappingGuides();
                        const session = new chart_1.ChartSnappingSession(guides, layout, handle, 10 / this.state.zoom.scale, handle.options && handle.options.snapToClosestPoint);
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
                                action.forEach((a) => a.dispatch(this.props.store.dispatcher));
                            }
                        });
                    } })));
        });
    }
    renderHandles() {
        return (React.createElement("g", null,
            this.renderChartHandles(),
            this.renderLayoutHandles()));
    }
    renderControls() {
        const elements = this.props.store.chart.elements;
        const elementStates = this.props.store.chartState.elements;
        return (React.createElement("div", { className: "canvas-popups" }, core_1.zipArray(elements, elementStates)
            .filter(([element]) => core_1.Prototypes.isType(element.classID, "plot-segment"))
            .map(([layout, layoutState], index) => {
            if (this.state.currentSelection instanceof stores_1.ChartElementSelection &&
                this.state.currentSelection.chartElement == layout) {
                const layoutClass = this.props.store.chartManager.getPlotSegmentClass(layoutState);
                const manager = new fluentui_manager_1.FluentUIWidgetManager(this.props.store, layoutClass);
                const controls = layoutClass.getPopupEditor(manager);
                if (!controls) {
                    return null;
                }
                const pt = core_1.Geometry.applyZoom(this.state.zoom, {
                    x: controls.anchor.x,
                    y: -controls.anchor.y,
                });
                if (pt.x < 0 || pt.y < 0 || !this.state.canvasToolbar) {
                    return null;
                }
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "charticulator__canvas-popup", key: `m${index}`, id: `anchor${index}`, style: {
                            left: pt.x.toFixed(0) + "px",
                            bottom: (this.state.viewHeight - pt.y + 5).toFixed(0) + "px",
                        } }),
                    React.createElement(react_1.Callout, { target: `#anchor${index}`, directionalHint: react_1.DirectionalHint.topLeftEdge, styles: {
                            root: {
                                padding: 10,
                            },
                            calloutMain: {
                                overflow: "hidden",
                            },
                        }, onDismiss: () => this.setState({
                            canvasToolbar: false,
                        }) }, manager.horizontal(controls.widgets.map(() => 0), ...controls.widgets))));
            }
        })));
    }
    // eslint-disable-next-line
    renderSnappingGuides() {
        const guides = this.state.snappingCandidates;
        if (!guides || guides.length == 0) {
            return null;
        }
        // eslint-disable-next-line
        return guides.map((guide, idx) => {
            const key = `m${idx}`;
            switch (guide.guide.type) {
                case "x": {
                    const axisGuide = guide.guide;
                    return (React.createElement("line", { key: key, className: "snapping-guide", x1: axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerX, x2: axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerX, y1: 0, y2: this.state.viewHeight }));
                }
                case "y": {
                    const axisGuide = guide.guide;
                    return (React.createElement("line", { key: key, className: "snapping-guide", y1: -axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerY, y2: -axisGuide.value * this.state.zoom.scale +
                            this.state.zoom.centerY, x1: 0, x2: this.state.viewWidth }));
                }
                case "point": {
                    const axisGuide = guide.guide;
                    return (React.createElement(React.Fragment, null,
                        axisGuide.visibleRadius ? (React.createElement("circle", { className: "snapping-guide", key: `ck${idx}display`, cx: axisGuide.cx * this.state.zoom.scale +
                                this.state.zoom.centerX, cy: -axisGuide.cy * this.state.zoom.scale +
                                this.state.zoom.centerY, r: Math.abs(axisGuide.visibleRadius * this.state.zoom.scale) })) : (React.createElement(React.Fragment, null,
                            React.createElement("line", { key: `lk${idx}display1`, className: "snapping-guide", x1: axisGuide.cx * this.state.zoom.scale +
                                    this.state.zoom.centerX, y1: -(axisGuide.cy - 10) * this.state.zoom.scale +
                                    this.state.zoom.centerY, x2: axisGuide.cx * this.state.zoom.scale +
                                    this.state.zoom.centerX, y2: -(axisGuide.cy + 10) * this.state.zoom.scale +
                                    this.state.zoom.centerY }),
                            React.createElement("line", { key: `lk${idx}display1`, className: "snapping-guide", x1: (axisGuide.cx - 10) * this.state.zoom.scale +
                                    this.state.zoom.centerX, y1: -axisGuide.cy * this.state.zoom.scale +
                                    this.state.zoom.centerY, x2: (axisGuide.cx + 10) * this.state.zoom.scale +
                                    this.state.zoom.centerX, y2: -axisGuide.cy * this.state.zoom.scale +
                                    this.state.zoom.centerY }))),
                        React.createElement("line", { key: `lk${idx}display`, className: "snapping-guide", x1: axisGuide.cx * this.state.zoom.scale + this.state.zoom.centerX, y1: -axisGuide.cy * this.state.zoom.scale +
                                this.state.zoom.centerY, x2: axisGuide.angle * this.state.zoom.scale +
                                this.state.zoom.centerX, y2: -axisGuide.radius * this.state.zoom.scale +
                                this.state.zoom.centerY })));
                }
            }
        });
    }
    renderChartCanvas() {
        const chartState = this.props.store.chartState;
        const p1 = {
            x: -chartState.attributes.width / 2,
            y: -chartState.attributes.height / 2,
        };
        const p2 = {
            x: +chartState.attributes.width / 2,
            y: +chartState.attributes.height / 2,
        };
        const p1t = core_1.Geometry.applyZoom(this.state.zoom, p1);
        const p2t = core_1.Geometry.applyZoom(this.state.zoom, p2);
        const cornerInnerRadius = 8;
        const cornerOuterRadius = cornerInnerRadius + 1;
        const shadowSize = cornerOuterRadius - cornerInnerRadius;
        const getRoundedRectPath = (x1, y1, x2, y2, radius) => {
            return `m${Math.min(x1, x2) + cornerInnerRadius},${Math.min(y1, y2)} 
      h${Math.abs(x2 - x1) - radius * 2} 
      a${radius},${radius} 0 0 1 ${radius},${radius} 
      v${Math.abs(y2 - y1) - radius * 2} 
      a${radius},${radius} 0 0 1 -${radius},${radius} 
      h-${Math.abs(x2 - x1) - radius * 2} 
      a${radius},${radius} 0 0 1 -${radius},-${radius} 
      v-${Math.abs(y2 - y1) - radius * 2} 
      a${radius},${radius} 0 0 1 ${radius},-${radius} 
      z`;
        };
        return (React.createElement("g", null,
            React.createElement("path", { className: "canvas-region-outer", d: getRoundedRectPath(p1t.x - shadowSize, p1t.y - shadowSize, p2t.x + shadowSize, p2t.y + shadowSize, cornerInnerRadius) }),
            React.createElement("path", { className: "canvas-region", d: getRoundedRectPath(p1t.x, p1t.y, p2t.x, p2t.y, cornerInnerRadius) }),
            React.createElement(resize_1.ResizeHandleView, { zoom: this.state.zoom, cx: (p1.x + p2.x) / 2, cy: (p1.y + p2.y) / 2, width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y), onResize: (newWidth, newHeight) => {
                    new actions_1.Actions.SetChartSize(newWidth, newHeight).dispatch(this.props.store.dispatcher);
                } })));
    }
    renderDropZoneForMarkLayout(layout, state) {
        const cls = this.props.store.chartManager.getPlotSegmentClass(state);
        return cls
            .getDropZones()
            .filter((zone) => {
            // We don't allow scale data mapping right now
            if (zone.dropAction.scaleInference) {
                return false;
            }
            if (this.state.dropZoneData) {
                // Process dropzone filter
                if (zone.accept) {
                    if (zone.accept.table != null) {
                        if (this.state.dropZoneData.data instanceof actions_1.DragData.DataExpression) {
                            const data = this.state.dropZoneData
                                .data;
                            if (data.table.name != zone.accept.table) {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    if (zone.accept.scaffolds) {
                        if (this.state.dropZoneData.layout) {
                            return (zone.accept.scaffolds.indexOf(this.state.dropZoneData.layout.type) >= 0);
                        }
                        else {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return (this.state.dropZoneData.data instanceof actions_1.DragData.DataExpression);
                }
            }
            else {
                return false;
            }
        })
            .map((zone, idx) => (React.createElement(dropzone_1.DropZoneView, { key: `m${idx}`, onDragEnter: (data) => {
                const dropAction = zone.dropAction;
                if (dropAction.axisInference) {
                    return () => {
                        new actions_1.Actions.BindDataToAxis(layout, dropAction.axisInference.property, dropAction.axisInference.appendToProperty, data, true).dispatch(this.props.store.dispatcher);
                        return true;
                    };
                }
                if (dropAction.extendPlotSegment) {
                    return () => {
                        new actions_1.Actions.ExtendPlotSegment(layout, data.type).dispatch(this.props.store.dispatcher);
                        return true;
                    };
                }
            }, zone: zone, zoom: this.state.zoom })));
    }
    renderDropZones() {
        const { chart, chartState } = this.props.store;
        if (!this.state.dropZoneData) {
            return null;
        }
        return (React.createElement("g", null, core_1.zipArray(chart.elements, chartState.elements)
            .filter(([e]) => core_1.Prototypes.isType(e.classID, "plot-segment"))
            .map(([layout, layoutState]) => {
            return (React.createElement("g", { key: `m${layout._id}` }, this.renderDropZoneForMarkLayout(layout, layoutState)));
        })));
    }
    doZoom(factor) {
        const { scale, centerX, centerY } = this.state.zoom;
        const fixPoint = core_1.Geometry.unapplyZoom(this.state.zoom, {
            x: this.state.viewWidth / 2,
            y: this.state.viewHeight / 2,
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
    // eslint-disable-next-line
    render() {
        const width = this.state.viewWidth;
        const height = this.state.viewHeight;
        const transform = `translate(${this.state.zoom.centerX},${this.state.zoom.centerY}) scale(${this.state.zoom.scale})`;
        return (React.createElement("div", { className: "chart-editor-view" },
            React.createElement("div", { className: "chart-editor-canvas-view", ref: "canvasContainer" },
                React.createElement("svg", { className: "canvas-view", ref: "canvas", x: 0, y: 0, width: width, height: height },
                    React.createElement("rect", { className: "interaction-handler", ref: "canvasInteraction", x: 0, y: 0, width: width, height: height }),
                    this.renderChartCanvas(),
                    this.renderBoundsGuides(),
                    React.createElement("g", { className: "graphics", transform: transform }, this.renderGraphics()),
                    this.renderSnappingGuides(),
                    this.renderHandles(),
                    this.renderDropZones(),
                    this.renderEditingLink(),
                    this.renderCreatingComponent()),
                this.renderControls()),
            React.createElement("div", { className: "canvas-controls" },
                React.createElement("div", { className: "canvas-controls-left" }),
                React.createElement("div", { className: "canvas-controls-right" },
                    React.createElement(controls_1.Button, { icon: "ZoomIn", onClick: () => {
                            this.doZoom(1.1);
                        } }),
                    React.createElement(controls_1.Button, { icon: "ZoomOut", onClick: () => {
                            this.doZoom(1 / 1.1);
                        } }),
                    React.createElement(controls_1.Button, { icon: "ZoomToFit", onClick: () => {
                            const newZoom = this.getFitViewZoom(this.state.viewWidth, this.state.viewHeight);
                            if (!newZoom) {
                                return;
                            }
                            this.setState({
                                zoom: newZoom,
                            });
                        } }),
                    React.createElement(controls_1.Button, { icon: "rect-zoom", title: "Rectangle zoom", onClick: () => {
                            new actions_1.Actions.SetCurrentTool("rectangle-zoom").dispatch(this.props.store.dispatcher);
                        } }))),
            React.createElement(text_editor_1.default, { store: this.props.store }),
            this.state.isSolving ? (React.createElement("div", { className: "solving-hint" },
                React.createElement("div", { className: "el-box" },
                    React.createElement("img", { src: R.getSVGIcon("loading") }),
                    strings_1.strings.app.working))) : null));
    }
}
exports.ChartEditorView = ChartEditorView;
//# sourceMappingURL=chart_editor.js.map
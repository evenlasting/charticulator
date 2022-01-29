"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianPlotSegment = exports.config = void 0;
const Graphics = require("../../../graphics");
const Specification = require("../../../specification");
const axis_1 = require("../axis");
const base_1 = require("./base");
const plot_segment_1 = require("../plot_segment");
const __1 = require("../../..");
const strings_1 = require("../../../../strings");
const types_1 = require("../../../specification/types");
const d3_scale_1 = require("d3-scale");
const observer_1 = require("../../../../app/views/panels/widgets/observer");
const icons = {
    xMinIcon: "AlignHorizontalLeft",
    xMiddleIcon: "AlignHorizontalCenter",
    xMaxIcon: "AlignHorizontalRight",
    yMiddleIcon: "AlignVerticalCenter",
    yMinIcon: "AlignVerticalBottom",
    yMaxIcon: "AlignVerticalTop",
    dodgeXIcon: "HorizontalDistributeCenter",
    dodgeYIcon: "VerticalDistributeCenter",
    gridIcon: "GridViewSmall",
    packingIcon: "sublayout/packing",
    jitterIcon: "sublayout/jitter",
    overlapIcon: "Stack",
};
exports.config = {
    terminology: strings_1.strings.cartesianTerminology,
    icons,
    xAxisPrePostGap: false,
    yAxisPrePostGap: false,
};
class CartesianPlotSegment extends plot_segment_1.PlotSegmentClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [
            "x1",
            "x2",
            "y1",
            "y2",
            "x",
            "y",
            "gapX",
            "gapY",
        ];
        this.attributes = {
            x1: {
                name: "x1",
                type: Specification.AttributeType.Number,
            },
            x2: {
                name: "x2",
                type: Specification.AttributeType.Number,
            },
            y1: {
                name: "y1",
                type: Specification.AttributeType.Number,
            },
            y2: {
                name: "y2",
                type: Specification.AttributeType.Number,
            },
            x: {
                name: "x",
                type: Specification.AttributeType.Number,
            },
            y: {
                name: "y",
                type: Specification.AttributeType.Number,
            },
            gapX: {
                name: "gapX",
                type: Specification.AttributeType.Number,
                editableInGlyphStage: true,
            },
            gapY: {
                name: "gapY",
                type: Specification.AttributeType.Number,
                editableInGlyphStage: true,
            },
        };
        this.getTickData = (axis, manager) => {
            const table = manager.getTable(this.object.table);
            const axisExpression = manager.dataflow.cache.parse(axis.expression);
            const tickDataExpression = manager.dataflow.cache.parse(axis.tickDataExpression);
            const result = [];
            for (let i = 0; i < table.rows.length; i++) {
                const c = table.getRowContext(i);
                const axisValue = axisExpression.getValue(c);
                const tickData = tickDataExpression.getValue(c);
                result.push({ value: axisValue, tick: tickData });
            }
            return result;
        };
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x1 = -100;
        attrs.x2 = 100;
        attrs.y1 = -100;
        attrs.y2 = 100;
        attrs.gapX = 4;
        attrs.gapY = 4;
        attrs.x = attrs.x1;
        attrs.y = attrs.y2;
    }
    createBuilder(solver, context) {
        const builder = new base_1.Region2DConstraintBuilder(this, exports.config, "x1", "x2", "y1", "y2", solver, context);
        return builder;
    }
    buildGlyphConstraints(solver, context) {
        const builder = this.createBuilder(solver, context);
        builder.build();
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x1, x2, y1, y2 } = attrs;
        return {
            type: "rectangle",
            cx: (x1 + x2) / 2,
            cy: (y1 + y2) / 2,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
            rotation: 0,
        };
    }
    getSnappingGuides() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return [
            {
                type: "x",
                value: x1,
                attribute: "x1",
                priority: 2,
            },
            {
                type: "x",
                value: x2,
                attribute: "x2",
                priority: 2,
            },
            {
                type: "y",
                value: y1,
                attribute: "y1",
                priority: 2,
            },
            {
                type: "y",
                value: y2,
                attribute: "y2",
                priority: 2,
            },
        ];
    }
    getAttributePanelWidgets(manager) {
        const fluentUIManager = manager;
        fluentUIManager.eventManager.subscribe(observer_1.EventType.UPDATE_FIELD, {
            update: (property) => {
                if (typeof property === "object" &&
                    (property.property === "xData" ||
                        property.property === "yData" ||
                        property.property === "axis") &&
                    property.field === "windowSize") {
                    fluentUIManager.store.updatePlotSegments();
                    fluentUIManager.store.emit("graphics");
                }
            },
        });
        const builder = this.createBuilder();
        return [
            ...super.getAttributePanelWidgets(manager),
            ...builder.buildPanelWidgets(manager),
        ];
    }
    getPopupEditor(manager) {
        const builder = this.createBuilder();
        const widgets = builder.buildPopupWidgets(manager);
        if (widgets.length == 0) {
            return null;
        }
        const attrs = this.state.attributes;
        const anchor = { x: attrs.x1, y: attrs.y2 };
        return {
            anchor,
            widgets: [...widgets],
        };
    }
    getGraphics(manager) {
        const g = Graphics.makeGroup([]);
        const props = this.object.properties;
        if (props.xData && props.xData.visible) {
            if (props.xData.onTop) {
                g.elements.push(this.getPlotSegmentAxisXDataGraphics(manager));
            }
        }
        if (props.yData && props.yData.visible) {
            if (props.yData.onTop) {
                g.elements.push(this.getPlotSegmentAxisYDataGraphics(manager));
            }
        }
        return g;
    }
    getPlotSegmentAxisXDataGraphics(manager) {
        var _a, _b;
        const g = Graphics.makeGroup([]);
        const attrs = this.state.attributes;
        const props = this.object.properties;
        if (props.xData && props.xData.visible) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.xData, 0, attrs.x2 - attrs.x1, false, false, this.getDisplayFormat(props.xData, props.xData.tickFormat, manager), this.object, this.parent.dataflow);
            if (props.xData.tickDataExpression) {
                const tickFormatType = (_a = props.xData) === null || _a === void 0 ? void 0 : _a.tickFormatType;
                axisRenderer.setTicksByData(this.getTickData(props.xData, manager), props.xData.tickFormat, tickFormatType);
            }
            g.elements.push(axisRenderer.renderCartesian(attrs.x1, props.xData.side != "default" ? attrs.y2 : attrs.y1, axis_1.AxisMode.X, (_b = props.xData) === null || _b === void 0 ? void 0 : _b.offset));
        }
        return g;
    }
    getPlotSegmentAxisYDataGraphics(manager) {
        var _a, _b;
        const g = Graphics.makeGroup([]);
        const attrs = this.state.attributes;
        const props = this.object.properties;
        if (props.yData && props.yData.visible) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.yData, 0, attrs.y2 - attrs.y1, false, true, this.getDisplayFormat(props.yData, props.yData.tickFormat, manager), this.object, this.parent.dataflow);
            if (props.yData.tickDataExpression) {
                const tickFormatType = (_a = props.yData) === null || _a === void 0 ? void 0 : _a.tickFormatType;
                axisRenderer.setTicksByData(this.getTickData(props.yData, manager), props.yData.tickFormat, tickFormatType);
            }
            g.elements.push(axisRenderer.renderCartesian(props.yData.side != "default" ? attrs.x2 : attrs.x1, attrs.y1, axis_1.AxisMode.Y, (_b = props.yData) === null || _b === void 0 ? void 0 : _b.offset));
        }
        return g;
    }
    getPlotSegmentBackgroundGraphics(manager) {
        const g = Graphics.makeGroup([]);
        const attrs = this.state.attributes;
        const props = this.object.properties;
        if (props.xData && props.xData.visible) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.xData, 0, attrs.x2 - attrs.x1, false, false, this.getDisplayFormat(props.xData, props.xData.tickFormat, manager));
            g.elements.push(axisRenderer.renderGridlinesForAxes(attrs.x1, props.xData.side != "default" ? attrs.y2 : attrs.y1, axis_1.AxisMode.X, attrs.y2 - attrs.y1));
        }
        if (props.yData && props.yData.visible) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.yData, 0, attrs.y2 - attrs.y1, false, true, this.getDisplayFormat(props.yData, props.yData.tickFormat, manager));
            g.elements.push(axisRenderer.renderGridlinesForAxes(props.yData.side != "default" ? attrs.x2 : attrs.x1, attrs.y1, axis_1.AxisMode.Y, attrs.x2 - attrs.x1));
        }
        if (props.xData && props.xData.visible) {
            if (!props.xData.onTop) {
                g.elements.push(this.getPlotSegmentAxisXDataGraphics(manager));
            }
        }
        if (props.yData && props.yData.visible) {
            if (!props.yData.onTop) {
                g.elements.push(this.getPlotSegmentAxisYDataGraphics(manager));
            }
        }
        return g;
    }
    renderControls(manager, zoom) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const g = [];
        if (props.xData &&
            props.xData.visible &&
            props.xData.allowScrolling &&
            ((props.xData.allCategories &&
                props.xData.allCategories.length > props.xData.windowSize) ||
                Math.abs(props.xData.dataDomainMax - props.xData.dataDomainMin) >
                    props.xData.windowSize)) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.xData, 0, attrs.x2 - attrs.x1, false, false, this.getDisplayFormat(props.xData, props.xData.tickFormat, manager));
            g.push(axisRenderer.renderVirtualScrollBar(attrs.x1, (props.xData.side != "default" ? attrs.y2 : attrs.y1) +
                (props.xData.barOffset
                    ? (props.xData.side === "default" ? -1 : 1) *
                        props.xData.barOffset
                    : 0), axis_1.AxisMode.X, props.xData.scrollPosition ? props.xData.scrollPosition : 0, (position) => {
                if (props.xData.type === types_1.AxisDataBindingType.Categorical) {
                    if (!props.xData.allCategories) {
                        return;
                    }
                    props.xData.scrollPosition = 100 - position;
                    const start = Math.floor(((props.xData.allCategories.length - props.xData.windowSize) /
                        100) *
                        props.xData.scrollPosition);
                    props.xData.categories = props.xData.allCategories.slice(start, start + props.xData.windowSize);
                    if (props.xData.categories.length === 0) {
                        props.xData.allCategories.slice(start - 1, start + props.xData.windowSize);
                    }
                }
                else if (props.xData.type === types_1.AxisDataBindingType.Numerical) {
                    const scale = d3_scale_1.scaleLinear()
                        .domain([100, 0])
                        .range([props.xData.dataDomainMin, props.xData.dataDomainMax]);
                    props.xData.scrollPosition = position;
                    const start = scale(position);
                    props.xData.domainMin = start;
                    props.xData.domainMax = start + props.xData.windowSize;
                }
                manager.remapPlotSegmentGlyphs(this.object);
                manager.solveConstraints();
            }, zoom));
        }
        if (props.yData &&
            props.yData.visible &&
            props.yData.allowScrolling &&
            ((props.yData.allCategories &&
                props.yData.allCategories.length > props.yData.windowSize) ||
                Math.abs(props.yData.dataDomainMax - props.yData.dataDomainMin) >
                    props.yData.windowSize)) {
            const axisRenderer = new axis_1.AxisRenderer().setAxisDataBinding(props.yData, 0, attrs.y2 - attrs.y1, false, true, this.getDisplayFormat(props.yData, props.yData.tickFormat, manager));
            g.push(axisRenderer.renderVirtualScrollBar((props.yData.side != "default" ? attrs.x2 : attrs.x1) +
                (props.yData.barOffset
                    ? (props.yData.side === "default" ? -1 : 1) *
                        props.yData.barOffset
                    : 0), attrs.y1, axis_1.AxisMode.Y, props.yData.scrollPosition ? props.yData.scrollPosition : 0, (position) => {
                var _a;
                if (((_a = props.yData) === null || _a === void 0 ? void 0 : _a.type) === types_1.AxisDataBindingType.Categorical) {
                    if (!props.yData.allCategories) {
                        return;
                    }
                    props.yData.scrollPosition = position;
                    const start = Math.floor(((props.yData.allCategories.length - props.yData.windowSize) /
                        100) *
                        position);
                    props.yData.categories = props.yData.allCategories.slice(start, start + props.yData.windowSize);
                    if (props.yData.categories.length === 0) {
                        props.yData.allCategories.slice(start - 1, start + props.yData.windowSize);
                    }
                }
                else if (props.yData.type === types_1.AxisDataBindingType.Numerical) {
                    const scale = d3_scale_1.scaleLinear()
                        .domain([100, 0])
                        .range([props.yData.dataDomainMin, props.yData.dataDomainMax]);
                    props.yData.scrollPosition = position;
                    const start = scale(position);
                    props.yData.domainMin = start;
                    props.yData.domainMax = start + props.yData.windowSize;
                }
                manager.remapPlotSegmentGlyphs(this.object);
                manager.solveConstraints();
            }, zoom));
        }
        return g;
    }
    getDropZones() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        const zones = [];
        zones.push({
            type: "region",
            accept: { scaffolds: ["cartesian-y"] },
            dropAction: { extendPlotSegment: {} },
            p1: { x: x1, y: y1 },
            p2: { x: x2, y: y2 },
            title: "Add Y Scaffold",
        });
        zones.push({
            type: "region",
            accept: { scaffolds: ["cartesian-x"] },
            dropAction: { extendPlotSegment: {} },
            p1: { x: x1, y: y1 },
            p2: { x: x2, y: y2 },
            title: "Add X Scaffold",
        });
        zones.push({
            type: "region",
            accept: { scaffolds: ["polar"] },
            dropAction: { extendPlotSegment: {} },
            p1: { x: x1, y: y1 },
            p2: { x: x2, y: y2 },
            title: "Convert to Polar Coordinates",
        });
        zones.push({
            type: "region",
            accept: { scaffolds: ["curve"] },
            dropAction: { extendPlotSegment: {} },
            p1: { x: x1, y: y1 },
            p2: { x: x2, y: y2 },
            title: "Convert to Curve Coordinates",
        });
        zones.push({
            type: "region",
            accept: { scaffolds: ["map"] },
            dropAction: { extendPlotSegment: {} },
            p1: { x: x1, y: y1 },
            p2: { x: x2, y: y2 },
            title: "Convert to Map",
        });
        zones.push({
            type: "line",
            p1: { x: x2, y: y1 },
            p2: { x: x1, y: y1 },
            title: "X Axis",
            dropAction: {
                axisInference: { property: base_1.PlotSegmentAxisPropertyNames.xData },
            },
        });
        zones.push({
            type: "line",
            p1: { x: x1, y: y1 },
            p2: { x: x1, y: y2 },
            title: "Y Axis",
            dropAction: {
                axisInference: { property: base_1.PlotSegmentAxisPropertyNames.yData },
            },
        });
        return zones;
    }
    getAxisModes() {
        const props = this.object.properties;
        return [
            props.xData ? props.xData.type : "null",
            props.yData ? props.yData.type : "null",
        ];
    }
    getHandles() {
        const attrs = this.state.attributes;
        const { x1, x2, y1, y2 } = attrs;
        const h = [
            {
                type: "line",
                axis: "y",
                value: y1,
                span: [x1, x2],
                actions: [{ type: "attribute", attribute: "y1" }],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "y",
                value: y2,
                span: [x1, x2],
                actions: [{ type: "attribute", attribute: "y2" }],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "x",
                value: x1,
                span: [y1, y2],
                actions: [{ type: "attribute", attribute: "x1" }],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "line",
                axis: "x",
                value: x2,
                span: [y1, y2],
                actions: [{ type: "attribute", attribute: "x2" }],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x1,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x2,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x1,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
            {
                type: "point",
                x: x2,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
                options: {
                    snapToClosestPoint: true,
                },
            },
        ];
        const builder = this.createBuilder();
        const handles = builder.getHandles();
        for (const handle of handles) {
            h.push({
                type: "gap-ratio",
                axis: handle.gap.axis,
                reference: handle.gap.reference,
                value: handle.gap.value,
                scale: handle.gap.scale,
                span: handle.gap.span,
                range: [0, 1],
                coordinateSystem: this.getCoordinateSystem(),
                actions: [
                    {
                        type: "property",
                        property: handle.gap.property.property,
                        field: handle.gap.property.field,
                    },
                ],
            });
        }
        return h;
    }
    // eslint-disable-next-line
    getTemplateParameters() {
        const r = [];
        let p = [];
        if (this.object.properties.xData) {
            r.push(axis_1.buildAxisInference(this.object, base_1.PlotSegmentAxisPropertyNames.xData));
            p = p.concat(axis_1.buildAxisProperties(this.object, base_1.PlotSegmentAxisPropertyNames.xData));
        }
        if (this.object.properties.yData) {
            r.push(axis_1.buildAxisInference(this.object, base_1.PlotSegmentAxisPropertyNames.yData));
            p = p.concat(axis_1.buildAxisProperties(this.object, base_1.PlotSegmentAxisPropertyNames.yData));
        }
        if (this.object.properties.sublayout.order &&
            this.object.properties.sublayout.order.expression) {
            r.push({
                objectID: this.object._id,
                dataSource: {
                    table: this.object.table,
                    groupBy: this.object.groupBy,
                },
                expression: {
                    expression: this.object.properties.sublayout.order.expression,
                    property: { property: "sublayout", field: ["order", "expression"] },
                },
            });
        }
        if (this.object.properties.sublayout.order &&
            this.object.properties.sublayout.order.expression) {
            p.push({
                objectID: this.object._id,
                target: {
                    property: {
                        property: "sublayout",
                        field: "order",
                    },
                },
                type: Specification.AttributeType.Object,
                default: this.object.properties.sublayout.order,
            });
        }
        if (this.object.properties.xData &&
            (this.object.properties.xData.autoDomainMin ||
                this.object.properties.xData.autoDomainMax)) {
            const values = this.object.properties.xData.categories;
            const defaultValue = __1.getSortDirection(values);
            p.push({
                objectID: this.object._id,
                target: {
                    property: {
                        property: base_1.PlotSegmentAxisPropertyNames.xData,
                        field: "categories",
                    },
                },
                type: Specification.AttributeType.Enum,
                default: defaultValue,
            });
        }
        if (this.object.properties.yData &&
            (this.object.properties.yData.autoDomainMin ||
                this.object.properties.yData.autoDomainMax)) {
            const values = this.object.properties.yData.categories;
            const defaultValue = __1.getSortDirection(values);
            p.push({
                objectID: this.object._id,
                target: {
                    property: {
                        property: base_1.PlotSegmentAxisPropertyNames.yData,
                        field: "categories",
                    },
                },
                type: Specification.AttributeType.Enum,
                default: defaultValue,
            });
        }
        if (this.object.properties.axis) {
            const values = this.object.properties.axis.categories;
            const defaultValue = __1.getSortDirection(values);
            p.push({
                objectID: this.object._id,
                target: {
                    property: {
                        property: "axis",
                        field: "categories",
                    },
                },
                type: Specification.AttributeType.Enum,
                default: defaultValue,
            });
        }
        return { inferences: r, properties: p };
    }
}
exports.CartesianPlotSegment = CartesianPlotSegment;
CartesianPlotSegment.classID = "plot-segment.cartesian";
CartesianPlotSegment.type = "plot-segment";
CartesianPlotSegment.metadata = {
    displayName: "PlotSegment",
    iconPath: "plot-segment/cartesian",
    creatingInteraction: {
        type: "rectangle",
        mapping: { xMin: "x1", yMin: "y1", xMax: "x2", yMax: "y2" },
    },
};
CartesianPlotSegment.defaultMappingValues = {};
CartesianPlotSegment.defaultProperties = {
    marginX1: 0,
    marginY1: 0,
    marginX2: 0,
    marginY2: 0,
    visible: true,
    sublayout: {
        type: base_1.Region2DSublayoutType.DodgeX,
        order: null,
        ratioX: 0.1,
        ratioY: 0.1,
        align: {
            x: base_1.SublayoutAlignment.Start,
            y: base_1.SublayoutAlignment.Start,
        },
        grid: {
            direction: base_1.GridDirection.X,
            xCount: null,
            yCount: null,
            gridStartPosition: base_1.GridStartPosition.LeftTop,
        },
        jitter: {
            horizontal: true,
            vertical: true,
        },
        packing: {
            gravityX: 0.1,
            gravityY: 0.1,
        },
        orderReversed: null,
    },
};
//# sourceMappingURL=cartesian.js.map
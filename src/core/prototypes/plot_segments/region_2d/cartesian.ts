/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ChartStateManager } from "../..";
import * as Graphics from "../../../graphics";
import { ConstraintSolver } from "../../../solver";
import * as Specification from "../../../specification";
import { BuildConstraintsContext } from "../../chart_element";
import {
  AttributeDescription,
  BoundingBox,
  Controls,
  DropZones,
  Handles,
  ObjectClassMetadata,
  SnappingGuides,
  TemplateParameters,
} from "../../common";
import {
  AxisMode,
  AxisRenderer,
  buildAxisInference,
  buildAxisProperties,
} from "../axis";
import {
  GridDirection,
  GridStartPosition,
  PlotSegmentAxisPropertyNames,
  Region2DAttributes,
  Region2DConfiguration,
  Region2DConfigurationIcons,
  Region2DConstraintBuilder,
  Region2DProperties,
  Region2DSublayoutType,
  SublayoutAlignment,
} from "./base";
import { PlotSegmentClass } from "../plot_segment";
import { getSortDirection, ZoomInfo } from "../../..";
import { strings } from "../../../../strings";
import {
  AxisDataBinding,
  AxisDataBindingType,
} from "../../../specification/types";
import { scaleLinear } from "d3-scale";
import { FluentUIWidgetManager } from "../../../../app/views/panels/widgets/fluentui_manager";
import { EventType } from "../../../../app/views/panels/widgets/observer";

export type CartesianAxisMode =
  | "null"
  | "default"
  | "numerical"
  | "categorical";

export type CartesianProperties = Region2DProperties;

export interface CartesianAttributes extends Region2DAttributes {
  /** Cartesian plot segment region */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CartesianState extends Specification.PlotSegmentState {
  attributes: CartesianAttributes;
}

const icons: Region2DConfigurationIcons = {
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

export const config: Region2DConfiguration = {
  terminology: strings.cartesianTerminology,
  icons,
  xAxisPrePostGap: false,
  yAxisPrePostGap: false,
};

export class CartesianPlotSegment extends PlotSegmentClass<
  CartesianProperties,
  CartesianAttributes
> {
  public static classID: string = "plot-segment.cartesian";
  public static type: string = "plot-segment";

  public static metadata: ObjectClassMetadata = {
    displayName: "PlotSegment",
    iconPath: "plot-segment/cartesian",
    creatingInteraction: {
      type: "rectangle",
      mapping: { xMin: "x1", yMin: "y1", xMax: "x2", yMax: "y2" },
    },
  };

  public static defaultMappingValues: Specification.AttributeMap = {};

  public static defaultProperties: CartesianProperties = {
    marginX1: 0,
    marginY1: 0,
    marginX2: 0,
    marginY2: 0,
    visible: true,
    sublayout: {
      type: Region2DSublayoutType.DodgeX,
      order: null,
      ratioX: 0.1,
      ratioY: 0.1,
      align: {
        x: SublayoutAlignment.Start,
        y: SublayoutAlignment.Start,
      },
      grid: {
        direction: GridDirection.X,
        xCount: null,
        yCount: null,
        gridStartPosition: GridStartPosition.LeftTop,
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

  public readonly state: CartesianState;

  public attributeNames: string[] = [
    "x1",
    "x2",
    "y1",
    "y2",
    "x",
    "y",
    "gapX",
    "gapY",
  ];
  public attributes: { [name: string]: AttributeDescription } = {
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

  public initializeState(): void {
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

  public createBuilder(
    solver?: ConstraintSolver,
    context?: BuildConstraintsContext
  ) {
    const builder = new Region2DConstraintBuilder(
      this,
      config,
      "x1",
      "x2",
      "y1",
      "y2",
      solver,
      context
    );
    return builder;
  }

  public buildGlyphConstraints(
    solver: ConstraintSolver,
    context: BuildConstraintsContext
  ): void {
    const builder = this.createBuilder(solver, context);
    builder.build();
  }

  public getBoundingBox(): BoundingBox.Description {
    const attrs = this.state.attributes;
    const { x1, x2, y1, y2 } = attrs;
    return <BoundingBox.Rectangle>{
      type: "rectangle",
      cx: (x1 + x2) / 2,
      cy: (y1 + y2) / 2,
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      rotation: 0,
    };
  }

  public getSnappingGuides(): SnappingGuides.Description[] {
    const attrs = this.state.attributes;
    const { x1, y1, x2, y2 } = attrs;
    return [
      <SnappingGuides.Axis>{
        type: "x",
        value: x1,
        attribute: "x1",
        priority: 2,
      },
      <SnappingGuides.Axis>{
        type: "x",
        value: x2,
        attribute: "x2",
        priority: 2,
      },
      <SnappingGuides.Axis>{
        type: "y",
        value: y1,
        attribute: "y1",
        priority: 2,
      },
      <SnappingGuides.Axis>{
        type: "y",
        value: y2,
        attribute: "y2",
        priority: 2,
      },
    ];
  }

  public getAttributePanelWidgets(
    manager: Controls.WidgetManager
  ): Controls.Widget[] {
    const fluentUIManager = manager as FluentUIWidgetManager;
    fluentUIManager.eventManager.subscribe(EventType.UPDATE_FIELD, {
      update: (property: Controls.Property | Controls.Property[]) => {
        if (
          typeof property === "object" &&
          ((property as Controls.Property).property === "xData" ||
            (property as Controls.Property).property === "yData" ||
            (property as Controls.Property).property === "axis") &&
          (property as Controls.Property).field === "windowSize"
        ) {
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

  public getPopupEditor(manager: Controls.WidgetManager): Controls.PopupEditor {
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

  public getGraphics(manager: ChartStateManager): Graphics.Group {
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

  private getTickData = (
    axis: Specification.Types.AxisDataBinding,
    manager: ChartStateManager
  ) => {
    const table = manager.getTable(this.object.table);
    const axisExpression = manager.dataflow.cache.parse(axis.expression);
    const tickDataExpression = manager.dataflow.cache.parse(
      axis.tickDataExpression
    );
    const result = [];
    for (let i = 0; i < table.rows.length; i++) {
      const c = table.getRowContext(i);
      const axisValue = axisExpression.getValue(c);
      const tickData = tickDataExpression.getValue(c);
      result.push({ value: axisValue, tick: tickData });
    }
    return result;
  };

  private getPlotSegmentAxisXDataGraphics(
    manager: ChartStateManager
  ): Graphics.Group {
    const g = Graphics.makeGroup([]);
    const attrs = this.state.attributes;
    const props = this.object.properties;
    if (props.xData && props.xData.visible) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.xData,
        0,
        attrs.x2 - attrs.x1,
        false,
        false,
        this.getDisplayFormat(props.xData, props.xData.tickFormat, manager),
        this.object,
        this.parent.dataflow
      );
      if (props.xData.tickDataExpression) {
        const tickFormatType = props.xData?.tickFormatType;
        axisRenderer.setTicksByData(
          this.getTickData(props.xData, manager),
          props.xData.tickFormat,
          tickFormatType
        );
      }
      g.elements.push(
        axisRenderer.renderCartesian(
          attrs.x1,
          props.xData.side != "default" ? attrs.y2 : attrs.y1,
          AxisMode.X,
          props.xData?.offset
        )
      );
    }
    return g;
  }

  private getPlotSegmentAxisYDataGraphics(
    manager: ChartStateManager
  ): Graphics.Group {
    const g = Graphics.makeGroup([]);
    const attrs = this.state.attributes;
    const props = this.object.properties;

    if (props.yData && props.yData.visible) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.yData,
        0,
        attrs.y2 - attrs.y1,
        false,
        true,
        this.getDisplayFormat(props.yData, props.yData.tickFormat, manager),
        this.object,
        this.parent.dataflow
      );
      if (props.yData.tickDataExpression) {
        const tickFormatType = props.yData?.tickFormatType;
        axisRenderer.setTicksByData(
          this.getTickData(props.yData, manager),
          props.yData.tickFormat,
          tickFormatType
        );
      }
      g.elements.push(
        axisRenderer.renderCartesian(
          props.yData.side != "default" ? attrs.x2 : attrs.x1,
          attrs.y1,
          AxisMode.Y,
          props.yData?.offset
        )
      );
    }

    return g;
  }

  public getPlotSegmentBackgroundGraphics(
    manager: ChartStateManager
  ): Graphics.Group {
    const g = Graphics.makeGroup([]);
    const attrs = this.state.attributes;
    const props = this.object.properties;

    if (props.xData && props.xData.visible) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.xData,
        0,
        attrs.x2 - attrs.x1,
        false,
        false,
        this.getDisplayFormat(props.xData, props.xData.tickFormat, manager)
      );
      g.elements.push(
        axisRenderer.renderGridlinesForAxes(
          attrs.x1,
          props.xData.side != "default" ? attrs.y2 : attrs.y1,
          AxisMode.X,
          attrs.y2 - attrs.y1
        )
      );
    }

    if (props.yData && props.yData.visible) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.yData,
        0,
        attrs.y2 - attrs.y1,
        false,
        true,
        this.getDisplayFormat(props.yData, props.yData.tickFormat, manager)
      );
      g.elements.push(
        axisRenderer.renderGridlinesForAxes(
          props.yData.side != "default" ? attrs.x2 : attrs.x1,
          attrs.y1,
          AxisMode.Y,
          attrs.x2 - attrs.x1
        )
      );
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

  public renderControls(
    manager: ChartStateManager,
    zoom: ZoomInfo
  ): React.ReactElement<any>[] {
    const attrs = this.state.attributes;
    const props = this.object.properties;
    const g = [];

    if (
      props.xData &&
      props.xData.visible &&
      props.xData.allowScrolling &&
      ((props.xData.allCategories &&
        props.xData.allCategories.length > props.xData.windowSize) ||
        Math.abs(props.xData.dataDomainMax - props.xData.dataDomainMin) >
          props.xData.windowSize)
    ) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.xData,
        0,
        attrs.x2 - attrs.x1,
        false,
        false,
        this.getDisplayFormat(props.xData, props.xData.tickFormat, manager)
      );
      g.push(
        axisRenderer.renderVirtualScrollBar(
          attrs.x1,
          (props.xData.side != "default" ? attrs.y2 : attrs.y1) +
            (props.xData.barOffset
              ? (props.xData.side === "default" ? -1 : 1) *
                <number>props.xData.barOffset
              : 0),
          AxisMode.X,
          props.xData.scrollPosition ? props.xData.scrollPosition : 0,
          (position) => {
            if (props.xData.type === AxisDataBindingType.Categorical) {
              if (!props.xData.allCategories) {
                return;
              }
              props.xData.scrollPosition = 100 - position;

              const start = Math.floor(
                ((props.xData.allCategories.length - props.xData.windowSize) /
                  100) *
                  props.xData.scrollPosition
              );
              props.xData.categories = props.xData.allCategories.slice(
                start,
                start + props.xData.windowSize
              );

              if (props.xData.categories.length === 0) {
                props.xData.allCategories.slice(
                  start - 1,
                  start + props.xData.windowSize
                );
              }
            } else if (props.xData.type === AxisDataBindingType.Numerical) {
              const scale = scaleLinear()
                .domain([100, 0])
                .range([props.xData.dataDomainMin, props.xData.dataDomainMax]);
              props.xData.scrollPosition = position;
              const start = scale(position);
              props.xData.domainMin = start;
              props.xData.domainMax = start + props.xData.windowSize;
            }
            manager.remapPlotSegmentGlyphs(this.object);
            manager.solveConstraints();
          },
          zoom
        )
      );
    }
    if (
      props.yData &&
      props.yData.visible &&
      props.yData.allowScrolling &&
      ((props.yData.allCategories &&
        props.yData.allCategories.length > props.yData.windowSize) ||
        Math.abs(props.yData.dataDomainMax - props.yData.dataDomainMin) >
          props.yData.windowSize)
    ) {
      const axisRenderer = new AxisRenderer().setAxisDataBinding(
        props.yData,
        0,
        attrs.y2 - attrs.y1,
        false,
        true,
        this.getDisplayFormat(props.yData, props.yData.tickFormat, manager)
      );
      g.push(
        axisRenderer.renderVirtualScrollBar(
          (props.yData.side != "default" ? attrs.x2 : attrs.x1) +
            (props.yData.barOffset
              ? (props.yData.side === "default" ? -1 : 1) *
                <number>props.yData.barOffset
              : 0),
          attrs.y1,
          AxisMode.Y,
          props.yData.scrollPosition ? props.yData.scrollPosition : 0,
          (position) => {
            if (props.yData?.type === AxisDataBindingType.Categorical) {
              if (!props.yData.allCategories) {
                return;
              }
              props.yData.scrollPosition = position;
              const start = Math.floor(
                ((props.yData.allCategories.length - props.yData.windowSize) /
                  100) *
                  position
              );
              props.yData.categories = props.yData.allCategories.slice(
                start,
                start + props.yData.windowSize
              );

              if (props.yData.categories.length === 0) {
                props.yData.allCategories.slice(
                  start - 1,
                  start + props.yData.windowSize
                );
              }
            } else if (props.yData.type === AxisDataBindingType.Numerical) {
              const scale = scaleLinear()
                .domain([100, 0])
                .range([props.yData.dataDomainMin, props.yData.dataDomainMax]);
              props.yData.scrollPosition = position;
              const start = scale(position);
              props.yData.domainMin = start;
              props.yData.domainMax = start + props.yData.windowSize;
            }
            manager.remapPlotSegmentGlyphs(this.object);
            manager.solveConstraints();
          },
          zoom
        )
      );
    }

    return g;
  }

  public getDropZones(): DropZones.Description[] {
    const attrs = this.state.attributes;
    const { x1, y1, x2, y2 } = attrs;
    const zones: DropZones.Description[] = [];
    zones.push(<DropZones.Region>{
      type: "region",
      accept: { scaffolds: ["cartesian-y"] },
      dropAction: { extendPlotSegment: {} },
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      title: "Add Y Scaffold",
    });
    zones.push(<DropZones.Region>{
      type: "region",
      accept: { scaffolds: ["cartesian-x"] },
      dropAction: { extendPlotSegment: {} },
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      title: "Add X Scaffold",
    });
    zones.push(<DropZones.Region>{
      type: "region",
      accept: { scaffolds: ["polar"] },
      dropAction: { extendPlotSegment: {} },
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      title: "Convert to Polar Coordinates",
    });
    zones.push(<DropZones.Region>{
      type: "region",
      accept: { scaffolds: ["curve"] },
      dropAction: { extendPlotSegment: {} },
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      title: "Convert to Curve Coordinates",
    });
    zones.push(<DropZones.Region>{
      type: "region",
      accept: { scaffolds: ["map"] },
      dropAction: { extendPlotSegment: {} },
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      title: "Convert to Map",
    });
    zones.push(<DropZones.Line>{
      type: "line",
      p1: { x: x2, y: y1 },
      p2: { x: x1, y: y1 },
      title: "X Axis",
      dropAction: {
        axisInference: { property: PlotSegmentAxisPropertyNames.xData },
      },
    });
    zones.push(<DropZones.Line>{
      type: "line",
      p1: { x: x1, y: y1 },
      p2: { x: x1, y: y2 },
      title: "Y Axis",
      dropAction: {
        axisInference: { property: PlotSegmentAxisPropertyNames.yData },
      },
    });
    return zones;
  }

  public getAxisModes(): [CartesianAxisMode, CartesianAxisMode] {
    const props = this.object.properties;
    return [
      props.xData ? props.xData.type : "null",
      props.yData ? props.yData.type : "null",
    ];
  }

  public getHandles(): Handles.Description[] {
    const attrs = this.state.attributes;
    const { x1, x2, y1, y2 } = attrs;
    const h: Handles.Description[] = [
      <Handles.Line>{
        type: "line",
        axis: "y",
        value: y1,
        span: [x1, x2],
        actions: [{ type: "attribute", attribute: "y1" }],
        options: {
          snapToClosestPoint: true,
        },
      },
      <Handles.Line>{
        type: "line",
        axis: "y",
        value: y2,
        span: [x1, x2],
        actions: [{ type: "attribute", attribute: "y2" }],
        options: {
          snapToClosestPoint: true,
        },
      },
      <Handles.Line>{
        type: "line",
        axis: "x",
        value: x1,
        span: [y1, y2],
        actions: [{ type: "attribute", attribute: "x1" }],
        options: {
          snapToClosestPoint: true,
        },
      },
      <Handles.Line>{
        type: "line",
        axis: "x",
        value: x2,
        span: [y1, y2],
        actions: [{ type: "attribute", attribute: "x2" }],
        options: {
          snapToClosestPoint: true,
        },
      },
      <Handles.Point>{
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
      <Handles.Point>{
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
      <Handles.Point>{
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
      <Handles.Point>{
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
      h.push(<Handles.GapRatio>{
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
  public getTemplateParameters(): TemplateParameters {
    const r: Specification.Template.Inference[] = [];
    let p: Specification.Template.Property[] = [];
    if (this.object.properties.xData) {
      r.push(
        buildAxisInference(this.object, PlotSegmentAxisPropertyNames.xData)
      );
      p = p.concat(
        buildAxisProperties(this.object, PlotSegmentAxisPropertyNames.xData)
      );
    }
    if (this.object.properties.yData) {
      r.push(
        buildAxisInference(this.object, PlotSegmentAxisPropertyNames.yData)
      );
      p = p.concat(
        buildAxisProperties(this.object, PlotSegmentAxisPropertyNames.yData)
      );
    }
    if (
      this.object.properties.sublayout.order &&
      this.object.properties.sublayout.order.expression
    ) {
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
    if (
      this.object.properties.sublayout.order &&
      this.object.properties.sublayout.order.expression
    ) {
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
    if (
      this.object.properties.xData &&
      (this.object.properties.xData.autoDomainMin ||
        this.object.properties.xData.autoDomainMax)
    ) {
      const values = this.object.properties.xData.categories;
      const defaultValue = getSortDirection(values);
      p.push({
        objectID: this.object._id,
        target: {
          property: {
            property: PlotSegmentAxisPropertyNames.xData,
            field: "categories",
          },
        },
        type: Specification.AttributeType.Enum,
        default: defaultValue,
      });
    }
    if (
      this.object.properties.yData &&
      (this.object.properties.yData.autoDomainMin ||
        this.object.properties.yData.autoDomainMax)
    ) {
      const values = this.object.properties.yData.categories;
      const defaultValue = getSortDirection(values);
      p.push({
        objectID: this.object._id,
        target: {
          property: {
            property: PlotSegmentAxisPropertyNames.yData,
            field: "categories",
          },
        },
        type: Specification.AttributeType.Enum,
        default: defaultValue,
      });
    }
    if (this.object.properties.axis) {
      const values = (<AxisDataBinding>this.object.properties.axis).categories;
      const defaultValue = getSortDirection(values);
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

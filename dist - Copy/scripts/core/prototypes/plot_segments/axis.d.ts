import { ZoomInfo } from "../../common";
import { CoordinateSystem, Group } from "../../graphics";
import { Specification } from "../../index";
import { Controls } from "../common";
import { TickFormatType } from "../../specification/types";
import { DataflowManager } from "../dataflow";
import React = require("react");
export declare const defaultAxisStyle: Specification.Types.AxisRenderingStyle;
export interface TickDescription {
    position: number;
    label: string;
}
export declare enum AxisMode {
    X = "x",
    Y = "y"
}
export declare class AxisRenderer {
    ticks: TickDescription[];
    style: Specification.Types.AxisRenderingStyle;
    rangeMin: number;
    rangeMax: number;
    valueToPosition: (value: any) => number;
    oppositeSide: boolean;
    static SCROLL_BAR_SIZE: number;
    private plotSegment;
    private dataFlow;
    private data;
    private static textMeasurer;
    private scrollRequired;
    private shiftAxis;
    private hiddenCategoriesRatio;
    private handlerSize;
    private dataType;
    private windowSize;
    setStyle(style?: Partial<Specification.Types.AxisRenderingStyle>): this;
    setAxisDataBinding(data: Specification.Types.AxisDataBinding, rangeMin: number, rangeMax: number, enablePrePostGap: boolean, reverse: boolean, getTickFormat?: (value: any) => string, plotSegment?: Specification.PlotSegment, dataflow?: DataflowManager): this;
    ticksData: {
        tick: any;
        value: any;
    }[];
    setTicksByData(ticks: {
        tick: any;
        value: any;
    }[], tickFormatString: string, tickFormatType: TickFormatType): void;
    static getTickFormat(tickFormat: string, defaultFormat: (d: number) => string): (d: number) => string;
    setLinearScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number, tickFormat: string): this;
    setLogarithmicScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number, tickFormat: string): this;
    setTemporalScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number, tickFormatString: string): this;
    setCategoricalScale(domain: string[], range: [number, number][], rangeMin: number, rangeMax: number, tickFormat?: (value: any) => string): this;
    renderGridLine(x: number, y: number, angle: number, side: number, size: number): Group;
    renderGridlinesForAxes(x: number, y: number, axis: AxisMode, size: number): Group;
    renderLine(x: number, y: number, angle: number, side: number, offset?: number): Group;
    renderCartesian(x: number, y: number, axis: AxisMode, offset?: number): Group;
    renderPolarRadialGridLine(x: number, y: number, innerRadius: number, outerRadius: number): Group;
    renderPolarArcGridLine(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): Group;
    renderPolar(cx: number, cy: number, radius: number, side: number): Group;
    renderCurve(coordinateSystem: CoordinateSystem, y: number, side: number): Group;
    renderVirtualScrollBar(x: number, y: number, axis: AxisMode, scrollPosition: number, onScroll: (position: number) => void, zoom: ZoomInfo): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
    private renderScrollBar;
}
export declare function getCategoricalAxis(data: Specification.Types.AxisDataBinding, enablePrePostGap: boolean, reverse: boolean): {
    gap: number;
    preGap: number;
    postGap: number;
    gapScale: number;
    ranges: [number, number][];
};
export declare function getNumericalInterpolate(data: Specification.Types.AxisDataBinding): (x: number) => number;
interface AxisAppearanceWidgets {
    isVisible: boolean;
    wordWrap: boolean;
    isOffset: boolean;
}
export declare function buildAxisAppearanceWidgets(axisProperty: string, manager: Controls.WidgetManager, options: AxisAppearanceWidgets): any;
export declare function buildAxisWidgets(data: Specification.Types.AxisDataBinding, axisProperty: string, manager: Controls.WidgetManager, axisName: string, showOffset?: boolean): Controls.Widget[];
export declare function buildAxisInference(plotSegment: Specification.PlotSegment, property: string): Specification.Template.Inference;
export declare function buildAxisProperties(plotSegment: Specification.PlotSegment, property: string): Specification.Template.Property[];
export {};

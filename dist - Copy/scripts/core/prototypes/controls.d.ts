import { DataMappingHints } from ".";
import { Point } from "../common";
import * as Specification from "../specification";
import * as Dataset from "../dataset";
import { CSSProperties } from "react";
import { ICheckboxStyles } from "@fluentui/react";
export declare type Widget = any;
export interface Property {
    property: string;
    field?: string | number | (string | number)[];
    noUpdateState?: boolean;
    noComputeLayout?: boolean;
}
export interface InputComboboxOptions {
    defaultRange: string[];
    valuesOnly?: boolean;
    label?: string;
}
export declare const enum LabelPosition {
    Right = 0,
    Bottom = 1,
    Left = 2,
    Top = 3
}
export interface InputSelectOptions {
    type: "radio" | "dropdown";
    showLabel?: boolean;
    labelPosition?: LabelPosition;
    options: string[];
    icons?: string[];
    labels?: string[];
    tooltip?: string;
    label?: string;
    hideBorder?: boolean;
    shiftCallout?: number;
}
export interface InputFontComboboxOptions {
    label?: string;
}
export interface InputTextOptions {
    label?: string;
    placeholder?: string;
    tooltip?: string;
    updateProperty?: boolean;
    value?: string;
    underline?: boolean;
    borderless?: boolean;
    styles?: CSSProperties;
    emitMappingAction?: boolean;
    disabled?: boolean;
}
export interface InputBooleanOptions {
    type: "checkbox" | "highlight" | "checkbox-fill-width";
    icon?: string;
    headerLabel?: string;
    label?: string;
    observerConfig?: ObserverConfig;
    checkBoxStyles?: ICheckboxStyles;
}
export interface RowOptions {
    dropzone?: {
        type: "axis-data-binding";
        prompt?: string;
        property?: string;
        defineCategories?: boolean;
    };
}
export interface DropTargetOptions {
    type: "order";
    property: Property;
    label: string;
}
export interface OrderWidgetOptions {
    table: string;
    displayLabel?: boolean;
    labelPosition?: LabelPosition;
    tooltip?: string;
    shiftCallout?: number;
}
export interface MappingEditorOptions {
    /** Hints for creating data mapping */
    hints?: DataMappingHints;
    /** When no mapping is specified, show the default value */
    defaultValue?: Specification.AttributeValue;
    /** When no mapping is specified, and no default value, show auto (true) or none (false). */
    defaultAuto?: boolean;
    /** Only allow mapping from one table */
    table?: string;
    acceptKinds?: Specification.DataKind[];
    numberOptions?: InputNumberOptions;
    /** Open mapping editor after rendering */
    openMapping?: boolean;
    /** Enables value selector from mapping */
    allowSelectValue?: boolean;
    /** Text lael of input */
    label?: string;
    stopPropagation?: boolean;
}
export interface ObserverConfig {
    isObserver: boolean;
    properties: Property | Property[];
    value: Specification.AttributeValue;
}
export interface InputNumberOptions {
    digits?: number;
    minimum?: number;
    maximum?: number;
    step?: number;
    percentage?: boolean;
    showSlider?: boolean;
    sliderRange?: [number, number];
    sliderFunction?: "linear" | "sqrt";
    showUpdown?: boolean;
    updownTick?: number;
    updownRange?: [number, number];
    updownStyle?: "normal" | "font";
    label?: string;
    stopPropagation?: boolean;
    observerConfig?: ObserverConfig;
}
export interface InputDateOptions {
    defaultValue?: number | Date;
    placeholder?: string;
    label?: string;
    onEnter?: (value: number) => boolean;
}
export interface InputColorOptions {
    allowNull?: boolean;
    label?: string;
    noDefaultMargin?: boolean;
    stopPropagation?: boolean;
    labelKey: string;
    width?: number;
    underline?: boolean;
    pickerBeforeTextField?: boolean;
}
export interface TableOptions {
}
export interface VerticalGroupOptions {
    isCollapsed?: boolean;
    header: string;
    alignVertically?: boolean;
}
export declare const enum PanelMode {
    Button = "button",
    Panel = "panel"
}
export interface FilterEditorOptions {
    table: string;
    target: {
        plotSegment?: Specification.PlotSegment;
        property?: Property;
    };
    value: Specification.Types.Filter;
    mode: PanelMode;
}
export interface GroupByEditorOptions {
    table: string;
    target: {
        plotSegment?: Specification.PlotSegment;
        property?: Property;
    };
    value: Specification.Types.GroupBy;
    mode: PanelMode;
}
export interface NestedChartEditorOptions {
    specification: Specification.Chart;
    dataset: Dataset.Dataset;
    filterCondition?: {
        column: string;
        value: any;
    };
    width: number;
    height: number;
}
export interface ArrayWidgetOptions {
    allowReorder?: boolean;
    allowDelete?: boolean;
}
export interface ScrollListOptions {
    height?: number;
    maxHeight?: number;
    styles?: CSSProperties;
}
export interface InputExpressionOptions {
    table?: string;
    label?: string;
    dropzone?: {
        type: "axis-data-binding";
        prompt?: string;
        property?: string;
        defineCategories?: boolean;
    };
}
export interface InputFormatOptions {
    blank?: string;
}
export interface InputFormatOptions {
    blank?: string;
    label?: string;
}
export interface InputFormatOptions {
    blank?: string;
    isDateField?: boolean;
    label?: string;
}
export interface ReOrderWidgetOptions {
    allowReset?: boolean;
    onConfirm?: (items: string[]) => void;
    onReset?: () => string[];
    items?: string[];
}
export interface InputFormatOptions {
    blank?: string;
    isDateField?: boolean;
}
export interface InputFormatOptions {
    blank?: string;
    isDateField?: boolean;
}
export interface InputFormatOptions {
    blank?: string;
    isDateField?: boolean;
}
export interface CustomCollapsiblePanelOptions {
    header?: string;
    styles?: CSSProperties;
}
export interface WidgetManager {
    mappingEditor(name: string, attribute: string, options: MappingEditorOptions): Widget;
    inputNumber(property: Property, options?: InputNumberOptions): Widget;
    inputDate(property: Property, options?: InputDateOptions): Widget;
    inputText(property: Property, options: InputTextOptions): Widget;
    inputComboBox(property: Property, options: InputComboboxOptions): Widget;
    inputFontFamily(property: Property, options: InputFontComboboxOptions): Widget;
    inputSelect(property: Property, options: InputSelectOptions): Widget;
    inputBoolean(property: Property | Property[], options: InputBooleanOptions): Widget;
    inputExpression(property: Property, options?: InputExpressionOptions): Widget;
    inputFormat(property: Property, options?: InputFormatOptions): Widget;
    inputImage(property: Property): Widget;
    inputImageProperty(property: Property): Widget;
    inputColor(property: Property, options?: InputColorOptions): Widget;
    inputColorGradient(property: Property, inline?: boolean): Widget;
    clearButton(property: Property, icon?: string, isHeader?: boolean): Widget;
    setButton(property: Property, value: Specification.AttributeValue, icon?: string, text?: string): Widget;
    scaleEditor(attribute: string, text: string): Widget;
    orderByWidget(property: Property, options: OrderWidgetOptions): Widget;
    reorderWidget(property: Property, options: ReOrderWidgetOptions): Widget;
    arrayWidget(property: Property, item: (item: Property, index?: number) => Widget, options?: ArrayWidgetOptions): Widget;
    dropTarget(options: DropTargetOptions, widget: Widget): Widget;
    icon(icon: string): Widget;
    label(title: string, options?: {
        addMargins: boolean;
    }): Widget;
    text(text: string, align?: "left" | "center" | "right"): Widget;
    sep(): Widget;
    sectionHeader(title: string, widget?: Widget, options?: RowOptions): Widget;
    row(title?: string, widget?: Widget, options?: RowOptions): Widget;
    horizontal(cols: number[], ...widgets: Widget[]): Widget;
    verticalGroup(options: VerticalGroupOptions, ...widgets: Widget[]): Widget;
    vertical(...widgets: Widget[]): Widget;
    table(rows: Widget[][], options?: TableOptions): Widget;
    scrollList(widgets: Widget[], options?: ScrollListOptions): Widget;
    tooltip(widget: Widget, tooltipContent: Widget): Widget;
    filterEditor(options: FilterEditorOptions): Widget;
    groupByEditor(options: GroupByEditorOptions): Widget;
    nestedChartEditor(property: Property, options: NestedChartEditorOptions): Widget;
    customCollapsiblePanel(widgets: Widget[], options: CustomCollapsiblePanelOptions): Widget;
}
export interface PopupEditor {
    anchor: Point;
    widgets: Widget[];
}

import { Dataset, Point, Prototypes, Specification, Action, SelectMark, ClearSelection, MessageType } from "../../core";
import * as DragData from "./drag_data";
import { ExportTemplateTarget } from "../template";
import { DataType } from "../../core/dataset";
import { ObjectClass } from "../../core/prototypes";
import { AxisDataBindingType, NumericalMode } from "../../core/specification/types";
import { NestedChartEditorOptions } from "../../core/prototypes/controls";
import { AttributeMap } from "../../core/specification";
export { Action, SelectMark, ClearSelection };
export declare class Undo extends Action {
    digest(): {
        name: string;
    };
}
export declare class Redo extends Action {
    digest(): {
        name: string;
    };
}
export declare class Reset extends Action {
    digest(): {
        name: string;
    };
}
export declare class Export extends Action {
    type: string;
    options: {
        scale?: number;
        quality?: number;
    };
    constructor(type: string, options?: {
        scale?: number;
        quality?: number;
    });
    digest(): {
        name: string;
        type: string;
        options: {
            scale?: number;
            quality?: number;
        };
    };
}
export declare class ExportTemplate extends Action {
    kind: string;
    target: ExportTemplateTarget;
    properties: {
        [name: string]: string;
    };
    constructor(kind: string, target: ExportTemplateTarget, properties: {
        [name: string]: string;
    });
    digest(): {
        name: string;
    };
}
export declare class SaveExportTemplatePropertyName extends Action {
    objectId: string;
    propertyName: string;
    value: string;
    constructor(objectId: string, propertyName: string, value: string);
    digest(): {
        name: string;
    };
}
export declare class Open extends Action {
    id: string;
    onFinish?: (error?: Error) => void;
    constructor(id: string, onFinish?: (error?: Error) => void);
    digest(): {
        name: string;
        id: string;
    };
}
/** Save the current chart */
export declare class Save extends Action {
    onFinish?: (error?: Error) => void;
    constructor(onFinish?: (error?: Error) => void);
    digest(): {
        name: string;
    };
}
export declare class SaveAs extends Action {
    saveAs: string;
    onFinish?: (error?: Error) => void;
    constructor(saveAs: string, onFinish?: (error?: Error) => void);
    digest(): {
        name: string;
        saveAs: string;
    };
}
export declare class Load extends Action {
    projectData: any;
    constructor(projectData: any);
    digest(): {
        name: string;
    };
}
export declare class ImportDataset extends Action {
    dataset: Dataset.Dataset;
    constructor(dataset: Dataset.Dataset);
    digest(): {
        name: string;
        datasetName: string;
    };
}
export declare class ImportChartAndDataset extends Action {
    specification: Specification.Chart;
    dataset: Dataset.Dataset;
    options: {
        [key: string]: any;
    };
    originSpecification?: Specification.Chart;
    constructor(specification: Specification.Chart, dataset: Dataset.Dataset, options: {
        [key: string]: any;
    }, originSpecification?: Specification.Chart);
    digest(): {
        name: string;
    };
}
export declare class ReplaceDataset extends Action {
    dataset: Dataset.Dataset;
    keepState: boolean;
    constructor(dataset: Dataset.Dataset, keepState?: boolean);
    digest(): {
        name: string;
        datasetName: string;
        keepState: boolean;
    };
}
/** Invokes updaes all plot segments on the chart,  */
export declare class UpdatePlotSegments extends Action {
    constructor();
    digest(): {
        name: string;
    };
}
export declare class UpdateDataAxis extends Action {
    constructor();
    digest(): {
        name: string;
    };
}
export declare class ConvertColumnDataType extends Action {
    tableName: string;
    column: string;
    type: DataType;
    constructor(tableName: string, column: string, type: DataType);
    digest(): {
        name: string;
    };
}
/** Add an empty glyph to the chart */
export declare class AddGlyph extends Action {
    classID: string;
    constructor(classID: string);
    digest(): {
        name: string;
        classID: string;
    };
}
/** Remove a glyph from the chart */
export declare class RemoveGlyph extends Action {
    glyph: Specification.Glyph;
    constructor(glyph: Specification.Glyph);
    digest(): {
        name: string;
        glyph: string[];
    };
}
/** Add an mark to the glyph */
export declare class AddMarkToGlyph extends Action {
    glyph: Specification.Glyph;
    classID: string;
    point: Point;
    mappings: {
        [name: string]: [number, Specification.Mapping];
    };
    properties: Specification.AttributeMap;
    constructor(glyph: Specification.Glyph, classID: string, point: Point, mappings?: {
        [name: string]: [number, Specification.Mapping];
    }, properties?: Specification.AttributeMap);
    digest(): {
        name: string;
        classID: string;
        glyph: string[];
        mappings: {
            [name: string]: [number, Specification.Mapping];
        };
        properties: Specification.AttributeMap;
    };
}
/** Remove an mark from the glyph */
export declare class RemoveMarkFromGlyph extends Action {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    constructor(glyph: Specification.Glyph, mark: Specification.Element);
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
    };
}
/**
 * Dispatches when user binds table coulmns to attributes
 */
export declare class MapDataToMarkAttribute extends Action {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    attribute: string;
    attributeType: Specification.AttributeType;
    expression: string;
    valueType: Specification.DataType;
    valueMetadata: Dataset.ColumnMetadata;
    hints: Prototypes.DataMappingHints;
    expressionTable: string;
    /**
     * @param glyph the glyph object where marks is
     * @param mark mark object for which the attribute is being changed
     * @param attribute name of the attribute that data is associated with
     * @param attributeType attribute data type
     * @param expression expression to fetch data from table. Usually contains name of column and aggregation function
     * @param valueType type of data in the column
     * @param valueMetadata additional data about column
     * @param hints contains configuration of data mapping to attribute
     */
    constructor(glyph: Specification.Glyph, mark: Specification.Element, attribute: string, attributeType: Specification.AttributeType, expression: string, valueType: Specification.DataType, valueMetadata: Dataset.ColumnMetadata, hints: Prototypes.DataMappingHints, expressionTable: string);
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
        attribute: string;
        attributeType: Specification.AttributeType;
        expression: string;
        valueType: Dataset.DataType;
        hints: any;
    };
}
export declare class MarkAction extends Action {
}
export declare class SetMarkAttribute extends MarkAction {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    attribute: string;
    mapping: Specification.Mapping;
    constructor(glyph: Specification.Glyph, mark: Specification.Element, attribute: string, mapping: Specification.Mapping);
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
        attribute: string;
        mapping: Specification.Mapping;
    };
}
export declare class UnmapMarkAttribute extends MarkAction {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    attribute: string;
    constructor(glyph: Specification.Glyph, mark: Specification.Element, attribute: string);
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
        attribute: string;
    };
}
export declare class UpdateMarkAttribute extends MarkAction {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    updates: {
        [name: string]: Specification.AttributeValue;
    };
    constructor(glyph: Specification.Glyph, mark: Specification.Element, updates: {
        [name: string]: Specification.AttributeValue;
    });
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
        updates: {
            [name: string]: Specification.AttributeValue;
        };
    };
}
export declare class SnapMarks extends MarkAction {
    glyph: Specification.Glyph;
    mark: Specification.Element;
    attribute: string;
    targetMark: Specification.Element;
    targetAttribute: string;
    constructor(glyph: Specification.Glyph, mark: Specification.Element, attribute: string, targetMark: Specification.Element, targetAttribute: string);
    digest(): {
        name: string;
        glyph: string[];
        mark: string[];
        attribute: string;
        targetMark: string[];
        targetAttribute: string;
    };
}
export declare class MarkActionGroup extends MarkAction {
    actions: MarkAction[];
    constructor(actions?: MarkAction[]);
    add(action: MarkAction): void;
    digest(): {
        name: string;
        actions: {
            name: string;
        }[];
    };
}
export declare class SetGlyphAttribute extends Action {
    glyph: Specification.Glyph;
    attribute: string;
    mapping: Specification.Mapping;
    constructor(glyph: Specification.Glyph, attribute: string, mapping: Specification.Mapping);
    digest(): {
        name: string;
        glyph: string[];
        attribute: string;
        mapping: Specification.Mapping;
    };
}
export declare class UpdateGlyphAttribute extends Action {
    glyph: Specification.Glyph;
    updates: {
        [name: string]: Specification.AttributeValue;
    };
    constructor(glyph: Specification.Glyph, updates: {
        [name: string]: Specification.AttributeValue;
    });
    digest(): {
        name: string;
        glyph: string[];
        updates: {
            [name: string]: Specification.AttributeValue;
        };
    };
}
export declare class AddChartElement extends Action {
    classID: string;
    mappings: {
        [name: string]: [Specification.AttributeValue, Specification.Mapping];
    };
    properties: Specification.AttributeMap;
    constructor(classID: string, mappings: {
        [name: string]: [Specification.AttributeValue, Specification.Mapping];
    }, properties?: Specification.AttributeMap);
    digest(): {
        name: string;
        classID: string;
        mappings: {
            [name: string]: [Specification.AttributeValue, Specification.Mapping];
        };
        attribute: Specification.AttributeMap;
    };
}
export declare class DeleteChartElement extends Action {
    chartElement: Specification.ChartElement;
    constructor(chartElement: Specification.ChartElement);
    digest(): {
        name: string;
        chartElement: string[];
    };
}
export declare class SetChartElementMapping extends Action {
    chartElement: Specification.ChartElement;
    attribute: string;
    mapping: Specification.Mapping;
    constructor(chartElement: Specification.ChartElement, attribute: string, mapping: Specification.Mapping);
    digest(): {
        name: string;
        chartElement: string[];
        attribute: string;
        mapping: Specification.Mapping;
    };
}
export declare class MapDataToChartElementAttribute extends Action {
    chartElement: Specification.ChartElement;
    attribute: string;
    attributeType: Specification.AttributeType;
    table: string;
    expression: string;
    valueType: Specification.DataType;
    valueMetadata: Dataset.ColumnMetadata;
    hints: Prototypes.DataMappingHints;
    constructor(chartElement: Specification.ChartElement, attribute: string, attributeType: Specification.AttributeType, table: string, expression: string, valueType: Specification.DataType, valueMetadata: Dataset.ColumnMetadata, hints: Prototypes.DataMappingHints);
    digest(): {
        name: string;
        chartElement: string[];
        attribute: string;
        attributeType: Specification.AttributeType;
        expression: string;
        valueType: Dataset.DataType;
        hints: any;
    };
}
export declare class SetPlotSegmentFilter extends Action {
    plotSegment: Specification.PlotSegment;
    filter: Specification.Types.Filter;
    constructor(plotSegment: Specification.PlotSegment, filter: Specification.Types.Filter);
    digest(): {
        name: string;
        plotSegment: string[];
        filter: Specification.Types.Filter;
    };
}
export declare class SetPlotSegmentGroupBy extends Action {
    plotSegment: Specification.PlotSegment;
    groupBy: Specification.Types.GroupBy;
    constructor(plotSegment: Specification.PlotSegment, groupBy: Specification.Types.GroupBy);
    digest(): {
        name: string;
        plotSegment: string[];
        groupBy: Specification.Types.GroupBy;
    };
}
export declare class SetScaleAttribute extends Action {
    scale: Specification.Scale;
    attribute: string;
    mapping: Specification.Mapping;
    constructor(scale: Specification.Scale, attribute: string, mapping: Specification.Mapping);
    digest(): {
        name: string;
        scale: string[];
        attribute: string;
        mapping: Specification.Mapping;
    };
}
export declare class SetPageText extends Action {
    pageText: string;
    constructor(pageText: string);
    digest(): {
        name: string;
        pageText: string;
    };
}
export declare class ToggleLegendForScale extends Action {
    scale: string;
    mapping: Specification.ScaleMapping;
    plotSegment: ObjectClass;
    constructor(scale: string, mapping: Specification.ScaleMapping, plotSegment: ObjectClass);
    digest(): {
        name: string;
        scale: string;
        mapping: string;
    };
}
export declare class UpdateChartElementAttribute extends Action {
    chartElement: Specification.ChartElement;
    updates: {
        [name: string]: Specification.AttributeValue;
    };
    constructor(chartElement: Specification.ChartElement, updates: {
        [name: string]: Specification.AttributeValue;
    });
    digest(): {
        name: string;
        chartElement: string[];
        updates: {
            [name: string]: Specification.AttributeValue;
        };
    };
}
export declare class SnapChartElements extends Action {
    element: Specification.ChartElement;
    attribute: string;
    targetElement: Specification.ChartElement;
    targetAttribute: string;
    constructor(element: Specification.ChartElement, attribute: string, targetElement: Specification.ChartElement, targetAttribute: string);
    digest(): {
        name: string;
        element: string[];
        attribute: string;
        targetElement: string[];
        targetAttribute: string;
    };
}
export declare class BindDataToAxis extends Action {
    object: Specification.PlotSegment;
    property: string;
    appendToProperty: string;
    dataExpression: DragData.DataExpression;
    defineCategories: boolean;
    type?: AxisDataBindingType;
    numericalMode?: NumericalMode;
    constructor(object: Specification.PlotSegment, property: string, appendToProperty: string, dataExpression: DragData.DataExpression, defineCategories: boolean, type?: AxisDataBindingType, numericalMode?: NumericalMode);
    digest(): {
        name: string;
        object: string[];
        property: string;
        appendToProperty: string;
        dataExpression: {
            table: string;
            expression: string;
            valueType: Dataset.DataType;
            kind: Dataset.DataKind;
            allowSelectValue: boolean;
        };
        type: Specification.Types.AxisDataBindingType;
        numericalMode: Specification.Types.NumericalMode;
    };
}
export declare class AddLinks extends Action {
    links: Specification.Links;
    constructor(links: Specification.Links);
    digest(): {
        name: string;
        links: Specification.Links<Specification.ObjectProperties>;
    };
}
export declare class UpdateChartAttribute extends Action {
    chart: Specification.Chart;
    updates: {
        [name: string]: Specification.AttributeValue;
    };
    constructor(chart: Specification.Chart, updates: {
        [name: string]: Specification.AttributeValue;
    });
    digest(): {
        name: string;
        updates: {
            [name: string]: Specification.AttributeValue;
        };
    };
}
export declare class SetChartSize extends Action {
    width: number;
    height: number;
    constructor(width: number, height: number);
    digest(): {
        name: string;
        width: number;
        height: number;
    };
}
export declare class SetChartAttribute extends Action {
    attribute: string;
    mapping: Specification.Mapping;
    constructor(attribute: string, mapping: Specification.Mapping);
    digest(): {
        name: string;
        attribute: string;
        mapping: Specification.Mapping;
    };
}
export declare class SetObjectProperty extends Action {
    object: Specification.Object;
    property: string;
    field: number | string | (number | string)[];
    value: Specification.AttributeValue;
    noUpdateState: boolean;
    noComputeLayout: boolean;
    constructor(object: Specification.Object, property: string, field: number | string | (number | string)[], value: Specification.AttributeValue, noUpdateState?: boolean, noComputeLayout?: boolean);
    digest(): {
        name: string;
        object: string[];
        property: string;
        field: string | number | (string | number)[];
        value: Specification.AttributeValue;
        noUpdateState: boolean;
        noComputeLayout: boolean;
    };
}
export declare class DeleteObjectProperty extends Action {
    object: Specification.Object;
    property: string;
    field: number | string | (number | string)[];
    noUpdateState: boolean;
    noComputeLayout: boolean;
    constructor(object: Specification.Object, property: string, field: number | string | (number | string)[], noUpdateState?: boolean, noComputeLayout?: boolean);
    digest(): {
        name: string;
        object: string[];
        property: string;
        field: string | number | (string | number)[];
        noUpdateState: boolean;
        noComputeLayout: boolean;
    };
}
export declare class SetObjectMappingScale extends Action {
    object: Specification.Object;
    property: string;
    scaleId: string;
    constructor(object: Specification.Object, property: string, scaleId: string);
    digest(): {
        name: string;
        object: string[];
        property: string;
        scaleId: string;
    };
}
export declare class ExtendPlotSegment extends Action {
    plotSegment: Specification.PlotSegment;
    extension: string;
    constructor(plotSegment: Specification.PlotSegment, extension: string);
    digest(): {
        name: string;
        plotSegment: string[];
        extension: string;
    };
}
export declare class ReorderChartElement extends Action {
    fromIndex: number;
    toIndex: number;
    constructor(fromIndex: number, toIndex: number);
    digest(): {
        name: string;
        fromIndex: number;
        toIndex: number;
    };
}
export declare class ReorderGlyphMark extends Action {
    glyph: Specification.Glyph;
    fromIndex: number;
    toIndex: number;
    constructor(glyph: Specification.Glyph, fromIndex: number, toIndex: number);
    digest(): {
        name: string;
        glyph: string[];
        fromIndex: number;
        toIndex: number;
    };
}
export declare class SelectGlyph extends Action {
    plotSegment: Specification.PlotSegment;
    glyph: Specification.Glyph;
    glyphIndex: number;
    constructor(plotSegment: Specification.PlotSegment, glyph: Specification.Glyph, glyphIndex?: number);
    digest(): {
        name: string;
        plotSegment: string[];
        glyph: string[];
        glyphIndex: number;
    };
}
export declare class SelectChartElement extends Action {
    chartElement: Specification.ChartElement;
    glyphIndex: number;
    constructor(chartElement: Specification.ChartElement, glyphIndex?: number);
    digest(): {
        name: string;
        glyph: string[];
        glyphIndex: number;
    };
}
export declare class FocusToMarkAttribute extends Action {
    attributeName: string;
    constructor(attributeName: string);
    digest(): {
        name: string;
        attributeName: string;
    };
}
export declare class SetCurrentMappingAttribute extends Action {
    attributeName: string;
    constructor(attributeName: string);
    digest(): {
        name: string;
        attributeName: string;
    };
}
export declare class SetCurrentTool extends Action {
    tool: string;
    options: string;
    constructor(tool: string, options?: string);
    digest(): {
        name: string;
        tool: string;
        options: string;
    };
}
export declare class AddMessage extends Action {
    type: MessageType | string;
    options: {
        title?: string;
        text?: string;
    };
    constructor(type: MessageType | string, options?: {
        title?: string;
        text?: string;
    });
    digest(): {
        name: string;
        type: string | MessageType;
        options: {
            title?: string;
            text?: string;
        };
    };
}
export declare class RemoveMessage extends Action {
    type: MessageType | string;
    constructor(type: MessageType | string);
    digest(): {
        name: string;
        type: string | MessageType;
    };
}
export declare class ClearMessages extends Action {
    constructor();
    digest(): {
        name: string;
    };
}
export declare class OpenNestedEditor extends Action {
    object: Specification.Object<AttributeMap>;
    property: Prototypes.Controls.Property;
    options: NestedChartEditorOptions;
    constructor(object: Specification.Object<AttributeMap>, property: Prototypes.Controls.Property, options: NestedChartEditorOptions);
    digest(): {
        name: string;
    };
}

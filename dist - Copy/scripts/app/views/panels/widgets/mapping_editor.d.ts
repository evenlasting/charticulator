import * as React from "react";
import { EventEmitter, Prototypes, Specification } from "../../../../core";
import { DragData } from "../../../actions";
import { ContextedComponent } from "../../../context_component";
import { CharticulatorPropertyAccessors } from "./manager";
import { AppStore } from "../../../stores";
import { ObjectClass } from "../../../../core/prototypes";
export interface MappingEditorProps {
    parent: Prototypes.Controls.WidgetManager & CharticulatorPropertyAccessors;
    attribute: string;
    type: Specification.AttributeType;
    options: Prototypes.Controls.MappingEditorOptions;
    store?: AppStore;
}
export interface MappingEditorState {
    showNoneAsValue: boolean;
}
export declare class MappingEditor extends React.Component<MappingEditorProps, MappingEditorState> {
    mappingButton: Element;
    noneLabel: HTMLSpanElement;
    scaleMappingDisplay: HTMLSpanElement;
    updateEvents: EventEmitter;
    state: MappingEditorState;
    private beginDataFieldSelection;
    private beginDataFieldValueSelection;
    private initiateValueEditor;
    private setValueMapping;
    clearMapping(): void;
    mapData(data: DragData.DataExpression, hints: Prototypes.DataMappingHints): void;
    componentDidUpdate(): void;
    getTableOrDefault(): string;
    private renderValueEditor;
    private renderCurrentAttributeMapping;
    render(): JSX.Element;
}
export interface DataMappAndScaleEditorProps {
    plotSegment: ObjectClass;
    attribute: string;
    defaultMapping: Specification.Mapping;
    options: Prototypes.Controls.MappingEditorOptions;
    parent: MappingEditor;
    onClose: () => void;
    alignLeft?: boolean;
}
export interface DataMappAndScaleEditorState {
    currentMapping: Specification.Mapping;
}
export declare class DataMappAndScaleEditor extends ContextedComponent<DataMappAndScaleEditorProps, DataMappAndScaleEditorState> {
    state: {
        currentMapping: Specification.Mapping;
    };
    private tokens;
    componentDidMount(): void;
    componentWillUnmount(): void;
    renderScaleEditor(): JSX.Element;
    renderDataPicker(): JSX.Element;
    render(): JSX.Element;
}

import * as React from "react";
import { Prototypes, ZoomInfo } from "../../../../core";
import { HandlesDragContext } from "./common";
export interface HandlesViewProps {
    zoom: ZoomInfo;
    active?: boolean;
    visible?: boolean;
    handles: Prototypes.Handles.Description[];
    isAttributeSnapped?: (attribute: string) => boolean;
    onDragStart?: (handle: Prototypes.Handles.Description, ctx: HandlesDragContext) => void;
}
export interface HandlesViewState {
}
export declare class HandlesView extends React.Component<HandlesViewProps, HandlesViewState> {
    renderHandle(handle: Prototypes.Handles.Description): JSX.Element;
    render(): JSX.Element;
}

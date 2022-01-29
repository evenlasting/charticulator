import { IGroupHeaderProps, IRenderFunction } from "@fluentui/react";
import * as React from "react";
interface CollapsiblePanelProps {
    header: string | IRenderFunction<IGroupHeaderProps>;
    widgets: JSX.Element[];
    isCollapsed?: boolean;
    alignVertically?: boolean;
}
export declare const CollapsiblePanel: React.FunctionComponent<CollapsiblePanelProps>;
export {};

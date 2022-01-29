import { CSSProperties } from "react";
interface CollapsiblePanelProps {
    widgets: JSX.Element[];
    header?: string;
    styles?: CSSProperties;
}
export declare const CustomCollapsiblePanel: ({ widgets, header, styles, }: CollapsiblePanelProps) => JSX.Element;
interface PanelHeaderProps {
    header: string;
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}
export declare const PanelHeader: ({ header, setCollapsed, collapsed, }: PanelHeaderProps) => JSX.Element;
export {};

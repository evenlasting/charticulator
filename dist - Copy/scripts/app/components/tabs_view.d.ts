import * as React from "react";
export interface TabsViewProps {
    tabs: {
        name: string;
        label: string;
        icon?: string;
    }[];
    currentTab: string;
    onSelect: (tabName: string) => void;
}
export declare class TabsView extends React.Component<TabsViewProps, {}> {
    render(): JSX.Element;
}

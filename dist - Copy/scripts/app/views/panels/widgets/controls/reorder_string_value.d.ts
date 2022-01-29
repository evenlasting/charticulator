import * as React from "react";
interface ReorderStringsValueProps {
    items: string[];
    onConfirm: (items: string[], customOrder: boolean) => void;
    allowReset?: boolean;
    onReset?: () => string[];
}
interface ReorderStringsValueState {
    items: string[];
    customOrder: boolean;
}
export declare class ReorderStringsValue extends React.Component<ReorderStringsValueProps, ReorderStringsValueState> {
    state: ReorderStringsValueState;
    render(): JSX.Element;
}
export {};

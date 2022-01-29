import * as React from "react";
import { Expression } from "../../../../../core";
export interface InputFormatProps {
    validate?: (value: string) => Expression.VerifyUserExpressionReport;
    defaultValue?: string;
    placeholder?: string;
    onEnter?: (value: string) => boolean;
    onCancel?: () => void;
    textExpression?: boolean;
    allowNull?: boolean;
}
export interface InputFormatState {
    errorMessage?: string;
    errorIndicator: boolean;
    value?: string;
}
export declare class InputFormat extends React.Component<InputFormatProps, InputFormatState> {
    protected refInput: HTMLInputElement;
    state: InputFormatState;
    componentWillReceiveProps(newProps: InputFormatProps): void;
    protected doEnter(): void;
    protected doCancel(): void;
    render(): JSX.Element;
}

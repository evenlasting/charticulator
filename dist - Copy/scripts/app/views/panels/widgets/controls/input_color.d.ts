import * as React from "react";
import { Color, ColorGradient } from "../../../../../core";
import { AppStore } from "../../../../stores";
export interface InputColorProps {
    defaultValue: Color;
    allowNull?: boolean;
    onEnter: (value: Color) => boolean;
    store?: AppStore;
}
export declare class InputColor extends React.Component<InputColorProps, {}> {
    render(): JSX.Element;
}
export interface InputColorGradientProps {
    defaultValue: ColorGradient;
    onEnter: (value: ColorGradient) => boolean;
}
export declare class InputColorGradient extends React.Component<InputColorGradientProps, {}> {
    render(): JSX.Element;
}

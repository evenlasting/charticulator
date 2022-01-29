import * as Graphics from "../../graphics";
import { LegendClass } from "./legend";
export declare class NumericalColorLegendClass extends LegendClass {
    static classID: string;
    static type: string;
    getLegendSize(): [number, number];
    getGraphics(): Graphics.Element;
}

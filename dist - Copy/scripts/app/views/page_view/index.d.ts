import * as React from "react";
import { AppStore } from "../../stores";
export declare class PageView extends React.PureComponent<{
    store: AppStore;
}, {
    svgDataURL: string;
}> {
    constructor(props: {
        store: AppStore;
    });
    renderImage(): Promise<void>;
    render(): JSX.Element;
}

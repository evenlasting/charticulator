/**
 * @description basic demo
 * @author wangfupeng
 */
import * as React from 'react';
import { AppStore } from "../../stores";
import { IDomEditor, SlateDescendant } from '@wangeditor/editor';
interface IState {
    editor: IDomEditor | null;
    curContent: SlateDescendant[];
}
interface IProps {
    store: AppStore;
}
declare class TextEditor extends React.Component<IProps, IState> {
    state: IState;
    constructor(props: {
        store: AppStore;
    });
    render(): JSX.Element;
    componentWillUnmount(): void;
}
export default TextEditor;

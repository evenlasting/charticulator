"use strict";
/**
 * @description basic demo
 * @author wangfupeng
 */
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
// import '@wangeditor/editor/dist/css/style.css'
const editor_for_react_1 = require("@wangeditor/editor-for-react");
class TextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editor: null,
            curContent: [],
        };
    }
    render() {
        // ----------------------- editor config -----------------------
        const editorConfig = {};
        editorConfig.placeholder = '请输入内容...';
        editorConfig.onCreated = (editor) => {
            this.setState({ editor });
        };
        editorConfig.onChange = (editor) => {
            this.props.store.setPageText(editor.getHtml());
            this.setState({ curContent: editor.children });
        };
        editorConfig.MENU_CONF = {};
        editorConfig.MENU_CONF['uploadImage'] = {
            base64LimitSize: 1 * 1024 * 1024,
            maxFileSize: 1 * 1024 * 1024,
            server: 'https://106.12.198.214:3000/api/upload-img',
            fieldName: 'react-hooks-demo-fileName',
        };
        // 继续补充其他配置~
        // ----------------------- editor content -----------------------
        const defaultContent = [
            { type: 'paragraph', children: [{ text: '' }] },
        ];
        // ----------------------- toolbar config -----------------------
        const toolbarConfig = {
        // 可配置 toolbarKeys: [...]
        };
        return (React.createElement("div", { "data-testid": "editor-container", style: { border: '1px solid #ccc', marginTop: '10px' } },
            React.createElement(editor_for_react_1.Toolbar, { editor: this.state.editor, defaultConfig: toolbarConfig, style: { borderBottom: '1px solid #ccc' } }),
            React.createElement(editor_for_react_1.Editor, { defaultConfig: editorConfig, defaultContent: defaultContent, mode: "default", style: { height: '200px' } })));
    }
    componentWillUnmount() {
        // ----------------------- 销毁 editor -----------------------
        const { editor } = this.state;
        if (editor == null)
            return;
        editor.destroy();
        this.setState({ editor: null });
    }
}
exports.default = TextEditor;
//# sourceMappingURL=text_editor.js.map
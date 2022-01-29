/**
 * @description basic demo
 * @author wangfupeng
 */

import * as React from 'react'
import { AppStore } from "../../stores";
import { IDomEditor, IEditorConfig, SlateDescendant } from '@wangeditor/editor'
// import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'

interface IState {
  editor: IDomEditor | null
  curContent: SlateDescendant[]
}

interface IProps {
    store: AppStore
}


class TextEditor extends React.Component<IProps,IState> {
  state: IState = {
    editor: null,
    curContent: [],
  }

  constructor(props:{ store: AppStore }) {
    super(props)
  }

  render() {
    // ----------------------- editor config -----------------------
    const editorConfig: Partial<IEditorConfig> = {}
    editorConfig.placeholder = '请输入内容...'
    editorConfig.onCreated = (editor: IDomEditor) => {
      this.setState({ editor })
    }
    editorConfig.onChange = (editor: IDomEditor) => {
      this.props.store.setPageText(editor.getHtml());
      this.setState({ curContent: editor.children })
    }
    editorConfig.MENU_CONF = {}
    editorConfig.MENU_CONF['uploadImage'] = {
      base64LimitSize: 1*1024*1024,
      maxFileSize: 1*1024*1024,
      server: 'https://106.12.198.214:3000/api/upload-img', // 上传图片地址
      fieldName: 'react-hooks-demo-fileName',
    }
    // 继续补充其他配置~

    // ----------------------- editor content -----------------------
    const defaultContent = [
      { type: 'paragraph', children: [{ text: '' }] },
    ]

    // ----------------------- toolbar config -----------------------
    const toolbarConfig = {
      // 可配置 toolbarKeys: [...]
    }

    return (

        <div data-testid="editor-container" style={{ border: '1px solid #ccc', marginTop: '10px' }}>
          {/* 渲染 toolbar */}
          <Toolbar
            editor={this.state.editor}
            defaultConfig={toolbarConfig}
            style={{ borderBottom: '1px solid #ccc' }}
          />

          {/* 渲染 editor */}
          <Editor
            defaultConfig={editorConfig}
            defaultContent={defaultContent}
            mode="default"
            style={{ height: '200px' }}
          />
        </div>
    )
  }

  componentWillUnmount() {
    // ----------------------- 销毁 editor -----------------------
    const { editor } = this.state
    if (editor == null) return
    editor.destroy()
    this.setState({ editor: null })
  }
}

export default TextEditor
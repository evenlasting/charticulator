"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableTextView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const fluentui_customized_components_1 = require("../views/panels/widgets/controls/fluentui_customized_components");
const react_1 = require("@fluentui/react");
class EditableTextView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.autofocus || false,
            currentText: this.props.text,
        };
        this.confirmEdit = this.confirmEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.startEdit = this.startEdit.bind(this);
    }
    confirmEdit() {
        const text = this.state.currentText;
        this.setState({
            editing: false,
        });
        if (this.props.onEdit) {
            this.props.onEdit(text);
        }
    }
    cancelEdit() {
        this.setState({
            editing: false,
        });
    }
    startEdit() {
        this.setState({
            editing: true,
            currentText: this.props.text,
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(fluentui_customized_components_1.FluentTextField, null,
                React.createElement(react_1.TextField, { value: this.state.currentText, onRenderLabel: fluentui_customized_components_1.labelRender, type: "text", onChange: (event, newValue) => {
                        this.setState({ currentText: newValue });
                    }, onBlur: () => {
                        if (this.state.currentText == this.props.text) {
                            this.cancelEdit();
                        }
                        else {
                            this.setState({
                                currentText: this.props.text,
                            });
                        }
                    }, onKeyDown: (e) => {
                        if (e.key == "Enter") {
                            this.confirmEdit();
                        }
                        if (e.key == "Escape") {
                            this.cancelEdit();
                        }
                    }, autoFocus: false, styles: {
                        fieldGroup: {
                            border: !this.state.editing && "none",
                        },
                    } }))));
    }
}
exports.EditableTextView = EditableTextView;
//# sourceMappingURL=editable_text_view.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderStringsValue = void 0;
const React = require("react");
const object_list_editor_1 = require("../../object_list_editor");
const button_1 = require("./button");
const components_1 = require("../../../../components");
const strings_1 = require("../../../../../strings");
class ReorderStringsValue extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            items: this.props.items.slice(),
            customOrder: false,
        };
    }
    render() {
        const items = this.state.items.slice();
        return (React.createElement("div", { className: "charticulator__widget-popup-reorder-widget" },
            React.createElement("div", { className: "el-row el-list-view" },
                React.createElement(object_list_editor_1.ReorderListView, { enabled: true, onReorder: (a, b) => {
                        object_list_editor_1.ReorderListView.ReorderArray(items, a, b);
                        this.setState({ items, customOrder: true });
                    } }, items.map((x) => (React.createElement("div", { key: x, className: "el-item" }, x))))),
            React.createElement("div", { className: "el-row" },
                React.createElement(button_1.Button, { icon: "Sort", text: strings_1.strings.reOrder.reverse, onClick: () => {
                        this.setState({
                            items: this.state.items.reverse(),
                            customOrder: true,
                        });
                    } }),
                " ",
                React.createElement(button_1.Button, { icon: "general/sort", text: strings_1.strings.reOrder.sort, onClick: () => {
                        this.setState({
                            items: this.state.items.sort(),
                            customOrder: false,
                        });
                    } }),
                this.props.allowReset && (React.createElement(React.Fragment, null,
                    " ",
                    React.createElement(button_1.Button, { icon: "general/clear", text: strings_1.strings.reOrder.reset, onClick: () => {
                            if (this.props.onReset) {
                                const items = this.props.onReset();
                                this.setState({ items, customOrder: false });
                            }
                        } })))),
            React.createElement("div", { className: "el-row" },
                React.createElement(components_1.ButtonRaised, { text: "OK", onClick: () => {
                        this.props.onConfirm(this.state.items, this.state.customOrder);
                    } }))));
    }
}
exports.ReorderStringsValue = ReorderStringsValue;
//# sourceMappingURL=reorder_string_value.js.map
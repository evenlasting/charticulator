"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePanel = void 0;
const React = require("react");
const R = require("../resources");
const core_1 = require("../../core");
const stores_1 = require("../stores");
const context_component_1 = require("../context_component");
const _1 = require(".");
const actions_1 = require("../actions/actions");
// eslint-disable-next-line
function getObjectIcon(classID) {
    return R.getSVGIcon(core_1.Prototypes.ObjectClasses.GetMetadata(classID).iconPath || "object");
}
class MessagePanel extends context_component_1.ContextedComponent {
    componentDidMount() {
        this.tokens = [
            this.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => this.forceUpdate()),
        ];
    }
    componentWillUnmount() {
        this.tokens.forEach((token) => token.remove());
        this.tokens = [];
    }
    renderUnexpectedState(message) {
        return (React.createElement("div", { className: "attribute-editor charticulator__widget-container" },
            React.createElement("div", { className: "attribute-editor-unexpected" }, message)));
    }
    render() {
        const store = this.props.store;
        const messages = store.messageState;
        return (React.createElement("div", { className: "charticulator__object-list-editor" }, Array.from(messages, ([key]) => key).map((key, index) => {
            const message = messages.get(key);
            if (core_1.messageTypes.find((k) => k === key)) {
                return (React.createElement("div", { key: index },
                    React.createElement("div", { key: index, className: "el-object-item auto-height" },
                        React.createElement("span", { className: "el-text" }, message))));
            }
            else {
                return (React.createElement("div", { key: index },
                    React.createElement("div", { key: index, className: "el-object-item auto-height", onClick: () => {
                            this.store.dispatcher.dispatch(new actions_1.RemoveMessage(key));
                        } },
                        React.createElement("span", { className: "el-text" }, message),
                        React.createElement(_1.SVGImageIcon, { url: R.getSVGIcon("ChromeClose") }))));
            }
        })));
    }
}
exports.MessagePanel = MessagePanel;
//# sourceMappingURL=messsage_box.js.map
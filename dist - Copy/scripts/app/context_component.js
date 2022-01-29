"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainReactContext = exports.ContextedComponent = exports.MainContextTypes = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const stores_1 = require("./stores");
const strings_1 = require("../strings");
exports.MainContextTypes = {
    store: (props, propName, componentName) => {
        if (props[propName] instanceof stores_1.AppStore) {
            return null;
        }
        else {
            return new Error(strings_1.strings.error.storeNotFound(componentName));
        }
    },
};
class ContextedComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    dispatch(action) {
        this.context.store.dispatcher.dispatch(action);
    }
    get store() {
        return this.context.store;
    }
}
exports.ContextedComponent = ContextedComponent;
ContextedComponent.contextTypes = exports.MainContextTypes;
exports.MainReactContext = React.createContext(null);
//# sourceMappingURL=context_component.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileViewNew = void 0;
const React = require("react");
const strings_1 = require("../../../strings");
const actions_1 = require("../../actions");
const import_data_view_1 = require("./import_data_view");
class FileViewNew extends React.Component {
    render() {
        return (React.createElement("section", { className: "charticulator__file-view-content" },
            React.createElement("h1", null, strings_1.strings.mainTabs.new),
            React.createElement(import_data_view_1.ImportDataView, { store: this.props.store, onConfirmImport: (dataset) => {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.ImportDataset(dataset));
                    this.props.onClose();
                } })));
    }
}
exports.FileViewNew = FileViewNew;
//# sourceMappingURL=new_view.js.map
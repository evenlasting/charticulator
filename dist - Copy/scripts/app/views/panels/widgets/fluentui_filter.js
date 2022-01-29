"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPanel = void 0;
const react_1 = require("@fluentui/react");
const React = require("react");
const strings_1 = require("../../../../strings");
const fluentui_customized_components_1 = require("./controls/fluentui_customized_components");
const fluentui_filter_editor_1 = require("./fluentui_filter_editor");
exports.FilterPanel = ({ text, options, manager }) => {
    const [isOpen, setOpen] = React.useState(false);
    switch (options.mode) {
        case "button" /* Button */:
            if (options.value) {
                if (options.value.categories) {
                    text = strings_1.strings.filter.filterBy + options.value.categories.expression;
                }
                if (options.value.expression) {
                    text = strings_1.strings.filter.filterBy + options.value.expression;
                }
            }
            return (React.createElement(React.Fragment, null,
                React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                    React.createElement(react_1.DefaultButton, { id: "filterTarget", text: text, iconProps: {
                            iconName: "Filter",
                        }, onClick: () => {
                            setOpen(!isOpen);
                        }, styles: {
                            root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultComponentsHeight),
                        } })),
                isOpen ? (React.createElement(react_1.Callout, { onDismiss: () => setOpen(false), target: "#filterTarget", directionalHint: react_1.DirectionalHint.topCenter },
                    React.createElement(fluentui_filter_editor_1.FluentUIFilterEditor, { manager: manager, value: options.value, options: options }))) : null));
        case "panel" /* Panel */:
            return (React.createElement(fluentui_filter_editor_1.FluentUIFilterEditor, { manager: manager, value: options.value, options: options }));
    }
};
//# sourceMappingURL=fluentui_filter.js.map
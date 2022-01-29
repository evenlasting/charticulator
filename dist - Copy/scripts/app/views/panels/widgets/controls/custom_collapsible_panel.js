"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelHeader = exports.CustomCollapsiblePanel = void 0;
const React = require("react");
const react_1 = require("react");
const react_2 = require("@fluentui/react");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
//Needs to handle tab index in plot segment
exports.CustomCollapsiblePanel = ({ widgets, header, styles, }) => {
    const [collapsed, setCollapsed] = react_1.useState(false);
    const panelHeader = header !== null && header !== void 0 ? header : "";
    return (React.createElement(React.Fragment, null,
        React.createElement(exports.PanelHeader, { header: panelHeader, setCollapsed: setCollapsed, collapsed: collapsed }),
        React.createElement("div", { style: styles }, !collapsed ? widgets : null)));
};
exports.PanelHeader = ({ header, setCollapsed, collapsed, }) => {
    return (React.createElement("div", { onClick: () => setCollapsed(!collapsed) },
        React.createElement(react_2.DefaultButton, { iconProps: {
                iconName: collapsed ? "ChevronRight" : "ChevronDown",
                styles: {
                    root: {
                        fontSize: "unset",
                        height: 12,
                    },
                },
            }, styles: fluentui_customized_components_1.PanelHeaderStyles, onClick: () => {
                setCollapsed(!collapsed);
            } }),
        React.createElement(react_2.Label, { styles: {
                root: {
                    display: "inline-block",
                    cursor: "pointer",
                },
            } }, header)));
};
//# sourceMappingURL=custom_collapsible_panel.js.map
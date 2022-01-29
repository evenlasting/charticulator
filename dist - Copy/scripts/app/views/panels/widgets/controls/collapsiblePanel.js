"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsiblePanel = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const react_1 = require("@fluentui/react");
const React = require("react");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
exports.CollapsiblePanel = ({ header, widgets, isCollapsed, alignVertically, }) => {
    const [groupState, setIsCollapsed] = React.useState(isCollapsed === undefined ? false : isCollapsed);
    return (React.createElement(fluentui_customized_components_1.FluentGroupedList, { marginLeft: alignVertically ? 0 : null },
        React.createElement(react_1.GroupedList, { groupProps: {
                onRenderHeader: (props) => {
                    return (React.createElement(react_1.GroupHeader, Object.assign({ onRenderGroupHeaderCheckbox: () => null }, props, { styles: fluentui_customized_components_1.groupHeaderStyles, onToggleCollapse: (group) => {
                            setIsCollapsed(!group.isCollapsed);
                        }, onGroupHeaderClick: (group) => {
                            props.onToggleCollapse(group);
                            setIsCollapsed(group.isCollapsed);
                        }, onRenderTitle: typeof header === "string"
                            ? () => React.createElement(react_1.Label, null, header)
                            : header })));
                },
            }, selectionMode: react_1.SelectionMode.none, items: widgets
                .filter((w) => w !== null)
                .map((w, i) => ({
                key: i,
                item: w,
            })), onRenderCell: (nestingDepth, item, itemIndex) => {
                return item && typeof itemIndex === "number" && itemIndex > -1 ? (React.createElement("div", { className: "charticulator__widget-collapsible-panel-item" }, item.item)) : null;
            }, groups: [
                {
                    count: widgets.length,
                    key: "group",
                    level: 0,
                    name: typeof header === "string" ? header : "",
                    startIndex: 0,
                    isCollapsed: groupState,
                },
            ], compact: true, styles: Object.assign(Object.assign({}, fluentui_customized_components_1.groupStyles), { groupIsDropping: {} }), focusZoneProps: {
                handleTabKey: 1,
            } })));
};
//# sourceMappingURL=collapsiblePanel.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteList = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const styles_1 = require("./styles");
class PaletteList extends React.PureComponent {
    render() {
        const palettes = this.props.palettes;
        const groups = [];
        const group2Index = new Map();
        for (const p of palettes) {
            const groupName = p.name.split("/")[0];
            let group;
            if (group2Index.has(groupName)) {
                group = groups[group2Index.get(groupName)][1];
            }
            else {
                group = [];
                group2Index.set(groupName, groups.length);
                groups.push([groupName, group]);
            }
            group.push(p);
        }
        return (React.createElement("ul", null, groups.map((group, index) => {
            return (React.createElement(React.Fragment, { key: `palette-group-wrapper-${index}` },
                React.createElement(react_1.Label, { key: `palette-label-${index}` }, group[0]),
                group[1].map((x) => (React.createElement(react_1.DefaultButton, { key: x.name, onClick: () => this.props.onClick(x), text: x.name.split("/")[1], styles: styles_1.defaultPaletteButtonsStyles, checked: this.props.selected == x })))));
        })));
    }
}
exports.PaletteList = PaletteList;
//# sourceMappingURL=palette_list.js.map
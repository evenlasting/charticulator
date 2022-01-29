"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorGrid = void 0;
const React = require("react");
const color_grid_item_1 = require("./color_grid_item");
const styles_1 = require("./styles");
class ColorGrid extends React.PureComponent {
    render() {
        return (React.createElement(styles_1.ColorGridRowWrapper, null, this.props.colors.map((colors, index) => (React.createElement(styles_1.ColorGridColumnWrapper, { key: `column-color-${index}` }, colors.map((color, i) => (React.createElement(color_grid_item_1.ColorGridItem, { key: `color-item-${i}`, color: color, onClick: this.props.onClick, defaultValue: this.props.defaultValue }))))))));
    }
}
exports.ColorGrid = ColorGrid;
//# sourceMappingURL=color_grid.js.map
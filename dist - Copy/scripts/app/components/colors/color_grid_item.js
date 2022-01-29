"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorGridItem = void 0;
const fluentui_color_picker_1 = require("../fluentui_color_picker");
const React = require("react");
const styled_components_1 = require("styled-components");
const ColorItem = styled_components_1.default.span `
  display: block;
  box-sizing: border-box;
  border: 1px solid #8a8886;
  width: 20px;
  height: 20px;
  margin: 4px;
  background-color: ${(props) => props.color};
  cursor: pointer;
`;
class ColorGridItem extends React.Component {
    render() {
        return (React.createElement("span", { onClick: () => {
                if (this.props.onClick) {
                    this.props.onClick(this.props.color);
                }
            } },
            React.createElement(ColorItem, { color: fluentui_color_picker_1.colorToCSS(this.props.color) })));
    }
}
exports.ColorGridItem = ColorGridItem;
//# sourceMappingURL=color_grid_item.js.map
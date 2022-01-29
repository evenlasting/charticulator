"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomGradientButtonsWrapper = exports.ColorGradientWrapper = exports.ColorCell = exports.ColorRowWrapper = exports.TabWrapper = exports.PalettesWrapper = exports.colorTextInputStyles = exports.dropdownStyles = exports.deleteColorStyles = exports.colorPalettesLabelStyles = exports.defaultActionButtonsStyles = void 0;
const styled_components_1 = require("styled-components");
exports.defaultActionButtonsStyles = {
    root: {
        height: 24,
        marginRight: 5,
    },
};
exports.colorPalettesLabelStyles = {
    root: {
        marginLeft: 5,
        display: "inline-block",
        fontWeight: 400,
        cursor: "pointer",
    },
};
exports.deleteColorStyles = {
    root: {
        height: 20,
        width: 20,
        minWidth: "unset",
        padding: "unset",
        border: "unset",
    },
};
exports.dropdownStyles = {
    root: {
        display: "inline-block",
        height: 24,
        width: "100%",
    },
    dropdown: {
        height: 24,
    },
    title: {
        lineHeight: 24,
        height: 24,
        fontWeight: 600,
    },
    caretDown: {
        lineHeight: 24,
        height: 24,
    },
};
exports.colorTextInputStyles = {
    root: {
        display: "inline-block",
        height: "unset",
        marginLeft: 5,
        marginRight: 5,
    },
    fieldGroup: {
        height: "unset",
    },
};
exports.PalettesWrapper = styled_components_1.default.div `
  cursor: pointer;

  &:hover {
    background-color: #f3f2f1;
  }
`;
exports.TabWrapper = styled_components_1.default.div `
  max-height: 300px;
  overflow-y: auto;
`;
exports.ColorRowWrapper = styled_components_1.default.div `
  margin-top: 5px;
  display: flex;
`;
exports.ColorCell = styled_components_1.default.span `
  background: ${(props) => props.$color};
  width: 20px;
  height: 20px;
  display: inline-block;
  cursor: pointer;
  border: 1px solid #8a8886;
  margin-right: 5px;
`;
exports.ColorGradientWrapper = styled_components_1.default.span `
  width: 50%;
  cursor: pointer;
`;
exports.CustomGradientButtonsWrapper = styled_components_1.default.div `
  display: flex;
  margin-top: 10px;
`;
//# sourceMappingURL=styles.js.map
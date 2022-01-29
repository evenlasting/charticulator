"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorsPickerLeftSectionWrapper = exports.ColorsPickerWrapper = exports.ColorsSectionWrapper = exports.PickersSection = exports.PickersSectionWrapper = exports.ColorGridColumnWrapper = exports.ColorGridRowWrapper = exports.NullButtonWrapper = exports.defaultPaletteButtonsStyles = exports.defaultNoneButtonStyles = void 0;
const styled_components_1 = require("styled-components");
exports.defaultNoneButtonStyles = {
    root: {
        border: "unset",
        width: "100%",
        padding: "unset",
        height: 24,
    },
    label: {
        textAlign: "start",
    },
};
exports.defaultPaletteButtonsStyles = {
    root: {
        border: "unset",
        height: 24,
        width: "100%",
    },
    label: {
        textAlign: "start",
        fontWeight: 400,
    },
};
exports.NullButtonWrapper = styled_components_1.default.div `
  border-top: 1px solid #e6e6e6;
`;
exports.ColorGridRowWrapper = styled_components_1.default.div `
  display: flex;
  flex-direction: row;
`;
exports.ColorGridColumnWrapper = styled_components_1.default.div `
  display: flex;
  flex-direction: column;
`;
exports.PickersSectionWrapper = styled_components_1.default.div `
  margin: 5px;
  width: 150px;
  display: flex;
  flex-direction: column;
`;
exports.PickersSection = styled_components_1.default.div `
  flex-grow: 1;
`;
exports.ColorsSectionWrapper = styled_components_1.default.div `
  margin: 5px;
`;
exports.ColorsPickerWrapper = styled_components_1.default.div `
  display: flex;
`;
exports.ColorsPickerLeftSectionWrapper = styled_components_1.default.div `
  border-right: 1px solid #e6e6e6;
  display: flex;
`;
//# sourceMappingURL=styles.js.map
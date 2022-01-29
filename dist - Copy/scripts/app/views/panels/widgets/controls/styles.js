"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolTipHostStyles = exports.ImageMappingTextFieldStyles = exports.ImageMappingDragStateWrapper = void 0;
const styled_components_1 = require("styled-components");
exports.ImageMappingDragStateWrapper = styled_components_1.default.div `
  border: 1px solid #fa9e13;
  padding-left: 4px;
  width: 96%;
  background: #fa9e136b;
`;
exports.ImageMappingTextFieldStyles = {
    root: {
        height: 25,
    },
    wrapper: {
        height: 25,
    },
    field: {
        height: 25,
    },
};
exports.ToolTipHostStyles = {
    root: {
        width: "100%",
        display: "unset",
        paddingLeft: "4px",
        paddingRight: "4px",
    },
};
//# sourceMappingURL=styles.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelHeaderStyles = exports.defaultStyle = exports.FluentDatePickerWrapper = exports.FluentDropdownWrapper = exports.FluentDropdown = exports.PlaceholderStyle = exports.groupStyles = exports.groupHeaderStyles = exports.defultComponentsHeight = exports.FluentGroupedList = exports.NestedChartButtonsWrapper = exports.labelRender = exports.defaultLabelStyle = exports.defaultFontWeight = exports.FluentLayoutItem = exports.FluentColumnLayout = exports.FluentDataBindingMenuLabel = exports.FluentDataBindingMenuItem = exports.FluentRowLayout = exports.FluentCheckbox = exports.FluentTextField = exports.FluentActionButton = exports.FluentLabelHeader = exports.FluentButton = exports.defultBindButtonSize = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const styled_components_1 = require("styled-components");
exports.defultBindButtonSize = {
    height: "24px",
    width: "24px",
};
exports.FluentButton = styled_components_1.default.div `
  margin-top: ${({ marginTop }) => marginTop || "24px"};
  margin-left: ${({ marginLeft }) => marginLeft || "unset"};
  display: inline-block;
  padding: 0px ${({ paddingRight }) => paddingRight || "4px"} 0px 0px;
  height: ${exports.defultBindButtonSize.height};
  line-height: ${exports.defultBindButtonSize.height};
  button {
    padding: 4px;
  }
`;
exports.FluentLabelHeader = styled_components_1.default.div `
  margin-bottom: ${({ marginBottom }) => marginBottom || "24px"};
  margin-top: ${({ marginTop }) => marginTop || "20px"};
  margin-right: ${({ marginRight: marginLeft }) => marginLeft || "2px"};
`;
exports.FluentActionButton = styled_components_1.default.div `
  button {
    border: 1px solid;
    width: 100%;
    overflow: hidden;
  }
`;
exports.FluentTextField = styled_components_1.default.div `
  flex: 1;
  * {
    flex: 1;
  }
`;
exports.FluentCheckbox = styled_components_1.default.div `
  margin-bottom: 2px;
`;
exports.FluentRowLayout = styled_components_1.default.div `
  display: flex;
  flex-direction: row;
`;
exports.FluentDataBindingMenuItem = styled_components_1.default.div `
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  height: 26px;
  line-height: unset;
  background-color: ${({ backgroundColor }) => backgroundColor || null};
  &:hover {
    background-color: ${({ backgroundColorHover }) => backgroundColorHover || null};
  }
  .ms-Dropdown-container {
    margin-top: 2px;
  }
`;
exports.FluentDataBindingMenuLabel = styled_components_1.default.div `
  flex: 1;
  margin-left: 5px;
`;
exports.FluentColumnLayout = styled_components_1.default.div `
  display: flex;
  flex-direction: column;
`;
exports.FluentLayoutItem = styled_components_1.default.div `
  flex: ${({ flex }) => flex || "1"};
`;
exports.defaultFontWeight = 400;
exports.defaultLabelStyle = {
    root: {
        fontWeight: exports.defaultFontWeight,
        lineHeight: "unset",
    },
};
exports.labelRender = ({ label, }) => (label ? React.createElement(react_1.Label, { styles: exports.defaultLabelStyle }, label) : null);
exports.NestedChartButtonsWrapper = styled_components_1.default.div `
  margin-top: 5px;
`;
exports.FluentGroupedList = styled_components_1.default.div `
  .charticulator__widget-collapsible-panel-item {
    margin-left: ${({ marginLeft }) => marginLeft != null ? marginLeft : "25px"};
    margin-right: 15px;
    min-width: 270px;
  }

  .ms-List-surface .ms-List-cell .ms-List-cell:last-child {
    margin-bottom: 5px;
  }

  .ms-List-surface .ms-List-page .ms-List-cell {
    min-height: 24px;
  }
`;
exports.defultComponentsHeight = {
    height: "24px",
    lineHeight: "unset",
};
exports.groupHeaderStyles = {
    title: {
        fontWeight: 600,
    },
    headerCount: {
        display: "none",
    },
    groupHeaderContainer: Object.assign({}, exports.defultComponentsHeight),
    expand: Object.assign(Object.assign({}, exports.defultBindButtonSize), { fontSize: "unset" }),
    dropIcon: {
        display: "none",
    },
};
exports.groupStyles = {
    group: {
        borderTop: "1px #C8C6C4 solid",
    },
};
exports.PlaceholderStyle = styled_components_1.default.div `
  input {
    ::-webkit-input-placeholder {
      /* Chrome/Opera/Safari */
      color: ${({ color }) => color || "lightgray"};
    }
    ::-moz-placeholder {
      /* Firefox 19+ */
      color: ${({ color }) => color || "lightgray"};
    }
    :-ms-input-placeholder {
      /* IE 10+ */
      color: ${({ color }) => color || "lightgray"};
    }
    :-moz-placeholder {
      /* Firefox 18- */
      color: ${({ color }) => color || "lightgray"};
    }
  }
`;
exports.FluentDropdown = styled_components_1.default.div `
  & svg {
    stroke: rgb(128, 128, 128) !important;
    fill: rgb(128, 128, 128) !important;
  }
  display: inline;
`;
exports.FluentDropdownWrapper = styled_components_1.default.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 20px;
`;
exports.FluentDatePickerWrapper = styled_components_1.default.div `
  .ms-TextField-fieldGroup {
    height: 24px;
  }
  i {
    padding: 4px 5px 5px;
    line-height: unset;
  }
`;
exports.defaultStyle = {
    field: {
        defultComponentsHeight: exports.defultComponentsHeight,
        height: "20px",
    },
    fieldGroup: exports.defultComponentsHeight,
    dropdown: Object.assign({ boxSizing: "unset" }, exports.defultComponentsHeight),
    dropdownOptionText: Object.assign({ boxSizing: "unset" }, exports.defultComponentsHeight),
    dropdownItem: Object.assign({ boxSizing: "unset", minHeight: "25px" }, exports.defultComponentsHeight),
    dropdownItemHeader: Object.assign({ boxSizing: "unset" }, exports.defultComponentsHeight),
    dropdownItemSelected: Object.assign({ boxSizing: "unset", minHeight: "24px", lineHeight: "24px" }, exports.defultComponentsHeight),
    caretDown: Object.assign({ boxSizing: "unset" }, exports.defultComponentsHeight),
    caretDownWrapper: Object.assign({ boxSizing: "unset", marginTop: "5px" }, exports.defultComponentsHeight),
    title: Object.assign(Object.assign({ boxSizing: "unset" }, exports.defultComponentsHeight), { height: "22px", lineHeight: "unset" }),
    label: {
        lineHeight: "unset",
    },
};
exports.PanelHeaderStyles = {
    root: {
        border: "unset",
        height: 24,
        width: 24,
        display: "inline",
        padding: 0,
        minWidth: 24,
    },
    textContainer: {
        flexGrow: "unset",
    },
};
//# sourceMappingURL=fluentui_customized_components.js.map
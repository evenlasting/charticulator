"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullButton = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const styles_1 = require("./styles");
class NullButton extends React.Component {
    render() {
        return (React.createElement(React.Fragment, null, this.props.allowNull ? (React.createElement(styles_1.NullButtonWrapper, null,
            React.createElement(react_1.DefaultButton, { text: "none", iconProps: {
                    iconName: "ChromeClose",
                }, styles: styles_1.defaultNoneButtonStyles, onClick: () => {
                    this.props.onPick(null);
                } }))) : null));
    }
}
exports.NullButton = NullButton;
//# sourceMappingURL=null_button.js.map
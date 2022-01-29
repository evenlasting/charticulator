"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomGradientButtons = void 0;
const React = require("react");
const react_1 = require("@fluentui/react");
const strings_1 = require("../../../strings");
const core_1 = require("../../../core");
const styles_1 = require("./styles");
const fluent_ui_gradient_picker_1 = require("../fluent_ui_gradient_picker");
class CustomGradientButtons extends React.Component {
    render() {
        const currentGradient = this.props.currentGradient;
        const dropdownItems = [
            { key: fluent_ui_gradient_picker_1.Colorspace.HCL, text: "HCL" },
            { key: fluent_ui_gradient_picker_1.Colorspace.LAB, text: "Lab" },
        ];
        return (React.createElement(styles_1.CustomGradientButtonsWrapper, null,
            React.createElement("div", null,
                React.createElement(react_1.DefaultButton, { iconProps: {
                        iconName: "Add",
                    }, text: strings_1.strings.scaleEditor.add, onClick: () => {
                        const newGradient = core_1.deepClone(currentGradient);
                        newGradient.colors.push({ r: 150, g: 150, b: 150 });
                        this.props.selectGradient(newGradient, true);
                    }, styles: styles_1.defaultActionButtonsStyles })),
            React.createElement("div", null,
                React.createElement(react_1.DefaultButton, { iconProps: {
                        iconName: "Sort",
                    }, text: strings_1.strings.scaleEditor.reverse, onClick: () => {
                        const newGradient = core_1.deepClone(currentGradient);
                        newGradient.colors.reverse();
                        this.props.selectGradient(newGradient, true);
                    }, styles: styles_1.defaultActionButtonsStyles })),
            React.createElement(react_1.Dropdown, { options: dropdownItems, onChange: (event, option) => {
                    if (option) {
                        const newGradient = core_1.deepClone(currentGradient);
                        newGradient.colorspace = option.key;
                        this.props.selectGradient(newGradient, true);
                    }
                }, defaultSelectedKey: currentGradient.colorspace, styles: styles_1.dropdownStyles })));
    }
}
exports.CustomGradientButtons = CustomGradientButtons;
//# sourceMappingURL=custom_gradient_buttons.js.map
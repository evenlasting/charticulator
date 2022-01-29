"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDialog = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const react_1 = require("react");
const react_2 = require("@fluentui/react");
const R = require("../../resources");
const strings_1 = require("../../../strings");
const utils_1 = require("../../utils");
const actions_1 = require("../../actions");
const components_1 = require("../../components");
const core_1 = require("../../../core");
const dialogContentProps = {
    type: react_2.DialogType.normal,
    title: strings_1.strings.dialog.deleteChart,
    subText: strings_1.strings.dialog.resetConfirm,
};
exports.DeleteDialog = ({ context }) => {
    const [isHidden, setIsHidden] = react_1.useState(true);
    const onClick = react_1.useCallback(() => {
        if (utils_1.isInIFrame()) {
            setIsHidden(false);
        }
        else {
            if (confirm(strings_1.strings.dialog.resetConfirm)) {
                new actions_1.Actions.Reset().dispatch(context.store.dispatcher);
            }
        }
    }, [context]);
    const toggleHideDialog = react_1.useCallback(() => {
        setIsHidden(true);
    }, []);
    const onDeleteChart = react_1.useCallback(() => {
        context.store.dispatcher.dispatch(new actions_1.Actions.Reset());
        setIsHidden(true);
        core_1.getDefaultColorGeneratorResetFunction()();
    }, [context]);
    return (React.createElement(React.Fragment, null,
        React.createElement(components_1.MenuButton, { url: R.getSVGIcon("toolbar/trash"), title: strings_1.strings.menuBar.reset, text: strings_1.strings.menuBar.reset, onClick: onClick }),
        React.createElement(react_2.Dialog, { hidden: isHidden, onDismiss: toggleHideDialog, dialogContentProps: dialogContentProps },
            React.createElement(react_2.DialogFooter, null,
                React.createElement(react_2.DefaultButton, { styles: core_1.primaryButtonStyles, onClick: onDeleteChart, text: strings_1.strings.button.yes }),
                React.createElement(react_2.DefaultButton, { onClick: toggleHideDialog, text: strings_1.strings.button.no })))));
};
//# sourceMappingURL=delete_dialog.js.map
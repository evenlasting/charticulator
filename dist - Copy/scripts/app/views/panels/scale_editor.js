"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleEditor = void 0;
const React = require("react");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const components_1 = require("../../components");
const stores_1 = require("../../stores");
const fluentui_manager_1 = require("./widgets/fluentui_manager");
const categorical_legend_1 = require("../../../core/prototypes/legends/categorical_legend");
const strings_1 = require("../../../strings");
const react_1 = require("@fluentui/react");
const observer_1 = require("./widgets/observer");
const panel_styles_1 = require("./panel_styles");
class ScaleEditor extends React.Component {
    componentDidMount() {
        this.token = this.props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => {
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        this.token.remove();
    }
    // eslint-disable-next-line
    render() {
        var _a;
        const { scale, store, scaleMapping } = this.props;
        const scaleClass = store.chartManager.getClassById(scale._id);
        const manager = new fluentui_manager_1.FluentUIWidgetManager(this.props.store, scaleClass);
        manager.onEditMappingHandler = (attribute, mapping) => {
            new actions_1.Actions.SetScaleAttribute(scale, attribute, mapping).dispatch(store.dispatcher);
        };
        let canAddLegend = true;
        if (scale.classID.startsWith("scale.format") ||
            scale.classID === "scale.categorical<string,image>") {
            canAddLegend = false;
        }
        let canExtendLegend = false;
        if (scale.classID === "scale.categorical<string,color>" ||
            scale.classID === "scale.categorical<date,color>") {
            canExtendLegend = true;
        }
        const currentSelection = this.props.store.currentMappingAttributeFocus;
        return (React.createElement(panel_styles_1.ScaleEditorWrapper, { className: "scale-editor-view" },
            React.createElement("div", { className: "attribute-editor" },
                React.createElement("section", { className: "attribute-editor-element" },
                    React.createElement("div", { className: "header" },
                        React.createElement(components_1.EditableTextView, { text: scale.properties.name, onEdit: (newText) => {
                                new actions_1.Actions.SetObjectProperty(scale, "name", null, newText, true).dispatch(store.dispatcher);
                            } })),
                    manager.vertical(...scaleClass.getAttributePanelWidgets(manager)),
                    React.createElement("div", { className: "action-buttons" },
                        canExtendLegend ? (React.createElement(React.Fragment, null,
                            React.createElement(react_1.DefaultButton, { iconProps: {
                                    iconName: "Add",
                                }, text: strings_1.strings.scaleEditor.add, onClick: () => {
                                    manager.eventManager.notify(observer_1.EventType.UPDATE_FIELD, {
                                        property: "autoDomainMin",
                                    }, false);
                                    manager.eventManager.notify(observer_1.EventType.UPDATE_FIELD, {
                                        property: "autoDomainMax",
                                    }, false);
                                    const mappingsKey = Object.keys(scale.properties.mapping);
                                    const theLastMapping = mappingsKey[mappingsKey.length - 1];
                                    const value = scale.properties.mapping[theLastMapping];
                                    new actions_1.Actions.SetObjectProperty(scale, "mapping", categorical_legend_1.ReservedMappingKeyNamePrefix + core_1.uniqueID(), value, true, true).dispatch(this.props.store.dispatcher);
                                } }),
                            React.createElement(react_1.DefaultButton, { iconProps: {
                                    iconName: "Remove",
                                }, disabled: ((_a = currentSelection === null || currentSelection === void 0 ? void 0 : currentSelection.length) !== null && _a !== void 0 ? _a : 0) === 0, text: strings_1.strings.scaleEditor.removeSelected, onClick: () => {
                                    if ((currentSelection === null || currentSelection === void 0 ? void 0 : currentSelection.length) > 0) {
                                        new actions_1.Actions.DeleteObjectProperty(scale, "mapping", currentSelection, false, true).dispatch(this.props.store.dispatcher);
                                        new actions_1.Actions.SetCurrentMappingAttribute(null).dispatch(this.props.store.dispatcher);
                                    }
                                } }))) : null,
                        canAddLegend ? (React.createElement(react_1.DefaultButton, { iconProps: {
                                iconName: "CharticulatorLegend",
                            }, text: store.isLegendExistForScale(scale._id)
                                ? strings_1.strings.scaleEditor.removeLegend
                                : strings_1.strings.scaleEditor.addLegend, onClick: () => {
                                new actions_1.Actions.ToggleLegendForScale(scale._id, scaleMapping, this.props.plotSegment).dispatch(store.dispatcher);
                            } })) : null)))));
    }
}
exports.ScaleEditor = ScaleEditor;
//# sourceMappingURL=scale_editor.js.map
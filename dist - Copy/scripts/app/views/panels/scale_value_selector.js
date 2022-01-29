"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleValueSelector = void 0;
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const R = require("../../resources");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const components_1 = require("../../components");
const stores_1 = require("../../stores");
const fluentui_manager_1 = require("./widgets/fluentui_manager");
class ScaleValueSelector extends React.Component {
    constructor(props) {
        super(props);
        const parsedExpression = core_1.Expression.parse(this.props.scaleMapping.expression);
        let selectedIndex;
        try {
            selectedIndex = parsedExpression.args[0]
                .args[0].args[1].value;
        }
        catch (ex) {
            selectedIndex = 0;
        }
        this.state = {
            selectedIndex,
        };
    }
    componentDidMount() {
        this.token = this.props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => {
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        this.token.remove();
    }
    render() {
        const { scale, store, scaleMapping } = this.props;
        const scaleClass = store.chartManager.getClassById(scale._id);
        const manager = new fluentui_manager_1.FluentUIWidgetManager(this.props.store, scaleClass);
        manager.onEditMappingHandler = (attribute, mapping) => {
            new actions_1.Actions.SetScaleAttribute(scale, attribute, mapping).dispatch(store.dispatcher);
        };
        let canSelectValue = false;
        if (typeof this.props.onSelect === "function") {
            canSelectValue = true;
        }
        return (React.createElement("div", { className: "scale-editor-view", style: { width: "400px", padding: "10px" } },
            React.createElement("div", { className: "attribute-editor" },
                React.createElement("section", { className: "attribute-editor-element" },
                    React.createElement("div", { className: "header" },
                        React.createElement(components_1.EditableTextView, { text: scale.properties.name, onEdit: (newText) => {
                                new actions_1.Actions.SetObjectProperty(scale, "name", null, newText, true).dispatch(store.dispatcher);
                            } })),
                    manager.sectionHeader("Color Mapping"),
                    manager.vertical(manager.scrollList(Object.keys(scale.properties.mapping).map((key, selectedIndex) => {
                        return (React.createElement("div", { className: this.props.onSelect &&
                                this.state.selectedIndex === selectedIndex
                                ? "is-active"
                                : "", onClick: () => {
                                this.setState({ selectedIndex });
                                if (selectedIndex != null && this.props.onSelect) {
                                    this.props.onSelect(selectedIndex);
                                }
                            } }, manager.horizontal([2, 3], manager.label(key), manager.inputColor({
                            property: "mapping",
                            field: key,
                            noComputeLayout: true,
                        }, {
                            labelKey: key,
                            noDefaultMargin: true,
                            stopPropagation: true,
                        }))));
                    }))),
                    canSelectValue ? (React.createElement("div", { className: "action-buttons" },
                        React.createElement(components_1.ButtonRaised, { url: R.getSVGIcon("CharticulatorLegend"), text: store.isLegendExistForScale(scale._id)
                                ? "Remove Legend"
                                : "Add Legend", onClick: () => {
                                new actions_1.Actions.ToggleLegendForScale(scale._id, scaleMapping, null).dispatch(store.dispatcher);
                            } }))) : null))));
    }
}
exports.ScaleValueSelector = ScaleValueSelector;
//# sourceMappingURL=scale_value_selector.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentUIFilterEditor = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const react_1 = require("@fluentui/react");
const React = require("react");
const core_1 = require("../../../../core");
const strings_1 = require("../../../../strings");
const actions_1 = require("../../../actions");
const data_field_selector_1 = require("../../dataset/data_field_selector");
const fluentui_customized_components_1 = require("./controls/fluentui_customized_components");
const fluentui_input_expression_1 = require("./controls/fluentui_input_expression");
class FluentUIFilterEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.state = this.getDefaultState(this.props.value);
    }
    getDefaultState(value) {
        let filterType = "none";
        if (value) {
            if (value.expression) {
                filterType = "expression";
            }
            if (value.categories) {
                filterType = "categories";
            }
        }
        return {
            type: filterType,
            currentValue: value,
        };
    }
    emitUpdateFilter(newValue) {
        if (this.props.options.target.property) {
            this.props.manager.emitSetProperty(this.props.options.target.property, newValue);
        }
        if (this.props.options.target.plotSegment) {
            this.props.manager.store.dispatcher.dispatch(new actions_1.Actions.SetPlotSegmentFilter(this.props.options.target.plotSegment, newValue));
        }
        this.setState(this.getDefaultState(newValue));
    }
    // eslint-disable-next-line
    render() {
        const { manager, options } = this.props;
        const value = this.state.currentValue;
        let typedControls = [];
        switch (this.state.type) {
            case "expression":
                {
                    typedControls = [
                        React.createElement(fluentui_input_expression_1.FluentInputExpression, { validate: (newValue) => {
                                if (newValue) {
                                    return manager.store.verifyUserExpressionWithTable(newValue, options.table, { expectedTypes: ["boolean"] });
                                }
                                else {
                                    return {
                                        pass: true,
                                    };
                                }
                            }, allowNull: true, value: this.state.currentValue.expression, onEnter: (newValue) => {
                                this.emitUpdateFilter({
                                    expression: newValue,
                                });
                                return true;
                            }, label: strings_1.strings.filter.expression }),
                    ];
                }
                break;
            case "categories":
                {
                    const keysSorted = [];
                    if (value && value.categories) {
                        for (const k in value.categories.values) {
                            // eslint-disable-next-line
                            if (value.categories.values.hasOwnProperty(k)) {
                                keysSorted.push(k);
                            }
                        }
                        keysSorted.sort((a, b) => (a < b ? -1 : 1));
                    }
                    typedControls = [
                        manager.vertical(manager.label(strings_1.strings.filter.column), React.createElement("div", { className: "charticulator__filter-editor-column-selector" },
                            React.createElement(data_field_selector_1.DataFieldSelector, { defaultValue: {
                                    table: options.table,
                                    expression: this.state.currentValue.categories.expression,
                                }, table: options.table, datasetStore: this.props.manager.store, kinds: [core_1.Specification.DataKind.Categorical], onChange: (field) => {
                                    // Enumerate all values of this field
                                    if (field.expression) {
                                        const parsed = core_1.Expression.parse(field.expression);
                                        const table = this.props.manager.store.chartManager.dataflow.getTable(field.table);
                                        const exprValues = {};
                                        for (let i = 0; i < table.rows.length; i++) {
                                            const rowContext = table.getRowContext(i);
                                            exprValues[parsed.getStringValue(rowContext)] = true;
                                        }
                                        this.emitUpdateFilter({
                                            categories: {
                                                expression: field.expression,
                                                values: exprValues,
                                            },
                                        });
                                    }
                                } }))),
                        keysSorted.length > 0
                            ? manager.vertical(manager.label(strings_1.strings.filter.values), React.createElement("div", { className: "charticulator__filter-editor-values-selector" },
                                React.createElement("div", { className: "el-buttons" },
                                    React.createElement(react_1.DefaultButton, { text: strings_1.strings.filter.selectAll, onClick: () => {
                                            for (const key in value.categories.values) {
                                                // eslint-disable-next-line
                                                if (value.categories.values.hasOwnProperty(key)) {
                                                    value.categories.values[key] = true;
                                                }
                                            }
                                            this.emitUpdateFilter({
                                                categories: {
                                                    expression: value.categories.expression,
                                                    values: value.categories.values,
                                                },
                                            });
                                        } }),
                                    " ",
                                    React.createElement(react_1.DefaultButton, { text: strings_1.strings.filter.clear, onClick: () => {
                                            for (const key in value.categories.values) {
                                                // eslint-disable-next-line
                                                if (value.categories.values.hasOwnProperty(key)) {
                                                    value.categories.values[key] = false;
                                                }
                                            }
                                            this.emitUpdateFilter({
                                                categories: {
                                                    expression: value.categories.expression,
                                                    values: value.categories.values,
                                                },
                                            });
                                        } })),
                                React.createElement("div", null, keysSorted.map((key) => (React.createElement("div", { key: key },
                                    React.createElement(fluentui_customized_components_1.FluentCheckbox, null,
                                        React.createElement(react_1.Checkbox, { checked: value.categories.values[key], label: key, onChange: (ev, newValue) => {
                                                value.categories.values[key] = newValue;
                                                this.emitUpdateFilter({
                                                    categories: {
                                                        expression: value.categories.expression,
                                                        values: value.categories.values,
                                                    },
                                                });
                                            } }))))))))
                            : null,
                    ];
                }
                break;
        }
        return (React.createElement("div", { className: "charticulator__filter-editor" },
            React.createElement("div", { className: "attribute-editor" },
                React.createElement("div", { className: "header" }, strings_1.strings.filter.editFilter),
                manager.vertical(React.createElement(react_1.Dropdown, { label: strings_1.strings.filter.filterType, styles: {
                        root: {
                            minWidth: 105,
                        },
                    }, onRenderLabel: fluentui_customized_components_1.labelRender, options: [
                        strings_1.strings.filter.none,
                        strings_1.strings.filter.categories,
                        strings_1.strings.filter.expression,
                    ].map((type) => {
                        return {
                            key: type.toLowerCase(),
                            text: type,
                        };
                    }), selectedKey: this.state.type, onChange: (event, newValue) => {
                        if (this.state.type != newValue.key) {
                            if (newValue.key == "none") {
                                this.emitUpdateFilter(null);
                            }
                            else {
                                this.setState({
                                    type: newValue.key,
                                    currentValue: {
                                        expression: "",
                                        categories: {
                                            expression: "",
                                            values: {},
                                        },
                                    },
                                });
                            }
                        }
                    } }), ...typedControls))));
    }
}
exports.FluentUIFilterEditor = FluentUIFilterEditor;
//# sourceMappingURL=fluentui_filter_editor.js.map
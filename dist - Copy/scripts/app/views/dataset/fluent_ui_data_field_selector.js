"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFieldSelector = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const core_1 = require("../../../core");
const components_1 = require("../../components");
const R = require("../../resources");
const utils_1 = require("../../utils");
const common_1 = require("./common");
const controls_1 = require("../panels/widgets/controls");
class DataFieldSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getDefaultState(props);
    }
    getDefaultState(props) {
        let expression = this.props.defaultValue
            ? this.props.defaultValue.expression
            : null;
        let expressionAggregation = null;
        if (props.useAggregation) {
            if (expression != null) {
                const parsed = core_1.Expression.parse(expression);
                if (parsed instanceof core_1.Expression.FunctionCall) {
                    expression = parsed.args[0].toString();
                    expressionAggregation = parsed.name;
                }
            }
        }
        if (props.defaultValue) {
            for (const f of this.getAllFields()) {
                if (props.defaultValue.table != null &&
                    f.table != props.defaultValue.table) {
                    continue;
                }
                if (expression != null) {
                    if (f.expression == expression) {
                        return {
                            currentSelection: f,
                            currentSelectionAggregation: expressionAggregation,
                            currentSelections: [f],
                            currentSelectionsAggregations: [expressionAggregation],
                        };
                    }
                }
            }
        }
        return {
            currentSelection: null,
            currentSelectionAggregation: null,
            currentSelections: [],
            currentSelectionsAggregations: [],
        };
    }
    get value() {
        if (this.props.multiSelect) {
            return this.state.currentSelections;
        }
        else {
            return this.state.currentSelection;
        }
    }
    getAllFields() {
        const fields = this.getFields();
        const r = [];
        for (const item of fields) {
            r.push(item);
            if (item.derived) {
                for (const ditem of item.derived) {
                    r.push(ditem);
                }
            }
        }
        return r;
    }
    getFields() {
        const store = this.props.datasetStore;
        const table = store
            .getTables()
            .filter((table) => table.name == this.props.table || this.props.table == null)[0];
        const columns = table.columns;
        const columnFilters = [];
        columnFilters.push((x) => !x.metadata.isRaw);
        if (this.props.table) {
            columnFilters.push((x) => x.table == this.props.table);
        }
        if (this.props.kinds) {
            columnFilters.push((x) => x.metadata != null &&
                common_1.isKindAcceptable(x.metadata.kind, this.props.kinds));
        }
        if (this.props.types) {
            columnFilters.push((x) => x.metadata != null && this.props.types.indexOf(x.type) >= 0);
        }
        const columnFilter = (x) => {
            for (const f of columnFilters) {
                if (!f(x)) {
                    return false;
                }
            }
            return true;
        };
        let candidates = columns.map((c) => {
            const r = {
                selectable: true,
                table: table.name,
                columnName: c.name,
                expression: core_1.Expression.variable(c.name).toString(),
                rawExpression: core_1.Expression.variable(c.metadata.rawColumnName || c.name).toString(),
                type: c.type,
                displayName: c.name,
                metadata: c.metadata,
                derived: [],
            };
            // Compute derived columns.
            const derivedColumns = common_1.type2DerivedColumns[r.type];
            if (derivedColumns) {
                for (const item of derivedColumns) {
                    const ditem = {
                        table: table.name,
                        columnName: null,
                        expression: core_1.Expression.functionCall(item.function, core_1.Expression.parse(r.expression)).toString(),
                        rawExpression: core_1.Expression.functionCall(item.function, core_1.Expression.parse(r.rawExpression)).toString(),
                        type: item.type,
                        metadata: item.metadata,
                        displayName: item.name,
                        selectable: true,
                    };
                    if (columnFilter(ditem)) {
                        r.derived.push(ditem);
                    }
                }
            }
            r.selectable = columnFilter(r);
            return r;
        });
        // Make sure we only show good ones
        candidates = candidates.filter((x) => (x.derived.length > 0 || x.selectable) && !x.metadata.isRaw);
        return candidates;
    }
    isValueEqual(v1, v2) {
        if (v1 == v2) {
            return true;
        }
        if (v1 == null || v2 == null) {
            return false;
        }
        return v1.expression == v2.expression && v1.table == v2.table;
    }
    isValueExists(v1, v2) {
        if (v2.find((v) => v == v1 || (v1.expression == v.expression && v1.table == v.table))) {
            return true;
        }
        if (v1 == null || v2.length == 0) {
            return false;
        }
        return false;
    }
    selectItem(item, aggregation = null) {
        var _a;
        if (item == null) {
            if (this.props.onChange) {
                this.props.onChange(null);
            }
        }
        else {
            if (this.props.useAggregation) {
                if (aggregation == null) {
                    aggregation = core_1.Expression.getDefaultAggregationFunction(item.type, (_a = item.metadata) === null || _a === void 0 ? void 0 : _a.kind);
                }
            }
            if (this.props.multiSelect) {
                this.setState((current) => {
                    const found = current.currentSelections.find((i) => i.expression === item.expression);
                    if (found) {
                        return Object.assign(Object.assign({}, current), { currentSelections: current.currentSelections.filter((i) => i.expression !== item.expression), currentSelectionsAggregations: current.currentSelectionsAggregations.filter((a) => a !== aggregation) });
                    }
                    else {
                        return Object.assign(Object.assign({}, current), { currentSelections: [...current.currentSelections, item], currentSelectionsAggregations: [
                                ...current.currentSelectionsAggregations,
                                aggregation,
                            ] });
                    }
                });
            }
            else {
                this.setState({
                    currentSelection: item,
                    currentSelectionAggregation: aggregation,
                });
            }
            if (this.props.onChange) {
                if (this.props.multiSelect) {
                    const rlist = [...this.state.currentSelections, item].map((item) => {
                        const r = {
                            table: item.table,
                            expression: item.expression,
                            rawExpression: item.rawExpression,
                            columnName: item.columnName,
                            type: item.type,
                            metadata: item.metadata,
                        };
                        if (this.props.useAggregation) {
                            r.expression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.expression)).toString();
                            r.rawExpression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.rawExpression)).toString();
                        }
                        return r;
                    });
                    this.props.onChangeSelectionList(rlist);
                }
                else {
                    const r = {
                        table: item.table,
                        expression: item.expression,
                        rawExpression: item.rawExpression,
                        columnName: item.columnName,
                        type: item.type,
                        metadata: item.metadata,
                    };
                    if (this.props.useAggregation) {
                        r.expression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.expression)).toString();
                        r.rawExpression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.rawExpression)).toString();
                    }
                    this.props.onChange(r);
                }
            }
        }
    }
    renderCandidate(item) {
        let elDerived;
        const onClick = (item) => {
            if (item.selectable) {
                this.selectItem(item, this.isValueEqual(this.state.currentSelection, item)
                    ? this.state.currentSelectionAggregation
                    : null);
            }
        };
        return (React.createElement("div", { className: "el-column-item", key: item.table + item.expression },
            React.createElement("div", { tabIndex: 0, className: utils_1.classNames("el-field-item", [
                    "is-active",
                    this.props.multiSelect
                        ? this.isValueExists(item, this.state.currentSelections)
                        : this.isValueEqual(this.state.currentSelection, item),
                ], ["is-selectable", item.selectable]), onClick: () => onClick(item), onKeyPress: (e) => {
                    if (e.key === "Enter") {
                        onClick(item);
                    }
                } },
                React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon(common_1.kind2Icon[item.metadata.kind]) }),
                React.createElement("span", { className: "el-text" }, item.displayName),
                this.props.useAggregation &&
                    this.isValueEqual(this.state.currentSelection, item) ? (React.createElement(controls_1.Select, { value: this.state.currentSelectionAggregation, options: core_1.Expression.getCompatibleAggregationFunctionsByDataType(item.type).map((x) => x.name), labels: core_1.Expression.getCompatibleAggregationFunctionsByDataType(item.type).map((x) => x.displayName), showText: true, onChange: (newValue) => {
                        this.selectItem(item, newValue);
                    } })) : null,
                item.derived && item.derived.length > 0 ? (React.createElement(controls_1.Button, { icon: "general/more-vertical", onClick: () => {
                        if (elDerived) {
                            if (elDerived.style.display == "none") {
                                elDerived.style.display = "block";
                            }
                            else {
                                elDerived.style.display = "none";
                            }
                        }
                    } })) : null),
            item.derived && item.derived.length > 0 ? (React.createElement("div", { className: "el-derived-fields", style: { display: "none" }, ref: (e) => (elDerived = e) }, item.derived.map((df) => this.renderCandidate(df)))) : null));
    }
    //Update desing
    render() {
        const fields = this.getFields();
        return (React.createElement("div", { className: "charticulator__data-field-selector" },
            this.props.nullDescription ? (React.createElement("div", { tabIndex: 0, className: utils_1.classNames("el-field-item", "is-null", "is-selectable", [
                    "is-active",
                    !this.props.nullNotHighlightable &&
                        this.state.currentSelection == null,
                ]), onClick: () => this.selectItem(null), onKeyPress: (e) => {
                    if (e.key === "Enter") {
                        this.selectItem(null);
                    }
                } }, this.props.nullDescription)) : null,
            fields.length == 0 && !this.props.nullDescription ? (React.createElement("div", { className: "el-field-item is-null" }, "(no suitable column)")) : null,
            fields.map((f) => this.renderCandidate(f))));
    }
}
exports.DataFieldSelector = DataFieldSelector;
//# sourceMappingURL=fluent_ui_data_field_selector.js.map
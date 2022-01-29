"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderStringsValue = exports.DropZoneView = exports.WidgetManager = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const globals = require("../../../globals");
const R = require("../../../resources");
const core_1 = require("../../../../core");
const actions_1 = require("../../../actions");
const components_1 = require("../../../components");
const icons_1 = require("../../../components/icons");
const controllers_1 = require("../../../controllers");
const index_1 = require("../../../utils/index");
const data_field_selector_1 = require("../../dataset/data_field_selector");
const object_list_editor_1 = require("../object_list_editor");
const controls_1 = require("./controls");
const filter_editor_1 = require("./filter_editor");
const mapping_editor_1 = require("./mapping_editor");
const groupby_editor_1 = require("./groupby_editor");
const container_1 = require("../../../../container");
const input_date_1 = require("./controls/input_date");
const expression_1 = require("../../../../core/expression");
const datetime_1 = require("../../../../core/dataset/datetime");
const scale_value_selector_1 = require("../scale_value_selector");
const strings_1 = require("../../../../strings");
const input_format_1 = require("./controls/input_format");
const actions_2 = require("../../../actions/actions");
class WidgetManager {
    constructor(store, objectClass) {
        this.store = store;
        this.objectClass = objectClass;
    }
    tooltip(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    widget, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tooltipContent) {
        throw new Error("Method not implemented.");
    }
    mappingEditor(name, attribute, options) {
        const objectClass = this.objectClass;
        const info = objectClass.attributes[attribute];
        if (options.defaultValue == null) {
            options.defaultValue = info.defaultValue;
        }
        let focusDiv = null;
        const openMapping = options.openMapping || attribute === this.store.currentAttributeFocus;
        if (openMapping) {
            setTimeout(() => {
                if (focusDiv) {
                    focusDiv.scrollIntoView();
                }
                this.store.dispatcher.dispatch(new actions_1.Actions.FocusToMarkAttribute(null));
            }, 0);
        }
        return this.row(name, React.createElement(React.Fragment, null,
            React.createElement("div", { ref: (r) => (focusDiv = r) }),
            React.createElement(mapping_editor_1.MappingEditor, { store: this.store, parent: this, attribute: attribute, type: info.type, options: Object.assign(Object.assign({}, options), { openMapping }) })));
    }
    getAttributeMapping(attribute) {
        return this.objectClass.object.mappings[attribute];
    }
    getPropertyValue(property) {
        const prop = this.objectClass.object.properties[property.property];
        let value;
        if (property.field != null) {
            value = core_1.getField(prop, property.field);
        }
        else {
            value = prop;
        }
        return value;
    }
    getDateFormat(property) {
        try {
            const prop = this.objectClass.object.properties[property.property];
            const expressionString = prop.expression;
            // eslint-disable-next-line
            const expression = expression_1.TextExpression.Parse(`\$\{${expressionString}\}`);
            // const table = this.store.chartManager.dataflow.getTable((this.objectClass.object as any).table);
            const functionCallpart = expression.parts.find((part) => {
                if (part.expression instanceof expression_1.FunctionCall) {
                    return part.expression.args.find((arg) => arg instanceof expression_1.Variable);
                }
            }).expression;
            if (functionCallpart) {
                const variable = functionCallpart.args.find((arg) => arg instanceof expression_1.Variable);
                const columnName = variable.name;
                const tableName = this.objectClass.object.table;
                const table = this.store.dataset.tables.find((table) => table.name === tableName);
                const column = table.columns.find((column) => column.name === columnName);
                if (column.metadata.format) {
                    return column.metadata.format;
                }
                const rawColumnName = column.metadata.rawColumnName;
                if (rawColumnName &&
                    (column.metadata.kind === core_1.Specification.DataKind.Temporal ||
                        column.type === core_1.Specification.DataType.Boolean)) {
                    const value = (table.rows[0][rawColumnName] || core_1.refineColumnName(rawColumnName)).toString();
                    return datetime_1.getDateFormat(value);
                }
            }
        }
        catch (ex) {
            console.warn(ex);
            return null;
        }
        return null;
    }
    emitSetProperty(property, value) {
        new actions_1.Actions.SetObjectProperty(this.objectClass.object, property.property, property.field, value, property.noUpdateState, property.noComputeLayout).dispatch(this.store.dispatcher);
    }
    // Property widgets
    inputNumber(property, options = {}) {
        const value = this.getPropertyValue(property);
        return (React.createElement(controls_1.InputNumber, Object.assign({}, options, { defaultValue: value, onEnter: (value) => {
                if (value == null) {
                    this.emitSetProperty(property, null);
                    return true;
                }
                else {
                    this.emitSetProperty(property, value);
                    return true;
                }
                return false;
            } })));
    }
    inputDate(property, options = {}) {
        const value = this.getPropertyValue(property);
        const format = this.getDateFormat(property);
        return (React.createElement(input_date_1.InputDate, Object.assign({}, options, { defaultValue: value, dateDisplayFormat: format || datetime_1.defaultDateTimeFormat, onEnter: (value) => {
                if (value == null) {
                    this.emitSetProperty(property, null);
                    return true;
                }
                else {
                    this.emitSetProperty(property, value);
                    return true;
                }
            } })));
    }
    inputText(property, options) {
        return (React.createElement(controls_1.InputText, { defaultValue: this.getPropertyValue(property), placeholder: options.placeholder, onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            } }));
    }
    inputFontFamily(property, options) {
        return (React.createElement(controls_1.ComboBoxFontFamily, { label: options.label, defaultValue: this.getPropertyValue(property), onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            } }));
    }
    inputComboBox(property, options) {
        return (React.createElement(controls_1.ComboBox, { defaultValue: this.getPropertyValue(property), options: options.defaultRange, optionsOnly: options.valuesOnly, onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            } }));
    }
    inputSelect(property, options) {
        if (options.type == "dropdown") {
            return (React.createElement(controls_1.Select, { labels: options.labels, icons: options.icons, options: options.options, labelPosition: options.labelPosition, tooltip: options.tooltip, value: this.getPropertyValue(property), showText: options.showLabel, onChange: (value) => {
                    this.emitSetProperty(property, value);
                } }));
        }
        else {
            return (React.createElement(controls_1.Radio, { labels: options.labels, icons: options.icons, options: options.options, tooltip: options.tooltip, value: this.getPropertyValue(property), showText: options.showLabel, onChange: (value) => {
                    this.emitSetProperty(property, value);
                } }));
        }
    }
    inputBoolean(properties, options) {
        const property = properties instanceof Array ? properties[0] : properties;
        switch (options.type) {
            case "checkbox-fill-width":
            case "checkbox": {
                return (React.createElement(controls_1.CheckBox, { value: this.getPropertyValue(property), text: options.label, title: options.label, fillWidth: options.type == "checkbox-fill-width", onChange: (v) => {
                        if (properties instanceof Array) {
                            properties.forEach((property) => this.emitSetProperty(property, v));
                        }
                        else {
                            this.emitSetProperty(property, v);
                        }
                    } }));
            }
            case "highlight": {
                return (React.createElement(controls_1.Button, { icon: options.icon, text: options.label, active: this.getPropertyValue(property), onClick: () => {
                        const v = this.getPropertyValue(property);
                        this.emitSetProperty(property, !v);
                    } }));
            }
        }
    }
    inputExpression(property, options = {}) {
        return (React.createElement(controls_1.InputExpression, { defaultValue: this.getPropertyValue(property), validate: (value) => {
                if (value && value.trim() !== "") {
                    return this.store.verifyUserExpressionWithTable(value, options.table);
                }
                return {
                    pass: true,
                };
            }, placeholder: strings_1.strings.core.none, onEnter: (value) => {
                if (!value || value.trim() == "") {
                    this.emitSetProperty(property, null);
                }
                else {
                    this.emitSetProperty(property, value);
                }
                return true;
            } }));
    }
    inputFormat(property, options = {}) {
        return (React.createElement(input_format_1.InputFormat, { defaultValue: this.getPropertyValue(property), validate: (value) => {
                if (value && value.trim() !== "") {
                    try {
                        container_1.getFormat()(value === null || value === void 0 ? void 0 : value.replace(container_1.tickFormatParserExpression(), "$1"));
                        return {
                            pass: true,
                            formatted: value,
                        };
                    }
                    catch (ex) {
                        return {
                            pass: false,
                            error: "Invalid format",
                        };
                    }
                }
                return {
                    pass: true,
                };
            }, placeholder: options.blank || strings_1.strings.core.none, onEnter: (value) => {
                if (!value || value.trim() == "") {
                    this.emitSetProperty(property, null);
                }
                else {
                    this.emitSetProperty(property, value);
                }
                return true;
            } }));
    }
    inputColor(property, options) {
        const color = this.getPropertyValue(property);
        return (React.createElement(controls_1.InputColor, { store: this.store, defaultValue: color, allowNull: options.allowNull, onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            } }));
    }
    inputColorGradient(property, inline = false) {
        const gradient = this.getPropertyValue(property);
        if (inline) {
            return (React.createElement("span", { className: "charticulator__widget-control-input-color-gradient-inline" },
                React.createElement(components_1.GradientPicker, { defaultValue: gradient, onPick: (value) => {
                        this.emitSetProperty(property, value);
                    } })));
        }
        else {
            return (React.createElement(controls_1.InputColorGradient, { defaultValue: gradient, onEnter: (value) => {
                    this.emitSetProperty(property, value);
                    return true;
                } }));
        }
    }
    inputImage(property) {
        return (React.createElement(controls_1.InputImage, { value: this.getPropertyValue(property), onChange: (image) => {
                this.emitSetProperty(property, image);
                return true;
            } }));
    }
    inputImageProperty(property) {
        return (React.createElement(controls_1.InputImageProperty, { value: this.getPropertyValue(property), onChange: (image) => {
                this.emitSetProperty(property, image);
                return true;
            } }));
    }
    clearButton(property, icon) {
        return (React.createElement(controls_1.Button, { icon: icon || "general/eraser", onClick: () => {
                this.emitSetProperty(property, null);
            } }));
    }
    setButton(property, value, icon, text) {
        return (React.createElement(controls_1.Button, { text: text, icon: icon, onClick: () => {
                this.emitSetProperty(property, value);
            } }));
    }
    scaleEditor(attribute, text) {
        let mappingButton = null;
        const objectClass = this.objectClass;
        const mapping = objectClass.object.mappings[attribute];
        const scaleObject = core_1.getById(this.store.chart.scales, mapping.scale);
        return (React.createElement(controls_1.Button, { ref: (e) => (mappingButton = ReactDOM.findDOMNode(e)), text: text, onClick: () => {
                const { alignX } = index_1.getAligntment(mappingButton);
                globals.popupController.popupAt((context) => {
                    return (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement(scale_value_selector_1.ScaleValueSelector, { scale: scaleObject, scaleMapping: mapping, store: this.store })));
                }, { anchor: mappingButton, alignX });
            } }));
    }
    orderByWidget(property, options) {
        var _a;
        let ref;
        return (React.createElement(DropZoneView, { filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                this.emitSetProperty(property, { expression: data.expression });
            }, ref: (e) => (ref = e), className: index_1.classNames("charticulator__widget-control-order-widget", [
                "is-active",
                this.getPropertyValue(property) != null,
            ]), onClick: () => {
                globals.popupController.popupAt((context) => {
                    let currentExpression = null;
                    const currentSortBy = this.getPropertyValue(property);
                    if (currentSortBy != null) {
                        currentExpression = currentSortBy.expression;
                    }
                    return (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement("div", { className: "charticulator__widget-popup-order-widget" },
                            React.createElement("div", { className: "el-row" },
                                React.createElement(data_field_selector_1.DataFieldSelector, { nullDescription: "(default order)", datasetStore: this.store, useAggregation: true, defaultValue: currentExpression
                                        ? {
                                            table: options.table,
                                            expression: currentExpression,
                                        }
                                        : null, onChange: (value) => {
                                        if (value != null) {
                                            this.emitSetProperty(property, {
                                                expression: value.expression,
                                            });
                                        }
                                        else {
                                            this.emitSetProperty(property, null);
                                        }
                                        context.close();
                                    } })))));
                }, { anchor: ref.dropContainer });
            } }, options.displayLabel != null && options.displayLabel ? (React.createElement(React.Fragment, null,
            React.createElement("div", { title: options.tooltip },
                React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("general/sort") }),
                React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("ChevronDown") })),
            React.createElement("span", { className: "el-text" }, ((_a = this.getPropertyValue(property)) === null || _a === void 0 ? void 0 : _a.expression) ||
                strings_1.strings.core.default))) : (React.createElement("div", { title: options.tooltip },
            React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("general/sort") }),
            React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("ChevronDown") })))));
    }
    reorderWidget(property, options = {}) {
        let container;
        return (React.createElement("span", { ref: (e) => (container = e) },
            React.createElement(controls_1.Button, { icon: "general/sort", active: false, onClick: () => {
                    globals.popupController.popupAt((context) => {
                        const items = this.getPropertyValue(property);
                        return (React.createElement(controllers_1.PopupView, { context: context },
                            React.createElement(ReorderStringsValue, Object.assign({ items: items, onConfirm: (items, customOrder) => {
                                    this.emitSetProperty(property, items);
                                    if (customOrder) {
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "orderMode",
                                        }, "order");
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "order",
                                        }, items);
                                    }
                                    else {
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "orderMode",
                                        }, "alphabetically");
                                    }
                                    context.close();
                                }, onReset: () => {
                                    const axisDataBinding = Object.assign({}, this.objectClass.object.properties[property.property]);
                                    axisDataBinding.table = this.store.chartManager.getTable(this.objectClass.object.table);
                                    axisDataBinding.metadata = {
                                        kind: axisDataBinding.dataKind,
                                        orderMode: "order",
                                    };
                                    const groupBy = this.store.getGroupingExpression(this.objectClass.object);
                                    const values = this.store.chartManager.getGroupedExpressionVector(this.objectClass.object.table, groupBy, axisDataBinding.expression);
                                    const { categories, } = this.store.getCategoriesForDataBinding(axisDataBinding.metadata, axisDataBinding.type, values);
                                    return categories;
                                } }, options))));
                    }, { anchor: container });
                } })));
    }
    arrayWidget(property, renderItem, options = {
        allowDelete: true,
        allowReorder: true,
    }) {
        const items = this.getPropertyValue(property).slice();
        return (React.createElement("div", { className: "charticulator__widget-array-view" },
            React.createElement(object_list_editor_1.ReorderListView, { enabled: options.allowReorder, onReorder: (dragIndex, dropIndex) => {
                    object_list_editor_1.ReorderListView.ReorderArray(items, dragIndex, dropIndex);
                    this.emitSetProperty(property, items);
                } }, items.map((item, index) => {
                return (React.createElement("div", { key: index, className: "charticulator__widget-array-view-item" },
                    options.allowReorder ? (React.createElement("span", { className: "charticulator__widget-array-view-control charticulator__widget-array-view-order" },
                        React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("general/order") }))) : null,
                    React.createElement("span", { className: "charticulator__widget-array-view-content" }, renderItem({
                        property: property.property,
                        field: property.field
                            ? property.field instanceof Array
                                ? [...property.field, index]
                                : [property.field, index]
                            : index,
                    })),
                    options.allowDelete ? (React.createElement("span", { className: "charticulator__widget-array-view-control" },
                        React.createElement(controls_1.Button, { icon: "ChromeClose", onClick: () => {
                                items.splice(index, 1);
                                this.emitSetProperty(property, items);
                            } }))) : null));
            }))));
    }
    dropTarget(options, widget) {
        return (React.createElement(DropZoneView, { filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                this.emitSetProperty(options.property, {
                    expression: data.expression,
                });
            }, className: index_1.classNames("charticulator__widget-control-drop-target"), draggingHint: () => (React.createElement("span", { className: "el-dropzone-hint" }, options.label)) }, widget));
    }
    // Label and text
    icon(icon) {
        return (React.createElement("span", { className: "charticulator__widget-label" },
            React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon(icon) })));
    }
    label(title) {
        return React.createElement("span", { className: "charticulator__widget-label" }, title);
    }
    text(title, align = "left") {
        return (React.createElement("span", { className: "charticulator__widget-text", style: { textAlign: align } }, title));
    }
    sep() {
        return React.createElement("span", { className: "charticulator__widget-sep" });
    }
    // Layout elements
    sectionHeader(title, widget, options = {}) {
        if (options.dropzone && options.dropzone.type == "axis-data-binding") {
            let refButton;
            const current = this.getPropertyValue({
                property: options.dropzone.property,
            });
            return (React.createElement(DropZoneView, { filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                    new actions_1.Actions.BindDataToAxis(this.objectClass.object, options.dropzone.property, null, data, false).dispatch(this.store.dispatcher);
                }, className: "charticulator__widget-section-header charticulator__widget-section-header-dropzone", draggingHint: () => (React.createElement("span", { className: "el-dropzone-hint" }, options.dropzone.prompt)) },
                React.createElement("span", { className: "charticulator__widget-section-header-title" }, title),
                widget,
                React.createElement(controls_1.Button, { icon: "general/bind-data", ref: (e) => (refButton = ReactDOM.findDOMNode(e)), onClick: () => {
                        globals.popupController.popupAt((context) => {
                            return (React.createElement(controllers_1.PopupView, { context: context },
                                React.createElement(data_field_selector_1.DataFieldSelector, { datasetStore: this.store, defaultValue: current && current.expression
                                        ? { table: null, expression: current.expression }
                                        : null, useAggregation: true, nullDescription: strings_1.strings.core.none, nullNotHighlightable: true, onChange: (value) => {
                                        if (!value) {
                                            this.emitSetProperty({ property: options.dropzone.property }, null);
                                        }
                                        else {
                                            const data = new actions_1.DragData.DataExpression(this.store.getTable(value.table), value.expression, value.type, value.metadata, value.rawExpression);
                                            new actions_1.Actions.BindDataToAxis(this.objectClass
                                                .object, options.dropzone.property, null, data, true).dispatch(this.store.dispatcher);
                                        }
                                    } })));
                        }, { anchor: refButton });
                    }, active: false })));
        }
        else {
            return (React.createElement("div", { className: "charticulator__widget-section-header" },
                React.createElement("span", { className: "charticulator__widget-section-header-title" }, title),
                widget));
        }
    }
    horizontal(cols, ...widgets) {
        return (React.createElement("div", { className: "charticulator__widget-horizontal" }, widgets.map((x, id) => (React.createElement("span", { className: `el-layout-item el-layout-item-col-${cols[id]}`, key: id }, x)))));
    }
    filterEditor(options) {
        let button;
        let text = "Filter by...";
        switch (options.mode) {
            case "button":
                if (options.value) {
                    if (options.value.categories) {
                        text = "Filter by " + options.value.categories.expression;
                    }
                    if (options.value.expression) {
                        text = "Filter by " + options.value.expression;
                    }
                }
                return (React.createElement(controls_1.Button, { text: text, ref: (e) => (button = e), onClick: () => {
                        globals.popupController.popupAt((context) => {
                            return (React.createElement(controllers_1.PopupView, { context: context },
                                React.createElement(filter_editor_1.FilterEditor, { manager: this, value: options.value, options: options })));
                        }, { anchor: ReactDOM.findDOMNode(button) });
                    } }));
            case "panel":
                return (React.createElement(filter_editor_1.FilterEditor, { manager: this, value: options.value, options: options }));
        }
    }
    groupByEditor(options) {
        let button;
        let text = "Group by...";
        switch (options.mode) {
            case "button":
                if (options.value) {
                    if (options.value.expression) {
                        text = "Group by " + options.value.expression;
                    }
                }
                return (React.createElement(controls_1.Button, { text: text, ref: (e) => (button = e), onClick: () => {
                        globals.popupController.popupAt((context) => {
                            return (React.createElement(controllers_1.PopupView, { context: context },
                                React.createElement(groupby_editor_1.GroupByEditor, { manager: this, value: options.value, options: options })));
                        }, { anchor: ReactDOM.findDOMNode(button) });
                    } }));
            case "panel":
                return (React.createElement(groupby_editor_1.GroupByEditor, { manager: this, value: options.value, options: options }));
        }
    }
    nestedChartEditor(property, options) {
        return this.row("", this.vertical(React.createElement(components_1.ButtonRaised, { text: "Edit Nested Chart...", onClick: () => {
                this.store.dispatcher.dispatch(new actions_2.OpenNestedEditor(this.objectClass.object, property, options));
            } }), React.createElement("div", { style: { marginTop: "5px" } },
            React.createElement(components_1.ButtonRaised, { text: "Import Template...", onClick: () => __awaiter(this, void 0, void 0, function* () {
                    const file = yield index_1.showOpenFileDialog(["tmplt", "json"]);
                    const str = yield index_1.readFileAsString(file);
                    const data = JSON.parse(str);
                    const template = new container_1.ChartTemplate(data);
                    for (const table of options.dataset.tables) {
                        const tTable = template.getDatasetSchema()[0];
                        template.assignTable(tTable.name, table.name);
                        for (const column of tTable.columns) {
                            template.assignColumn(tTable.name, column.name, column.name);
                        }
                    }
                    const instance = template.instantiate(options.dataset, false // no scale inference
                    );
                    this.emitSetProperty(property, instance.chart);
                }) }))));
    }
    row(title, widget) {
        return (React.createElement("div", { className: "charticulator__widget-row" },
            title != null ? (React.createElement("span", { className: "charticulator__widget-row-label el-layout-item" }, title)) : null,
            widget));
    }
    vertical(...widgets) {
        return (React.createElement("div", { className: "charticulator__widget-vertical" }, widgets.map((x, id) => (React.createElement("span", { className: "el-layout-item", key: id }, x)))));
    }
    verticalGroup(options, widgets) {
        return (React.createElement("div", { className: "charticulator__widget-vertical" }, widgets.map((x, id) => (React.createElement("span", { className: "el-layout-item", key: id }, x)))));
    }
    table(rows, 
    // eslint-disable-next-line
    options) {
        return (React.createElement("table", { className: "charticulator__widget-table" },
            React.createElement("tbody", null, rows.map((row, index) => (React.createElement("tr", { key: index }, row.map((x, i) => (React.createElement("td", { key: i },
                React.createElement("span", { className: "el-layout-item" }, x))))))))));
    }
    scrollList(widgets, options = {}) {
        return (React.createElement("div", { className: "charticulator__widget-scroll-list", style: {
                maxHeight: options.maxHeight ? options.maxHeight + "px" : undefined,
                height: options.height ? options.height + "px" : undefined,
            } }, widgets.map((widget, i) => (React.createElement("div", { className: "charticulator__widget-scroll-list-item", key: i }, widget)))));
    }
    customCollapsiblePanel() {
        throw new Error("Method not implemented.");
    }
}
exports.WidgetManager = WidgetManager;
class DropZoneView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isInSession: false,
            isDraggingOver: false,
            data: null,
        };
    }
    componentDidMount() {
        globals.dragController.registerDroppable(this, this.dropContainer);
        this.tokens = [
            globals.dragController.addListener("sessionstart", () => {
                const session = globals.dragController.getSession();
                if (this.props.filter(session.data)) {
                    this.setState({
                        isInSession: true,
                    });
                }
            }),
            globals.dragController.addListener("sessionend", () => {
                this.setState({
                    isInSession: false,
                });
            }),
        ];
    }
    componentWillUnmount() {
        globals.dragController.unregisterDroppable(this);
        this.tokens.forEach((x) => x.remove());
    }
    onDragEnter(ctx) {
        const data = ctx.data;
        const judge = this.props.filter(data);
        if (judge) {
            this.setState({
                isDraggingOver: true,
                data,
            });
            ctx.onLeave(() => {
                this.setState({
                    isDraggingOver: false,
                    data: null,
                });
            });
            ctx.onDrop((point, modifiers) => {
                this.props.onDrop(data, point, modifiers);
            });
            return true;
        }
    }
    render() {
        return (React.createElement("div", { className: index_1.classNames(this.props.className, ["is-in-session", this.state.isInSession], ["is-dragging-over", this.state.isDraggingOver]), onClick: this.props.onClick, ref: (e) => (this.dropContainer = e) }, this.props.draggingHint == null
            ? this.props.children
            : this.state.isInSession
                ? this.props.draggingHint()
                : this.props.children));
    }
}
exports.DropZoneView = DropZoneView;
class ReorderStringsValue extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            items: this.props.items.slice(),
            customOrder: false,
        };
    }
    render() {
        const items = this.state.items.slice();
        return (React.createElement("div", { className: "charticulator__widget-popup-reorder-widget" },
            React.createElement("div", { className: "el-row el-list-view" },
                React.createElement(object_list_editor_1.ReorderListView, { enabled: true, onReorder: (a, b) => {
                        object_list_editor_1.ReorderListView.ReorderArray(items, a, b);
                        this.setState({ items, customOrder: true });
                    } }, items.map((x) => (React.createElement("div", { key: x, className: "el-item" }, x))))),
            React.createElement("div", { className: "el-row" },
                React.createElement(controls_1.Button, { icon: "Sort", text: "Reverse", onClick: () => {
                        this.setState({ items: this.state.items.reverse() });
                    } }),
                " ",
                React.createElement(controls_1.Button, { icon: "general/sort", text: "Sort", onClick: () => {
                        this.setState({
                            items: this.state.items.sort(container_1.getSortFunctionByData(this.state.items)),
                            customOrder: false,
                        });
                    } }),
                this.props.allowReset && (React.createElement(React.Fragment, null,
                    " ",
                    React.createElement(controls_1.Button, { icon: "general/clear", text: "Reset", onClick: () => {
                            if (this.props.onReset) {
                                const items = this.props.onReset();
                                this.setState({ items });
                            }
                        } })))),
            React.createElement("div", { className: "el-row" },
                React.createElement(components_1.ButtonRaised, { text: "OK", onClick: () => {
                        this.props.onConfirm(this.state.items, this.state.customOrder);
                    } }))));
    }
}
exports.ReorderStringsValue = ReorderStringsValue;
//# sourceMappingURL=manager.js.map
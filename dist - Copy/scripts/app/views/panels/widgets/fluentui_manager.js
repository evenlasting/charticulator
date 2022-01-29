"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
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
exports.DetailsButtonInner = exports.FluentDetailsButton = exports.DropZoneView = exports.FluentUIWidgetManager = void 0;
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
const object_list_editor_1 = require("../object_list_editor");
const controls_1 = require("./controls");
const groupby_editor_1 = require("./groupby_editor");
const container_1 = require("../../../../container");
const expression_1 = require("../../../../core/expression");
const datetime_1 = require("../../../../core/dataset/datetime");
const scale_value_selector_1 = require("../scale_value_selector");
const react_1 = require("@fluentui/react");
const fluent_mapping_editor_1 = require("./fluent_mapping_editor");
const fluentui_input_color_1 = require("./controls/fluentui_input_color");
const fluentui_input_expression_1 = require("./controls/fluentui_input_expression");
const Icon_1 = require("@fluentui/react/lib/Icon");
const fluentui_customized_components_1 = require("./controls/fluentui_customized_components");
const fluentui_input_number_1 = require("./controls/fluentui_input_number");
const merge_styles_1 = require("@fluentui/merge-styles");
const strings_1 = require("../../../../strings");
const fluentui_image_1 = require("./controls/fluentui_image");
const fluentui_image_2_1 = require("./controls/fluentui_image_2");
const data_field_binding_builder_1 = require("../../dataset/data_field_binding_builder");
const fluentui_input_format_1 = require("./controls/fluentui_input_format");
const collapsiblePanel_1 = require("./controls/collapsiblePanel");
const actions_2 = require("../../../actions/actions");
const fluentui_filter_1 = require("./fluentui_filter");
const observer_1 = require("./observer");
const fluent_ui_gradient_picker_1 = require("../../../components/fluent_ui_gradient_picker");
const types_1 = require("../../../../core/specification/types");
const reorder_string_value_1 = require("./controls/reorder_string_value");
const custom_collapsible_panel_1 = require("./controls/custom_collapsible_panel");
class FluentUIWidgetManager {
    constructor(store, objectClass) {
        this.store = store;
        this.objectClass = objectClass;
        this.director = new data_field_binding_builder_1.Director();
        this.director.setBuilder(new data_field_binding_builder_1.MenuItemBuilder());
        this.eventManager = new observer_1.EventManager();
        this.eventListener = new observer_1.UIManagerListener(this);
        this.eventManager.subscribe(observer_1.EventType.UPDATE_FIELD, this.eventListener);
    }
    getKeyFromProperty(property) {
        var _a;
        return `${property === null || property === void 0 ? void 0 : property.property}-${(_a = property === null || property === void 0 ? void 0 : property.field) === null || _a === void 0 ? void 0 : _a.toString()}`;
    }
    mappingEditor(name, attribute, options) {
        const objectClass = this.objectClass;
        const info = objectClass.attributes[attribute];
        if (options.defaultValue == null) {
            options.defaultValue = info.defaultValue;
        }
        const openMapping = options.openMapping || attribute === this.store.currentAttributeFocus;
        if (openMapping) {
            setTimeout(() => {
                document
                    .querySelectorAll(".ms-GroupHeader-expand")
                    .forEach((expand) => {
                    if (expand.querySelector("i").classList.contains("is-collapsed")) {
                        expand.click();
                    }
                });
                this.store.dispatcher.dispatch(new actions_1.Actions.FocusToMarkAttribute(null));
            }, 0);
        }
        return (React.createElement(fluent_mapping_editor_1.FluentMappingEditor, { key: name + attribute, store: this.store, parent: this, attribute: attribute, type: info.type, options: Object.assign(Object.assign({}, options), { label: name, openMapping }) }));
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
            const expression = expression_1.TextExpression.Parse(`\${${expressionString}}`);
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
    emitUpdateProperty(event, property, prevKey, newKey) {
        event.preventDefault();
        event.stopPropagation();
        const validatedKey = newKey.length === 0 ? " " : newKey;
        const oldPropertyValue = this.getPropertyValue(property);
        const changedValue = oldPropertyValue;
        const newValue = Object.keys(changedValue).reduce((obj, key) => {
            obj[key === prevKey ? validatedKey : key] = oldPropertyValue[key];
            return obj;
        }, {});
        new actions_1.Actions.SetObjectProperty(this.objectClass.object, property.property, property.field, newValue, property.noUpdateState, property.noComputeLayout).dispatch(this.store.dispatcher);
    }
    inputFormat(property, options = {}) {
        return (React.createElement(fluentui_input_format_1.FluentInputFormat, { label: options.label, defaultValue: this.getPropertyValue(property), validate: (value) => {
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
                            error: strings_1.strings.objects.invalidFormat,
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
    inputNumber(property, options = {}) {
        const value = this.getPropertyValue(property);
        return (React.createElement(fluentui_input_number_1.FluentInputNumber, Object.assign({}, options, { key: this.getKeyFromProperty(property), defaultValue: value, onEnter: (value) => {
                var _a, _b, _c, _d, _e;
                if (value == null) {
                    this.emitSetProperty(property, null);
                }
                else {
                    this.emitSetProperty(property, value);
                }
                if ((_a = options.observerConfig) === null || _a === void 0 ? void 0 : _a.isObserver) {
                    if (((_b = options.observerConfig) === null || _b === void 0 ? void 0 : _b.properties) instanceof Array) {
                        (_c = options.observerConfig) === null || _c === void 0 ? void 0 : _c.properties.forEach((property) => {
                            var _a;
                            return this.eventManager.notify(observer_1.EventType.UPDATE_FIELD, property, (_a = options.observerConfig) === null || _a === void 0 ? void 0 : _a.value);
                        });
                    }
                    else {
                        this.eventManager.notify(observer_1.EventType.UPDATE_FIELD, (_d = options.observerConfig) === null || _d === void 0 ? void 0 : _d.properties, (_e = options.observerConfig) === null || _e === void 0 ? void 0 : _e.value);
                    }
                }
                return true;
            } })));
    }
    inputDate(property, options = {}) {
        const value = this.getPropertyValue(property);
        const format = this.getDateFormat(property);
        return (React.createElement(fluentui_customized_components_1.FluentDatePickerWrapper, null,
            React.createElement(react_1.DatePicker, { key: this.getKeyFromProperty(property), firstDayOfWeek: react_1.DayOfWeek.Sunday, placeholder: options.placeholder, ariaLabel: options.placeholder, defaultValue: format, value: new Date(value), label: options.label, onSelectDate: (value) => {
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
        var _a, _b, _c;
        let prevKey = (_a = options.value) !== null && _a !== void 0 ? _a : "";
        return (React.createElement(react_1.TextField, { styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { field: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle.field), { height: null }) }), key: this.getKeyFromProperty(property), value: options.value
                ? options.value
                : this.getPropertyValue(property), placeholder: options.placeholder, label: options.label, disabled: options.disabled, onRenderLabel: fluentui_customized_components_1.labelRender, onChange: (event, value) => {
                options.updateProperty
                    ? this.emitUpdateProperty(event, property, prevKey, value)
                    : this.emitSetProperty(property, value);
                prevKey = value;
                if (options.emitMappingAction) {
                    new actions_1.Actions.SetCurrentMappingAttribute(value).dispatch(this.store.dispatcher);
                }
            }, onClick: () => {
                if (options.emitMappingAction) {
                    new actions_1.Actions.SetCurrentMappingAttribute(prevKey).dispatch(this.store.dispatcher);
                }
            }, type: "text", underlined: (_b = options.underline) !== null && _b !== void 0 ? _b : false, borderless: (_c = options.borderless) !== null && _c !== void 0 ? _c : false, style: options.styles }));
    }
    inputFontFamily(property, options) {
        return (React.createElement(controls_1.FluentComboBoxFontFamily, { key: this.getKeyFromProperty(property), label: options.label, defaultValue: this.getPropertyValue(property), onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            } }));
    }
    inputComboBox(property, options) {
        return (React.createElement(react_1.ComboBox, { styles: fluentui_customized_components_1.defaultStyle, key: this.getKeyFromProperty(property), selectedKey: this.getPropertyValue(property), label: options.label, autoComplete: "on", options: options.defaultRange.map((rangeValue) => {
                return {
                    key: rangeValue,
                    text: rangeValue,
                };
            }), onChange: (event, value) => {
                this.emitSetProperty(property, value.key);
                return true;
            } }));
    }
    inputSelect(property, options) {
        const theme = react_1.getTheme();
        if (options.type == "dropdown") {
            const iconStyles = { marginRight: "8px" };
            const onRenderOption = (option) => {
                return (React.createElement(React.Fragment, null,
                    option.data && option.data.icon && (React.createElement(fluentui_customized_components_1.FluentDropdown, null,
                        React.createElement(Icon_1.Icon, { style: iconStyles, iconName: option.data.icon, "aria-hidden": "true", title: option.data.icon }))),
                    React.createElement("span", null, option.text)));
            };
            const onRenderTitle = (options) => {
                const option = options[0];
                return (React.createElement(fluentui_customized_components_1.FluentDropdownWrapper, null,
                    option.data && option.data.icon && (React.createElement(fluentui_customized_components_1.FluentDropdown, null,
                        React.createElement(Icon_1.Icon, { style: iconStyles, iconName: option.data.icon, "aria-hidden": "true", title: option.data.icon }))),
                    React.createElement("span", null, option.text)));
            };
            return (React.createElement(react_1.Dropdown, { key: `${this.getKeyFromProperty(property)}-${options.label}-${options.type}`, selectedKey: this.getPropertyValue(property), defaultValue: this.getPropertyValue(property), label: options.label, onRenderLabel: fluentui_customized_components_1.labelRender, onRenderOption: onRenderOption, onRenderTitle: onRenderTitle, options: options.options.map((rangeValue, index) => {
                    var _a;
                    return {
                        key: rangeValue,
                        text: options.labels[index],
                        data: {
                            icon: (_a = options.icons) === null || _a === void 0 ? void 0 : _a[index],
                            iconStyles: {
                                stroke: "gray",
                            },
                        },
                    };
                }), onChange: (event, value) => {
                    this.emitSetProperty(property, value.key);
                    return true;
                }, styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { title: Object.assign(Object.assign({}, fluentui_customized_components_1.defultComponentsHeight), { borderWidth: options.hideBorder ? "0px" : null }), dropdownItemsWrapper: {
                        minWidth: 90,
                    }, callout: {
                        marginTop: options.shiftCallout ? options.shiftCallout : null,
                    } }) }));
        }
        else {
            return (React.createElement(React.Fragment, { key: `${this.getKeyFromProperty(property)}-${options.label}-${options.type}` },
                options.label && options.label.length > 0 ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, options.label)) : null,
                options.options.map((option, index) => {
                    return (React.createElement(react_1.IconButton, { key: `${this.getKeyFromProperty(property)}-${options.label}-${options.type}-${index}`, iconProps: {
                            iconName: options.icons[index],
                        }, style: {
                            stroke: `${theme.palette.themePrimary} !important`,
                        }, styles: {
                            label: null,
                            root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                        }, title: options.labels[index], checked: option === this.getPropertyValue(property), onClick: () => {
                            this.emitSetProperty(property, option);
                        } }));
                })));
        }
    }
    inputBoolean(properties, options) {
        const property = properties instanceof Array ? properties[0] : properties;
        switch (options.type) {
            case "checkbox-fill-width":
            case "checkbox": {
                return (React.createElement(React.Fragment, { key: this.getKeyFromProperty(property) },
                    options.headerLabel ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, options.headerLabel)) : null,
                    React.createElement(fluentui_customized_components_1.FluentCheckbox, null,
                        React.createElement(react_1.Checkbox, { checked: this.getPropertyValue(property), label: options.label, styles: Object.assign({ label: fluentui_customized_components_1.defaultLabelStyle, root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight) }, options.checkBoxStyles), onChange: (ev, v) => {
                                if (properties instanceof Array) {
                                    properties.forEach((property) => this.emitSetProperty(property, v));
                                }
                                else {
                                    this.emitSetProperty(property, v);
                                }
                                this.defaultNotification(options.observerConfig);
                            } }))));
            }
            case "highlight": {
                return (React.createElement(react_1.IconButton, { key: this.getKeyFromProperty(property), iconProps: {
                        iconName: options.icon,
                    }, title: options.label, label: options.label, styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defultBindButtonSize), { label: fluentui_customized_components_1.defaultLabelStyle, root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize) }), text: options.label, ariaLabel: options.label, checked: this.getPropertyValue(property), onClick: () => {
                        this.defaultNotification(options.observerConfig);
                        const v = this.getPropertyValue(property);
                        this.emitSetProperty(property, !v);
                    } }));
            }
        }
    }
    defaultNotification(observerConfig) {
        if (observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.isObserver) {
            if ((observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.properties) instanceof Array) {
                observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.properties.forEach((property) => this.eventManager.notify(observer_1.EventType.UPDATE_FIELD, property, observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.value));
            }
            else {
                this.eventManager.notify(observer_1.EventType.UPDATE_FIELD, observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.properties, observerConfig === null || observerConfig === void 0 ? void 0 : observerConfig.value);
            }
        }
    }
    inputExpression(property, options = {}) {
        const value = this.getPropertyValue(property);
        const inputExpression = (React.createElement(fluentui_input_expression_1.FluentInputExpression, { key: this.getKeyFromProperty(property), label: options.label, value: value, defaultValue: value, validate: (value) => {
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
                    this.store.updateDataAxes();
                    this.store.updatePlotSegments();
                }
                return true;
            } }));
        if (options.dropzone) {
            return (React.createElement(DropZoneView, { key: options.label, filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                    new actions_1.Actions.BindDataToAxis(this.objectClass.object, options.dropzone.property, null, data, true).dispatch(this.store.dispatcher);
                }, className: "charticulator__widget-section-header charticulator__widget-section-header-dropzone", draggingHint: () => {
                    var _a;
                    return (React.createElement("span", { className: "el-dropzone-hint" }, (_a = options.dropzone) === null || _a === void 0 ? void 0 : _a.prompt));
                } }, inputExpression));
        }
        else {
            return inputExpression;
        }
    }
    inputColor(property, options) {
        const color = this.getPropertyValue(property);
        return (React.createElement(fluentui_input_color_1.FluentInputColor, { key: this.getKeyFromProperty(property), label: options.label, store: this.store, defaultValue: color, allowNull: options.allowNull, noDefaultMargin: options.noDefaultMargin, labelKey: options.labelKey, onEnter: (value) => {
                this.emitSetProperty(property, value);
                return true;
            }, width: options.width, underline: options.underline, pickerBeforeTextField: options.pickerBeforeTextField }));
    }
    inputColorGradient(property, inline = false) {
        const gradient = this.getPropertyValue(property);
        if (inline) {
            return (React.createElement("span", { className: "charticulator__widget-control-input-color-gradient-inline" },
                React.createElement(fluent_ui_gradient_picker_1.FluentUIGradientPicker, { key: this.getKeyFromProperty(property), defaultValue: gradient, onPick: (value) => {
                        this.emitSetProperty(property, value);
                    } })));
        }
        else {
            return (React.createElement(controls_1.InputColorGradient, { key: this.getKeyFromProperty(property), defaultValue: gradient, onEnter: (value) => {
                    this.emitSetProperty(property, value);
                    return true;
                } }));
        }
    }
    inputImage(property) {
        return (React.createElement(fluentui_image_1.InputImage, { key: this.getKeyFromProperty(property), value: this.getPropertyValue(property), onChange: (image) => {
                this.emitSetProperty(property, image);
                return true;
            } }));
    }
    inputImageProperty(property) {
        return (React.createElement(fluentui_image_2_1.InputImageProperty, { key: this.getKeyFromProperty(property), value: this.getPropertyValue(property), onChange: (image) => {
                this.emitSetProperty(property, image);
                return true;
            } }));
    }
    clearButton(property, icon, isHeader) {
        return (React.createElement(fluentui_customized_components_1.FluentButton, { key: this.getKeyFromProperty(property), marginTop: isHeader ? "0px" : null },
            React.createElement(react_1.DefaultButton, { styles: {
                    root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                }, iconProps: {
                    iconName: icon || "EraseTool",
                }, onClick: () => {
                    this.emitSetProperty(property, null);
                } })));
    }
    setButton(property, value, icon, text) {
        return (React.createElement(react_1.DefaultButton, { key: this.getKeyFromProperty(property), iconProps: {
                iconName: icon,
            }, text: text, onClick: () => {
                this.emitSetProperty(property, value);
            } }));
    }
    scaleEditor(attribute, text) {
        let mappingButton = null;
        const objectClass = this.objectClass;
        const mapping = objectClass.object.mappings[attribute];
        const scaleObject = core_1.getById(this.store.chart.scales, mapping.scale);
        return (React.createElement(components_1.ButtonRaised, { key: attribute, ref: (e) => (mappingButton = ReactDOM.findDOMNode(e)), text: text, onClick: () => {
                globals.popupController.popupAt((context) => {
                    return (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement(scale_value_selector_1.ScaleValueSelector, { scale: scaleObject, scaleMapping: mapping, store: this.store })));
                }, { anchor: mappingButton });
            } }));
    }
    orderByWidget(property, options) {
        const onClick = (value) => {
            if (value != null) {
                this.emitSetProperty(property, {
                    expression: value.expression,
                });
            }
            else {
                this.emitSetProperty(property, null);
            }
        };
        let currentExpression = null;
        const currentSortBy = this.getPropertyValue(property);
        if (currentSortBy != null) {
            currentExpression = currentSortBy.expression;
        }
        const defaultValue = currentExpression
            ? { table: options.table, expression: currentExpression }
            : null;
        const menu = this.director.buildSectionHeaderFieldsMenu(onClick, defaultValue, this.store);
        const menuRender = this.director.getMenuRender();
        return (React.createElement(DropZoneView, { key: this.getKeyFromProperty(property), filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                this.emitSetProperty(property, { expression: data.expression });
            }, className: "" },
            React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                React.createElement(react_1.IconButton, { styles: {
                        root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                        label: null,
                    }, key: property.property, checked: this.getPropertyValue(property) != null, iconProps: {
                        iconName: "SortLines",
                    }, menuProps: {
                        items: menu,
                        gapSpace: options.shiftCallout ? options.shiftCallout : 0,
                        onMenuOpened: () => {
                            fluent_mapping_editor_1.FluentMappingEditor.openEditor(currentExpression, false, null);
                        },
                        onRenderMenuList: menuRender,
                    } }))));
    }
    reorderWidget(property, options = {}) {
        let container;
        return (React.createElement(fluentui_customized_components_1.FluentButton, { ref: (e) => (container = e), key: this.getKeyFromProperty(property), marginTop: "0px", paddingRight: "0px" },
            React.createElement(react_1.DefaultButton, { styles: {
                    root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultComponentsHeight),
                }, iconProps: {
                    iconName: "SortLines",
                }, onClick: () => {
                    globals.popupController.popupAt((context) => {
                        const items = options.items
                            ? options.items
                            : this.getPropertyValue(property);
                        return (React.createElement(controllers_1.PopupView, { context: context },
                            React.createElement(reorder_string_value_1.ReorderStringsValue, Object.assign({ items: items, onConfirm: (items, customOrder) => {
                                    this.emitSetProperty(property, items);
                                    if (customOrder) {
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "orderMode",
                                        }, types_1.OrderMode.order);
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "order",
                                        }, items);
                                    }
                                    else {
                                        this.emitSetProperty({
                                            property: property.property,
                                            field: "orderMode",
                                        }, types_1.OrderMode.alphabetically);
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
        return (React.createElement("div", { className: "charticulator__widget-array-view", key: this.getKeyFromProperty(property) },
            React.createElement(object_list_editor_1.ReorderListView, { enabled: options.allowReorder, onReorder: (dragIndex, dropIndex) => {
                    object_list_editor_1.ReorderListView.ReorderArray(items, dragIndex, dropIndex);
                    this.emitSetProperty(property, items);
                } }, items.map((item, index) => {
                return (React.createElement("div", { key: index, className: "charticulator__widget-array-view-item" },
                    options.allowReorder ? (React.createElement("span", { className: "charticulator__widget-array-view-control charticulator__widget-array-view-order" },
                        React.createElement(react_1.FontIcon, { className: merge_styles_1.mergeStyles({
                                fontSize: "20px",
                                margin: "5px",
                            }), iconName: "CheckListText" }))) : null,
                    React.createElement("span", { className: "charticulator__widget-array-view-content" }, renderItem({
                        property: property.property,
                        field: property.field
                            ? property.field instanceof Array
                                ? [...property.field, index]
                                : [property.field, index]
                            : index,
                    })),
                    options.allowDelete ? (React.createElement("span", { className: "charticulator__widget-array-view-control" },
                        React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                            React.createElement(react_1.DefaultButton, { styles: {
                                    root: {
                                        minWidth: "unset",
                                    },
                                }, iconProps: {
                                    iconName: "Delete",
                                }, onClick: () => {
                                    items.splice(index, 1);
                                    this.emitSetProperty(property, items);
                                } })))) : null));
            }))));
    }
    dropTarget(options, widget) {
        return (React.createElement(DropZoneView, { key: this.getKeyFromProperty(options === null || options === void 0 ? void 0 : options.property) + options.label, filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                this.emitSetProperty(options.property, {
                    expression: data.expression,
                });
            }, className: index_1.classNames("charticulator__widget-control-drop-target"), draggingHint: () => (React.createElement("span", { className: "el-dropzone-hint" }, options.label)) }, widget));
    }
    // Label and text
    icon(icon) {
        return (React.createElement("span", { className: "charticulator__widget-label", key: icon },
            React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon(icon) })));
    }
    label(title, options) {
        // return <span className="charticulator__widget-label">{title}</span>;
        return (React.createElement(fluentui_customized_components_1.FluentLabelHeader, { key: title, marginBottom: (options === null || options === void 0 ? void 0 : options.addMargins) ? "5px" : "0px", marginTop: (options === null || options === void 0 ? void 0 : options.addMargins) ? "5px" : "0px" },
            React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, title)));
    }
    text(title, align = "left") {
        return (React.createElement("span", { className: "charticulator__widget-text", style: { textAlign: align }, key: title + align }, title));
    }
    sep() {
        return React.createElement("span", { className: "charticulator__widget-sep" });
    }
    // Layout elements
    // eslint-disable-next-line max-lines-per-function
    sectionHeader(title, widget, options = {}) {
        this.director.setBuilder(new data_field_binding_builder_1.MenuItemBuilder());
        if (options.dropzone && options.dropzone.type == "axis-data-binding") {
            const current = this.getPropertyValue({
                property: options.dropzone.property,
            });
            const onClick = (value) => {
                if (!value) {
                    this.emitSetProperty({ property: options.dropzone.property }, null);
                }
                else {
                    const data = new actions_1.DragData.DataExpression(this.store.getTable(value.table), value.expression, value.type, value.metadata, value.rawExpression);
                    new actions_1.Actions.BindDataToAxis(this.objectClass.object, options.dropzone.property, null, data, false).dispatch(this.store.dispatcher);
                }
            };
            const defaultValue = current && current.expression
                ? { table: null, expression: current.expression }
                : null;
            const menu = this.director.buildSectionHeaderFieldsMenu(onClick, defaultValue, this.store);
            const menuRender = this.director.getMenuRender();
            return (React.createElement(DropZoneView, { key: title, filter: (data) => data instanceof actions_1.DragData.DataExpression, onDrop: (data) => {
                    new actions_1.Actions.BindDataToAxis(this.objectClass.object, options.dropzone.property, null, data, true).dispatch(this.store.dispatcher);
                }, className: "charticulator__widget-section-header charticulator__widget-section-header-dropzone", draggingHint: () => (React.createElement("span", { className: "el-dropzone-hint" }, options.dropzone.prompt)) },
                title ? (React.createElement(fluentui_customized_components_1.FluentLabelHeader, null,
                    React.createElement(react_1.Label, null, title))) : null,
                widget,
                React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px", marginLeft: "6px" },
                    React.createElement(react_1.DefaultButton, { key: title, iconProps: {
                            iconName: "Link",
                        }, menuProps: {
                            items: menu,
                            onRenderMenuList: menuRender,
                        }, styles: {
                            menuIcon: {
                                display: "none !important",
                            },
                            root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                        } }))));
        }
        else {
            return (React.createElement("div", { className: "charticulator__widget-section-header" },
                React.createElement(fluentui_customized_components_1.FluentLabelHeader, null,
                    React.createElement(react_1.Label, null, title)),
                widget));
        }
    }
    horizontal(cols, ...widgets) {
        return (React.createElement("div", { className: "charticulator__widget-horizontal" }, widgets.map((x, id) => (React.createElement("span", { className: `el-layout-item el-layout-item-col-${cols[id]}`, key: id }, x)))));
    }
    filterEditor(options) {
        return (React.createElement(fluentui_filter_1.FilterPanel, { options: Object.assign({}, options), text: strings_1.strings.filter.filterBy, manager: this }));
    }
    groupByEditor(options) {
        let button;
        let text = strings_1.strings.objects.plotSegment.groupBy;
        const getControl = () => {
            var _a, _b;
            switch (options.mode) {
                case "button" /* Button */:
                    if (options.value) {
                        if (options.value.expression) {
                            text =
                                strings_1.strings.objects.plotSegment.groupByCategory +
                                    options.value.expression;
                        }
                    }
                    return (React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px", key: this.getKeyFromProperty((_a = options.target) === null || _a === void 0 ? void 0 : _a.property) + (options === null || options === void 0 ? void 0 : options.table) + (options === null || options === void 0 ? void 0 : options.value) },
                        React.createElement(react_1.DefaultButton, { styles: {
                                root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultComponentsHeight),
                            }, text: text, elementRef: (e) => (button = e), iconProps: {
                                iconName: "RowsGroup",
                            }, onClick: () => {
                                globals.popupController.popupAt((context) => {
                                    return (React.createElement(controllers_1.PopupView, { context: context },
                                        React.createElement(groupby_editor_1.GroupByEditor, { manager: this, value: options.value, options: options })));
                                }, { anchor: button });
                            } })));
                case "panel" /* Panel */:
                    return (React.createElement(groupby_editor_1.GroupByEditor, { key: this.getKeyFromProperty((_b = options === null || options === void 0 ? void 0 : options.target) === null || _b === void 0 ? void 0 : _b.property) +
                            options.table + (options === null || options === void 0 ? void 0 : options.value), manager: this, value: options.value, options: options }));
            }
        };
        return (React.createElement("div", { style: { display: "inline" }, ref: (e) => (button = e) }, getControl()));
    }
    nestedChartEditor(property, options) {
        return (React.createElement(React.Fragment, { key: this.getKeyFromProperty(property) }, this.vertical(React.createElement(fluentui_customized_components_1.NestedChartButtonsWrapper, null,
            React.createElement(components_1.ButtonRaised, { text: "Edit Nested Chart...", onClick: () => {
                    this.store.dispatcher.dispatch(new actions_2.OpenNestedEditor(this.objectClass.object, property, options));
                } })), React.createElement(fluentui_customized_components_1.NestedChartButtonsWrapper, null,
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
                }) })))));
    }
    row(title, widget) {
        return (React.createElement("div", { className: "charticulator__widget-row", key: title },
            title != null ? (React.createElement("span", { className: "charticulator__widget-row-label el-layout-item" }, title)) : // <Label>{title}</Label>
                null,
            widget));
    }
    vertical(...widgets) {
        return (React.createElement("div", { className: "charticulator__widget-vertical" }, widgets.map((x, id) => (React.createElement("span", { className: "el-layout-item", key: id }, x)))));
    }
    verticalGroup(options, widgets) {
        return (React.createElement(collapsiblePanel_1.CollapsiblePanel, { header: options.header, widgets: widgets, isCollapsed: options.isCollapsed, alignVertically: options.alignVertically }));
    }
    table(rows, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options) {
        return (React.createElement("table", { className: "charticulator__widget-table" },
            React.createElement("tbody", null, rows.map((row, index) => (React.createElement("tr", { key: index }, row.map((x, i) => (React.createElement("td", { key: i },
                React.createElement("span", { className: "el-layout-item" }, x))))))))));
    }
    scrollList(widgets, options = {}) {
        return (React.createElement("div", { className: "charticulator__widget-scroll-list", style: {
                maxHeight: options.maxHeight ? options.maxHeight + "px" : undefined,
                height: options.height ? options.height + "px" : undefined,
            } }, widgets.map((widget, i) => (React.createElement("div", { className: "charticulator__widget-scroll-list-item", key: i, style: options.styles }, widget)))));
    }
    tooltip(widget, tooltipContent) {
        return React.createElement(react_1.TooltipHost, { content: tooltipContent }, widget);
    }
    customCollapsiblePanel(widgets, options = {}) {
        return (React.createElement(custom_collapsible_panel_1.CustomCollapsiblePanel, { widgets: widgets, styles: options.styles, header: options.header }));
    }
}
exports.FluentUIWidgetManager = FluentUIWidgetManager;
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
class FluentDetailsButton extends React.Component {
    componentDidUpdate() {
        if (this.inner) {
            this.inner.forceUpdate();
        }
    }
    render() {
        let btn;
        return (React.createElement(React.Fragment, null,
            this.props.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, this.props.label)) : null,
            React.createElement(react_1.DefaultButton, { iconProps: {
                    iconName: "More",
                }, componentRef: (e) => (btn = ReactDOM.findDOMNode(e)), onClick: () => {
                    globals.popupController.popupAt((context) => {
                        return (React.createElement(controllers_1.PopupView, { context: context },
                            React.createElement(DetailsButtonInner, { parent: this, ref: (e) => (this.inner = e) })));
                    }, {
                        anchor: btn,
                        alignX: controllers_1.getAlignment(btn).alignX,
                    });
                } })));
    }
}
exports.FluentDetailsButton = FluentDetailsButton;
class DetailsButtonInner extends React.Component {
    render() {
        const parent = this.props.parent;
        return (React.createElement("div", { className: "charticulator__widget-popup-details" }, parent.props.manager.vertical(...parent.props.widgets)));
    }
}
exports.DetailsButtonInner = DetailsButtonInner;
//# sourceMappingURL=fluentui_manager.js.map
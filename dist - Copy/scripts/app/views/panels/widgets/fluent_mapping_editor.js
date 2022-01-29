"use strict";
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentOfType = exports.DataMappAndScaleEditor = exports.FluentMappingEditor = void 0;
const React = require("react");
const core_1 = require("../../../../core");
const actions_1 = require("../../../actions");
const fluentui_color_picker_1 = require("../../../components/fluentui_color_picker");
const context_component_1 = require("../../../context_component");
const common_1 = require("../../dataset/common");
const scale_editor_1 = require("../scale_editor");
const manager_1 = require("./manager");
const scale_value_selector_1 = require("../scale_value_selector");
const fluentui_value_editor_1 = require("./fluentui_value_editor");
const fluentui_input_expression_1 = require("./controls/fluentui_input_expression");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("./controls/fluentui_customized_components");
const fluent_ui_data_field_selector_1 = require("../../dataset/fluent_ui_data_field_selector");
const data_field_binding_builder_1 = require("../../dataset/data_field_binding_builder");
const strings_1 = require("../../../../strings");
const specification_1 = require("../../../../core/specification");
class FluentMappingEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateEvents = new core_1.EventEmitter();
        this.state = {
            showNoneAsValue: false,
            isDataFieldValueSelectionOpen: false,
            isColorPickerOpen: false,
        };
        this.director = null;
        this.director = new data_field_binding_builder_1.Director();
        this.director.setBuilder(new data_field_binding_builder_1.MenuItemBuilder());
    }
    changeDataFieldValueSelectionState() {
        this.setState(Object.assign(Object.assign({}, this.state), { isDataFieldValueSelectionOpen: !this.state.isDataFieldValueSelectionOpen }));
    }
    changeColorPickerState() {
        this.setState(Object.assign(Object.assign({}, this.state), { isColorPickerOpen: !this.state.isColorPickerOpen }));
    }
    openDataFieldValueSelection() {
        const parent = this.props.parent;
        const attribute = this.props.attribute;
        const mapping = parent.getAttributeMapping(attribute);
        const scaleMapping = mapping;
        if (scaleMapping === null || scaleMapping === void 0 ? void 0 : scaleMapping.scale) {
            const scaleObject = core_1.getById(this.props.store.chart.scales, scaleMapping.scale);
            return (React.createElement(React.Fragment, null, this.state.isDataFieldValueSelectionOpen && (React.createElement(react_1.Callout, { target: `#dataFieldValueSelection`, onDismiss: () => this.changeDataFieldValueSelectionState() },
                React.createElement(scale_value_selector_1.ScaleValueSelector, { scale: scaleObject, scaleMapping: mapping, store: this.props.store, onSelect: (index) => {
                        const paresedExpression = core_1.Expression.parse(scaleMapping.expression);
                        // change the second param of get function
                        paresedExpression.args[1].value = index;
                        scaleMapping.expression = paresedExpression.toString();
                        this.props.parent.onEditMappingHandler(this.props.attribute, scaleMapping);
                        this.changeDataFieldValueSelectionState();
                    } })))));
        }
        return null;
    }
    initiateValueEditor() {
        switch (this.props.type) {
            case "number":
            case "font-family":
            case "text":
                {
                    this.setState(Object.assign(Object.assign({}, this.state), { showNoneAsValue: true }));
                }
                break;
            case "color":
                {
                    if (this.noneLabel == null) {
                        return;
                    }
                    this.changeColorPickerState();
                }
                break;
        }
    }
    setValueMapping(value) {
        this.props.parent.onEditMappingHandler(this.props.attribute, {
            type: "value",
            value,
        });
    }
    clearMapping() {
        this.props.parent.onEditMappingHandler(this.props.attribute, null);
        this.setState(Object.assign(Object.assign({}, this.state), { showNoneAsValue: false }));
    }
    mapData(data, hints) {
        this.props.parent.onMapDataHandler(this.props.attribute, data, hints);
    }
    componentDidUpdate() {
        this.updateEvents.emit("update");
    }
    getTableOrDefault() {
        if (this.props.options.table) {
            return this.props.options.table;
        }
        else {
            return this.props.parent.store.getTables()[0].name;
        }
    }
    renderValueEditor(value) {
        let placeholderText = this.props.options.defaultAuto
            ? strings_1.strings.core.auto
            : strings_1.strings.core.none;
        if (this.props.options.defaultValue != null) {
            placeholderText = this.props.options.defaultValue.toString();
        }
        const parent = this.props.parent;
        const attribute = this.props.attribute;
        const options = this.props.options;
        const mapping = parent.getAttributeMapping(attribute);
        const table = mapping ? mapping.table : options.table;
        const builderProps = getMenuProps.bind(this)(parent, attribute, options);
        const mainMenuItems = this.director.buildFieldsMenu(builderProps.onClick, builderProps.defaultValue, parent.store, this, attribute, table, options.acceptKinds);
        const menuRender = this.director.getMenuRender();
        return (React.createElement(React.Fragment, null,
            React.createElement(fluentui_value_editor_1.FluentValueEditor, { label: this.props.options.label, value: value, type: this.props.type, placeholder: placeholderText, onClear: () => this.clearMapping(), onEmitValue: (value) => this.setValueMapping(value), onEmitMapping: (mapping) => this.props.parent.onEditMappingHandler(this.props.attribute, mapping), onBeginDataFieldSelection: () => {
                    if (this.mappingButton) {
                        this.mappingButton.click();
                    }
                }, getTable: () => this.getTableOrDefault(), hints: this.props.options.hints, numberOptions: this.props.options.numberOptions, stopPropagation: this.props.options.stopPropagation, mainMenuItems: mainMenuItems, menuRender: menuRender })));
    }
    renderColorPicker() {
        return (React.createElement(React.Fragment, null, this.state.isColorPickerOpen && (React.createElement(react_1.Callout, { target: `#id_${this.props.options.label}`, onDismiss: () => this.changeColorPickerState() },
            React.createElement(fluentui_color_picker_1.ColorPicker, { store: this.props.store, defaultValue: null, allowNull: true, onPick: (color) => {
                    if (color == null) {
                        this.clearMapping();
                    }
                    else {
                        this.setValueMapping(color);
                    }
                    this.changeColorPickerState();
                }, parent: this })))));
    }
    renderCurrentAttributeMapping() {
        const parent = this.props.parent;
        const attribute = this.props.attribute;
        const options = this.props.options;
        const mapping = parent.getAttributeMapping(attribute);
        if (!mapping) {
            if (options.defaultValue != undefined) {
                return this.renderValueEditor(options.defaultValue);
            }
            else {
                let alwaysShowNoneAsValue = false;
                if (this.props.type == core_1.Specification.AttributeType.Number ||
                    this.props.type == core_1.Specification.AttributeType.Enum ||
                    this.props.type == core_1.Specification.AttributeType.Image) {
                    alwaysShowNoneAsValue = true;
                }
                if (this.state.showNoneAsValue || alwaysShowNoneAsValue) {
                    return this.renderValueEditor(null);
                }
                else {
                    if (options.defaultAuto) {
                        return (React.createElement(React.Fragment, null,
                            this.renderColorPicker(),
                            React.createElement(react_1.TextField, { styles: fluentui_customized_components_1.defaultStyle, label: this.props.options.label, onRenderLabel: fluentui_customized_components_1.labelRender, placeholder: strings_1.strings.core.auto, onClick: () => {
                                    if (!mapping || mapping.valueIndex == undefined) {
                                        this.initiateValueEditor();
                                    }
                                } })));
                    }
                    else {
                        return (React.createElement(React.Fragment, null,
                            this.renderColorPicker(),
                            React.createElement(react_1.TextField, { id: `id_${this.props.options.label}`, styles: fluentui_customized_components_1.defaultStyle, label: this.props.options.label, onRenderLabel: fluentui_customized_components_1.labelRender, placeholder: strings_1.strings.core.none, onClick: () => {
                                    if (!mapping || mapping.valueIndex == undefined) {
                                        this.initiateValueEditor();
                                    }
                                } })));
                    }
                }
            }
        }
        else {
            switch (mapping.type) {
                case core_1.Specification.MappingType.value: {
                    const valueMapping = mapping;
                    return this.renderValueEditor(valueMapping.value);
                }
                case core_1.Specification.MappingType.text: {
                    const textMapping = mapping;
                    return (React.createElement(fluentui_input_expression_1.FluentInputExpression, { label: this.props.options.label, defaultValue: textMapping.textExpression, textExpression: true, value: textMapping.textExpression, validate: (value) => parent.store.verifyUserExpressionWithTable(value, textMapping.table, { textExpression: true, expectedTypes: ["string"] }), allowNull: true, onEnter: (newValue) => {
                            if (newValue == null || newValue.trim() == "") {
                                this.clearMapping();
                            }
                            else {
                                if (core_1.Expression.parseTextExpression(newValue).isTrivialString()) {
                                    this.props.parent.onEditMappingHandler(this.props.attribute, {
                                        type: core_1.Specification.MappingType.value,
                                        value: newValue,
                                    });
                                }
                                else {
                                    this.props.parent.onEditMappingHandler(this.props.attribute, {
                                        type: core_1.Specification.MappingType.text,
                                        table: textMapping.table,
                                        textExpression: newValue,
                                    });
                                }
                            }
                            return true;
                        } }));
                }
                case core_1.Specification.MappingType.scale: {
                    const scaleMapping = mapping;
                    const table = mapping ? mapping.table : options.table;
                    const builderProps = getMenuProps.bind(this)(parent, attribute, options);
                    const mainMenuItems = this.director.buildFieldsMenu(builderProps.onClick, builderProps.defaultValue, parent.store, this, attribute, table, options.acceptKinds);
                    const menuRender = this.director.getMenuRender();
                    if (scaleMapping.scale) {
                        return (React.createElement(React.Fragment, null,
                            this.props.options.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, this.props.options.label)) : null,
                            React.createElement(fluentui_customized_components_1.FluentActionButton, null,
                                React.createElement(react_1.ActionButton, { elementRef: (e) => (this.mappingButton = e), styles: {
                                        menuIcon: Object.assign({ display: "none !important" }, fluentui_customized_components_1.defultComponentsHeight),
                                        root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
                                    }, title: strings_1.strings.mappingEditor.bindData, menuProps: {
                                        items: mainMenuItems,
                                        onRenderMenuList: menuRender,
                                        onMenuOpened: () => {
                                            var _a;
                                            const currentMapping = parent.getAttributeMapping(attribute);
                                            FluentMappingEditor.openEditor((_a = currentMapping) === null || _a === void 0 ? void 0 : _a.expression, false, this.mappingButton);
                                        },
                                    }, text: scaleMapping.expression, iconProps: {
                                        iconName: "ColumnFunction",
                                    }, onMenuClick: (event) => {
                                        if (scaleMapping.expression.startsWith("get")) {
                                            event.preventDefault();
                                            this.changeDataFieldValueSelectionState();
                                        }
                                    } }))));
                    }
                    else {
                        return (React.createElement(React.Fragment, null,
                            this.props.options.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, this.props.options.label)) : null,
                            React.createElement(fluentui_customized_components_1.FluentActionButton, null,
                                React.createElement(react_1.ActionButton, { text: scaleMapping.expression, elementRef: (e) => (this.mappingButton = e), iconProps: {
                                        iconName: "ColumnFunction",
                                    } }))));
                    }
                }
                case core_1.Specification.MappingType.expressionScale:
                    {
                        const scaleMapping = mapping;
                        const table = mapping ? scaleMapping.table : options.table;
                        const builderProps = getMenuProps.bind(this)(parent, attribute, options);
                        const mainMenuItems = this.director.buildFieldsMenu(builderProps.onClick, builderProps.defaultValue, parent.store, this, attribute, table, options.acceptKinds);
                        const menuRender = this.director.getMenuRender();
                        return (React.createElement(React.Fragment, null,
                            this.props.options.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, this.props.options.label)) : null,
                            React.createElement(fluentui_customized_components_1.FluentRowLayout, null,
                                React.createElement(fluentui_customized_components_1.FluentActionButton, { style: {
                                        flex: 1,
                                        marginRight: "2px",
                                    } },
                                    React.createElement(react_1.ActionButton, { elementRef: (e) => (this.mappingButton = e), styles: {
                                            menuIcon: Object.assign({ display: "none !important" }, fluentui_customized_components_1.defultComponentsHeight),
                                            root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
                                        }, title: strings_1.strings.mappingEditor.keyColumnExpression, 
                                        // menuProps={{
                                        //   items: mainMenuItems,
                                        //   onRenderMenuList: menuRender,
                                        //   onMenuOpened: () => {
                                        //     const currentMapping = parent.getAttributeMapping(
                                        //       attribute
                                        //     );
                                        //     FluentMappingEditor.openEditor(
                                        //       (currentMapping as Specification.ScaleValueExpressionMapping)
                                        //         ?.expression,
                                        //       false,
                                        //       this.mappingButton
                                        //     );
                                        //   },
                                        // }}
                                        text: scaleMapping.expression, iconProps: {
                                            iconName: "ColumnFunction",
                                        }, onMenuClick: (event) => {
                                            if (scaleMapping.expression.startsWith("get")) {
                                                event.preventDefault();
                                                this.changeDataFieldValueSelectionState();
                                            }
                                        } })),
                                React.createElement(fluentui_customized_components_1.FluentActionButton, { style: {
                                        flex: 1,
                                    } },
                                    React.createElement(react_1.ActionButton, { elementRef: (e) => (this.mappingButton = e), styles: {
                                            menuIcon: Object.assign({ display: "none !important" }, fluentui_customized_components_1.defultComponentsHeight),
                                            root: Object.assign({}, fluentui_customized_components_1.defultComponentsHeight),
                                        }, title: strings_1.strings.mappingEditor.bindData, menuProps: {
                                            items: mainMenuItems,
                                            onRenderMenuList: menuRender,
                                            onMenuOpened: () => {
                                                var _a;
                                                const currentMapping = parent.getAttributeMapping(attribute);
                                                FluentMappingEditor.openEditor((_a = currentMapping) === null || _a === void 0 ? void 0 : _a.valueExpression, false, this.mappingButton);
                                            },
                                        }, text: scaleMapping.valueExpression, iconProps: {
                                            iconName: "ColumnFunction",
                                        }, onMenuClick: (event) => {
                                            if (scaleMapping.expression.startsWith("get")) {
                                                event.preventDefault();
                                                this.changeDataFieldValueSelectionState();
                                            }
                                        } })))));
                    }
                    break;
                default: {
                    return React.createElement("span", null, "(...)");
                }
            }
        }
    }
    render() {
        const parent = this.props.parent;
        const attribute = this.props.attribute;
        const options = this.props.options;
        const currentMapping = parent.getAttributeMapping(attribute);
        // If there is a mapping, also not having default or using auto
        const shouldShowBindData = parent.onMapDataHandler != null;
        const isDataMapping = currentMapping != null &&
            (currentMapping.type == "scale" || currentMapping.type == "value");
        const valueIndex = currentMapping && currentMapping.valueIndex;
        if (this.props.options.openMapping) {
            setTimeout(() => {
                var _a;
                FluentMappingEditor.openEditor((_a = currentMapping) === null || _a === void 0 ? void 0 : _a.expression, true, this.mappingButton);
            }, 0);
        }
        const table = currentMapping
            ? currentMapping.table
            : options.table;
        const builderProps = getMenuProps.bind(this)(parent, attribute, options);
        const mainMenuItems = this.director.buildFieldsMenu(builderProps.onClick, builderProps.defaultValue, parent.store, this, attribute, table, options.acceptKinds);
        const menuRender = this.director.getMenuRender();
        return (React.createElement("div", { ref: (e) => (this.noneLabel = e), key: attribute },
            React.createElement(manager_1.DropZoneView, { filter: (data) => {
                    if (!shouldShowBindData) {
                        return false;
                    }
                    if (data instanceof actions_1.DragData.DataExpression) {
                        return common_1.isKindAcceptable(data.metadata.kind, options.acceptKinds);
                    }
                    else {
                        return false;
                    }
                }, onDrop: (data, point, modifiers) => {
                    if (!options.hints) {
                        options.hints = {};
                    }
                    options.hints.newScale = modifiers.shiftKey;
                    options.hints.scaleID = data.scaleID;
                    const parsedExpression = core_1.Expression.parse(data.expression);
                    if (data.allowSelectValue && parsedExpression.name !== "get") {
                        data.expression = `get(${data.expression}, 0)`;
                    }
                    // because original mapping allowed it
                    if (parsedExpression.name === "get") {
                        data.allowSelectValue = true;
                    }
                    this.mapData(data, Object.assign(Object.assign({}, options.hints), { allowSelectValue: data.allowSelectValue }));
                }, className: "charticulator__widget-control-mapping-editor" }, parent.horizontal([1, 0], this.renderCurrentAttributeMapping(), React.createElement("span", null,
                isDataMapping ? (React.createElement(fluentui_customized_components_1.FluentButton, null,
                    React.createElement(react_1.DefaultButton, { iconProps: {
                            iconName: "EraseTool",
                        }, styles: {
                            root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                        }, checked: false, title: strings_1.strings.mappingEditor.remove, onClick: () => {
                            if (parent.getAttributeMapping(attribute)) {
                                this.clearMapping();
                            }
                            this.setState(Object.assign(Object.assign({}, this.state), { showNoneAsValue: false }));
                        } }))) : null,
                (valueIndex === undefined || valueIndex === null) &&
                    shouldShowBindData ? (React.createElement(React.Fragment, null,
                    React.createElement(fluentui_customized_components_1.FluentButton, null,
                        React.createElement(react_1.DefaultButton, { elementRef: (e) => (this.mappingButton = e), iconProps: {
                                iconName: "Link",
                            }, styles: {
                                menuIcon: {
                                    display: "none !important",
                                },
                                root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                            }, title: strings_1.strings.mappingEditor.bindData, checked: isDataMapping, menuProps: {
                                items: mainMenuItems,
                                onRenderMenuList: menuRender,
                            } })))) : null,
                valueIndex !== undefined && valueIndex !== null ? (React.createElement(fluentui_customized_components_1.FluentButton, null,
                    React.createElement(react_1.DefaultButton, { iconProps: {
                            iconName: "Link",
                        }, id: "dataFieldValueSelection", styles: {
                            root: Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize),
                        }, title: strings_1.strings.mappingEditor.bindDataValue, elementRef: (e) => (this.mappingButton = e), onClick: () => {
                            this.changeDataFieldValueSelectionState();
                        }, checked: isDataMapping }))) : null,
                this.openDataFieldValueSelection())))));
    }
    static menuKeyClick(derivedExpression) {
        setTimeout(() => {
            const aggContainer = document.querySelector("body :last-child.ms-Layer");
            const button = aggContainer === null || aggContainer === void 0 ? void 0 : aggContainer.querySelector("button.ms-ContextualMenu-splitMenu");
            if (button == null) {
                const derColumnsContainer = document.querySelector("body :last-child.ms-Layer");
                const derColumnsContainerXpath = `//ul//span[text()="${derivedExpression}"]`;
                const derMenuItem = document.evaluate(derColumnsContainerXpath, derColumnsContainer, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                setTimeout(() => {
                    derMenuItem === null || derMenuItem === void 0 ? void 0 : derMenuItem.click();
                    setTimeout(() => {
                        const aggContainer = document.querySelector("body :last-child.ms-Layer");
                        const splitButton = aggContainer === null || aggContainer === void 0 ? void 0 : aggContainer.querySelector("button.ms-ContextualMenu-splitMenu");
                        splitButton === null || splitButton === void 0 ? void 0 : splitButton.click();
                    }, 100);
                }, 100);
            }
            else {
                button === null || button === void 0 ? void 0 : button.click();
            }
        }, 100);
    }
    static openEditor(expressionString, clickOnButton, mappingButton) {
        setTimeout(() => {
            if (clickOnButton) {
                mappingButton === null || mappingButton === void 0 ? void 0 : mappingButton.click();
            }
            setTimeout(() => {
                var _a;
                let expression = null;
                let expressionAggregation = null;
                let derivedExpression = null;
                if (expressionString != null) {
                    const parsed = core_1.Expression.parse(expressionString);
                    if (parsed instanceof core_1.Expression.FunctionCall) {
                        expression = parsed.args[0].toString();
                        expressionAggregation = parsed.name;
                        //dataFieldValueSelection
                        if (expressionAggregation.startsWith("get")) {
                            return;
                        }
                        //derived columns
                        if (expression.startsWith("date.")) {
                            derivedExpression = (_a = common_1.type2DerivedColumns.date.find((item) => expression.startsWith(item.function))) === null || _a === void 0 ? void 0 : _a.displayName;
                        }
                    }
                    expression = expression === null || expression === void 0 ? void 0 : expression.split("`").join("");
                    const aggContainer = document.querySelector("body :last-child.ms-Layer");
                    const xpath = `//ul//span[contains(text(), "${expression}")]`;
                    const menuItem = document.evaluate(xpath, aggContainer, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (menuItem == null) {
                        const derSubXpath = `//ul//span[contains(text(), "${derivedExpression}")]`;
                        const derElement = document.evaluate(derSubXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        setTimeout(() => {
                            derElement === null || derElement === void 0 ? void 0 : derElement.click();
                            FluentMappingEditor.menuKeyClick(derivedExpression);
                        });
                    }
                    else {
                        setTimeout(() => {
                            menuItem === null || menuItem === void 0 ? void 0 : menuItem.click();
                            FluentMappingEditor.menuKeyClick(derivedExpression);
                        }, 0);
                    }
                }
            }, 0);
        });
    }
}
exports.FluentMappingEditor = FluentMappingEditor;
class DataMappAndScaleEditor extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = {
            currentMapping: this.props.defaultMapping,
        };
    }
    componentDidMount() {
        this.tokens = [
            this.props.parent.updateEvents.addListener("update", () => {
                this.setState({
                    currentMapping: this.props.parent.props.parent.getAttributeMapping(this.props.attribute),
                });
            }),
        ];
    }
    componentWillUnmount() {
        for (const t of this.tokens) {
            t.remove();
        }
    }
    renderScaleEditor() {
        const mapping = this.state.currentMapping;
        if (mapping && mapping.type == "scale") {
            const scaleMapping = mapping;
            if (scaleMapping.scale) {
                const scaleObject = core_1.getById(this.store.chart.scales, scaleMapping.scale);
                return (React.createElement(scale_editor_1.ScaleEditor, { scale: scaleObject, scaleMapping: scaleMapping, store: this.store, plotSegment: this.props.plotSegment }));
            }
        }
        return null;
    }
    renderDataPicker() {
        const options = this.props.options;
        let currentExpression = null;
        const mapping = this.state.currentMapping;
        if (mapping != null && mapping.type == "scale") {
            currentExpression = mapping.expression;
        }
        return (React.createElement("div", null,
            React.createElement(fluent_ui_data_field_selector_1.DataFieldSelector, { table: mapping ? mapping.table : options.table, datasetStore: this.store, kinds: options.acceptKinds, useAggregation: true, defaultValue: currentExpression
                    ? { table: options.table, expression: currentExpression }
                    : null, nullDescription: strings_1.strings.core.none, nullNotHighlightable: true, onChange: (value) => {
                    if (value != null) {
                        this.props.parent.mapData(new actions_1.DragData.DataExpression(this.store.getTable(value.table), value.expression, value.type, value.metadata, value.rawExpression), options.hints);
                    }
                    else {
                        this.props.parent.clearMapping();
                        this.props.onClose();
                    }
                } })));
    }
    render() {
        const scaleElement = this.renderScaleEditor();
        if (scaleElement) {
            return (React.createElement("div", { className: "charticulator__data-mapping-and-scale-editor" },
                React.createElement("div", { className: this.props.alignLeft ? "el-scale-editor-left" : "el-scale-editor" }, scaleElement),
                React.createElement("div", { className: "el-data-picker" }, this.renderDataPicker())));
        }
        else {
            return (React.createElement("div", { className: "charticulator__data-mapping-and-scale-editor" },
                React.createElement("div", { className: "el-data-picker" }, this.renderDataPicker())));
        }
    }
}
exports.DataMappAndScaleEditor = DataMappAndScaleEditor;
function parentOfType(p, typeSought) {
    while (p) {
        if (core_1.Prototypes.isType(p.object.classID, typeSought)) {
            return p;
        }
        p = p.parent;
    }
}
exports.parentOfType = parentOfType;
function getMenuProps(parent, attribute, options) {
    var _a;
    const currentMapping = parent.getAttributeMapping(attribute);
    const table = currentMapping ? currentMapping.table : options.table;
    const onClick = (value) => {
        if (value != null) {
            this.mapData(new actions_1.DragData.DataExpression(this.props.store.getTable(value.table), value.expression, value.type, value.metadata, value.rawExpression), options.hints);
        }
        else {
            this.clearMapping();
        }
    };
    const mapping = parent.getAttributeMapping(attribute);
    let currentExpression = null;
    if (mapping != null) {
        if (mapping.type == specification_1.MappingType.text) {
            currentExpression = mapping.textExpression;
        }
        if (mapping.type == specification_1.MappingType.scale) {
            currentExpression = mapping.expression;
        }
    }
    const defaultValue = currentExpression
        ? {
            table: (_a = options === null || options === void 0 ? void 0 : options.table) !== null && _a !== void 0 ? _a : table,
            expression: currentExpression,
            type: mapping === null || mapping === void 0 ? void 0 : mapping.type,
        }
        : null;
    return {
        onClick,
        defaultValue,
    };
}
//# sourceMappingURL=fluent_mapping_editor.js.map
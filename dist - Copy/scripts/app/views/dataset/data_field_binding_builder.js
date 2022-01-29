"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Director = exports.MenuItemBuilder = void 0;
const core_1 = require("../../../core");
const react_1 = require("@fluentui/react");
const common_1 = require("./common");
const scale_editor_1 = require("../panels/scale_editor");
const fluent_mapping_editor_1 = require("../panels/widgets/fluent_mapping_editor");
const strings_1 = require("../../../strings");
const specification_1 = require("../../../core/specification");
const fluentui_customized_components_1 = require("../panels/widgets/controls/fluentui_customized_components");
const collapsiblePanel_1 = require("../panels/widgets/controls/collapsiblePanel");
const React = require("react");
const DELIMITER = "-";
const DERIVED_COLUMNS_KEY_PREFIX = "_derived";
class MenuItemsCreator {
    constructor() {
        this.menuItems = [];
        this.nullDescription = strings_1.strings.core.none;
        this.fields = [];
        this.nullSelectable = true;
        this.onClick = () => {
            alert();
        };
        this.useAggregation = false;
        this.useDerivedColumns = false;
        this.isDerivedColumns = false;
        this.derivedColumnsIdx = [];
        this.selectedKey = null;
        this.defaultValue = null;
    }
    onToggleSelect(field, ev, item) {
        ev && ev.preventDefault && ev.preventDefault();
        if (item && field) {
            this.selectedKey = field.columnName + DELIMITER + item.key;
        }
    }
    onToggleDerivedSelect(field, derivedField, ev, item) {
        ev && ev.preventDefault();
        if (derivedField && field && item) {
            this.selectedKey =
                field.columnName + DELIMITER + derivedField + DELIMITER + item.key;
        }
    }
    setFieds(datasetStore, table, kinds, types) {
        this.fields = this.getTableFields(datasetStore, table, kinds, types);
    }
    getTableFields(store, table, kinds, types) {
        const storeTable = store
            .getTables()
            .filter((storeTable) => storeTable.name == table || table == null)[0];
        const imagesTable = store
            .getTables()
            .filter((storeTable) => storeTable.name.endsWith("Images"))[0];
        const columns = core_1.deepClone(storeTable.columns);
        //append image column
        if (imagesTable) {
            const imageColumn = imagesTable.columns.filter((column) => column.type === specification_1.DataType.Image)[0];
            columns.push(imageColumn);
        }
        const columnFilters = [];
        columnFilters.push((x) => !x.metadata.isRaw);
        if (table) {
            columnFilters.push((x) => x.table == table);
        }
        if (kinds) {
            columnFilters.push((x) => x.metadata != null && common_1.isKindAcceptable(x.metadata.kind, kinds));
        }
        if (types) {
            columnFilters.push((x) => x.metadata != null && types.indexOf(x.type) >= 0);
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
                table: storeTable.name,
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
                        table: storeTable.name,
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
    transformField(item, aggregation = null) {
        var _a;
        if (aggregation == null) {
            aggregation = core_1.Expression.getDefaultAggregationFunction(item.type, (_a = item.metadata) === null || _a === void 0 ? void 0 : _a.kind);
        }
        const r = {
            table: item.table,
            expression: item.expression,
            rawExpression: item.rawExpression,
            columnName: item.columnName,
            type: item.type,
            metadata: item.metadata,
        };
        if (this.useAggregation) {
            r.expression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.expression)).toString();
            r.rawExpression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.rawExpression)).toString();
        }
        return r;
    }
    transformDerivedField(item, expression, aggregation = null) {
        var _a;
        if (aggregation == null) {
            aggregation = core_1.Expression.getDefaultAggregationFunction(item.type, (_a = item.metadata) === null || _a === void 0 ? void 0 : _a.kind);
        }
        const r = {
            table: item.table,
            expression: item.expression + expression,
            rawExpression: item.rawExpression + expression,
            columnName: item.columnName,
            type: item.type,
            metadata: item.metadata,
        };
        if (this.useAggregation) {
            r.expression = expression;
            r.rawExpression = core_1.Expression.functionCall(aggregation, core_1.Expression.parse(item.rawExpression)).toString();
        }
        return r;
    }
    checkSelection(key) {
        return key.localeCompare(this.selectedKey) === 0;
    }
    buildMenuFieldsItems() {
        var _a, _b, _c;
        // if useAggregation == true -> create sub menu
        const mapping = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.getAttributeMapping(this.attribute);
        this.menuItems = this.fields.map((field, idx) => {
            const onClickFn = (ev, item) => {
                const transformedField = this.transformField(field, item === null || item === void 0 ? void 0 : item.key);
                if ((mapping === null || mapping === void 0 ? void 0 : mapping.type) === specification_1.MappingType.text) {
                    this.textMappingOnClick(transformedField.expression, field);
                }
                else {
                    this.onClick(transformedField);
                }
                this.onToggleSelect(field, ev, item);
            };
            let subMenuCheckedItem = null;
            const derivedColumns = common_1.type2DerivedColumns[field.type];
            if (derivedColumns) {
                this.isDerivedColumns = true;
                this.derivedColumnsIdx.push([idx, field]);
            }
            const subMenuProps = this.useAggregation
                ? {
                    items: core_1.Expression.getCompatibleAggregationFunctionsByDataKind(field.metadata.kind).map((subMenuItem) => {
                        const selectionKey = field.columnName + DELIMITER + subMenuItem.name;
                        const isSelected = this.checkSelection(selectionKey);
                        if (isSelected) {
                            subMenuCheckedItem = subMenuItem.displayName;
                        }
                        const mappingConfig = this.scaleEditorMenu(isSelected);
                        return {
                            key: subMenuItem.name,
                            text: subMenuItem.displayName,
                            isChecked: isSelected,
                            canCheck: true,
                            onClick: onClickFn,
                            split: mappingConfig.isMappingEditor,
                            subMenuProps: mappingConfig.scaleEditorSubMenuProps,
                        };
                    }),
                }
                : null;
            const selectionKey = field.columnName + DELIMITER + field.columnName;
            const itemText = field.columnName +
                (subMenuProps && subMenuCheckedItem && mapping ? `` : "");
            return {
                key: field.columnName + (derivedColumns ? DERIVED_COLUMNS_KEY_PREFIX : ""),
                text: itemText,
                subMenuProps,
                canCheck: subMenuProps ? null : true,
                isChecked: this.checkSelection(selectionKey),
                onClick: subMenuProps ? null : onClickFn,
                data: subMenuCheckedItem,
            };
        });
    }
    renderScaleEditor(parent, store) {
        var _a, _b;
        const mapping = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent.getAttributeMapping(this.attribute);
        if (mapping && mapping.type == specification_1.MappingType.scale) {
            const scaleMapping = mapping;
            if (scaleMapping.scale) {
                const scaleObject = core_1.getById(this.store.chart.scales, scaleMapping.scale);
                return (React.createElement(scale_editor_1.ScaleEditor, { scale: scaleObject, scaleMapping: scaleMapping, store: store, plotSegment: fluent_mapping_editor_1.parentOfType(parent.props.parent.objectClass.parent, "plot-segment") }));
            }
            return null;
        }
        return null;
    }
    produceScaleEditor(store, attribute, parent) {
        this.attribute = attribute;
        this.parent = parent;
        this.store = store;
    }
    appendNull() {
        this.menuItems = [
            {
                key: this.nullDescription,
                text: this.nullDescription,
                onClick: () => this.onClick(null),
            },
            ...this.menuItems,
        ];
    }
    scaleEditorMenu(isSelected) {
        var _a, _b, _c;
        const mapping = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.getAttributeMapping(this.attribute);
        const isMappingEditor = !!(mapping &&
            mapping.type == specification_1.MappingType.scale &&
            mapping.scale);
        const scaleEditorSubMenuProps = isSelected && isMappingEditor
            ? {
                items: [
                    {
                        key: "mapping",
                        onRender: () => this.renderScaleEditor(this.parent, this.store),
                    },
                ],
            }
            : null;
        return { scaleEditorSubMenuProps, isMappingEditor };
    }
    textMappingOnClick(menuExpr, field) {
        var _a, _b, _c, _d, _e, _f;
        const newValue = "${" + menuExpr + "}";
        if (core_1.Expression.parseTextExpression(newValue).isTrivialString()) {
            (_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.onEditMappingHandler(this.attribute, {
                type: "value",
                value: newValue,
            });
        }
        else {
            (_f = (_e = (_d = this === null || this === void 0 ? void 0 : this.parent) === null || _d === void 0 ? void 0 : _d.props) === null || _e === void 0 ? void 0 : _e.parent) === null || _f === void 0 ? void 0 : _f.onEditMappingHandler(this.attribute, {
                type: "text",
                table: field.table,
                textExpression: newValue,
            });
        }
    }
    getDerivedColumnExpression(derivedColumn, field, aggregationMenuItem) {
        const expr = core_1.Expression.functionCall(derivedColumn.function, core_1.Expression.variable(field.columnName)).toString();
        return `${aggregationMenuItem.name}(${expr})`;
    }
    /**
     * Add DerivedColumn
     * @see derivedColumnsIdx
     */
    // eslint-disable-next-line max-lines-per-function
    appendDerivedColumn() {
        var _a, _b, _c;
        const mapping = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.getAttributeMapping(this.attribute);
        if (this.useAggregation && this.isDerivedColumns) {
            for (let i = 0; i < this.derivedColumnsIdx.length; i++) {
                const menuIdx = this.derivedColumnsIdx[i][0];
                const field = this.derivedColumnsIdx[i][1];
                const derivedColumns = common_1.type2DerivedColumns[field.type];
                let subMenuCheckedItem = null;
                const subMenuProps = this.useAggregation
                    ? {
                        items: derivedColumns.map((derivedColumn) => {
                            const subMenuProps = this.useAggregation
                                ? {
                                    items: core_1.Expression.getCompatibleAggregationFunctionsByDataKind(derivedColumn.metadata.kind).map((aggregationMenuItem) => {
                                        var _a, _b, _c;
                                        const onClickFn = (ev, item) => {
                                            const menuExpr = this.getDerivedColumnExpression(derivedColumn, field, aggregationMenuItem);
                                            if ((mapping === null || mapping === void 0 ? void 0 : mapping.type) === specification_1.MappingType.text) {
                                                this.textMappingOnClick(menuExpr, field);
                                            }
                                            else {
                                                this.onClick(this.transformDerivedField(field, menuExpr, item === null || item === void 0 ? void 0 : item.key));
                                            }
                                            //update selection key
                                            this.onToggleDerivedSelect(field, derivedColumn.name, ev, item);
                                        };
                                        const selectionKey = field.columnName +
                                            DELIMITER +
                                            derivedColumn.name +
                                            DELIMITER +
                                            aggregationMenuItem.name;
                                        const isSelected = this.checkSelection(selectionKey);
                                        if (isSelected) {
                                            subMenuCheckedItem =
                                                derivedColumn.displayName +
                                                    DELIMITER +
                                                    aggregationMenuItem.displayName;
                                        }
                                        //function for mapping renderer
                                        const mapping = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.getAttributeMapping(this.attribute);
                                        const mappingConfig = this.scaleEditorMenu(isSelected);
                                        return {
                                            key: aggregationMenuItem.name,
                                            text: aggregationMenuItem.displayName,
                                            isChecked: isSelected,
                                            canCheck: true,
                                            onClick: onClickFn,
                                            split: mappingConfig.isMappingEditor,
                                            subMenuProps: mappingConfig.scaleEditorSubMenuProps,
                                        };
                                    }),
                                }
                                : null;
                            return {
                                key: derivedColumn.name,
                                text: derivedColumn.displayName,
                                canCheck: true,
                                subMenuProps,
                            };
                        }),
                    }
                    : null;
                //key for no aggregation option
                const selectionKey = field.columnName + DELIMITER + field.columnName;
                const itemText = field.columnName +
                    strings_1.strings.objects.derivedColumns.menuSuffix +
                    (subMenuProps && subMenuCheckedItem && mapping ? `` : "");
                const derivedColumnsField = {
                    key: field.columnName,
                    text: itemText,
                    subMenuProps,
                    canCheck: subMenuProps ? null : true,
                    isChecked: this.checkSelection(selectionKey),
                    data: subMenuCheckedItem,
                };
                //add derived column field to menu
                this.menuItems.splice(menuIdx + 1, 0, derivedColumnsField);
            }
            //we need clear array between renders
            this.derivedColumnsIdx = [];
        }
    }
    buildMenu() {
        this.buildMenuFieldsItems();
        if (this.useDerivedColumns) {
            this.appendDerivedColumn();
        }
        this.appendNull();
    }
    parseDerivedColumnsExpression(expression) {
        const DATE_DERIVED_PREDIX = "date.";
        if (expression.startsWith(DATE_DERIVED_PREDIX)) {
            //data.year(DATE) -> DATE-year
            return (expression.match(/\(([^)]+)\)/)[1] +
                DELIMITER +
                expression.match(/\.([^(]+)\(/)[1]);
        }
        return expression;
    }
    //todo: defaultValue without Aggregation
    produceDefaultValue(defaultValue) {
        var _a, _b;
        const mappingType = defaultValue === null || defaultValue === void 0 ? void 0 : defaultValue.type;
        this.defaultValue = defaultValue;
        let expression = null;
        let expressionAggregation = null;
        if (defaultValue != null) {
            if (defaultValue.expression != null) {
                let parsed;
                if (mappingType === specification_1.MappingType.text) {
                    parsed = (_b = (_a = core_1.Expression.parseTextExpression(defaultValue.expression)) === null || _a === void 0 ? void 0 : _a.parts[0]) === null || _b === void 0 ? void 0 : _b.expression;
                }
                else {
                    parsed = core_1.Expression.parse(defaultValue.expression);
                }
                if (parsed instanceof core_1.Expression.FunctionCall) {
                    expression = parsed.args[0].toString();
                    expressionAggregation = parsed.name;
                    expression = expression === null || expression === void 0 ? void 0 : expression.split("`").join("");
                    //need to provide date.year() etc.
                    expression = this.parseDerivedColumnsExpression(expression);
                }
            }
            const value = (expression ? expression + DELIMITER : "") + expressionAggregation;
            if (value) {
                this.selectedKey = value;
            }
        }
    }
}
class MenuItemBuilder {
    constructor() {
        this.reset();
    }
    produceScaleEditor(store, attribute, parent) {
        this.menuItemsCreator.produceScaleEditor(store, attribute, parent);
    }
    produceDerivedColumns() {
        this.menuItemsCreator.useDerivedColumns = true;
    }
    produceOnChange(fn) {
        this.menuItemsCreator.onClick = fn;
    }
    getMenuItems() {
        return this.menuItemsCreator.menuItems;
    }
    reset() {
        this.menuItemsCreator = new MenuItemsCreator();
    }
    produceNullDescription(nullDescription) {
        this.menuItemsCreator.nullDescription = nullDescription;
    }
    produceUsingAggregation(useAggregation) {
        this.menuItemsCreator.useAggregation = useAggregation;
    }
    produceFields(datasetStore, table, kinds, types) {
        this.menuItemsCreator.setFieds(datasetStore, table, kinds, types);
    }
    produceDefaultValue(dafaultValue) {
        this.menuItemsCreator.produceDefaultValue(dafaultValue);
    }
    buildMenu() {
        return this.menuItemsCreator.buildMenu();
    }
}
exports.MenuItemBuilder = MenuItemBuilder;
class Director {
    setBuilder(builder) {
        this.builder = builder;
    }
    buildNullMenu() {
        this.builder.buildMenu();
        return this.builder.getMenuItems();
    }
    buildFieldsMenu(onClick, defaultValue, datasetStore, parent, attribute, table, kinds, types) {
        // console.log(datasetStore, table, kinds, types)
        this.builder.produceFields(datasetStore, table, kinds, types);
        this.builder.produceOnChange(onClick);
        this.builder.produceUsingAggregation(true);
        this.builder.produceDefaultValue(defaultValue);
        this.builder.produceScaleEditor(datasetStore, attribute, parent);
        this.builder.produceDerivedColumns();
        this.builder.buildMenu();
        return this.builder.getMenuItems();
    }
    buildSectionHeaderFieldsMenu(onClick, defaultValue, datasetStore, table, kinds, types) {
        this.builder.produceFields(datasetStore, table, kinds, types);
        this.builder.produceOnChange(onClick);
        this.builder.produceUsingAggregation(true);
        this.builder.produceDefaultValue(defaultValue);
        this.builder.buildMenu();
        return this.builder.getMenuItems();
    }
    getMenuRender() {
        const theme = react_1.getTheme();
        const CustomMenuRender = ({ item, defaultKey }) => {
            let currentFunction;
            if (item.subMenuProps) {
                currentFunction = item.subMenuProps.items.find((i) => i.isChecked);
                if (currentFunction) {
                    defaultKey = currentFunction.key;
                }
            }
            return (React.createElement(fluentui_customized_components_1.FluentDataBindingMenuItem, { key: item.key, backgroundColor: currentFunction
                    ? theme.semanticColors.buttonBackgroundChecked
                    : null, backgroundColorHover: theme.semanticColors.buttonBackgroundHovered },
                React.createElement(fluentui_customized_components_1.FluentDataBindingMenuLabel, null,
                    React.createElement(react_1.Label, { onClick: (e) => {
                            var _a;
                            const agr = (_a = item.subMenuProps) === null || _a === void 0 ? void 0 : _a.items.find((item) => item.key === defaultKey);
                            if (agr) {
                                agr.onClick(e, agr);
                            }
                            else {
                                item.onClick(e, item);
                            }
                        }, styles: fluentui_customized_components_1.defaultLabelStyle }, item.text)),
                item.subMenuProps ? (React.createElement(react_1.Dropdown, { styles: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle), { title: Object.assign(Object.assign({}, fluentui_customized_components_1.defaultStyle.title), { lineHeight: fluentui_customized_components_1.defultBindButtonSize.height, borderWidth: "0px" }), dropdownOptionText: {
                            boxSizing: "unset",
                            lineHeight: fluentui_customized_components_1.defultBindButtonSize.height,
                        }, callout: {
                            minWidth: 180,
                        } }), selectedKey: defaultKey, options: item.subMenuProps.items.map((i) => ({
                        key: i.key,
                        text: i.text,
                    })), onChange: (e, opt) => {
                        const agr = item.subMenuProps.items.find((item) => item.key === opt.key);
                        if (agr) {
                            agr.onClick(e, agr);
                        }
                        else {
                            item.onClick(e, item);
                        }
                    } })) : null));
        };
        return (props) => {
            const calloutKey = "mappingMenuAnchor";
            // find current mapping
            let mapping = null;
            const currentColumn = props.items
                .filter((item) => item.subMenuProps) // exclude None
                .flatMap((items) => {
                if (items.subMenuProps &&
                    items.subMenuProps.items.find((i) => i.key === "year")) {
                    return items.subMenuProps.items;
                }
                else {
                    return items;
                }
            })
                .find((item) => item.subMenuProps.items.filter((i) => i.isChecked && i.subMenuProps)
                .length > 0); // Exclude unselected columns
            if (currentColumn) {
                const aggregationFunction = currentColumn.subMenuProps.items.find((i) => i.isChecked && i.subMenuProps);
                const currentMapping = aggregationFunction.subMenuProps.items.find((i) => i.key === "mapping"); // Select mapping of column
                // set current mapping
                mapping = currentMapping;
            }
            return (React.createElement("div", { id: calloutKey },
                mapping ? (React.createElement(react_1.Callout, { target: `#${calloutKey}`, directionalHint: react_1.DirectionalHint.leftCenter }, mapping.onRender(mapping, () => null))) : null,
                !props.items.find((item) => item.key === "first" || item.key === "avg") ? (React.createElement(React.Fragment, null, props.items.map((item) => {
                    var _a, _b;
                    if ((_a = item.subMenuProps) === null || _a === void 0 ? void 0 : _a.items.find((i) => i.key === "year")) {
                        const expand = item.subMenuProps.items.find((columns) => columns.subMenuProps.items.find((func) => func.isChecked));
                        return (React.createElement(collapsiblePanel_1.CollapsiblePanel, { key: item.key, header: () => (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle }, item.text)), isCollapsed: expand === null, widgets: item.subMenuProps.items.map((item) => {
                                var _a;
                                const currentKey = (_a = item.subMenuProps) === null || _a === void 0 ? void 0 : _a.items[0].key;
                                return (React.createElement(CustomMenuRender, { key: item.key, item: item, defaultKey: currentKey }));
                            }) }));
                    }
                    else {
                        const currentKey = (_b = item.subMenuProps) === null || _b === void 0 ? void 0 : _b.items[0].key;
                        return (React.createElement(CustomMenuRender, { key: item.key, item: item, defaultKey: currentKey }));
                    }
                }))) : (React.createElement(react_1.ContextualMenu, Object.assign({}, props)))));
        };
    }
}
exports.Director = Director;
//# sourceMappingURL=data_field_binding_builder.js.map
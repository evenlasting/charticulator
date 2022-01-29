"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalesPanel = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const R = require("../../resources");
const core_1 = require("../../../core");
const components_1 = require("../../components");
const stores_1 = require("../../stores");
const object_list_editor_1 = require("./object_list_editor");
const context_component_1 = require("../../context_component");
const specification_1 = require("../../../core/specification");
const __1 = require("../..");
const utils_1 = require("../../utils");
const expression_1 = require("../../../core/expression");
// eslint-disable-next-line
function getObjectIcon(classID) {
    return R.getSVGIcon(core_1.Prototypes.ObjectClasses.GetMetadata(classID).iconPath || "object");
}
class ScalesPanel extends context_component_1.ContextedComponent {
    constructor(props) {
        super(props, null);
        this.state = {
            isSelected: "",
        };
    }
    componentDidMount() {
        this.tokens = [
            this.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => this.forceUpdate()),
            this.store.addListener(stores_1.AppStore.EVENT_SELECTION, () => this.forceUpdate()),
            this.store.addListener(stores_1.AppStore.EVENT_SAVECHART, () => this.forceUpdate()),
        ];
    }
    componentWillUnmount() {
        this.tokens.forEach((token) => token.remove());
        this.tokens = [];
    }
    renderUnexpectedState(message) {
        return (React.createElement("div", { className: "attribute-editor charticulator__widget-container" },
            React.createElement("div", { className: "attribute-editor-unexpected" }, message)));
    }
    getPropertyDisplayName(name) {
        return name[0].toUpperCase() + name.slice(1);
    }
    // eslint-disable-next-line
    render() {
        const store = this.props.store;
        let scales = store.chart.scales;
        const filterElementByScalePredicate = (scaleID) => (element) => {
            return (Object.keys(element.mappings).find((key) => {
                const mapping = element.mappings[key];
                return ((mapping.type === specification_1.MappingType.scale ||
                    mapping.type === specification_1.MappingType.expressionScale) &&
                    mapping.scale === scaleID);
            }) != undefined);
        };
        const filterElementProperties = (scaleID, element) => {
            return Object.keys(element.mappings).filter((key) => {
                const mapping = element.mappings[key];
                return ((mapping.type === specification_1.MappingType.scale ||
                    mapping.type === specification_1.MappingType.expressionScale) &&
                    mapping.scale === scaleID);
            });
        };
        // eslint-disable-next-line
        const mapToUI = (scale) => (glyph, element
        // eslint-disable-next-line
        ) => (key) => {
            if (!element) {
                return (React.createElement("div", { key: scale._id, className: "el-object-item" },
                    React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon(core_1.Prototypes.ObjectClasses.GetMetadata(scale.classID).iconPath) }),
                    React.createElement("span", { className: "el-text" }, scale.properties.name)));
            }
            else {
                const expr = element.mappings[key].expression;
                let rawColumnExpr = null; // TODO handle
                return (React.createElement("div", { className: "el-object-item el-object-scale-attribute", key: scale._id + "_" + element._id + "_" + key, onClick: () => {
                        if (glyph) {
                            this.dispatch(new __1.Actions.SelectMark(null, glyph, element));
                        }
                        else {
                            this.dispatch(new __1.Actions.SelectChartElement(element));
                        }
                        this.dispatch(new __1.Actions.FocusToMarkAttribute(key));
                    } },
                    React.createElement(components_1.DraggableElement, { key: key, className: utils_1.classNames("charticulator__scale-panel-property", [
                            "is-active",
                            this.state.isSelected === expr,
                        ]), onDragStart: () => this.setState({ isSelected: expr }), onDragEnd: () => this.setState({ isSelected: null }), dragData: () => {
                            const type = element.mappings[key].valueType;
                            const scaleID = element.mappings[key].scale;
                            const allowSelectValue = element.mappings[key]
                                .allowSelectValue;
                            const aggregation = core_1.Expression.getDefaultAggregationFunction(type, null);
                            const applyAggregation = (expr) => {
                                return core_1.Expression.functionCall(aggregation, core_1.Expression.parse(expr)).toString();
                            };
                            const table = this.store.dataset.tables.find((table) => table.name === element.mappings[key].table);
                            const parsedExpression = core_1.Expression.parse(expr);
                            let metadata = {};
                            if (parsedExpression instanceof expression_1.FunctionCall &&
                                parsedExpression.args[0] instanceof expression_1.Variable) {
                                const firstArgument = parsedExpression.args[0];
                                const column = table.columns.find((col) => col.name === firstArgument.name);
                                metadata = column.metadata;
                                rawColumnExpr =
                                    metadata.rawColumnName &&
                                        applyAggregation(metadata.rawColumnName);
                            }
                            this.setState({ isSelected: expr });
                            const r = new __1.DragData.DataExpression(table, expr, type, metadata, rawColumnExpr, scaleID, allowSelectValue);
                            return r;
                        }, renderDragElement: () => [
                            React.createElement("span", { className: "dragging-table-cell" }, element.mappings[key].expression),
                            { x: -10, y: -8 },
                        ] },
                        React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon(core_1.Prototypes.ObjectClasses.GetMetadata(element.classID).iconPath) }),
                        React.createElement("span", { className: "el-text" }, `${element.properties.name}.${this.getPropertyDisplayName(key)}`))));
            }
        };
        scales = scales.sort((a, b) => {
            if (a.properties.name < b.properties.name) {
                return -1;
            }
            if (a.properties.name > b.properties.name) {
                return 1;
            }
            return 0;
        });
        // Collect all used scales and object with properties into one list
        const propertyList = scales.flatMap((scale) => {
            return [0]
                .map(() => {
                return {
                    scale,
                    mark: null,
                    property: null,
                    glyph: null,
                };
            })
                .concat(
            // take all chart elements
            store.chart.elements
                // filter elements by scale
                .filter(filterElementByScalePredicate(scale._id))
                .flatMap((mark) => {
                // Take all properties of object/element where scale was used and map them into {property, element, scale} object/element
                return filterElementProperties(scale._id, mark).map((property) => {
                    return {
                        property,
                        mark,
                        scale,
                        glyph: null,
                    };
                });
            }))
                .concat(store.chart.glyphs
                // map all glyphs into {glyph & marks} group
                .flatMap((glyph) => glyph.marks.map((mark) => {
                return {
                    glyph,
                    mark,
                };
            }))
                // filter elements by scale
                .filter(({ mark }) => filterElementByScalePredicate(scale._id)(mark))
                // Take all properties of object/element where scale was used and map them into {property, element, scale} object/element
                .flatMap(({ mark, glyph, }) => {
                return filterElementProperties(scale._id, mark).map((property) => {
                    return {
                        property,
                        mark,
                        scale,
                        glyph,
                    };
                });
            }));
        });
        return (React.createElement("div", { className: "charticulator__object-list-editor charticulator__object-scales" },
            React.createElement(object_list_editor_1.ReorderListView, { restrict: true, enabled: true, onReorder: (IndexA, IndexB) => {
                    // Drag properties item only
                    if (!propertyList[IndexA].property || IndexA === IndexB) {
                        return;
                    }
                    // Find next scale in the list
                    if (IndexB > 0) {
                        IndexB--;
                    }
                    while (IndexB > 0 &&
                        !propertyList[IndexB] &&
                        propertyList[IndexB].property != null) {
                        IndexB--;
                    }
                    store.dispatcher.dispatch(new __1.Actions.SetObjectMappingScale(propertyList[IndexA].mark, propertyList[IndexA].property, propertyList[IndexB].scale._id));
                } }, propertyList.map((el) => {
                return mapToUI(el.scale)(el.glyph, el.mark)(el.property);
            }))));
    }
}
exports.ScalesPanel = ScalesPanel;
//# sourceMappingURL=scales_panel.js.map
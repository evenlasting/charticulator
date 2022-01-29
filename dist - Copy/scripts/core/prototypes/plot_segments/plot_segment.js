"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlotSegmentClass = void 0;
const Graphics = require("../../graphics");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
const expression_1 = require("../../expression");
const __1 = require("../..");
const axis_1 = require("./axis");
const d3_time_format_1 = require("d3-time-format");
const types_1 = require("../../specification/types");
const strings_1 = require("../../../strings");
class PlotSegmentClass extends chart_element_1.ChartElementClass {
    constructor() {
        super(...arguments);
        this.getDisplayFormat = (binding, tickFormat, manager) => {
            if (binding.numericalMode === types_1.NumericalMode.Temporal ||
                binding.valueType === Specification.DataType.Date) {
                if (tickFormat) {
                    return (value) => {
                        return d3_time_format_1.utcFormat(tickFormat.replace(__1.tickFormatParserExpression(), "$1"))(value);
                    };
                }
                else {
                    return (value) => {
                        return d3_time_format_1.utcFormat("%m/%d/%Y")(value);
                    };
                }
            }
            else {
                if (tickFormat) {
                    const resolvedFormat = axis_1.AxisRenderer.getTickFormat(tickFormat, null);
                    return (value) => {
                        return resolvedFormat(value);
                    };
                }
                else {
                    if (binding.rawExpression && manager) {
                        const rawFormat = this.getDisplayRawFormat(binding, manager);
                        if (rawFormat) {
                            return rawFormat;
                        }
                    }
                    return (value) => {
                        return value;
                    };
                }
            }
        };
    }
    /** Fill the layout's default state */
    // eslint-disable-next-line
    initializeState() { }
    /** Build intrinsic constraints between attributes (e.g., x2 - x1 = width for rectangles) */
    // eslint-disable-next-line
    buildConstraints(
    // eslint-disable-next-line
    solver, 
    // eslint-disable-next-line
    context, 
    // eslint-disable-next-line
    manager
    // eslint-disable-next-line
    ) { }
    /** Build constraints for glyphs within */
    // eslint-disable-next-line
    buildGlyphConstraints(
    // eslint-disable-next-line
    solver, 
    // eslint-disable-next-line
    context
    // eslint-disable-next-line
    ) { }
    /** Get the graphics that represent this layout */
    getPlotSegmentGraphics(glyphGraphics, manager) {
        return Graphics.makeGroup([glyphGraphics, this.getGraphics(manager)]);
    }
    /** Get the graphics that represent this layout of elements in background*/
    getPlotSegmentBackgroundGraphics(
    // eslint-disable-next-line
    manager) {
        return null;
    }
    // Renders interactable elements of plotsegment;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderControls(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _manager, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _zoom) {
        return null;
    }
    getCoordinateSystem() {
        return new Graphics.CartesianCoordinates();
    }
    /** Get DropZones given current state */
    getDropZones() {
        return [];
    }
    /** Get handles given current state */
    getHandles() {
        return null;
    }
    getBoundingBox() {
        return null;
    }
    /**
     * Renders gridlines for axis
     * @param data axis data binding
     * @param manager widgets manager
     * @param axisProperty property name of plotsegment with axis properties (xData, yData, axis)
     */
    buildGridLineWidgets(data, manager, axisProperty) {
        if (!data) {
            return [];
        }
        if (data.type === types_1.AxisDataBindingType.Default) {
            return [];
        }
        return PlotSegmentClass.getGridLineAttributePanelWidgets(manager, axisProperty);
    }
    static getGridLineAttributePanelWidgets(manager, axisProperty) {
        return [
            manager.verticalGroup({
                header: strings_1.strings.objects.plotSegment.gridline,
            }, [
                manager.inputSelect({ property: axisProperty, field: ["style", "gridlineStyle"] }, {
                    type: "dropdown",
                    showLabel: true,
                    icons: [
                        "ChromeClose",
                        "stroke/solid",
                        "stroke/dashed",
                        "stroke/dotted",
                    ],
                    options: ["none", "solid", "dashed", "dotted"],
                    labels: ["None", "Solid", "Dashed", "Dotted"],
                    label: strings_1.strings.objects.style,
                }),
                manager.inputColor({
                    property: axisProperty,
                    field: ["style", "gridlineColor"],
                }, {
                    label: strings_1.strings.objects.color,
                    labelKey: strings_1.strings.objects.color,
                }),
                manager.inputNumber({
                    property: axisProperty,
                    field: ["style", "gridlineWidth"],
                }, {
                    minimum: 0,
                    maximum: 100,
                    showUpdown: true,
                    label: strings_1.strings.objects.width,
                }),
            ]),
        ];
    }
    getAttributePanelWidgets(manager) {
        return [
            manager.horizontal([0, 1, 1], manager.label("Data", {
                addMargins: true,
            }), manager.horizontal([1], [
                manager.filterEditor({
                    table: this.object.table,
                    target: { plotSegment: this.object },
                    value: this.object.filter,
                    mode: "button" /* Button */,
                }),
                manager.groupByEditor({
                    table: this.object.table,
                    target: { plotSegment: this.object },
                    value: this.object.groupBy,
                    mode: "button" /* Button */,
                }),
            ])),
        ];
    }
    static createDefault(glyph) {
        const plotSegment = super.createDefault();
        plotSegment.glyph = glyph._id;
        plotSegment.table = glyph.table;
        return plotSegment;
    }
    getDisplayRawFormat(binding, manager) {
        const tableName = this.object.table;
        const table = manager.dataset.tables.find((table) => table.name === tableName);
        const getColumnName = (rawExpression) => {
            // eslint-disable-next-line
            const expression = expression_1.TextExpression.Parse(`\$\{${rawExpression}\}`);
            const parsedExpression = expression.parts.find((part) => {
                if (part.expression instanceof expression_1.FunctionCall) {
                    return (part.expression.args.find((arg) => arg instanceof expression_1.Variable));
                }
            });
            const functionCallpart = parsedExpression && parsedExpression.expression;
            if (functionCallpart) {
                const variable = (functionCallpart.args.find((arg) => arg instanceof expression_1.Variable));
                const columnName = variable.name;
                const column = table.columns.find((column) => column.name === columnName);
                return column.name;
            }
            return null;
        };
        if (binding.valueType === Specification.DataType.Boolean) {
            const columnName = getColumnName(binding.expression);
            const rawColumnName = getColumnName(binding.rawExpression);
            if (columnName && rawColumnName) {
                const dataMapping = new Map();
                table.rows.forEach((row) => {
                    const value = row[columnName];
                    const rawValue = row[rawColumnName];
                    if (value !== undefined && value !== null && rawValue !== undefined) {
                        const stringValue = value.toString();
                        const rawValueString = (rawValue || row[__1.refineColumnName(rawColumnName)]).toString();
                        dataMapping.set(stringValue, rawValueString);
                    }
                });
                return (value) => {
                    const rawValue = dataMapping.get(value);
                    return rawValue !== null ? rawValue : value;
                };
            }
        }
        return null;
    }
    buildGlyphOrderedList() {
        const groups = this.state.dataRowIndices.map((x, i) => i);
        if (!this.object.properties.sublayout) {
            return groups;
        }
        const order = this.object.properties.sublayout.order;
        const dateRowIndices = this.state.dataRowIndices;
        const table = this.parent.dataflow.getTable(this.object.table);
        if (order != null && order.expression) {
            const orderExpression = this.parent.dataflow.cache.parse(order.expression);
            const compare = (i, j) => {
                const vi = orderExpression.getValue(table.getGroupedContext(dateRowIndices[i]));
                const vj = orderExpression.getValue(table.getGroupedContext(dateRowIndices[j]));
                return __1.getSortFunctionByData([vi + "", vj + ""])(vi, vj);
            };
            groups.sort(compare);
        }
        if (this.object.properties.sublayout.orderReversed) {
            groups.reverse();
        }
        return groups;
    }
    /**
     * Return the index of the first glyph after sorting glyphs according sublayout order parameter
     */
    getFirstGlyphIndex() {
        const glyphs = this.buildGlyphOrderedList();
        return glyphs.length > 0 ? glyphs[0] : -1;
    }
    /**
     * Return the index of the last glyph after sorting glyphs according sublayout order parameter
     */
    getLastGlyphIndex() {
        const glyphs = this.buildGlyphOrderedList();
        return glyphs.length > 0 ? glyphs[glyphs.length - 1] : -1;
    }
}
exports.PlotSegmentClass = PlotSegmentClass;
//# sourceMappingURL=plot_segment.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartContainer = exports.ChartContainerEvent = exports.ChartContainerComponent = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const core_1 = require("../core");
const chart_component_1 = require("./chart_component");
class ChartContainerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.defaultWidth != null ? this.props.defaultWidth : 900,
            height: this.props.defaultHeight != null ? this.props.defaultHeight : 900,
            selection: null,
            localization: null,
        };
        this.handleGlyphClick = (data, modifiers) => {
            if (data == null) {
                this.clearSelection(true);
            }
            else {
                this.setSelection(data.table, data.rowIndices, modifiers.shiftKey || modifiers.ctrlKey || modifiers.metaKey, true);
            }
        };
        this.handleGlyphContextMenuClick = (data, modifiers) => {
            if (this.props.onMouseContextMenuClickGlyph) {
                this.props.onMouseContextMenuClickGlyph(data, modifiers);
            }
        };
        // eslint-disable-next-line
        this.handleGlyphMouseEnter = (data, modifiers) => {
            if (this.props.onMouseEnterGlyph) {
                this.props.onMouseEnterGlyph(data);
            }
        };
        // eslint-disable-next-line
        this.handleGlyphMouseLeave = (data, modifiers) => {
            if (this.props.onMouseLeaveGlyph) {
                this.props.onMouseLeaveGlyph(data);
            }
        };
    }
    setSelection(table, rowIndices, union = false, emit = false) {
        const indicesSet = new Set(rowIndices);
        if (union && this.state.selection && this.state.selection.table == table) {
            for (const item of this.state.selection.indices) {
                indicesSet.add(item);
            }
        }
        this.setState({
            selection: {
                table,
                indices: indicesSet,
                isSelected: (qTable, qIndices) => {
                    return (table == qTable && qIndices.find((v) => indicesSet.has(v)) >= 0);
                },
            },
        });
        if (emit && this.props.onSelectionChange) {
            this.props.onSelectionChange({
                table,
                rowIndices: Array.from(indicesSet),
            });
        }
    }
    clearSelection(emit = false) {
        this.setState({ selection: null });
        if (emit && this.props.onSelectionChange) {
            this.props.onSelectionChange(null);
        }
    }
    resize(width, height) {
        this.setState({ width, height });
    }
    getProperty(objectID, property) {
        return this.component.getProperty(objectID, property);
    }
    setProperty(objectID, property, value) {
        return this.component.setProperty(objectID, property, value);
    }
    getAttributeMapping(objectID, attribute) {
        return this.component.getAttributeMapping(objectID, attribute);
    }
    setAttributeMapping(objectID, attribute, mapping) {
        return this.component.setAttributeMapping(objectID, attribute, mapping);
    }
    render() {
        return (React.createElement(chart_component_1.ChartComponent, { ref: (e) => (this.component = e), chart: this.props.chart, dataset: this.props.dataset, defaultAttributes: this.props.defaultAttributes, width: this.state.width, height: this.state.height, rootElement: "svg", selection: this.state.selection, onGlyphClick: this.handleGlyphClick, onGlyphMouseEnter: this.handleGlyphMouseEnter, onGlyphMouseLeave: this.handleGlyphMouseLeave, onGlyphContextMenuClick: this.handleGlyphContextMenuClick, renderEvents: this.props.renderEvents }));
    }
}
exports.ChartContainerComponent = ChartContainerComponent;
var ChartContainerEvent;
(function (ChartContainerEvent) {
    ChartContainerEvent["Selection"] = "selection";
    ChartContainerEvent["MouseEnter"] = "mouseenter";
    ChartContainerEvent["MouseLeave"] = "mouseleave";
    ChartContainerEvent["ContextMenu"] = "contextmenu";
})(ChartContainerEvent = exports.ChartContainerEvent || (exports.ChartContainerEvent = {}));
class ChartContainer extends core_1.EventEmitter {
    constructor(instance, dataset, renderEvents, localizaiton) {
        var _a, _b, _c;
        super();
        this.instance = instance;
        this.dataset = dataset;
        this.renderEvents = renderEvents;
        this.localizaiton = localizaiton;
        this.width = 1200;
        this.height = 800;
        this.chart = instance.chart;
        this.defaultAttributes = instance.defaultAttributes;
        core_1.setFormatOptions({
            currency: (_a = [localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.currency, ""]) !== null && _a !== void 0 ? _a : core_1.defaultCurrency,
            grouping: core_1.defaultDigitsGroup,
            decimal: (_b = localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.decemalDelimiter) !== null && _b !== void 0 ? _b : core_1.defaultNumberFormat.decimal,
            thousands: (_c = localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.thousandsDelimiter) !== null && _c !== void 0 ? _c : core_1.defaultNumberFormat.decimal,
        });
    }
    /** Resize the chart */
    resize(width, height) {
        if (this.component) {
            this.component.resize(width, height);
        }
    }
    /** Listen to selection change */
    addSelectionListener(listener) {
        return this.addListener(ChartContainerEvent.Selection, listener);
    }
    addContextMenuListener(listener) {
        return this.addListener(ChartContainerEvent.ContextMenu, listener);
    }
    addMouseEnterListener(listener) {
        return this.addListener(ChartContainerEvent.MouseEnter, listener);
    }
    addMouseLeaveListener(listener) {
        return this.addListener(ChartContainerEvent.MouseLeave, listener);
    }
    /** Set data selection and update the chart */
    setSelection(table, rowIndices) {
        this.component.setSelection(table, rowIndices);
    }
    /** Clear data selection and update the chart */
    clearSelection() {
        this.component.clearSelection();
    }
    /** Get a property from the chart */
    getProperty(objectID, property) {
        return this.component.getProperty(objectID, property);
    }
    /** Set a property to the chart */
    setProperty(objectID, property, value) {
        return this.component.setProperty(objectID, property, value);
    }
    /**
     * Get a attribute mapping
     */
    getAttributeMapping(objectID, attribute) {
        return this.component.getAttributeMapping(objectID, attribute);
    }
    /** Set a attribute mapping */
    setAttributeMapping(objectID, attribute, mapping) {
        return this.component.setAttributeMapping(objectID, attribute, mapping);
    }
    setChart(chart) {
        this.chart = chart;
        ReactDOM.render(this.reactMount(this.width, this.height), this.container);
    }
    static setFormatOptions(options) {
        core_1.setFormatOptions(options);
    }
    reactMount(width = 1200, height = 800) {
        this.width = width;
        this.height = height;
        return (React.createElement(ChartContainerComponent, { ref: (e) => (this.component = e), chart: this.chart, dataset: this.dataset, defaultWidth: width, defaultHeight: height, defaultAttributes: this.defaultAttributes, onSelectionChange: (data) => {
                if (data == null) {
                    this.emit(ChartContainerEvent.Selection);
                }
                else {
                    this.emit(ChartContainerEvent.Selection, data.table, data.rowIndices);
                }
            }, onMouseEnterGlyph: (data) => {
                this.emit(ChartContainerEvent.MouseEnter, data.table, data.rowIndices);
            }, onMouseLeaveGlyph: (data) => {
                this.emit(ChartContainerEvent.MouseLeave, data.table, data.rowIndices);
            }, onMouseContextMenuClickGlyph: (data, modifiers) => {
                this.emit(ChartContainerEvent.ContextMenu, data.table, data.rowIndices, modifiers);
            }, renderEvents: this.renderEvents }));
    }
    /** Mount the chart to a container element */
    mount(container, width = 1200, height = 800) {
        // We only mount in one place
        if (this.container) {
            this.unmount();
        }
        if (typeof container == "string") {
            container = document.getElementById(container);
        }
        this.container = container;
        ReactDOM.render(this.reactMount(width, height), container);
    }
    /** Unmount the chart */
    unmount() {
        if (this.container) {
            ReactDOM.unmountComponentAtNode(this.container);
            this.container = null;
        }
    }
}
exports.ChartContainer = ChartContainer;
//# sourceMappingURL=container.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxButton = exports.LegendButton = exports.LinkButton = exports.ScaffoldButton = exports.MultiObjectButton = exports.ObjectButton = exports.Toolbar = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const globals = require("../globals");
const R = require("../resources");
const actions_1 = require("../actions");
const components_1 = require("../components");
const context_component_1 = require("../context_component");
const controllers_1 = require("../controllers");
const utils_1 = require("../utils");
const link_creator_1 = require("./panels/link_creator");
const legend_creator_1 = require("./panels/legend_creator");
const stores_1 = require("../stores");
const strings_1 = require("../../strings");
const main_view_1 = require("../main_view");
const app_store_1 = require("../stores/app_store");
const minWidthToColapseButtons = Object.freeze({
    guides: 1090,
    plotSegments: 1120,
    scaffolds: 1211,
});
class Toolbar extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = {
            innerWidth: window.innerWidth,
        };
    }
    componentDidMount() {
        this.token = this.store.addListener(stores_1.AppStore.EVENT_CURRENT_TOOL, () => {
            this.forceUpdate();
        });
        this.resizeListener = () => {
            this.setState({
                innerWidth: window.innerWidth,
            });
        };
        window.addEventListener("resize", this.resizeListener);
    }
    componentWillUnmount() {
        this.token.remove();
        window.removeEventListener("resize", this.resizeListener);
    }
    renderGuidesButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "guide-y",
                    title: strings_1.strings.toolbar.guideY,
                    icon: "guide/x",
                },
                {
                    classID: "guide-x",
                    title: strings_1.strings.toolbar.guideX,
                    icon: "guide/y",
                },
                {
                    classID: "guide-coordinator-x",
                    title: strings_1.strings.toolbar.guideX,
                    icon: "guide/coordinator-x",
                },
                {
                    classID: "guide-coordinator-y",
                    title: strings_1.strings.toolbar.guideY,
                    icon: "guide/coordinator-y",
                },
                {
                    classID: "guide-coordinator-polar",
                    title: strings_1.strings.toolbar.guidePolar,
                    icon: "plot-segment/polar",
                },
            ] }));
    }
    renderPlotSegmentsButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "plot-segment.cartesian",
                    title: strings_1.strings.toolbar.region2D,
                    icon: "plot/region",
                    noDragging: true,
                },
                {
                    classID: "plot-segment.line",
                    title: strings_1.strings.toolbar.line,
                    icon: "plot/line",
                    noDragging: true,
                },
            ] }));
    }
    renderMarksButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "mark.rect",
                    title: strings_1.strings.toolbar.rectangle,
                    icon: "mark/rect",
                    options: '{"shape":"rectangle"}',
                },
                {
                    classID: "mark.rect",
                    title: strings_1.strings.toolbar.ellipse,
                    icon: "mark/ellipse",
                    options: '{"shape":"ellipse"}',
                },
                {
                    classID: "mark.rect",
                    title: strings_1.strings.toolbar.triangle,
                    icon: "mark/triangle",
                    options: '{"shape":"triangle"}',
                },
            ] }));
    }
    renderSymbolButton() {
        return (React.createElement(ObjectButton, { classID: "mark.symbol", title: "Symbol", icon: "mark/symbol" }));
    }
    renderLineButton() {
        return React.createElement(ObjectButton, { classID: "mark.line", title: "Line", icon: "mark/line" });
    }
    renderTextButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "mark.text",
                    title: strings_1.strings.toolbar.text,
                    icon: "mark/text",
                },
                {
                    classID: "mark.textbox",
                    title: strings_1.strings.toolbar.textbox,
                    icon: "mark/textbox",
                },
            ] }));
    }
    renderIconButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "mark.icon",
                    title: strings_1.strings.toolbar.icon,
                    icon: "mark/icon",
                },
                {
                    classID: "mark.image",
                    title: strings_1.strings.toolbar.image,
                    icon: "FileImage",
                },
            ] }));
    }
    renderDataAxisButton() {
        return (React.createElement(ObjectButton, { classID: "mark.data-axis", title: strings_1.strings.toolbar.dataAxis, icon: "mark/data-axis" }));
    }
    renderScaffoldButton() {
        return (React.createElement(MultiObjectButton, { compact: this.props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "scaffold/cartesian-x",
                    title: strings_1.strings.toolbar.lineH,
                    icon: "scaffold/cartesian-x",
                    noDragging: false,
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-x"),
                },
                {
                    classID: "scaffold/cartesian-y",
                    title: strings_1.strings.toolbar.lineV,
                    icon: "scaffold/cartesian-y",
                    noDragging: false,
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-y"),
                },
                {
                    classID: "scaffold/circle",
                    title: strings_1.strings.toolbar.polar,
                    icon: "scaffold/circle",
                    noDragging: false,
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("polar"),
                },
                {
                    classID: "scaffold/curve",
                    title: strings_1.strings.toolbar.curve,
                    icon: "scaffold/curve",
                    noDragging: false,
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("curve"),
                },
            ] }));
    }
    getGlyphToolItems(labels = true) {
        return [
            React.createElement(React.Fragment, null,
                React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                    labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, strings_1.strings.toolbar.marks)),
                    this.renderMarksButton(),
                    this.renderSymbolButton(),
                    this.renderLineButton(),
                    this.renderTextButton(),
                    this.renderIconButton(),
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                    this.renderDataAxisButton(),
                    this.context.store.editorType === app_store_1.EditorType.Embedded ? (React.createElement(ObjectButton, { classID: "mark.nested-chart", title: strings_1.strings.toolbar.nestedChart, icon: "mark/nested-chart" })) : null,
                    this.props.undoRedoLocation === main_view_1.UndoRedoLocation.ToolBar ? (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                        React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.undo, icon: R.getSVGIcon("Undo"), disabled: this.context.store.historyManager.statesBefore.length === 0, onClick: () => new actions_1.Actions.Undo().dispatch(this.context.store.dispatcher) }),
                        React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.redo, icon: R.getSVGIcon("Redo"), disabled: this.context.store.historyManager.statesAfter.length === 0, onClick: () => new actions_1.Actions.Redo().dispatch(this.context.store.dispatcher) }))) : null)),
        ];
    }
    getChartToolItems(labels = true) {
        return [
            React.createElement(React.Fragment, null,
                this.props.undoRedoLocation === main_view_1.UndoRedoLocation.ToolBar ? (React.createElement(React.Fragment, null,
                    React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.undo, icon: R.getSVGIcon("toolbar/undo"), disabled: this.context.store.historyManager.statesBefore.length === 0, onClick: () => new actions_1.Actions.Undo().dispatch(this.context.store.dispatcher) }),
                    React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.redo, icon: R.getSVGIcon("toolbar/redo"), disabled: this.context.store.historyManager.statesAfter.length === 0, onClick: () => new actions_1.Actions.Redo().dispatch(this.context.store.dispatcher) }),
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }))) : null,
                React.createElement(LinkButton, { label: true }),
                React.createElement(LegendButton, null),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                        ? "charticulator__toolbar-vertical-label"
                        : "charticulator__toolbar-label" }, strings_1.strings.toolbar.guides)),
                this.renderGuidesButton(),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                labels && (React.createElement(React.Fragment, null,
                    React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, this.props.layout === main_view_1.LayoutDirection.Vertical
                        ? strings_1.strings.toolbar.plot
                        : strings_1.strings.toolbar.plotSegments))),
                this.renderPlotSegmentsButton(),
                React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                    labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, strings_1.strings.toolbar.scaffolds)),
                    this.renderScaffoldButton())),
        ];
    }
    // eslint-disable-next-line
    getToolItems(labels = true, innerWidth = window.innerWidth) {
        return (React.createElement(React.Fragment, null,
            this.props.undoRedoLocation === main_view_1.UndoRedoLocation.ToolBar ? (React.createElement(React.Fragment, null,
                React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.undo, icon: R.getSVGIcon("Undo"), disabled: this.context.store.historyManager.statesBefore.length === 0, onClick: () => new actions_1.Actions.Undo().dispatch(this.context.store.dispatcher) }),
                React.createElement(components_1.ToolButton, { title: strings_1.strings.menuBar.redo, icon: R.getSVGIcon("Redo"), disabled: this.context.store.historyManager.statesAfter.length === 0, onClick: () => new actions_1.Actions.Redo().dispatch(this.context.store.dispatcher) }),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }))) : null,
            labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.marks)),
            this.renderMarksButton(),
            this.renderSymbolButton(),
            this.renderLineButton(),
            this.renderTextButton(),
            this.renderIconButton(),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            this.renderDataAxisButton(),
            React.createElement(ObjectButton, { classID: "mark.nested-chart", title: strings_1.strings.toolbar.nestedChart, icon: "BarChartVerticalFilter" }),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            React.createElement(LinkButton, { label: labels }),
            React.createElement(LegendButton, null),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.guides)),
            innerWidth > minWidthToColapseButtons.guides ? (React.createElement(React.Fragment, null,
                React.createElement(ObjectButton, { classID: "guide-y", title: strings_1.strings.toolbar.guideY, icon: "guide/x" }),
                React.createElement(ObjectButton, { classID: "guide-x", title: strings_1.strings.toolbar.guideX, icon: "guide/y" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-x", title: strings_1.strings.toolbar.guideX, icon: "guide/coordinator-x" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-y", title: strings_1.strings.toolbar.guideY, icon: "guide/coordinator-y" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-polar", title: strings_1.strings.toolbar.guidePolar, icon: "plot-segment/polar" }))) : (this.renderGuidesButton()),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement(React.Fragment, null,
                React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                        ? "charticulator__toolbar-vertical-label"
                        : "charticulator__toolbar-label" }, this.props.layout === main_view_1.LayoutDirection.Vertical
                    ? strings_1.strings.toolbar.plot
                    : strings_1.strings.toolbar.plotSegments))),
            innerWidth > minWidthToColapseButtons.plotSegments ? (React.createElement(React.Fragment, null,
                React.createElement(ObjectButton, { classID: "plot-segment.cartesian", title: strings_1.strings.toolbar.region2D, icon: "plot/region", noDragging: true }),
                React.createElement(ObjectButton, { classID: "plot-segment.line", title: strings_1.strings.toolbar.line, icon: "plot/line", noDragging: true }))) : (this.renderPlotSegmentsButton()),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement("span", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.scaffolds)),
            innerWidth > minWidthToColapseButtons.scaffolds ? (React.createElement(React.Fragment, null,
                React.createElement(ScaffoldButton, { type: "cartesian-x", title: strings_1.strings.toolbar.lineH, icon: "scaffold/cartesian-x", currentTool: this.store.currentTool }),
                React.createElement(ScaffoldButton, { type: "cartesian-y", title: strings_1.strings.toolbar.lineV, icon: "scaffold/cartesian-y", currentTool: this.store.currentTool }),
                React.createElement(ScaffoldButton, { type: "polar", title: strings_1.strings.toolbar.polar, icon: "scaffold/circle", currentTool: this.store.currentTool }),
                React.createElement(ScaffoldButton, { type: "curve", title: strings_1.strings.toolbar.curve, icon: "scaffold/curve", currentTool: this.store.currentTool }))) : (this.renderScaffoldButton())));
    }
    render() {
        var _a;
        let tooltipsItems = [];
        if (this.context.store.editorType === app_store_1.EditorType.Embedded ||
            this.context.store.editorType === app_store_1.EditorType.NestedEmbedded) {
            const chartToolItems = this.getChartToolItems(this.props.toolbarLabels);
            const glyphToolItems = this.getGlyphToolItems(this.props.toolbarLabels);
            tooltipsItems = [...chartToolItems, ...glyphToolItems];
        }
        else {
            tooltipsItems = [
                this.getToolItems(this.props.toolbarLabels, (_a = this.state) === null || _a === void 0 ? void 0 : _a.innerWidth),
            ];
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: this.props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical"
                    : "charticulator__toolbar-horizontal" },
                React.createElement("div", { className: "charticulator__toolbar-buttons-align-left" }, tooltipsItems.map((item, index) => {
                    return (React.createElement(React.Fragment, { key: index },
                        React.createElement("div", { key: index, className: this.props.layout === main_view_1.LayoutDirection.Vertical
                                ? "charticulator__toolbar-vertical-group"
                                : "charticulator__toolbar-horizontal-group" }, item)));
                })))));
    }
}
exports.Toolbar = Toolbar;
class ObjectButton extends context_component_1.ContextedComponent {
    getIsActive() {
        return (this.store.currentTool == this.props.classID &&
            this.store.currentToolOptions == this.props.options);
    }
    componentDidMount() {
        this.token = this.context.store.addListener(stores_1.AppStore.EVENT_CURRENT_TOOL, () => {
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        this.token.remove();
    }
    render() {
        return (React.createElement(components_1.ToolButton, { icon: R.getSVGIcon(this.props.icon), active: this.getIsActive(), title: this.props.title, text: this.props.text, compact: this.props.compact, onClick: () => {
                this.dispatch(new actions_1.Actions.SetCurrentTool(this.props.classID, this.props.options));
                if (this.props.onClick) {
                    this.props.onClick();
                }
            }, dragData: this.props.noDragging
                ? null
                : this.props.onDrag
                    ? this.props.onDrag
                    : () => {
                        return new actions_1.DragData.ObjectType(this.props.classID, this.props.options);
                    } }));
    }
}
exports.ObjectButton = ObjectButton;
class MultiObjectButton extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = {
            currentSelection: {
                classID: this.props.tools[0].classID,
                options: this.props.tools[0].options,
            },
        };
    }
    isActive() {
        const store = this.store;
        for (const item of this.props.tools) {
            if (item.classID == store.currentTool &&
                item.options == store.currentToolOptions) {
                return true;
            }
        }
        return false;
    }
    getSelectedTool() {
        for (const item of this.props.tools) {
            if (item.classID == this.state.currentSelection.classID &&
                item.options == this.state.currentSelection.options) {
                return item;
            }
        }
        return this.props.tools[0];
    }
    componentDidMount() {
        this.token = this.store.addListener(stores_1.AppStore.EVENT_CURRENT_TOOL, () => {
            for (const item of this.props.tools) {
                // If the tool is within the tools defined here, we update the current selection
                if (this.store.currentTool == item.classID &&
                    this.store.currentToolOptions == item.options) {
                    this.setState({
                        currentSelection: {
                            classID: item.classID,
                            options: item.options,
                        },
                    });
                    break;
                }
            }
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        this.token.remove();
    }
    render() {
        const openContextMenu = () => {
            globals.popupController.popupAt((context) => {
                return (React.createElement(controllers_1.PopupView, { context: context }, this.props.tools.map((tool, index) => (React.createElement("div", { key: index, className: "charticulator__button-multi-tool-dropdown" },
                    React.createElement(ObjectButton, Object.assign({}, tool, { noDragging: tool.noDragging !== undefined ? tool.noDragging : true, onClick: () => context.close() })))))));
            }, {
                anchor: ReactDOM.findDOMNode(this.refButton),
                alignX: controllers_1.PopupAlignment.EndOuter,
                alignY: controllers_1.PopupAlignment.StartInner,
            });
        };
        const onClick = () => {
            if (this.props.compact) {
                openContextMenu();
            }
        };
        const onClickContextMenu = () => {
            if (!this.props.compact) {
                openContextMenu();
            }
        };
        return (React.createElement("div", { className: utils_1.classNames("charticulator__button-multi-tool", [
                "is-active",
                this.isActive(),
            ]) },
            React.createElement(ObjectButton, Object.assign({ ref: (e) => (this.refButton = e) }, this.getSelectedTool(), { onClick: onClick, compact: this.props.compact })),
            React.createElement("span", { className: "el-dropdown", ref: (e) => {
                    if (this.props.compact) {
                        return;
                    }
                    this.refButton = e;
                }, onClick: onClickContextMenu }, this.props.compact ? null : (React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("ChevronDown") })))));
    }
}
exports.MultiObjectButton = MultiObjectButton;
class ScaffoldButton extends context_component_1.ContextedComponent {
    render() {
        return (React.createElement(components_1.ToolButton, { icon: R.getSVGIcon(this.props.icon), active: this.props.currentTool == this.props.type, title: this.props.title, onClick: () => {
                // this.dispatch(new Actions.SetCurrentTool(this.props.type));
            }, dragData: () => {
                return new actions_1.DragData.ScaffoldType(this.props.type);
            } }));
    }
}
exports.ScaffoldButton = ScaffoldButton;
class LinkButton extends context_component_1.ContextedComponent {
    render() {
        return (React.createElement("span", { ref: (e) => (this.container = e) },
            React.createElement(components_1.ToolButton, { title: strings_1.strings.toolbar.links, text: this.props.label ? strings_1.strings.toolbar.links : "", icon: R.getSVGIcon("CharticulatorLine"), active: this.store.currentTool == "link", onClick: () => {
                    globals.popupController.popupAt((context) => (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement(link_creator_1.LinkCreationPanel, { onFinish: () => context.close() }))), { anchor: this.container });
                } })));
    }
}
exports.LinkButton = LinkButton;
class LegendButton extends context_component_1.ContextedComponent {
    render() {
        return (React.createElement("span", { ref: (e) => (this.container = e) },
            React.createElement(components_1.ToolButton, { title: strings_1.strings.toolbar.legend, icon: R.getSVGIcon("CharticulatorLegend"), active: this.store.currentTool == "legend", onClick: () => {
                    globals.popupController.popupAt((context) => (React.createElement(controllers_1.PopupView, { context: context },
                        React.createElement(legend_creator_1.LegendCreationPanel, { onFinish: () => context.close() }))), { anchor: this.container });
                } })));
    }
}
exports.LegendButton = LegendButton;
class CheckboxButton extends React.Component {
    render() {
        return (React.createElement("span", { className: "charticulator__toolbar-checkbox", onClick: () => {
                const nv = !this.props.value;
                if (this.props.onChange) {
                    this.props.onChange(nv);
                }
            } },
            React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon(this.props.value ? "checkbox/checked" : "checkbox/empty") }),
            React.createElement("span", { className: "el-label" }, this.props.text)));
    }
}
exports.CheckboxButton = CheckboxButton;
//# sourceMappingURL=tool_bar.js.map
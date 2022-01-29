"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxButton = exports.LegendButton = exports.LinkButton = exports.ScaffoldButton = exports.MultiObjectButton = exports.ObjectButton = exports.FluentUIToolbar = void 0;
const React = require("react");
const R = require("../resources");
const actions_1 = require("../actions");
const components_1 = require("../components");
const context_component_1 = require("../context_component");
const link_creator_1 = require("./panels/link_creator");
const legend_creator_1 = require("./panels/legend_creator");
const stores_1 = require("../stores");
const strings_1 = require("../../strings");
const main_view_1 = require("../main_view");
const react_1 = require("react");
const react_2 = require("@fluentui/react");
const resources_1 = require("../resources");
const app_store_1 = require("../stores/app_store");
const react_3 = require("react");
const react_4 = require("react");
const minWidthToColapseButtons = Object.freeze({
    guides: 1090,
    plotSegments: 1120,
    scaffolds: 1211,
});
exports.FluentUIToolbar = (props) => {
    const { store } = react_1.useContext(context_component_1.MainReactContext);
    const [innerWidth, setInnerWidth] = react_3.useState(window.innerWidth);
    const resizeListener = () => {
        setInnerWidth(window.innerWidth);
    };
    react_4.useEffect(() => {
        setInnerWidth(window.innerWidth);
        window.addEventListener("resize", resizeListener);
        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, [setInnerWidth]);
    const getGlyphToolItems = (labels = true) => {
        return [
            React.createElement(React.Fragment, null,
                React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                    labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, strings_1.strings.toolbar.marks)),
                    React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                            {
                                classID: "mark.rect",
                                title: strings_1.strings.toolbar.rectangle,
                                icon: "RectangleShape",
                                options: '{"shape":"rectangle"}',
                            },
                            {
                                classID: "mark.rect",
                                title: strings_1.strings.toolbar.ellipse,
                                icon: "Ellipse",
                                options: '{"shape":"ellipse"}',
                            },
                            {
                                classID: "mark.rect",
                                title: strings_1.strings.toolbar.triangle,
                                icon: "TriangleShape",
                                options: '{"shape":"triangle"}',
                            },
                        ] }),
                    React.createElement(ObjectButton, { classID: "mark.symbol", title: strings_1.strings.toolbar.symbol, icon: "Shapes" }),
                    React.createElement(ObjectButton, { classID: "mark.line", title: strings_1.strings.toolbar.line, icon: "Line" }),
                    React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                            {
                                classID: "mark.text",
                                title: strings_1.strings.toolbar.text,
                                icon: "FontColorA",
                            },
                            {
                                classID: "mark.textbox",
                                title: strings_1.strings.toolbar.textbox,
                                icon: "TextField",
                            },
                        ] }),
                    React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                            {
                                classID: "mark.icon",
                                title: strings_1.strings.toolbar.icon,
                                icon: "ImagePixel",
                            },
                            {
                                classID: "mark.image",
                                title: strings_1.strings.toolbar.image,
                                icon: "FileImage",
                            },
                        ] }),
                    React.createElement(ObjectButton, { classID: "mark.data-axis", title: strings_1.strings.toolbar.dataAxis, icon: "mark/data-axis" }),
                    store.editorType === app_store_1.EditorType.Embedded ? (React.createElement(ObjectButton, { classID: "mark.nested-chart", title: strings_1.strings.toolbar.nestedChart, icon: "BarChartVerticalFilter" })) : null,
                    props.undoRedoLocation === main_view_1.UndoRedoLocation.ToolBar ? (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                        React.createElement(components_1.FluentToolButton, { title: strings_1.strings.menuBar.undo, disabled: store.historyManager.statesBefore.length === 0, icon: "Undo", onClick: () => new actions_1.Actions.Undo().dispatch(store.dispatcher) }),
                        React.createElement(components_1.FluentToolButton, { title: strings_1.strings.menuBar.redo, disabled: store.historyManager.statesAfter.length === 0, icon: "Redo", onClick: () => new actions_1.Actions.Redo().dispatch(store.dispatcher) }))) : null)),
        ];
    };
    // eslint-disable-next-line max-lines-per-function
    const getChartToolItems = (labels = true) => {
        return [
            React.createElement(React.Fragment, null,
                React.createElement(exports.LinkButton, { label: true }),
                React.createElement(exports.LegendButton, null),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                        ? "charticulator__toolbar-vertical-label"
                        : "charticulator__toolbar-label" }, strings_1.strings.toolbar.guides)),
                React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                        {
                            classID: "guide-y",
                            title: strings_1.strings.toolbar.guideY,
                            icon: "guide/x",
                            options: '{"shape":"rectangle"}',
                        },
                        {
                            classID: "guide-x",
                            title: strings_1.strings.toolbar.guideX,
                            icon: "guide/y",
                            options: '{"shape":"ellipse"}',
                        },
                        {
                            classID: "guide-coordinator-x",
                            title: strings_1.strings.toolbar.guideX,
                            icon: "CharticulatorGuideX",
                            options: '{"shape":"triangle"}',
                        },
                        {
                            classID: "guide-coordinator-y",
                            title: strings_1.strings.toolbar.guideY,
                            icon: "CharticulatorGuideY",
                            options: '{"shape":"triangle"}',
                        },
                        {
                            classID: "guide-coordinator-polar",
                            title: strings_1.strings.toolbar.guidePolar,
                            icon: "CharticulatorGuideCoordinator",
                            options: "",
                        },
                    ] }),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                labels && (React.createElement(React.Fragment, null,
                    React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, props.layout === main_view_1.LayoutDirection.Vertical
                        ? strings_1.strings.toolbar.plot
                        : strings_1.strings.toolbar.plotSegments))),
                React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                        {
                            classID: "plot-segment.cartesian",
                            title: strings_1.strings.toolbar.region2D,
                            icon: "BorderDot",
                            noDragging: true,
                        },
                        {
                            classID: "plot-segment.line",
                            title: strings_1.strings.toolbar.line,
                            icon: "Line",
                            noDragging: true,
                        },
                    ] }),
                React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
                    labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-label"
                            : "charticulator__toolbar-label" }, strings_1.strings.toolbar.scaffolds)),
                    React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                            {
                                classID: "scaffold/cartesian-x",
                                title: strings_1.strings.toolbar.lineH,
                                icon: "scaffold/cartesian-x",
                                onClick: () => null,
                                onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-x"),
                            },
                            {
                                classID: "scaffold/cartesian-y",
                                title: strings_1.strings.toolbar.lineV,
                                icon: "scaffold/cartesian-y",
                                onClick: () => null,
                                onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-y"),
                            },
                            {
                                classID: "scaffold/circle",
                                title: strings_1.strings.toolbar.polar,
                                icon: "scaffold/circle",
                                onClick: () => null,
                                onDrag: () => new actions_1.DragData.ScaffoldType("polar"),
                            },
                            {
                                classID: "scaffold/curve",
                                title: strings_1.strings.toolbar.curve,
                                icon: "scaffold/curve",
                                onClick: () => null,
                                onDrag: () => new actions_1.DragData.ScaffoldType("curve"),
                            },
                        ] }))),
        ];
    };
    const renderScaffoldButton = () => {
        return (React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "scaffold/cartesian-x",
                    title: strings_1.strings.toolbar.lineH,
                    icon: "scaffold/cartesian-x",
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-x"),
                },
                {
                    classID: "scaffold/cartesian-y",
                    title: strings_1.strings.toolbar.lineV,
                    icon: "scaffold/cartesian-y",
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("cartesian-y"),
                },
                {
                    classID: "scaffold/circle",
                    title: strings_1.strings.toolbar.polar,
                    icon: "scaffold/circle",
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("polar"),
                },
                {
                    classID: "scaffold/curve",
                    title: strings_1.strings.toolbar.curve,
                    icon: "scaffold/curve",
                    onClick: () => null,
                    onDrag: () => new actions_1.DragData.ScaffoldType("curve"),
                },
            ] }));
    };
    const renderGuidesButton = () => {
        return (React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                {
                    classID: "guide-y",
                    title: strings_1.strings.toolbar.guideY,
                    icon: "guide/x",
                },
                {
                    classID: "guide-x",
                    title: strings_1.strings.toolbar.guideX,
                    icon: "guide/y",
                    options: "",
                },
                {
                    classID: "guide-coordinator-x",
                    title: strings_1.strings.toolbar.guideX,
                    icon: "CharticulatorGuideX",
                    options: "",
                },
                {
                    classID: "guide-coordinator-y",
                    title: strings_1.strings.toolbar.guideY,
                    icon: "CharticulatorGuideY",
                    options: "",
                },
                {
                    classID: "guide-coordinator-polar",
                    title: strings_1.strings.toolbar.guidePolar,
                    icon: "CharticulatorGuideCoordinator",
                    options: "",
                },
            ] }));
    };
    // eslint-disable-next-line max-lines-per-function
    const getToolItems = (labels = true, innerWidth = window.innerWidth) => {
        return (React.createElement(React.Fragment, null,
            props.undoRedoLocation === main_view_1.UndoRedoLocation.ToolBar ? (React.createElement(React.Fragment, null,
                React.createElement(components_1.FluentToolButton, { title: strings_1.strings.menuBar.undo, disabled: store.historyManager.statesBefore.length === 0, icon: "Undo", onClick: () => new actions_1.Actions.Undo().dispatch(store.dispatcher) }),
                React.createElement(components_1.FluentToolButton, { title: strings_1.strings.menuBar.redo, disabled: store.historyManager.statesAfter.length === 0, icon: "Redo", onClick: () => new actions_1.Actions.Redo().dispatch(store.dispatcher) }),
                React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }))) : null,
            labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.marks)),
            React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                    {
                        classID: "mark.rect",
                        title: strings_1.strings.toolbar.rectangle,
                        icon: "RectangleShape",
                        options: '{"shape":"rectangle"}',
                    },
                    {
                        classID: "mark.rect",
                        title: strings_1.strings.toolbar.ellipse,
                        icon: "Ellipse",
                        options: '{"shape":"ellipse"}',
                    },
                    {
                        classID: "mark.rect",
                        title: strings_1.strings.toolbar.triangle,
                        icon: "TriangleShape",
                        options: '{"shape":"triangle"}',
                    },
                ] }),
            React.createElement(ObjectButton, { classID: "mark.symbol", title: "Symbol", icon: "Shapes" }),
            React.createElement(ObjectButton, { classID: "mark.line", title: "Line", icon: "Line" }),
            React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                    {
                        classID: "mark.text",
                        title: strings_1.strings.toolbar.text,
                        icon: "FontColorA",
                    },
                    {
                        classID: "mark.textbox",
                        title: strings_1.strings.toolbar.textbox,
                        icon: "TextField",
                    },
                ] }),
            React.createElement(MultiObjectButton, { compact: props.layout === main_view_1.LayoutDirection.Vertical, tools: [
                    {
                        classID: "mark.icon",
                        title: strings_1.strings.toolbar.icon,
                        icon: "ImagePixel",
                    },
                    {
                        classID: "mark.image",
                        title: strings_1.strings.toolbar.image,
                        icon: "FileImage",
                    },
                ] }),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            React.createElement(ObjectButton, { classID: "mark.data-axis", title: strings_1.strings.toolbar.dataAxis, icon: "mark/data-axis" }),
            React.createElement(ObjectButton, { classID: "mark.nested-chart", title: strings_1.strings.toolbar.nestedChart, icon: "BarChartVerticalFilter" }),
            React.createElement(exports.LegendButton, null),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            React.createElement(exports.LinkButton, { label: labels }),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.guides)),
            innerWidth > minWidthToColapseButtons.guides ? (React.createElement(React.Fragment, null,
                React.createElement(ObjectButton, { classID: "guide-y", title: strings_1.strings.toolbar.guideY, icon: "guide/x" }),
                React.createElement(ObjectButton, { classID: "guide-x", title: strings_1.strings.toolbar.guideX, icon: "guide/y" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-x", title: strings_1.strings.toolbar.guideX, icon: "CharticulatorGuideX" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-y", title: strings_1.strings.toolbar.guideY, icon: "CharticulatorGuideY" }),
                React.createElement(ObjectButton, { classID: "guide-coordinator-polar", title: strings_1.strings.toolbar.guidePolar, icon: "CharticulatorGuideCoordinator" }))) : (renderGuidesButton()),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement(React.Fragment, null,
                React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                        ? "charticulator__toolbar-vertical-label"
                        : "charticulator__toolbar-label" }, props.layout === main_view_1.LayoutDirection.Vertical
                    ? strings_1.strings.toolbar.plot
                    : strings_1.strings.toolbar.plotSegments))),
            React.createElement(ObjectButton, { classID: "plot-segment.cartesian", title: strings_1.strings.toolbar.region2D, icon: "BorderDot", noDragging: true }),
            React.createElement(ObjectButton, { classID: "plot-segment.line", title: strings_1.strings.toolbar.line, icon: "Line", noDragging: true }),
            React.createElement("span", { className: "charticulator__toolbar-horizontal-separator" }),
            labels && (React.createElement("span", { className: props.layout === main_view_1.LayoutDirection.Vertical
                    ? "charticulator__toolbar-vertical-label"
                    : "charticulator__toolbar-label" }, strings_1.strings.toolbar.scaffolds)),
            innerWidth > minWidthToColapseButtons.scaffolds ? (React.createElement(React.Fragment, null,
                React.createElement(exports.ScaffoldButton, { type: "cartesian-x", title: strings_1.strings.toolbar.lineH, icon: "scaffold/cartesian-x", currentTool: store.currentTool }),
                React.createElement(exports.ScaffoldButton, { type: "cartesian-y", title: strings_1.strings.toolbar.lineV, icon: "scaffold/cartesian-y", currentTool: store.currentTool }),
                React.createElement(exports.ScaffoldButton, { type: "polar", title: strings_1.strings.toolbar.polar, icon: "scaffold/circle", currentTool: store.currentTool }),
                React.createElement(exports.ScaffoldButton, { type: "curve", title: strings_1.strings.toolbar.curve, icon: "scaffold/curve", currentTool: store.currentTool }))) : (renderScaffoldButton())));
    };
    let tooltipsItems = [];
    if (store.editorType === "embedded") {
        const chartToolItems = getChartToolItems(props.toolbarLabels);
        const glyphToolItems = getGlyphToolItems(props.toolbarLabels);
        tooltipsItems = [...chartToolItems, ...glyphToolItems];
    }
    else {
        tooltipsItems = [getToolItems(props.toolbarLabels, innerWidth)];
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: props.layout === main_view_1.LayoutDirection.Vertical
                ? "charticulator__toolbar-vertical"
                : "charticulator__toolbar-horizontal" },
            React.createElement("div", { className: "charticulator__toolbar-buttons-align-left" }, tooltipsItems.map((item, index) => {
                return (React.createElement(React.Fragment, { key: index },
                    React.createElement("div", { key: index, className: props.layout === main_view_1.LayoutDirection.Vertical
                            ? "charticulator__toolbar-vertical-group"
                            : "charticulator__toolbar-horizontal-group" }, item)));
            })))));
};
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
        return (React.createElement(React.Fragment, null,
            React.createElement(components_1.DraggableElement, { dragData: this.props.noDragging
                    ? null
                    : this.props.onDrag
                        ? this.props.onDrag
                        : () => {
                            return new actions_1.DragData.ObjectType(this.props.classID, this.props.options);
                        }, onDragStart: () => this.setState({ dragging: true }), onDragEnd: () => this.setState({ dragging: false }), renderDragElement: () => {
                    return [
                        React.createElement(components_1.SVGImageIcon, { url: resources_1.getSVGIcon(this.props.icon), width: 32, height: 32 }),
                        { x: -16, y: -16 },
                    ];
                } },
                React.createElement(react_2.IconButton, { iconProps: {
                        iconName: this.props.icon,
                    }, title: this.props.title, text: this.props.text, checked: this.getIsActive(), onClick: () => {
                        this.dispatch(new actions_1.Actions.SetCurrentTool(this.props.classID, this.props.options));
                        if (this.props.onClick) {
                            this.props.onClick();
                        }
                    } }))));
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
            dragging: false,
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
        const currentTool = this.getSelectedTool();
        return (React.createElement(components_1.DraggableElement, { dragData: () => {
                if (currentTool === null || currentTool === void 0 ? void 0 : currentTool.onDrag) {
                    return currentTool === null || currentTool === void 0 ? void 0 : currentTool.onDrag();
                }
                return new actions_1.DragData.ObjectType(currentTool.classID, currentTool.options);
            }, onDragStart: () => this.setState({ dragging: true }), onDragEnd: () => this.setState({ dragging: false }), renderDragElement: () => {
                return [
                    React.createElement(components_1.SVGImageIcon, { url: resources_1.getSVGIcon(currentTool.icon), width: 24, height: 24 }),
                    { x: 16, y: 16 },
                ];
            } },
            React.createElement(react_2.IconButton, { split: true, menuProps: {
                    items: this.props.tools.map((tool, index) => {
                        return {
                            key: tool.classID + index,
                            data: {
                                classID: tool.classID,
                                options: tool.options,
                            },
                            text: tool.title,
                            iconProps: { iconName: tool.icon },
                        };
                    }),
                    onItemClick: (ev, item) => {
                        if (item.data) {
                            this.dispatch(new actions_1.Actions.SetCurrentTool(item.data.classID, item.data.options));
                        }
                    },
                }, iconProps: {
                    iconName: currentTool.icon,
                }, onMenuClick: () => {
                    if (currentTool) {
                        this.dispatch(new actions_1.Actions.SetCurrentTool(currentTool.classID, currentTool.options));
                    }
                } })));
    }
}
exports.MultiObjectButton = MultiObjectButton;
exports.ScaffoldButton = (props) => {
    return (React.createElement(components_1.FluentToolButton, { icon: props.icon, active: props.currentTool == props.type, title: props.title, onClick: () => {
            // this.dispatch(new Actions.SetCurrentTool(this.props.type));
        }, dragData: () => {
            return new actions_1.DragData.ScaffoldType(props.type);
        } }));
};
exports.LinkButton = (props) => {
    const { store } = React.useContext(context_component_1.MainReactContext);
    const [isOpen, openDialog] = React.useState(false);
    return (React.createElement("span", { id: "linkCreator" },
        React.createElement(react_2.IconButton, { title: strings_1.strings.toolbar.link, text: props.label ? strings_1.strings.toolbar.link : "", iconProps: {
                iconName: "CharticulatorLine",
            }, checked: store.currentTool == "link", onClick: () => {
                openDialog(true);
            } }),
        isOpen ? (React.createElement(react_2.Callout, { target: "#linkCreator", hidden: !isOpen, onDismiss: () => openDialog(false) },
            React.createElement(link_creator_1.LinkCreationPanel, { onFinish: () => openDialog(false) }))) : null));
};
exports.LegendButton = () => {
    const { store } = React.useContext(context_component_1.MainReactContext);
    const [isOpen, setOpen] = React.useState(false);
    React.useEffect(() => {
        return () => {
            setOpen(false);
        };
    }, [setOpen]);
    return (React.createElement("span", { id: "createLegend" },
        React.createElement(react_2.IconButton, { title: strings_1.strings.toolbar.legend, iconProps: {
                iconName: "CharticulatorLegend",
            }, checked: store.currentTool == "legend", onClick: () => {
                setOpen(!isOpen);
            } }),
        isOpen ? (React.createElement(react_2.Callout, { onDismiss: () => setOpen(false), target: "#createLegend", directionalHint: react_2.DirectionalHint.bottomLeftEdge },
            React.createElement(legend_creator_1.LegendCreationPanel, { onFinish: () => setOpen(false) }))) : null));
};
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
//# sourceMappingURL=fluentui_tool_bar.js.map
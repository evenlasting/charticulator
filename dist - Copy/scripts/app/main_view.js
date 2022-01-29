"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainView = exports.LayoutDirection = exports.PositionsLeftRightTop = exports.PositionsLeftRight = exports.UndoRedoLocation = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const globals = require("./globals");
const components_1 = require("./components");
const controllers_1 = require("./controllers");
const stores_1 = require("./stores");
const views_1 = require("./views");
const menubar_1 = require("./views/menubar");
const object_list_editor_1 = require("./views/panels/object_list_editor");
const scales_panel_1 = require("./views/panels/scales_panel");
const strings_1 = require("../strings");
const fluentui_tool_bar_1 = require("./views/fluentui_tool_bar");
const context_component_1 = require("./context_component");
var UndoRedoLocation;
(function (UndoRedoLocation) {
    UndoRedoLocation["MenuBar"] = "menubar";
    UndoRedoLocation["ToolBar"] = "toolbar";
})(UndoRedoLocation = exports.UndoRedoLocation || (exports.UndoRedoLocation = {}));
var PositionsLeftRight;
(function (PositionsLeftRight) {
    PositionsLeftRight["Left"] = "left";
    PositionsLeftRight["Right"] = "right";
})(PositionsLeftRight = exports.PositionsLeftRight || (exports.PositionsLeftRight = {}));
var PositionsLeftRightTop;
(function (PositionsLeftRightTop) {
    PositionsLeftRightTop["Left"] = "left";
    PositionsLeftRightTop["Right"] = "right";
    PositionsLeftRightTop["Top"] = "top";
})(PositionsLeftRightTop = exports.PositionsLeftRightTop || (exports.PositionsLeftRightTop = {}));
var LayoutDirection;
(function (LayoutDirection) {
    LayoutDirection["Vertical"] = "vertical";
    LayoutDirection["Horizontal"] = "horizontal";
})(LayoutDirection = exports.LayoutDirection || (exports.LayoutDirection = {}));
class MainView extends React.Component {
    constructor(props) {
        super(props);
        if (!props.viewConfiguration) {
            this.viewConfiguration = {
                ColumnsPosition: PositionsLeftRight.Left,
                EditorPanelsPosition: PositionsLeftRight.Left,
                ToolbarPosition: PositionsLeftRightTop.Top,
                MenuBarButtons: PositionsLeftRight.Left,
                MenuBarSaveButtons: PositionsLeftRight.Left,
                ToolbarLabels: true,
                UndoRedoLocation: UndoRedoLocation.MenuBar,
            };
        }
        else {
            this.viewConfiguration = props.viewConfiguration;
        }
        this.state = {
            glyphViewMaximized: false,
            layersViewMaximized: false,
            attributeViewMaximized: false,
            scaleViewMaximized: false,
            currentFocusComponentIndex: 0,
        };
        props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => this.forceUpdate());
    }
    shortcutKeyHandler(e) {
        if (e.ctrlKey && e.key === "F6") {
            const focusableComponents = this.getFocusableComponents();
            let newIndex = this.state.currentFocusComponentIndex;
            focusableComponents[newIndex].setAttribute("tabIndex", null);
            if (e.shiftKey) {
                newIndex = this.state.currentFocusComponentIndex - 1;
            }
            else {
                newIndex = this.state.currentFocusComponentIndex + 1;
            }
            if (newIndex >= focusableComponents.length) {
                newIndex = 0;
            }
            if (newIndex < 0) {
                newIndex = focusableComponents.length - 1;
            }
            this.setState({
                currentFocusComponentIndex: newIndex,
            });
            focusableComponents[newIndex].setAttribute("tabIndex", "0");
            focusableComponents[newIndex].focus();
            console.log("current index", newIndex);
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.shortcutKeyHandler.bind(this));
    }
    getFocusableComponents() {
        return document.querySelectorAll(".charticulator__menu-bar,.charticulator__toolbar-horizontal,.minimizable-pane,.charticulator__floating-panel");
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.shortcutKeyHandler);
    }
    getChildContext() {
        return {
            store: this.props.store,
        };
    }
    // eslint-disable-next-line
    render() {
        const toolBarCreator = (config) => {
            return (React.createElement("div", { className: `charticulator__panel-editor-toolbar-${config.layout}` },
                React.createElement(fluentui_tool_bar_1.FluentUIToolbar, { toolbarLabels: config.toolbarLabels, undoRedoLocation: config.undoRedoLocation, layout: config.layout })));
        };
        const datasetPanel = () => {
            return (React.createElement("div", { className: "charticulator__panel charticulator__panel-dataset" },
                React.createElement(components_1.MinimizablePanelView, null,
                    React.createElement(components_1.MinimizablePane, { title: strings_1.strings.mainView.datasetPanelTitle, scroll: true, hideHeader: true },
                        React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                            React.createElement(views_1.DatasetView, { store: this.props.store }))),
                    this.state.scaleViewMaximized ? null : (React.createElement(components_1.MinimizablePane, { title: strings_1.strings.mainView.scalesPanelTitle, scroll: true, onMaximize: () => this.setState({ scaleViewMaximized: true }) },
                        React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                            React.createElement(scales_panel_1.ScalesPanel, { store: this.props.store })))))));
        };
        const editorPanels = () => {
            return (React.createElement("div", { className: "charticulator__panel-editor-panel charticulator__panel-editor-panel-panes", style: {
                    display: this.state.glyphViewMaximized &&
                        this.state.attributeViewMaximized &&
                        this.state.layersViewMaximized
                        ? "none"
                        : undefined,
                } },
                React.createElement(components_1.MinimizablePanelView, null,
                    this.state.glyphViewMaximized ? null : (React.createElement(components_1.MinimizablePane, { title: strings_1.strings.mainView.glyphPaneltitle, scroll: false, onMaximize: () => this.setState({ glyphViewMaximized: true }) },
                        React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                            React.createElement(views_1.MarkEditorView, { height: 300 })))),
                    this.state.layersViewMaximized ? null : (React.createElement(components_1.MinimizablePane, { title: strings_1.strings.mainView.layersPanelTitle, scroll: true, maxHeight: 200, onMaximize: () => this.setState({ layersViewMaximized: true }) },
                        React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                            React.createElement(object_list_editor_1.ObjectListEditor, null)))),
                    this.state.attributeViewMaximized ? null : (React.createElement(components_1.MinimizablePane, { title: strings_1.strings.mainView.attributesPaneltitle, scroll: true, onMaximize: () => this.setState({ attributeViewMaximized: true }) },
                        React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                            React.createElement(views_1.AttributePanel, { store: this.props.store })))))));
        };
        const chartPanel = () => {
            return (React.createElement("div", { className: "charticulator__panel-editor-panel charticulator__panel-editor-panel-chart" },
                React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                    React.createElement(views_1.ChartEditorView, { store: this.props.store }))));
        };
        return (React.createElement("div", { className: "charticulator__application", onDragOver: (e) => e.preventDefault(), onDrop: (e) => e.preventDefault() },
            React.createElement(views_1.NewEditor, null),
            React.createElement(context_component_1.MainReactContext.Provider, { value: {
                    store: this.props.store,
                } },
                React.createElement(components_1.TelemetryContext.Provider, { value: this.props.telemetry },
                    React.createElement(menubar_1.MenuBar, { alignButtons: this.viewConfiguration.MenuBarButtons, alignSaveButton: this.viewConfiguration.MenuBarSaveButtons, undoRedoLocation: this.viewConfiguration.UndoRedoLocation, name: this.viewConfiguration.Name, ref: (e) => (this.refMenuBar = e), handlers: this.props.menuBarHandlers, tabButtons: this.props.tabButtons }),
                    this.viewConfiguration.ToolbarPosition ==
                        PositionsLeftRightTop.Top &&
                        toolBarCreator({
                            layout: LayoutDirection.Horizontal,
                            toolbarLabels: this.viewConfiguration.ToolbarLabels,
                            undoRedoLocation: this.viewConfiguration.UndoRedoLocation,
                        }),
                    React.createElement("section", { className: "charticulator__panel-container" },
                        this.viewConfiguration.ColumnsPosition ==
                            PositionsLeftRight.Left && datasetPanel(),
                        React.createElement("div", { className: "charticulator__panel charticulator__panel-editor" },
                            React.createElement("div", { className: "charticulator__panel-editor-panel-container" },
                                this.viewConfiguration.EditorPanelsPosition ==
                                    PositionsLeftRight.Left && editorPanels(),
                                this.viewConfiguration.ToolbarPosition ==
                                    PositionsLeftRightTop.Left &&
                                    toolBarCreator({
                                        layout: LayoutDirection.Vertical,
                                        toolbarLabels: this.viewConfiguration.ToolbarLabels,
                                        undoRedoLocation: this.viewConfiguration.UndoRedoLocation,
                                    }),
                                chartPanel(),
                                this.viewConfiguration.ToolbarPosition ==
                                    PositionsLeftRightTop.Right &&
                                    toolBarCreator({
                                        layout: LayoutDirection.Vertical,
                                        toolbarLabels: this.viewConfiguration.ToolbarLabels,
                                        undoRedoLocation: this.viewConfiguration.UndoRedoLocation,
                                    }),
                                this.viewConfiguration.EditorPanelsPosition ==
                                    PositionsLeftRight.Right && editorPanels())),
                        this.viewConfiguration.ColumnsPosition ==
                            PositionsLeftRight.Right && datasetPanel()),
                    React.createElement("div", { className: "charticulator__floating-panels" },
                        this.state.glyphViewMaximized ? (React.createElement(components_1.FloatingPanel, { peerGroup: "panels", title: strings_1.strings.mainView.glyphPaneltitle, onClose: () => this.setState({ glyphViewMaximized: false }) },
                            React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                React.createElement(views_1.MarkEditorView, null)))) : null,
                        this.state.layersViewMaximized ? (React.createElement(components_1.FloatingPanel, { scroll: true, peerGroup: "panels", title: strings_1.strings.mainView.layersPanelTitle, onClose: () => this.setState({ layersViewMaximized: false }) },
                            React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                React.createElement(object_list_editor_1.ObjectListEditor, null)))) : null,
                        this.state.attributeViewMaximized ? (React.createElement(components_1.FloatingPanel, { scroll: true, peerGroup: "panels", title: strings_1.strings.mainView.attributesPaneltitle, onClose: () => this.setState({ attributeViewMaximized: false }) },
                            React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                React.createElement(views_1.AttributePanel, { store: this.props.store })),
                            React.createElement(controllers_1.PopupContainer, { controller: globals.popupController }))) : null,
                        this.props.store.messageState.size ? (React.createElement("div", { className: "charticulator__floating-panels_errors" },
                            React.createElement(components_1.FloatingPanel, { floatInCenter: true, scroll: true, peerGroup: "messages", title: strings_1.strings.mainView.errorsPanelTitle, closeButtonIcon: "ChromeClose", height: 200, width: 350 },
                                React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                    React.createElement(components_1.MessagePanel, { store: this.props.store }))))) : null,
                        this.state.scaleViewMaximized ? (React.createElement(components_1.FloatingPanel, { scroll: true, peerGroup: "panels", title: strings_1.strings.mainView.scalesPanelTitle, onClose: () => this.setState({ scaleViewMaximized: false }) },
                            React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                React.createElement(scales_panel_1.ScalesPanel, { store: this.props.store })))) : null),
                    React.createElement(controllers_1.PopupContainer, { controller: globals.popupController }),
                    this.props.store.messageState.size ? (React.createElement("div", { className: "charticulator__floating-panels_errors" },
                        React.createElement(components_1.FloatingPanel, { floatInCenter: true, scroll: true, peerGroup: "messages", title: strings_1.strings.mainView.errorsPanelTitle, closeButtonIcon: "general/cross", height: 200, width: 350 },
                            React.createElement(components_1.ErrorBoundary, { telemetryRecorder: this.props.telemetry },
                                React.createElement(components_1.MessagePanel, { store: this.props.store }))))) : null,
                    React.createElement(controllers_1.DragStateView, { controller: globals.dragController })))));
    }
}
exports.MainView = MainView;
MainView.childContextTypes = {
    store: (s) => s instanceof stores_1.AppStore,
};
//# sourceMappingURL=main_view.js.map
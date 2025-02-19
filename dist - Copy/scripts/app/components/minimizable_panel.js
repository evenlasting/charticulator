"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingPanel = exports.MinimizablePane = exports.MinimizablePanelView = void 0;
const React = require("react");
const resources_1 = require("../resources");
const buttons_1 = require("./buttons");
const Hammer = require("hammerjs");
const utils_1 = require("../utils");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("../views/panels/widgets/controls/fluentui_customized_components");
class MinimizablePanelView extends React.Component {
    render() {
        return React.createElement("div", { className: "minimizable-panel-view" }, this.props.children);
    }
}
exports.MinimizablePanelView = MinimizablePanelView;
class MinimizablePane extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minimized: props.defaultMinimized || false,
        };
    }
    renderHeader() {
        if (this.props.hideHeader) {
            return null;
        }
        return (React.createElement("div", { className: "header", onClick: () => this.setState({ minimized: !this.state.minimized }) },
            React.createElement(react_1.DefaultButton, { onClick: () => this.setState({ minimized: !this.state.minimized }), iconProps: {
                    iconName: this.state.minimized ? "ChevronRight" : "ChevronDown",
                    styles: {
                        root: {
                            fontSize: "unset",
                            height: 12,
                        },
                    },
                }, styles: fluentui_customized_components_1.PanelHeaderStyles }),
            React.createElement("span", { className: "title" }, this.props.title),
            this.props.onMaximize ? (React.createElement("span", { className: "buttons", onClick: (e) => e.stopPropagation() },
                React.createElement(buttons_1.ButtonFlat, { title: "Show as separate window", url: resources_1.getSVGIcon("general/popout"), onClick: () => this.props.onMaximize() }))) : null));
    }
    render() {
        if (this.state.minimized) {
            return React.createElement("div", { className: "minimizable-pane" }, this.renderHeader());
        }
        else {
            if (this.props.scroll) {
                if (this.props.height != null) {
                    return (React.createElement("div", { className: "minimizable-pane minimizable-pane-scrollable" },
                        this.renderHeader(),
                        React.createElement("div", { className: "content", style: { height: this.props.height + "px" } }, this.props.children)));
                }
                else if (this.props.maxHeight != null) {
                    return (React.createElement("div", { className: "minimizable-pane minimizable-pane-scrollable" },
                        this.renderHeader(),
                        React.createElement("div", { className: "content", style: { maxHeight: this.props.maxHeight + "px" } }, this.props.children)));
                }
                else {
                    return (React.createElement("div", { className: "minimizable-pane minimizable-pane-scrollable minimizable-pane-autosize" },
                        this.renderHeader(),
                        React.createElement("div", { className: "content", style: { flex: "1 1" } }, this.props.children)));
                }
            }
            else {
                return (React.createElement("div", { className: "minimizable-pane" },
                    this.renderHeader(),
                    React.createElement("div", { className: "content" }, this.props.children)));
            }
        }
    }
}
exports.MinimizablePane = MinimizablePane;
class FloatingPanel extends React.Component {
    constructor() {
        super(...arguments);
        this.state = this.getInitialState();
    }
    getInitialState() {
        // Figure out a position that doesn't overlap with existing windows
        let initialX = 100;
        let initialY = 100;
        const width = this.props.width || 324;
        const height = this.props.height || 324;
        if (this.props.floatInCenter) {
            initialX = window.innerWidth / 2 - width / 2;
            initialY = window.innerHeight / 2 - height / 2;
        }
        else {
            // eslint-disable-next-line
            while (true) {
                let found = false;
                if (FloatingPanel.peerGroups.has(this.props.peerGroup)) {
                    for (const peer of FloatingPanel.peerGroups.get(this.props.peerGroup)) {
                        if (peer.state.x == initialX && peer.state.y == initialY) {
                            found = true;
                            break;
                        }
                    }
                }
                if (found && initialX < 400 && initialY < 400) {
                    initialX += 50;
                    initialY += 50;
                }
                else {
                    break;
                }
            }
        }
        return {
            x: initialX,
            y: initialY,
            width,
            height,
            focus: false,
            minimized: false,
        };
    }
    componentDidMount() {
        this.hammer = new Hammer.Manager(this.refContainer);
        this.hammer.add(new Hammer.Pan({ threshold: 0 }));
        this.hammer.on("panstart", (e) => {
            if (e.target == this.refHeader) {
                const x0 = this.state.x - e.deltaX;
                const y0 = this.state.y - e.deltaY;
                const panListener = (e) => {
                    this.setState({
                        x: x0 + e.deltaX,
                        y: Math.max(0, y0 + e.deltaY),
                    });
                };
                const panEndListener = () => {
                    this.hammer.off("pan", panListener);
                    this.hammer.off("panend", panEndListener);
                };
                this.hammer.on("pan", panListener);
                this.hammer.on("panend", panEndListener);
            }
            if (e.target == this.refResizer) {
                const x0 = this.state.width - e.deltaX;
                const y0 = this.state.height - e.deltaY;
                const panListener = (e) => {
                    this.setState({
                        width: Math.max(324, x0 + e.deltaX),
                        height: Math.max(100, y0 + e.deltaY),
                    });
                };
                const panEndListener = () => {
                    this.hammer.off("pan", panListener);
                    this.hammer.off("panend", panEndListener);
                };
                this.hammer.on("pan", panListener);
                this.hammer.on("panend", panEndListener);
            }
        });
        if (FloatingPanel.peerGroups.has(this.props.peerGroup)) {
            FloatingPanel.peerGroups.get(this.props.peerGroup).add(this);
        }
        else {
            FloatingPanel.peerGroups.set(this.props.peerGroup, new Set([this]));
        }
        this.focus();
    }
    focus() {
        if (FloatingPanel.peerGroups.has(this.props.peerGroup)) {
            for (const peer of FloatingPanel.peerGroups.get(this.props.peerGroup)) {
                if (peer != this) {
                    peer.setState({ focus: false });
                }
            }
        }
        this.setState({ focus: true });
    }
    componentWillUnmount() {
        this.hammer.destroy();
        if (FloatingPanel.peerGroups.has(this.props.peerGroup)) {
            FloatingPanel.peerGroups.get(this.props.peerGroup).delete(this);
        }
    }
    render() {
        return (React.createElement("div", { className: utils_1.classNames("charticulator__floating-panel", ["is-focus", this.state.focus], ["is-scroll", this.props.scroll]), ref: (e) => (this.refContainer = e), style: {
                left: this.state.x + "px",
                top: this.state.y + "px",
                width: this.state.width + "px",
                height: this.state.minimized ? undefined : this.state.height + "px",
            }, onMouseDown: () => {
                this.focus();
            }, onTouchStart: () => {
                this.focus();
            } },
            React.createElement("div", { className: "charticulator__floating-panel-header", ref: (e) => (this.refHeader = e) },
                React.createElement("span", { className: "title" }, this.props.title),
                React.createElement("span", { className: "buttons", onClick: (e) => e.stopPropagation() },
                    React.createElement(buttons_1.ButtonFlat, { url: resources_1.getSVGIcon("general/minus"), title: "Minimize", onClick: () => this.setState({ minimized: !this.state.minimized }) }),
                    this.props.onClose ? (React.createElement(buttons_1.ButtonFlat, { url: resources_1.getSVGIcon(this.props.closeButtonIcon || "general/popout"), title: "Restore to panel", onClick: () => this.props.onClose() })) : null)),
            !this.state.minimized ? (React.createElement("div", { className: "charticulator__floating-panel-content" }, this.props.children)) : null,
            !this.state.minimized ? (React.createElement("div", { className: "charticulator__floating-panel-resizer", ref: (e) => (this.refResizer = e) })) : null));
    }
}
exports.FloatingPanel = FloatingPanel;
FloatingPanel.peerGroups = new Map();
//# sourceMappingURL=minimizable_panel.js.map
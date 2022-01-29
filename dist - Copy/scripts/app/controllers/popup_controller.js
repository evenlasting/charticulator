"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalView = exports.PopupView = exports.PopupContainer = exports.PopupController = exports.PopupContext = exports.getAlignment = exports.PopupAlignment = void 0;
const React = require("react");
const core_1 = require("../../core");
const utils_1 = require("../utils");
const components_1 = require("../components");
var PopupAlignment;
(function (PopupAlignment) {
    PopupAlignment["Inner"] = "inner";
    PopupAlignment["Outer"] = "outer";
    PopupAlignment["StartInner"] = "start-inner";
    PopupAlignment["StartOuter"] = "start-outer";
    PopupAlignment["EndInner"] = "end-inner";
    PopupAlignment["EndOuter"] = "end-outer";
})(PopupAlignment = exports.PopupAlignment || (exports.PopupAlignment = {}));
function getAlignment(anchor) {
    let alignX;
    const avgPopupWindowWidth = 500;
    const anchorCloseToWindowBorder = window.innerWidth - anchor.getBoundingClientRect().right <
        avgPopupWindowWidth;
    let alignLeft = false;
    if (anchorCloseToWindowBorder) {
        alignX = PopupAlignment.StartOuter;
        alignLeft = true;
    }
    return { alignLeft, alignX };
}
exports.getAlignment = getAlignment;
const popupViewMapping = new WeakMap();
let newlyCreatedContexts = new WeakSet();
function findParentPopup(anchor) {
    while (anchor) {
        if (anchor instanceof HTMLDivElement && popupViewMapping.has(anchor)) {
            return popupViewMapping.get(anchor);
        }
        anchor = anchor.parentElement;
    }
}
class PopupContext extends core_1.EventEmitter {
    constructor(id, renderElement, options) {
        super();
        this.isClosed = false;
        this.children = [];
        this.id = id;
        this.options = options;
        if (options.parent) {
            this.parent = options.parent;
            options.parent.children.push(this);
        }
        else {
            this.parent = null;
        }
        this.element = renderElement(this);
        newlyCreatedContexts.add(this);
    }
    close() {
        for (const child of this.children) {
            child.close();
        }
        this.isClosed = true;
        if (this.parent) {
            const idx = this.parent.children.indexOf(this);
            if (idx >= 0) {
                this.parent.children.splice(idx, 1);
            }
        }
        this.emit("close");
    }
    traverse(visitor) {
        visitor(this);
        for (const child of this.children) {
            child.traverse(visitor);
        }
    }
}
exports.PopupContext = PopupContext;
class PopupController extends core_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.currentID = 0;
        this.rootPopup = null;
        this.currentModal = null;
    }
    traverse(visitor) {
        if (this.rootPopup) {
            this.rootPopup.traverse(visitor);
        }
    }
    popupAt(renderElement, options) {
        if (options.alignX == undefined) {
            options.alignX = PopupAlignment.StartInner;
        }
        if (options.alignY == undefined) {
            options.alignY = PopupAlignment.Outer;
        }
        if (!options.parent && options.anchor) {
            options.parent = findParentPopup(options.anchor);
        }
        const context = new PopupContext("#" + (this.currentID++).toString(), renderElement, options);
        if (!options.parent) {
            this.rootPopup = context;
        }
        context.addListener("close", () => {
            if (this.rootPopup == context) {
                this.rootPopup = null;
            }
            this.emit("changed");
        });
        this.emit("changed");
    }
    showModal(renderElement, options) {
        const context = new PopupContext("#" + (this.currentID++).toString(), renderElement, options);
        this.reset();
        this.currentModal = context;
        context.addListener("close", () => {
            this.currentModal = null;
            this.emit("changed");
        });
        this.emit("changed");
    }
    reset() {
        if (this.rootPopup) {
            this.rootPopup.close();
            this.rootPopup = null;
        }
        if (this.currentModal) {
            this.currentModal.close();
            this.currentModal = null;
        }
    }
    resetPopups() {
        if (this.rootPopup) {
            this.rootPopup.close();
            this.rootPopup = null;
        }
    }
}
exports.PopupController = PopupController;
class PopupContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    onKeyDown(e) {
        if (e.target == document.body) {
            let prefix = "";
            if (e.shiftKey) {
                prefix = "shift-" + prefix;
            }
            if (e.ctrlKey) {
                prefix = "ctrl-" + prefix;
            }
            const name = `${prefix}${e.key}`.toLowerCase();
            if (name == "escape") {
                if (this.props.controller.rootPopup) {
                    this.props.controller.resetPopups();
                }
                else {
                    this.props.controller.reset();
                }
            }
        }
    }
    componentDidMount() {
        this.token = this.props.controller.addListener("changed", () => {
            this.forceUpdate();
        });
        window.addEventListener("keydown", this.onKeyDown);
        setTimeout(() => {
            if (this.popupContainer) {
                this.popupContainer.focus();
            }
        }, 100);
    }
    componentWillUnmount() {
        this.token.remove();
        window.removeEventListener("keydown", this.onKeyDown);
    }
    render() {
        if (this.props.controller.currentModal) {
            const modal = this.props.controller.currentModal;
            return (React.createElement("div", { tabIndex: 0, className: "popup-container popup-container-modal", style: {
                    position: "fixed",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    pointerEvents: "all",
                }, onMouseDown: () => {
                    this.props.controller.reset();
                }, ref: (r) => (this.popupContainer = r) },
                modal.element,
                this.renderPopups()));
        }
        else {
            return this.renderPopups();
        }
    }
    renderPopups() {
        const popups = [];
        this.props.controller.traverse((p) => {
            if (!p.isClosed) {
                popups.push(p);
            }
        });
        if (popups.length == 0) {
            return React.createElement("div", null);
        }
        else {
            return (React.createElement("div", { tabIndex: 0, className: "popup-container", style: {
                    position: "fixed",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    pointerEvents: "all",
                }, ref: (r) => (this.popupContainer = r), onMouseDown: () => {
                    this.props.controller.resetPopups();
                } }, popups.map((popup) => {
                return (React.createElement("div", { key: popup.id, ref: (ref) => {
                        if (ref) {
                            popupViewMapping.set(ref, popup);
                        }
                    } }, popup.element));
            })));
        }
    }
}
exports.PopupContainer = PopupContainer;
class PopupView extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            if (this.popupContainer) {
                this.popupContainer.focus();
            }
        }, 100);
    }
    // eslint-disable-next-line
    render() {
        const popup = this.props.context;
        const position = popup.options.anchor.getBoundingClientRect();
        const style = { position: "absolute" };
        const marginX = 0;
        const marginY = 0;
        let alignX = popup.options.alignX;
        let alignY = popup.options.alignY;
        switch (popup.options.alignX) {
            case "inner":
                {
                    if ((position.left + position.right) / 2 < window.innerWidth / 2) {
                        style.left = position.left + "px";
                        alignX = PopupAlignment.StartInner;
                    }
                    else {
                        style.right =
                            window.innerWidth - (position.left + position.width) + "px";
                        alignX = PopupAlignment.EndInner;
                    }
                }
                break;
            case "outer":
                {
                    if ((position.left + position.right) / 2 > window.innerWidth / 2) {
                        style.right = window.innerWidth - position.left + marginX + "px";
                        alignX = PopupAlignment.StartOuter;
                    }
                    else {
                        style.left = position.left + position.width + marginX + "px";
                        alignX = PopupAlignment.EndOuter;
                    }
                }
                break;
            case "start-inner":
                {
                    style.left = position.left + "px";
                }
                break;
            case "end-inner":
                {
                    style.right =
                        window.innerWidth - (position.left + position.width) + "px";
                }
                break;
            case "start-outer":
                {
                    style.right = window.innerWidth - position.left + marginX + "px";
                }
                break;
            case "end-outer":
                {
                    style.left = position.left + position.width + marginX + "px";
                }
                break;
        }
        switch (popup.options.alignY) {
            case "inner":
                {
                    if ((position.top + position.bottom) / 2 < window.innerHeight / 2) {
                        style.top = position.top + "px";
                        alignY = PopupAlignment.StartInner;
                    }
                    else {
                        style.bottom =
                            window.innerHeight - (position.top + position.height) + "px";
                        alignY = PopupAlignment.EndInner;
                    }
                }
                break;
            case "outer":
                {
                    if ((position.top + position.bottom) / 2 > window.innerHeight / 2) {
                        style.bottom = window.innerHeight - position.top + marginY + "px";
                        alignY = PopupAlignment.StartOuter;
                    }
                    else {
                        style.top = position.top + position.height + marginY + "px";
                        alignY = PopupAlignment.EndOuter;
                    }
                }
                break;
            case "start-inner":
                {
                    style.top = position.top + "px";
                }
                break;
            case "end-inner":
                {
                    style.bottom =
                        window.innerHeight - (position.top + position.height) + "px";
                }
                break;
            case "start-outer":
                {
                    style.bottom = window.innerHeight - position.top + marginY + "px";
                }
                break;
            case "end-outer":
                {
                    style.top = position.top + position.height + marginY + "px";
                }
                break;
        }
        if (this.props.width != null) {
            style.width = this.props.width + "px";
        }
        return (React.createElement("div", { tabIndex: 0, ref: (r) => (this.popupContainer = r), className: this.props.className
                ? this.props.className + " popup-view-container"
                : "popup-view-container", style: style, onMouseDownCapture: () => {
                newlyCreatedContexts = new WeakSet();
            }, onMouseDown: (e) => {
                e.stopPropagation();
                for (const child of this.props.context.children) {
                    if (!newlyCreatedContexts.has(child)) {
                        child.close();
                    }
                }
            } },
            React.createElement("div", { className: utils_1.classNames("popup-view", [
                    "popup-x-top-left",
                    alignX == "start-inner" && alignY == "end-outer",
                ], [
                    "popup-x-bottom-left",
                    alignX == "start-inner" && alignY == "start-outer",
                ], [
                    "popup-x-top-right",
                    alignX == "end-inner" && alignY == "end-outer",
                ], [
                    "popup-x-bottom-right",
                    alignX == "end-inner" && alignY == "start-outer",
                ], [
                    "popup-y-top-left",
                    alignX == "start-outer" && alignY == "start-inner",
                ], [
                    "popup-y-top-right",
                    alignX == "end-outer" && alignY == "start-inner",
                ], [
                    "popup-y-bottom-left",
                    alignX == "start-outer" && alignY == "end-inner",
                ], [
                    "popup-y-bottom-right",
                    alignX == "end-outer" && alignY == "end-inner",
                ]) },
                React.createElement(components_1.TelemetryContext.Consumer, null, (telemetryRecorder) => {
                    return (React.createElement(components_1.ErrorBoundary, { telemetryRecorder: telemetryRecorder }, this.props.children));
                }))));
    }
}
exports.PopupView = PopupView;
class ModalView extends React.Component {
    render() {
        const type = this.props.type || "default";
        return (React.createElement("div", { className: `charticulator__modal-${type}`, onMouseDown: (e) => {
                e.stopPropagation();
            } },
            React.createElement("div", { className: `charticulator__modal-${type}-container` }, this.props.children)));
    }
}
exports.ModalView = ModalView;
//# sourceMappingURL=popup_controller.js.map
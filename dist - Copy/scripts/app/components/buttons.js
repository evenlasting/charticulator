"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonRaised = exports.ButtonFlatPanel = exports.ButtonFlat = exports.MenuButton = exports.AppButton = exports.BaseButton = exports.FluentToolButton = exports.ToolButton = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const utils_1 = require("../utils");
const draggable_1 = require("./draggable");
const icons_1 = require("./icons");
const R = require("../resources");
const strings_1 = require("../../strings");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("../views/panels/widgets/controls/fluentui_customized_components");
class ToolButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
        };
    }
    render() {
        const onClick = () => {
            if (this.props.onClick) {
                this.props.onClick();
            }
        };
        if (this.props.dragData) {
            return (React.createElement(draggable_1.DraggableElement, { dragData: this.props.dragData, onDragStart: () => this.setState({ dragging: true }), onDragEnd: () => this.setState({ dragging: false }), renderDragElement: () => {
                    return [
                        React.createElement(icons_1.SVGImageIcon, { url: this.props.icon, width: 32, height: 32 }),
                        { x: -16, y: -16 },
                    ];
                } },
                React.createElement("span", { className: utils_1.classNames("charticulator__button-tool", ["is-active", this.props.active || this.state.dragging], ["is-disabled", this.props.disabled]), title: this.props.title, onClick: onClick },
                    this.props.icon ? React.createElement(icons_1.SVGImageIcon, { url: this.props.icon }) : null,
                    this.props.text ? (React.createElement("span", { className: "el-text" }, this.props.text)) : null),
                React.createElement("span", { style: {
                        position: "relative",
                        bottom: "-7px",
                        left: "-20px",
                    }, onClick: onClick }, this.props.compact ? (React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("general/triangle-right-bottom") })) : null)));
        }
        else {
            return (React.createElement("span", { className: utils_1.classNames("charticulator__button-tool", ["is-active", this.props.active], ["is-disabled", this.props.disabled]), title: this.props.title, onClick: onClick },
                this.props.icon ? React.createElement(icons_1.SVGImageIcon, { url: this.props.icon }) : null,
                this.props.text ? (React.createElement("span", { className: "el-text" }, this.props.text)) : null));
        }
    }
}
exports.ToolButton = ToolButton;
class FluentToolButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
        };
    }
    render() {
        const onClick = () => {
            if (this.props.onClick) {
                this.props.onClick();
            }
        };
        if (this.props.dragData) {
            return (React.createElement(draggable_1.DraggableElement, { dragData: this.props.dragData, onDragStart: () => this.setState({ dragging: true }), onDragEnd: () => this.setState({ dragging: false }), renderDragElement: () => {
                    return [
                        React.createElement(icons_1.SVGImageIcon, { url: this.props.icon, width: 32, height: 32 }),
                        { x: -16, y: -16 },
                    ];
                } },
                React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                    React.createElement(react_1.CommandBarButton, { onClick: onClick, checked: this.props.active || this.state.dragging, disabled: this.props.disabled, text: this.props.text, title: this.props.title, iconProps: {
                            iconName: this.props.icon,
                        }, styles: {
                            root: {
                                minWidth: "unset",
                            },
                        } }))));
        }
        else {
            return (React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                React.createElement(react_1.CommandBarButton, { onClick: onClick, checked: this.props.active, disabled: this.props.disabled, text: this.props.text, title: this.props.title, iconProps: {
                        iconName: this.props.icon,
                    }, styles: {
                        root: {
                            minWidth: "unset",
                        },
                    } })));
        }
    }
}
exports.FluentToolButton = FluentToolButton;
class BaseButton extends React.PureComponent {
    constructor() {
        super(...arguments);
        this._doClick = this.doClick.bind(this);
    }
    doClick(e) {
        if (this.props.onClick) {
            this.props.onClick();
        }
        if (this.props.stopPropagation) {
            e.stopPropagation();
        }
    }
}
exports.BaseButton = BaseButton;
class AppButton extends BaseButton {
    render() {
        return (React.createElement("span", { tabIndex: 0, className: "charticulator__button-menu-app charticulator-title__button", title: this.props.title, onClick: this._doClick, onKeyPress: (e) => {
                if (e.key === "Enter") {
                    this._doClick();
                }
            } },
            React.createElement(icons_1.SVGImageIcon, { url: R.getSVGIcon("app-icon") }),
            React.createElement("span", { className: "el-text" }, this.props.name || strings_1.strings.app.name)));
    }
}
exports.AppButton = AppButton;
class MenuButton extends BaseButton {
    render() {
        const props = this.props;
        if (props.text) {
            return (React.createElement("span", { tabIndex: 0, className: utils_1.classNames("charticulator__button-menu-text", [
                    "is-disabled",
                    this.props.disabled,
                ]), title: props.title, onClick: this._doClick, onKeyPress: (e) => {
                    if (e.key === "Enter") {
                        this._doClick();
                    }
                } },
                React.createElement(icons_1.SVGImageIcon, { url: props.url }),
                React.createElement("span", { className: "el-text" }, props.text)));
        }
        else {
            return (React.createElement("span", { tabIndex: 0, className: "charticulator__button-menu", title: props.title, onClick: this._doClick, onKeyPress: (e) => {
                    if (e.key === "Enter") {
                        this._doClick();
                    }
                } },
                React.createElement(icons_1.SVGImageIcon, { url: props.url })));
        }
    }
}
exports.MenuButton = MenuButton;
class ButtonFlat extends BaseButton {
    render() {
        const props = this.props;
        if (props.url) {
            if (props.text) {
                return (React.createElement("button", { className: "charticulator__button-flat", title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url }),
                    React.createElement("span", { className: "el-text" }, props.text)));
            }
            else {
                return (React.createElement("button", { className: "charticulator__button-flat", title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url })));
            }
        }
        else {
            return (React.createElement("button", { className: "charticulator__button-flat", title: props.title, onClick: this._doClick },
                React.createElement("span", { className: "el-text" }, props.text)));
        }
    }
}
exports.ButtonFlat = ButtonFlat;
class ButtonFlatPanel extends BaseButton {
    render() {
        const props = this.props;
        if (props.url) {
            if (props.text) {
                return (React.createElement("span", { className: utils_1.classNames("charticulator__button-flat-panel", [
                        "is-disabled",
                        this.props.disabled,
                    ]), title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url }),
                    React.createElement("span", { className: "el-text" }, props.text)));
            }
            else {
                return (React.createElement("span", { className: utils_1.classNames("charticulator__button-flat-panel", [
                        "is-disabled",
                        this.props.disabled,
                    ]), title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url })));
            }
        }
        else {
            return (React.createElement("span", { className: utils_1.classNames("charticulator__button-flat-panel", [
                    "is-disabled",
                    this.props.disabled,
                ]), title: props.title, onClick: this._doClick },
                React.createElement("span", { className: "el-text" }, props.text)));
        }
    }
}
exports.ButtonFlatPanel = ButtonFlatPanel;
class ButtonRaised extends BaseButton {
    render() {
        const props = this.props;
        if (props.url) {
            if (props.text) {
                return (React.createElement("span", { className: utils_1.classNames("charticulator__button-raised", [
                        "is-disabled",
                        this.props.disabled,
                    ]), title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url }),
                    React.createElement("span", { className: "el-text" }, props.text)));
            }
            else {
                return (React.createElement("span", { className: utils_1.classNames("charticulator__button-raised", [
                        "is-disabled",
                        this.props.disabled,
                    ]), title: props.title, onClick: this._doClick },
                    React.createElement(icons_1.SVGImageIcon, { url: props.url })));
            }
        }
        else {
            return (React.createElement("span", { className: utils_1.classNames("charticulator__button-raised", [
                    "is-disabled",
                    this.props.disabled,
                ]), title: props.title, onClick: this._doClick },
                React.createElement("span", { className: "el-text" }, props.text)));
        }
    }
}
exports.ButtonRaised = ButtonRaised;
//# sourceMappingURL=buttons.js.map
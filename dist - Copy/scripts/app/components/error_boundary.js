"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = exports.TelemetryContext = exports.TelemetryActionType = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const index_1 = require("./index");
const utils_1 = require("../utils");
var TelemetryActionType;
(function (TelemetryActionType) {
    TelemetryActionType["Exception"] = "exception";
    TelemetryActionType["ExportTemplate"] = "exportTempalte";
})(TelemetryActionType = exports.TelemetryActionType || (exports.TelemetryActionType = {}));
exports.TelemetryContext = React.createContext(null);
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }
    componentDidCatch(error, info) {
        var _a;
        this.setState({
            hasError: true,
            errorString: `${error.name} \n ${error.message} \n ${error.stack && error.stack} \n ${info.componentStack}`,
        });
        (_a = this.props.telemetryRecorder) === null || _a === void 0 ? void 0 : _a.record(TelemetryActionType.Exception, {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        console.log(error, info);
    }
    render() {
        if (this.state.hasError) {
            const maxWidth = this.props.maxWidth
                ? this.props.maxWidth + "px"
                : undefined;
            return (React.createElement("div", { className: "charticulator__error-boundary-report", style: { margin: "1em", maxWidth } },
                React.createElement("p", null, "Oops! Something went wrong here. This must be a software bug. As a last resort, you can undo the previous change and try again."),
                React.createElement("p", null,
                    React.createElement(index_1.ButtonRaised, { text: "Try Again", onClick: () => {
                            this.setState({
                                hasError: false,
                            });
                        } })),
                React.createElement("p", null,
                    React.createElement(index_1.ButtonRaised, { text: "Copy diagnostic information to clipboard", onClick: () => {
                            utils_1.copyToClipboard(this.state.errorString);
                        } }))));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
//# sourceMappingURL=error_boundary.js.map
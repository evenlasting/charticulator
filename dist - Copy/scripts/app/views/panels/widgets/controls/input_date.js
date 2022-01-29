"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputDate = void 0;
const React = require("react");
const input_text_1 = require("./input_text");
const core_1 = require("../../../../../core");
const datetime_1 = require("../../../../../core/dataset/datetime");
class InputDate extends React.Component {
    formatDate(value) {
        if (value == null) {
            return "";
        }
        if (typeof value === "number") {
            return core_1.applyDateFormat(new Date(value), this.props.dateDisplayFormat || "%Y-%m-%dT%H:%M:%S");
        }
        if (typeof Date === "object" && value instanceof Date) {
            return core_1.applyDateFormat(value, this.props.dateDisplayFormat || "%Y-%m-%dT%H:%M:%S");
        }
    }
    render() {
        return (React.createElement("span", { className: "charticulator__widget-control-input-number" },
            React.createElement("div", { className: "charticulator__widget-control-input-number-input" }, this.props.showCalendar ? ("datapicker" // TODO add component
            ) : (React.createElement(input_text_1.InputText, { ref: (e) => (this.textInput = e), placeholder: this.props.placeholder, defaultValue: this.formatDate(this.props.defaultValue), onEnter: (str) => {
                    const date = datetime_1.parseDate(str);
                    this.props.onEnter(date);
                    return date != null;
                } })))));
    }
}
exports.InputDate = InputDate;
//# sourceMappingURL=input_date.js.map
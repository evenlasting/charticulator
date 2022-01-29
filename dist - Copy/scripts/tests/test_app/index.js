"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestApplication = exports.TestApplicationView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const ReactDOM = require("react-dom");
const core_1 = require("../../core");
const globals_1 = require("../../app/globals");
const controllers_1 = require("../../app/controllers");
const registeredTests = [];
function registerTest(name, component) {
    registeredTests.push({ name, component });
}
class TestApplicationView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = this.getDefaultState();
    }
    getDefaultState() {
        let currentTest = "";
        if (document.location.hash.startsWith("#!")) {
            currentTest = document.location.hash.slice(2);
        }
        return { currentTest };
    }
    render() {
        let TestComponent = null;
        for (const c of registeredTests) {
            if (c.name == this.state.currentTest) {
                TestComponent = c.component;
            }
        }
        return (React.createElement("div", null,
            React.createElement("div", { style: {
                    padding: "10px",
                    borderBottom: "1px solid #CCC",
                    marginBottom: "10px",
                } },
                "Select Test: ",
                React.createElement("select", { value: this.state.currentTest || "", onChange: (e) => {
                        if (e.target.value == "") {
                            document.location.hash = "";
                        }
                        else {
                            document.location.hash = "#!" + e.target.value;
                        }
                        this.setState({ currentTest: e.target.value });
                    } },
                    React.createElement("option", { value: "" }, "(no test selected)"),
                    registeredTests.map((test) => (React.createElement("option", { key: test.name, value: test.name }, test.name))))),
            React.createElement("div", { style: { padding: "10px" } },
                TestComponent ? React.createElement(TestComponent, null) : null,
                React.createElement(controllers_1.PopupContainer, { controller: globals_1.popupController }))));
    }
}
exports.TestApplicationView = TestApplicationView;
class TestApplication {
    initialize(config, containerID) {
        return core_1.initialize(config).then(() => {
            ReactDOM.render(React.createElement(TestApplicationView, null), document.getElementById(containerID));
        });
    }
}
exports.TestApplication = TestApplication;
require("./graphics").register(registerTest);
require("./color_picker").register(registerTest);
//# sourceMappingURL=index.js.map
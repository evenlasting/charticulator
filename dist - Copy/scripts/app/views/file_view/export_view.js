"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportTemplateView = exports.FileViewExport = exports.ExportHTMLView = exports.ExportImageView = exports.InputGroup = void 0;
const react_1 = require("@fluentui/react");
const React = require("react");
const _1 = require(".");
const core_1 = require("../../../core");
const examples_1 = require("../../../core/dataset/examples");
const prototypes_1 = require("../../../core/prototypes");
const strings_1 = require("../../../strings");
const actions_1 = require("../../actions");
const components_1 = require("../../components");
const R = require("../../resources");
const utils_1 = require("../../utils");
const controls_1 = require("../panels/widgets/controls");
class InputGroup extends React.Component {
    render() {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("input", { ref: (e) => (this.ref = e), type: "text", required: true, value: this.props.value || "", onChange: () => {
                    this.props.onChange(this.ref.value);
                } }),
            React.createElement("label", null, this.props.label),
            React.createElement("i", { className: "bar" })));
    }
}
exports.InputGroup = InputGroup;
class ExportImageView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { dpi: "144" };
    }
    getScaler() {
        let dpi = +this.state.dpi;
        if (dpi < 1 || dpi != dpi) {
            dpi = 144;
        }
        dpi = Math.max(Math.min(dpi, 1200), 36);
        return dpi / 72;
    }
    render() {
        return (React.createElement("div", { className: "el-horizontal-layout-item is-fix-width" },
            React.createElement(_1.CurrentChartView, { store: this.props.store }),
            React.createElement(InputGroup, { label: strings_1.strings.fileExport.imageDPI, value: this.state.dpi, onChange: (newValue) => {
                    this.setState({
                        dpi: newValue,
                    });
                } }),
            React.createElement("div", { className: "buttons" },
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileExport.typePNG, iconProps: {
                        iconName: "Export",
                    }, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.Export("png", { scale: this.getScaler() }));
                    } }),
                " ",
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileExport.typeJPEG, iconProps: {
                        iconName: "Export",
                    }, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.Export("jpeg", { scale: this.getScaler() }));
                    } }),
                " ",
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileExport.typeSVG, iconProps: {
                        iconName: "Export",
                    }, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.Export("svg"));
                    } }))));
    }
}
exports.ExportImageView = ExportImageView;
class ExportHTMLView extends React.Component {
    render() {
        return (React.createElement("div", { className: "el-horizontal-layout-item is-fix-width" },
            React.createElement(_1.CurrentChartView, { store: this.props.store }),
            React.createElement("div", { className: "buttons" },
                React.createElement(react_1.DefaultButton, { text: strings_1.strings.fileExport.typeHTML, iconProps: {
                        iconName: "Export",
                    }, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.Export("html"));
                    } }))));
    }
}
exports.ExportHTMLView = ExportHTMLView;
class FileViewExport extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            exportMode: "image",
        };
    }
    renderExportView(mode) {
        if (mode == "image") {
            return React.createElement(ExportImageView, { store: this.props.store });
        }
        if (mode == "html") {
            return React.createElement(ExportHTMLView, { store: this.props.store });
        }
    }
    renderExportTemplate() {
        return (React.createElement("div", { className: "el-horizontal-layout-item is-fix-width" },
            React.createElement(_1.CurrentChartView, { store: this.props.store }),
            React.createElement(ExportTemplateView, { store: this.props.store, exportKind: this.state.exportMode })));
    }
    render() {
        return (React.createElement("div", { className: "charticulator__file-view-content" },
            React.createElement("h1", null, strings_1.strings.mainTabs.export),
            React.createElement("div", { className: "el-horizontal-layout" },
                React.createElement("div", { className: "el-horizontal-layout-item" },
                    React.createElement("div", { className: "charticulator__list-view" },
                        React.createElement("div", { tabIndex: 0, className: utils_1.classNames("el-item", [
                                "is-active",
                                this.state.exportMode == "image",
                            ]), onClick: () => this.setState({ exportMode: "image" }), onKeyPress: (e) => {
                                if (e.key === "Enter") {
                                    this.setState({ exportMode: "image" });
                                }
                            } },
                            React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("toolbar/export") }),
                            React.createElement("span", { className: "el-text" }, strings_1.strings.fileExport.asImage)),
                        React.createElement("div", { tabIndex: 0, className: utils_1.classNames("el-item", [
                                "is-active",
                                this.state.exportMode == "html",
                            ]), onClick: () => this.setState({ exportMode: "html" }), onKeyPress: (e) => {
                                if (e.key === "Enter") {
                                    this.setState({ exportMode: "html" });
                                }
                            } },
                            React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("toolbar/export") }),
                            React.createElement("span", { className: "el-text" }, strings_1.strings.fileExport.asHTML)),
                        this.props.store.listExportTemplateTargets().map((name) => (React.createElement("div", { tabIndex: 0, key: name, className: utils_1.classNames("el-item", [
                                "is-active",
                                this.state.exportMode == name,
                            ]), onClick: () => this.setState({ exportMode: name }), onKeyPress: (e) => {
                                if (e.key === "Enter") {
                                    this.setState({ exportMode: name });
                                }
                            } },
                            React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon("toolbar/export") }),
                            React.createElement("span", { className: "el-text" }, name)))))),
                React.createElement(components_1.TelemetryContext.Consumer, null, (telemetryRecorder) => {
                    return (React.createElement(components_1.ErrorBoundary, { maxWidth: 300, telemetryRecorder: telemetryRecorder }, this.state.exportMode == "image" ||
                        this.state.exportMode == "html"
                        ? this.renderExportView(this.state.exportMode)
                        : this.renderExportTemplate()));
                }))));
    }
}
exports.FileViewExport = FileViewExport;
class ExportTemplateView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = this.getDefaultState(this.props.exportKind);
    }
    getDefaultState(kind) {
        this.props.store.dataset.tables.forEach((t) => examples_1.ensureColumnsHaveExamples(t));
        const template = core_1.deepClone(this.props.store.buildChartTemplate());
        const target = this.props.store.createExportTemplateTarget(kind, template);
        const targetProperties = {};
        for (const property of target.getProperties()) {
            targetProperties[property.name] =
                this.props.store.getPropertyExportName(property.name) ||
                    property.default;
        }
        return {
            template,
            target,
            targetProperties,
        };
    }
    componentWillReceiveProps(newProps) {
        this.setState(this.getDefaultState(newProps.exportKind));
    }
    /** Renders input fields for extension properties */
    renderInput(label, type, value, defaultValue, onChange) {
        let ref;
        switch (type) {
            case "string":
                return (React.createElement("div", { className: "form-group" },
                    React.createElement("input", { ref: (e) => (ref = e), type: "text", required: true, value: value || "", onChange: () => {
                            onChange(ref.value);
                        } }),
                    React.createElement("label", null, label),
                    React.createElement("i", { className: "bar" })));
            case "boolean":
                // eslint-disable-next-line
                const currentValue = value ? true : false;
                return (React.createElement("div", { className: "el-inference-item", onClick: () => {
                        onChange(!currentValue);
                    } },
                    React.createElement(components_1.SVGImageIcon, { url: currentValue
                            ? R.getSVGIcon("checkbox/checked")
                            : R.getSVGIcon("checkbox/empty") }),
                    React.createElement("span", { className: "el-text" }, label)));
            case "file":
                return (React.createElement("div", { className: "form-group-file" },
                    React.createElement("label", null, label),
                    React.createElement("div", { style: {
                            display: "flex",
                            flexDirection: "row",
                        } },
                        React.createElement(controls_1.InputImageProperty, { value: value, onChange: (image) => {
                                onChange(image);
                                return true;
                            } }),
                        React.createElement(controls_1.Button, { icon: "general/eraser", onClick: () => {
                                onChange(defaultValue);
                            } })),
                    React.createElement("i", { className: "bar" })));
        }
    }
    /** Renders all fields for extension properties */
    renderTargetProperties() {
        return this.state.target.getProperties().map((property) => {
            const displayName = this.props.store.getPropertyExportName(property.name);
            const targetProperties = this.state.targetProperties;
            return (React.createElement("div", { key: property.name }, this.renderInput(property.displayName, property.type, displayName || targetProperties[property.name], property.default, (value) => {
                this.props.store.setPropertyExportName(property.name, value);
                this.setState({
                    targetProperties: Object.assign(Object.assign({}, targetProperties), { [property.name]: value }),
                });
            })));
        });
    }
    /** Renders column names for export view */
    renderSlots() {
        if (this.state.template.tables.length == 0) {
            return React.createElement("p", null, strings_1.strings.core.none);
        }
        return this.state.template.tables.map((table) => (React.createElement("div", { key: table.name }, table.columns
            .filter((col) => !col.metadata.isRaw)
            .map((column) => (React.createElement("div", { key: column.name },
            this.renderInput(strings_1.strings.fileExport.slotColumnName(column.name), "string", column.displayName, null, (value) => {
                const originalColumn = this.getOriginalColumn(table.name, column.name);
                [originalColumn, column].forEach((c) => (c.displayName = value));
                this.setState({
                    template: this.state.template,
                });
            }),
            this.renderInput(strings_1.strings.fileExport.slotColumnExample(column.name), "string", column.metadata.examples, null, (value) => {
                const originalColumn = this.getOriginalColumn(table.name, column.name);
                [originalColumn, column].forEach((c) => (c.metadata.examples = value));
                this.setState({
                    template: this.state.template,
                });
            })))))));
    }
    getOriginalColumn(tableName, columnName) {
        const dataTable = this.props.store.dataset.tables.find((t) => t.name === tableName);
        const dataColumn = dataTable.columns.find((c) => c.name === columnName);
        return dataColumn;
    }
    // eslint-disable-next-line
    renderInferences() {
        const template = this.state.template;
        if (template.inference.length == 0) {
            return React.createElement("p", null, strings_1.strings.core.none);
        }
        return (template.inference
            // Only show axis and scale inferences
            .filter((inference) => inference.axis || inference.scale)
            // eslint-disable-next-line
            .map((inference, index) => {
            let descriptionMin;
            let descriptionMax;
            const object = prototypes_1.findObjectById(this.props.store.chart, inference.objectID);
            const temaplteObject = prototypes_1.findObjectById(template.specification, inference.objectID);
            const objectName = object.properties.name;
            if (inference.scale) {
                descriptionMin = strings_1.strings.fileExport.inferScaleMin(objectName);
                descriptionMax = strings_1.strings.fileExport.inferScaleMax(objectName);
            }
            if (inference.axis) {
                descriptionMin = strings_1.strings.fileExport.inferAxisMin(objectName, inference.axis.property.toString());
                descriptionMax = strings_1.strings.fileExport.inferAxisMax(objectName, inference.axis.property.toString());
            }
            const keyAutoDomainMin = "autoDomainMin";
            const keyAutoDomainMax = "autoDomainMax";
            let onClickAutoDomainMin = () => { };
            let onClickAutoDomainMax = () => { };
            let getAutoDomainMinPropertyValue = null;
            let getAutoDomainMaxPropertyValue = null;
            if (inference.axis) {
                if (object.properties[inference.axis.property][keyAutoDomainMax] === undefined) {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, inference.axis.property, keyAutoDomainMax, true, true, true));
                    temaplteObject.properties[keyAutoDomainMax] = true;
                    inference.autoDomainMax = true;
                }
                else {
                    inference.autoDomainMax = object.properties[inference.axis.property][keyAutoDomainMax];
                }
                onClickAutoDomainMax = () => {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, inference.axis.property, keyAutoDomainMax, !object.properties[inference.axis.property][keyAutoDomainMax], true, true));
                    this.setState({ template });
                };
                getAutoDomainMaxPropertyValue = () => {
                    return object.properties[inference.axis.property][keyAutoDomainMax];
                };
            }
            if (inference.scale) {
                if (object.properties[keyAutoDomainMax] === undefined) {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, keyAutoDomainMax, null, true, true, true));
                    temaplteObject.properties[keyAutoDomainMax] = true;
                    inference.autoDomainMax = true;
                }
                else {
                    inference.autoDomainMax = temaplteObject.properties[keyAutoDomainMax];
                }
                onClickAutoDomainMax = () => {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, keyAutoDomainMax, null, !object.properties[keyAutoDomainMax], true, true));
                    this.setState({ template });
                };
                getAutoDomainMaxPropertyValue = () => {
                    return object.properties[keyAutoDomainMax];
                };
            }
            if (inference.axis) {
                if (object.properties[inference.axis.property][keyAutoDomainMin] === undefined) {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, inference.axis.property, keyAutoDomainMin, true, true, true));
                    temaplteObject.properties[keyAutoDomainMin] = true;
                    inference.autoDomainMin = true;
                }
                else {
                    inference.autoDomainMin = object.properties[inference.axis.property][keyAutoDomainMin];
                }
                onClickAutoDomainMin = () => {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, inference.axis.property, keyAutoDomainMin, !object.properties[inference.axis.property][keyAutoDomainMin], true, true));
                    this.setState({ template });
                };
                getAutoDomainMinPropertyValue = () => {
                    return object.properties[inference.axis.property][keyAutoDomainMin];
                };
            }
            if (inference.scale) {
                if (object.properties[keyAutoDomainMin] === undefined) {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, keyAutoDomainMin, null, true, true, true));
                    temaplteObject.properties[keyAutoDomainMin] = true;
                    inference.autoDomainMin = true;
                }
                else {
                    inference.autoDomainMin = object.properties[keyAutoDomainMin];
                }
                onClickAutoDomainMin = () => {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, keyAutoDomainMin, null, !object.properties[keyAutoDomainMin], true, true));
                    this.setState({ template });
                };
                getAutoDomainMinPropertyValue = () => {
                    return object.properties[keyAutoDomainMin];
                };
            }
            return (React.createElement(React.Fragment, { key: index },
                React.createElement("div", { className: "el-inference-item", onClick: onClickAutoDomainMin },
                    React.createElement(components_1.SVGImageIcon, { url: getAutoDomainMinPropertyValue()
                            ? R.getSVGIcon("checkbox/checked")
                            : R.getSVGIcon("checkbox/empty") }),
                    React.createElement("span", { className: "el-text" }, descriptionMin)),
                React.createElement("div", { className: "el-inference-item", onClick: onClickAutoDomainMax },
                    React.createElement(components_1.SVGImageIcon, { url: getAutoDomainMaxPropertyValue()
                            ? R.getSVGIcon("checkbox/checked")
                            : R.getSVGIcon("checkbox/empty") }),
                    React.createElement("span", { className: "el-text" }, descriptionMax))));
        }));
    }
    /** Renders object/properties list of chart */
    renderExposedProperties() {
        const template = this.state.template;
        const result = [];
        const templateObjects = new Map();
        for (const p of this.state.template.properties) {
            const id = p.objectID;
            const object = prototypes_1.findObjectById(this.props.store.chart, id);
            if (object && (p.target.attribute || p.target.property)) {
                if (object.properties.exposed == undefined) {
                    this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, "exposed", null, true, true, true));
                    const templateObject = prototypes_1.findObjectById(this.state.template.specification, id);
                    templateObject.properties.exposed = true;
                }
                templateObjects.set(id, object);
            }
        }
        for (const [key, object] of templateObjects) {
            if (core_1.Prototypes.isType(object.classID, "guide")) {
                continue;
            }
            const onClick = () => {
                this.props.store.dispatcher.dispatch(new actions_1.Actions.SetObjectProperty(object, "exposed", null, !(object.properties.exposed === undefined
                    ? true
                    : object.properties.exposed), true, true));
                const templateObject = prototypes_1.findObjectById(this.state.template.specification, object._id);
                templateObject.properties.exposed = !templateObject.properties.exposed;
                this.setState({ template });
            };
            result.push(React.createElement("div", { "aria-checked": object.properties.exposed === undefined
                    ? "true"
                    : object.properties.exposed
                        ? "true"
                        : "false", tabIndex: 0, key: key, className: "el-inference-item", onClick: onClick, onKeyPress: (e) => {
                    if (e.key === "Enter") {
                        onClick();
                    }
                } },
                React.createElement(components_1.SVGImageIcon, { url: !(object.properties.exposed === undefined
                        ? true
                        : object.properties.exposed)
                        ? R.getSVGIcon("checkbox/empty")
                        : R.getSVGIcon("checkbox/checked") }),
                React.createElement(components_1.SVGImageIcon, { url: R.getSVGIcon(core_1.Prototypes.ObjectClasses.GetMetadata(object.classID).iconPath) }),
                React.createElement("span", { className: "el-text" }, object.properties.name)));
        }
        return result;
    }
    render() {
        return (React.createElement("div", { className: "charticulator__export-template-view" },
            React.createElement("h2", null, strings_1.strings.fileExport.labelSlots),
            this.renderSlots(),
            React.createElement("h2", null, strings_1.strings.fileExport.labelAxesAndScales),
            this.renderInferences(),
            React.createElement("h2", null, strings_1.strings.fileExport.labelExposedObjects),
            this.renderExposedProperties(),
            React.createElement("h2", null, strings_1.strings.fileExport.labelProperties(this.props.exportKind)),
            this.renderTargetProperties(),
            React.createElement("div", { className: "buttons" },
                React.createElement(react_1.DefaultButton, { text: this.props.exportKind, iconProps: {
                        iconName: "Export",
                    }, styles: core_1.primaryButtonStyles, onClick: () => {
                        this.props.store.dispatcher.dispatch(new actions_1.Actions.ExportTemplate(this.props.exportKind, this.state.target, this.state.targetProperties));
                    } }))));
    }
}
exports.ExportTemplateView = ExportTemplateView;
//# sourceMappingURL=export_view.js.map
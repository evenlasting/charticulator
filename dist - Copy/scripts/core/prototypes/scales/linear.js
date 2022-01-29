"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearBooleanScale = exports.LinearBooleanScaleMode = exports.LinearColorScale = exports.LinearScale = void 0;
const strings_1 = require("../../../strings");
const common_1 = require("../../common");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const types_1 = require("../../specification/types");
const index_1 = require("./index");
class LinearScale extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = ["rangeMin", "rangeMax"];
        this.attributes = {
            rangeMin: {
                name: "rangeMin",
                type: Specification.AttributeType.Number,
                defaultValue: 0,
            },
            rangeMax: {
                name: "rangeMax",
                type: Specification.AttributeType.Number,
            },
        };
    }
    mapDataToAttribute(data) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const x1 = props.domainMin;
        const x2 = props.domainMax;
        const y1 = attrs.rangeMin;
        const y2 = attrs.rangeMax;
        return ((data - x1) / (x2 - x1)) * (y2 - y1) + y1;
    }
    buildConstraint(data, target, solver) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const x1 = props.domainMin;
        const x2 = props.domainMax;
        const k = (data - x1) / (x2 - x1);
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, target]], [
            [1 - k, solver.attr(attrs, "rangeMin")],
            [k, solver.attr(attrs, "rangeMax")],
        ]);
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.rangeMin = 0;
        attrs.rangeMax = 100;
    }
    inferParameters(column, options = {}) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const s = new common_1.Scale.LinearScale();
        const values = column.filter((x) => typeof x == "number");
        s.inferParameters(values);
        s.adjustDomain(options);
        if (options.extendScaleMin || props.domainMin === undefined) {
            props.domainMin = s.domainMin;
        }
        if (options.extendScaleMax || props.domainMax === undefined) {
            props.domainMax = s.domainMax;
        }
        if (!options.reuseRange) {
            if (options.rangeNumber) {
                attrs.rangeMin = options.rangeNumber[0];
                attrs.rangeMax = options.rangeNumber[1];
            }
            else {
                attrs.rangeMin = 0;
                attrs.rangeMax = 100;
            }
            if (!options.autoRange) {
                this.object.mappings.rangeMin = {
                    type: specification_1.MappingType.value,
                    value: attrs.rangeMin,
                };
                this.object.mappings.rangeMax = {
                    type: specification_1.MappingType.value,
                    value: attrs.rangeMax,
                };
            }
            if (options.startWithZero === "always") {
                this.object.mappings.rangeMin = {
                    type: specification_1.MappingType.value,
                    value: 0,
                };
            }
        }
    }
    getAttributePanelWidgets(manager) {
        return [
            manager.sectionHeader(strings_1.strings.objects.dataAxis.domain),
            manager.inputNumber({ property: "domainMin" }, { label: strings_1.strings.objects.dataAxis.start, stopPropagation: true }),
            manager.inputNumber({ property: "domainMax" }, { label: strings_1.strings.objects.dataAxis.end, stopPropagation: true }),
            manager.sectionHeader(strings_1.strings.objects.dataAxis.autoUpdateValues),
            manager.inputBoolean({
                property: "autoDomainMin",
            }, {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.start,
            }),
            manager.inputBoolean({
                property: "autoDomainMax",
            }, {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.end,
            }),
            manager.sectionHeader(strings_1.strings.objects.dataAxis.range),
            manager.mappingEditor(strings_1.strings.objects.dataAxis.start, "rangeMin", {
                defaultValue: 0,
                stopPropagation: true,
            }),
            manager.mappingEditor(strings_1.strings.objects.dataAxis.end, "rangeMax", {
                defaultAuto: true,
                stopPropagation: true,
            }),
        ];
    }
    getTemplateParameters() {
        const parameters = super.getTemplateParameters();
        if (!parameters.properties) {
            parameters.properties = [];
        }
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                property: "domainMin",
            },
            type: Specification.AttributeType.Number,
        });
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                property: "domainMax",
            },
            type: Specification.AttributeType.Number,
        });
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                attribute: "rangeMin",
            },
            type: Specification.AttributeType.Number,
            default: null,
        });
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                attribute: "rangeMax",
            },
            type: Specification.AttributeType.Number,
            default: null,
        });
        return parameters;
    }
}
exports.LinearScale = LinearScale;
LinearScale.classID = "scale.linear<number,number>";
LinearScale.type = "scale";
LinearScale.defaultMappingValues = {
    rangeMin: 0,
};
LinearScale.defaultProperties = {
    autoDomainMin: true,
    autoDomainMax: true,
};
function getDefaultGradient() {
    return {
        colorspace: types_1.Colorspace.Lab,
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 0, b: 0 },
        ],
    };
}
class LinearColorScale extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        const x1 = props.domainMin;
        const x2 = props.domainMax;
        const t = (data - x1) / (x2 - x1);
        const c = common_1.interpolateColors(props.range.colors, props.range.colorspace);
        return c(t);
    }
    // eslint-disable-next-line
    buildConstraint(
    // eslint-disable-next-line
    data, 
    // eslint-disable-next-line
    target, 
    // eslint-disable-next-line
    solver
    // eslint-disable-next-line
    ) { }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.LinearScale();
        const values = column.filter((x) => typeof x == "number");
        s.inferParameters(values);
        s.adjustDomain(options);
        if (options.extendScaleMin || props.domainMin === undefined) {
            props.domainMin = s.domainMin;
        }
        if (options.extendScaleMax || props.domainMax === undefined) {
            props.domainMax = s.domainMax;
        }
        if (!options.reuseRange) {
            props.range = getDefaultGradient();
        }
    }
    getAttributePanelWidgets(manager) {
        return [
            manager.sectionHeader(strings_1.strings.objects.dataAxis.domain),
            manager.inputNumber({ property: "domainMin" }, { stopPropagation: true, label: strings_1.strings.objects.dataAxis.start }),
            manager.inputNumber({ property: "domainMax" }, { stopPropagation: true, label: strings_1.strings.objects.dataAxis.end }),
            manager.sectionHeader(strings_1.strings.objects.dataAxis.gradient),
            manager.inputColorGradient({ property: "range", noComputeLayout: true }, true),
        ];
    }
    getTemplateParameters() {
        const parameters = super.getTemplateParameters();
        if (!parameters.properties) {
            parameters.properties = [];
        }
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                property: "domainMin",
            },
            type: Specification.AttributeType.Number,
        });
        parameters.properties.push({
            objectID: this.object._id,
            target: {
                property: "domainMax",
            },
            type: Specification.AttributeType.Number,
        });
        return parameters;
    }
}
exports.LinearColorScale = LinearColorScale;
LinearColorScale.classID = "scale.linear<number,color>";
LinearColorScale.type = "scale";
LinearColorScale.metadata = {
    displayName: strings_1.strings.objects.scale,
    iconPath: "scale/color",
};
LinearColorScale.defaultMappingValues = {
    range: getDefaultGradient(),
};
var LinearBooleanScaleMode;
(function (LinearBooleanScaleMode) {
    LinearBooleanScaleMode["GreaterThan"] = "Greater than";
    LinearBooleanScaleMode["LessThan"] = "Less than";
    LinearBooleanScaleMode["Between"] = "Between";
    LinearBooleanScaleMode["EqualTo"] = "Equal to";
    LinearBooleanScaleMode["GreaterThanOrEqualTo"] = "Greater than or equal to";
    LinearBooleanScaleMode["LessThanOrEqualTo"] = "Less than or equal to";
    LinearBooleanScaleMode["NotBetween"] = "Not between";
    LinearBooleanScaleMode["NotEqualTo"] = "Not Equal to";
})(LinearBooleanScaleMode = exports.LinearBooleanScaleMode || (exports.LinearBooleanScaleMode = {}));
class LinearBooleanScale extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        const value = data;
        switch (props.mode) {
            case LinearBooleanScaleMode.GreaterThan:
                return value > props.min;
            case LinearBooleanScaleMode.GreaterThanOrEqualTo:
                return value >= props.min;
            case LinearBooleanScaleMode.LessThan:
                return value < props.max;
            case LinearBooleanScaleMode.LessThanOrEqualTo:
                return value <= props.max;
            case LinearBooleanScaleMode.EqualTo:
                return value == props.min;
            case LinearBooleanScaleMode.NotEqualTo:
                return value != props.min;
            case LinearBooleanScaleMode.Between:
                return value <= props.max && value >= props.min;
            case LinearBooleanScaleMode.NotBetween:
                return value > props.max || value < props.min;
        }
    }
    buildConstraint() {
        //ignore
    }
    initializeState() {
        //ignore
    }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.LinearScale();
        const values = column.filter((x) => typeof x == "number");
        s.inferParameters(values);
        if (options.extendScaleMin || props.min === undefined) {
            props.min = s.domainMin;
        }
        if (options.extendScaleMax || props.max === undefined) {
            props.max = s.domainMax;
        }
        props.mode = LinearBooleanScaleMode.GreaterThan;
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const minMax = [];
        const isEqual = props.mode === LinearBooleanScaleMode.EqualTo ||
            props.mode === LinearBooleanScaleMode.NotEqualTo;
        if (props.mode === LinearBooleanScaleMode.GreaterThan ||
            props.mode === LinearBooleanScaleMode.GreaterThanOrEqualTo ||
            props.mode === LinearBooleanScaleMode.Between ||
            props.mode === LinearBooleanScaleMode.NotBetween ||
            props.mode === LinearBooleanScaleMode.EqualTo ||
            props.mode === LinearBooleanScaleMode.NotEqualTo) {
            minMax.push(manager.vertical(this.object.inputType === Specification.DataType.Date
                ? manager.inputDate({ property: "min" }, { label: isEqual ? "Date" : "Start date" })
                : manager.inputNumber({ property: "min" }, {
                    stopPropagation: true,
                    label: isEqual ? "Value" : "Minimum value",
                })));
        }
        if (props.mode === LinearBooleanScaleMode.LessThan ||
            props.mode === LinearBooleanScaleMode.LessThanOrEqualTo ||
            props.mode === LinearBooleanScaleMode.Between ||
            props.mode === LinearBooleanScaleMode.NotBetween) {
            minMax.push(this.object.inputType === Specification.DataType.Date
                ? manager.inputDate({ property: "max" }, { label: "End date" })
                : manager.inputNumber({ property: "max" }, { stopPropagation: true, label: "Maximum value" }));
        }
        return [
            manager.sectionHeader(strings_1.strings.typeDisplayNames.boolean),
            manager.inputSelect({ property: "mode" }, {
                type: "dropdown",
                options: [
                    LinearBooleanScaleMode.GreaterThan,
                    LinearBooleanScaleMode.GreaterThanOrEqualTo,
                    LinearBooleanScaleMode.LessThan,
                    LinearBooleanScaleMode.LessThanOrEqualTo,
                    LinearBooleanScaleMode.EqualTo,
                    LinearBooleanScaleMode.NotEqualTo,
                    LinearBooleanScaleMode.Between,
                    LinearBooleanScaleMode.NotBetween,
                ],
                labels: [
                    LinearBooleanScaleMode.GreaterThan,
                    LinearBooleanScaleMode.GreaterThanOrEqualTo,
                    LinearBooleanScaleMode.LessThan,
                    LinearBooleanScaleMode.LessThanOrEqualTo,
                    LinearBooleanScaleMode.EqualTo,
                    LinearBooleanScaleMode.NotEqualTo,
                    LinearBooleanScaleMode.Between,
                    LinearBooleanScaleMode.NotBetween,
                ],
                showLabel: true,
                label: strings_1.strings.objects.scales.mode,
            }),
            ...minMax,
        ];
    }
    getTemplateParameters() {
        const parameters = super.getTemplateParameters();
        const props = this.object.properties;
        if (!parameters.properties) {
            parameters.properties = [];
        }
        if (props.mode === LinearBooleanScaleMode.GreaterThan ||
            props.mode === LinearBooleanScaleMode.GreaterThanOrEqualTo) {
            parameters.properties.push({
                objectID: this.object._id,
                target: {
                    property: "min",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.min,
            });
        }
        if (props.mode === LinearBooleanScaleMode.LessThan ||
            props.mode === LinearBooleanScaleMode.LessThanOrEqualTo) {
            parameters.properties.push({
                objectID: this.object._id,
                target: {
                    property: "max",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.max,
            });
        }
        if (props.mode === LinearBooleanScaleMode.Between ||
            props.mode === LinearBooleanScaleMode.NotBetween) {
            parameters.properties.push({
                objectID: this.object._id,
                target: {
                    property: "min",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.min,
            });
            parameters.properties.push({
                objectID: this.object._id,
                target: {
                    property: "max",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.max,
            });
        }
        if (props.mode === LinearBooleanScaleMode.EqualTo ||
            props.mode === LinearBooleanScaleMode.NotEqualTo) {
            parameters.properties.push({
                objectID: this.object._id,
                target: {
                    property: "min",
                },
                type: Specification.AttributeType.Number,
                default: this.object.properties.min,
            });
        }
        return parameters;
    }
}
exports.LinearBooleanScale = LinearBooleanScale;
LinearBooleanScale.classID = "scale.linear<number,boolean>";
LinearBooleanScale.type = "scale";
LinearBooleanScale.defaultMappingValues = {
    min: 0,
    max: 1,
    mode: LinearBooleanScaleMode.GreaterThan,
};
//# sourceMappingURL=linear.js.map
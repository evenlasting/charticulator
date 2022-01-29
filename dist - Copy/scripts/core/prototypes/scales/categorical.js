"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoricalScaleBase64Image = exports.CategoricalScaleImage = exports.CategoricalScaleBoolean = exports.CategoricalScaleEnum = exports.CategoricalScaleColor = exports.CategoricalScaleNumber = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../../common");
const solver_1 = require("../../solver");
const specification_1 = require("../../specification");
const index_1 = require("./index");
const d3_color_1 = require("d3-color");
const types_1 = require("../../specification/types");
const categorical_legend_1 = require("../legends/categorical_legend");
const strings_1 = require("../../../strings");
function reuseMapping(domain, existing) {
    const result = {};
    const available = [];
    for (const d of Object.keys(existing)) {
        if (domain.has(d)) {
            // Found one with the same key, reuse the color
            result[d] = existing[d];
        }
        else {
            // Other, make the color available
            available.push(existing[d]);
        }
    }
    // Assign remaining keys from the domain
    domain.forEach((v, d) => {
        // eslint-disable-next-line
        if (!result.hasOwnProperty(d)) {
            if (available.length > 0) {
                result[d] = available[0];
                available.splice(0, 1);
            }
            else {
                // No available color left, fail
                return null;
            }
        }
    });
    return result;
}
class CategoricalScaleNumber extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = ["rangeScale"];
        this.attributes = {
            rangeScale: {
                name: "rangeScale",
                type: specification_1.AttributeType.Number,
            },
        };
    }
    mapDataToAttribute(data) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const number = props.mapping[data ? data === null || data === void 0 ? void 0 : data.toString() : null];
        return (number !== null && number !== void 0 ? number : 0) * attrs.rangeScale;
    }
    buildConstraint(data, target, solver) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const k = props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, target]], [[k, solver.attr(attrs, "rangeScale")]]);
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.rangeScale = 10;
    }
    inferParameters(column, options = {}) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const values = column.filter((x) => typeof x == "string");
        s.inferParameters(values, types_1.OrderMode.order);
        props.mapping = {};
        let range = [1, s.domain.size];
        if (options.rangeNumber) {
            range = options.rangeNumber;
        }
        s.domain.forEach((v, d) => {
            props.mapping[d] =
                (v / (s.domain.size - 1)) * (range[1] - range[0]) + range[0];
        });
        attrs.rangeScale = range[1];
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const keys = [];
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return [
            manager.sectionHeader("Number Mapping"),
            manager.scrollList(keys.map((key) => manager.horizontal([2, 3], manager.text(key, "right"), manager.inputNumber({ property: "mapping", field: key })))),
            manager.sectionHeader("Scale export properties"),
            manager.row("", manager.vertical(manager.inputBoolean({
                property: "autoDomainMin",
            }, {
                type: "checkbox",
                label: "Auto min value",
            }), manager.inputBoolean({
                property: "autoDomainMax",
            }, {
                type: "checkbox",
                label: "Auto max value",
            }))),
        ];
    }
}
exports.CategoricalScaleNumber = CategoricalScaleNumber;
CategoricalScaleNumber.classID = "scale.categorical<string,number>";
CategoricalScaleNumber.type = "scale";
CategoricalScaleNumber.defaultProperties = {
    exposed: true,
    autoDomainMin: true,
    autoDomainMax: true,
};
class CategoricalScaleColor extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        return props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
    }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const values = column.filter((x) => x != null).map((x) => x.toString());
        s.inferParameters(values, types_1.OrderMode.order);
        props.autoDomainMin = true;
        props.autoDomainMax = true;
        // If we shouldn't reuse the range, then reset the mapping
        if (!options.reuseRange) {
            props.mapping = null;
            // Otherwise, if we already have a mapping, try to reuse it
        }
        else if (props.mapping != null) {
            if (options.extendScaleMin || options.extendScaleMax) {
                const mapping = reuseMapping(s.domain, props.mapping);
                let colorList = literalColorValues(values);
                if (!colorList) {
                    // Find a good default color palette
                    colorList = common_1.getDefaultColorPalette(s.length);
                }
                s.domain.forEach((v, d) => {
                    // If we still don't have enough colors, reuse them
                    // NEEDTO: fix this with a better method
                    if (!mapping[d]) {
                        mapping[d] = colorList[v % colorList.length];
                    }
                });
                // Find unused mapping and save them, if count if new mapping domain is less thant old.
                const newMappingKeys = Object.keys(mapping);
                const oldMappingKeys = Object.keys(props.mapping);
                if (newMappingKeys.length < oldMappingKeys.length) {
                    oldMappingKeys
                        .slice(newMappingKeys.length, oldMappingKeys.length)
                        .filter((key) => key.startsWith(categorical_legend_1.ReservedMappingKeyNamePrefix))
                        .forEach((key) => {
                        mapping[key] = props.mapping[key];
                    });
                }
                props.mapping = mapping;
            }
            else {
                props.mapping = reuseMapping(s.domain, props.mapping);
            }
        }
        if (props.mapping == null) {
            // If we can't reuse existing colors, infer from scratch
            props.mapping = {};
            // try to use literal values as color
            let colorList = literalColorValues(values);
            if (colorList) {
                s.domain.forEach((v, d) => {
                    props.mapping[d] = colorList[v % colorList.length];
                });
            }
            else if (common_1.getDefaultColorPaletteGenerator()) {
                s.domain.forEach((v, d) => {
                    props.mapping[d] = common_1.getDefaultColorPaletteByValue(d, s.length);
                });
            }
            else {
                colorList = common_1.getDefaultColorPalette(s.length);
                s.domain.forEach((v, d) => {
                    props.mapping[d] = colorList[v % colorList.length];
                });
            }
        }
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const keys = [];
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return [
            manager.inputBoolean([
                {
                    property: "autoDomainMin",
                },
                {
                    property: "autoDomainMax",
                },
            ], {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoUpdateValues,
            }),
            manager.sectionHeader("Color Mapping"),
            manager.scrollList(keys.map((key) => manager.horizontal([1, 0], manager.inputText({ property: "mapping" }, {
                updateProperty: true,
                value: key,
                underline: true,
                styles: {
                    textAlign: "right",
                },
                emitMappingAction: true,
            }), manager.inputColor({
                property: "mapping",
                field: key,
                noComputeLayout: true,
            }, {
                // label: key,
                noDefaultMargin: true,
                stopPropagation: true,
                labelKey: key,
                width: 100,
                underline: true,
                pickerBeforeTextField: true,
            })))),
        ];
    }
}
exports.CategoricalScaleColor = CategoricalScaleColor;
CategoricalScaleColor.metadata = {
    displayName: "Scale",
    iconPath: "scale/color",
};
CategoricalScaleColor.classID = "scale.categorical<string,color>";
CategoricalScaleColor.type = "scale";
function literalColorValues(values) {
    const colorList = [];
    const cache = {};
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (cache[value]) {
            continue;
        }
        const d3c = d3_color_1.color(value);
        if (!d3c) {
            return null;
        }
        const { r, g, b, opacity } = d3c.rgb();
        if (opacity !== 1) {
            return null;
        }
        colorList.push({ r, g, b });
        cache[value] = true;
    }
    return colorList;
}
class CategoricalScaleEnum extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        return props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
    }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const values = column.filter((x) => x != null).map((x) => x.toString());
        s.inferParameters(values, types_1.OrderMode.order);
        // If we shouldn't reuse the range, then reset the mapping
        if (!options.reuseRange) {
            props.mapping = null;
            // Otherwise, if we already have a mapping, try to reuse it
        }
        else if (props.mapping != null) {
            props.mapping = reuseMapping(s.domain, props.mapping);
        }
        if (props.mapping == null) {
            props.mapping = {};
            if (options.rangeEnum) {
                props.defaultRange = options.rangeEnum.slice();
            }
            s.domain.forEach((v, d) => {
                if (options.rangeEnum) {
                    props.mapping[d] = options.rangeEnum[v % options.rangeEnum.length];
                }
                else {
                    props.mapping[d] = d;
                }
            });
        }
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const keys = [];
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return [
            manager.sectionHeader("String Mapping"),
            manager.scrollList(keys.map((key) => manager.horizontal([2, 3], manager.inputText({ property: "mapping" }, {
                updateProperty: true,
                value: key,
                underline: true,
                styles: {
                    textAlign: "right",
                },
            }), manager.inputComboBox({ property: "mapping", field: key }, {
                defaultRange: props.defaultRange,
                valuesOnly: false,
            })))),
        ];
    }
}
exports.CategoricalScaleEnum = CategoricalScaleEnum;
CategoricalScaleEnum.classID = "scale.categorical<string,enum>";
CategoricalScaleEnum.type = "scale";
class CategoricalScaleBoolean extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        return props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
    }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const values = column.filter((x) => x != null).map((x) => x.toString());
        s.inferParameters(values, types_1.OrderMode.order);
        // If we shouldn't reuse the range, then reset the mapping
        if (!options.reuseRange) {
            props.mapping = null;
            // Otherwise, if we already have a mapping, try to reuse it
        }
        else if (props.mapping != null) {
            props.mapping = reuseMapping(s.domain, props.mapping);
        }
        if (props.mapping == null) {
            props.mapping = {};
            s.domain.forEach((v, d) => {
                props.mapping[d] = true;
            });
        }
    }
    getAttributePanelWidgets(manager) {
        const items = [];
        const props = this.object.properties;
        const mappingALL = {};
        const mappingNONE = {};
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                items.push(manager.inputBoolean({ property: "mapping", field: key }, { type: "checkbox-fill-width", label: key }));
                mappingALL[key] = true;
                mappingNONE[key] = false;
            }
        }
        return [
            manager.inputBoolean([
                {
                    property: "autoDomainMin",
                },
                {
                    property: "autoDomainMax",
                },
            ], {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoUpdateValues,
            }),
            manager.sectionHeader("Boolean Mapping"),
            manager.row(null, manager.horizontal([0, 0], manager.setButton({ property: "mapping" }, mappingALL, null, "Select All"), manager.setButton({ property: "mapping" }, mappingNONE, null, "Clear"))),
            manager.scrollList(items),
        ];
    }
}
exports.CategoricalScaleBoolean = CategoricalScaleBoolean;
CategoricalScaleBoolean.classID = "scale.categorical<string,boolean>";
CategoricalScaleBoolean.type = "scale";
class CategoricalScaleImage extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        return props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
    }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(column, options = {}) {
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const values = column.filter((x) => x != null).map((x) => x.toString());
        s.inferParameters(values, types_1.OrderMode.order);
        // If we shouldn't reuse the range, then reset the mapping
        if (!options.reuseRange) {
            props.mapping = null;
            // Otherwise, if we already have a mapping, try to reuse it
        }
        else if (props.mapping != null) {
            props.mapping = reuseMapping(s.domain, props.mapping);
        }
        if (props.mapping == null) {
            props.mapping = {};
            s.domain.forEach((v, d) => {
                if (options.rangeImage) {
                    props.mapping[d] = options.rangeImage[v % options.rangeImage.length];
                }
                else {
                    props.mapping[d] = null;
                }
            });
        }
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const keys = [];
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return [
            manager.inputBoolean([
                {
                    property: "autoDomainMin",
                },
                {
                    property: "autoDomainMax",
                },
            ], {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoUpdateValues,
            }),
            manager.sectionHeader("Image Mapping"),
            manager.scrollList(keys.map((key) => manager.horizontal([2, 5, 0], manager.inputText({ property: "mapping" }, {
                updateProperty: true,
                value: key,
                underline: true,
                styles: {
                    textAlign: "right",
                },
            }), manager.inputImageProperty({ property: "mapping", field: key }), manager.clearButton({ property: "mapping", field: key }, "", true))), {
                styles: {
                    paddingBottom: 5,
                    paddingTop: 5,
                },
            }),
        ];
    }
}
exports.CategoricalScaleImage = CategoricalScaleImage;
CategoricalScaleImage.classID = "scale.categorical<string,image>";
CategoricalScaleImage.type = "scale";
class CategoricalScaleBase64Image extends index_1.ScaleClass {
    constructor() {
        super(...arguments);
        this.attributeNames = [];
        this.attributes = {};
    }
    mapDataToAttribute(data) {
        const props = this.object.properties;
        return props.mapping[data === null || data === void 0 ? void 0 : data.toString()];
    }
    // eslint-disable-next-line
    initializeState() { }
    inferParameters(idColumn, options) {
        const props = this.object.properties;
        const s = new common_1.Scale.CategoricalScale();
        const idValues = idColumn.filter((x) => x != null).map((x) => x.toString());
        s.inferParameters(idValues, types_1.OrderMode.order);
        // If we shouldn't reuse the range, then reset the mapping
        if (!options.reuseRange) {
            props.mapping = null;
            // Otherwise, if we already have a mapping, try to reuse it
        }
        else if (props.mapping != null) {
            props.mapping = reuseMapping(s.domain, props.mapping);
        }
        if (props.mapping == null) {
            props.mapping = {};
            s.domain.forEach((v, d) => {
                if (options.rangeImage) {
                    props.mapping[d] = options.rangeImage[v % options.rangeImage.length];
                }
                else {
                    props.mapping[d] = null;
                }
            });
        }
    }
    getAttributePanelWidgets(manager) {
        const props = this.object.properties;
        const keys = [];
        for (const key in props.mapping) {
            // eslint-disable-next-line
            if (props.mapping.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return [
            manager.inputBoolean([
                {
                    property: "autoDomainMin",
                },
                {
                    property: "autoDomainMax",
                },
            ], {
                type: "checkbox",
                label: strings_1.strings.objects.dataAxis.autoUpdateValues,
            }),
            manager.sectionHeader("Image Mapping"),
            manager.scrollList(keys.map((key) => manager.horizontal([2, 5], manager.inputText({ property: "mapping" }, {
                updateProperty: true,
                value: key,
                underline: true,
                styles: {
                    textAlign: "right",
                },
            }), manager.inputImageProperty({ property: "mapping", field: key }), manager.clearButton({ property: "mapping", field: key }, "", true))), {
                styles: {
                    paddingTop: 5,
                    paddingBottom: 5,
                },
            }),
        ];
    }
}
exports.CategoricalScaleBase64Image = CategoricalScaleBase64Image;
CategoricalScaleBase64Image.classID = "scale.categorical<image,image>";
CategoricalScaleBase64Image.type = "scale";
//# sourceMappingURL=categorical.js.map
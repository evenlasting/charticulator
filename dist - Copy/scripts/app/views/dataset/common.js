"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type2DerivedColumns = exports.isKindAcceptable = exports.kind2CompatibleKinds = exports.kind2Icon = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const core_1 = require("../../../core");
const types_1 = require("../../../core/specification/types");
const strings_1 = require("../../../strings");
exports.kind2Icon = {
    categorical: "type/categorical",
    numerical: "type/numerical",
    ordinal: "type/ordinal",
    temporal: "type/temporal",
};
exports.kind2CompatibleKinds = {
    // Ordinal is compatible with categorical
    categorical: [core_1.Dataset.DataKind.Ordinal],
    // Temporal is compatible with numerical
    numerical: [core_1.Dataset.DataKind.Temporal],
    ordinal: [],
    temporal: [],
};
/** Determine if kind is acceptable, considering compatible kinds */
function isKindAcceptable(kind, acceptKinds) {
    if (acceptKinds == null) {
        return true;
    }
    else {
        for (const item of acceptKinds) {
            if (item == kind) {
                return true;
            }
            if (exports.kind2CompatibleKinds[item] != null) {
                const compatibles = exports.kind2CompatibleKinds[item];
                if (compatibles.indexOf(kind) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.isKindAcceptable = isKindAcceptable;
function makeTwoDigitRange(start, end) {
    const r = [];
    for (let i = start; i <= end; i++) {
        let istr = i.toString();
        while (istr.length < 2) {
            istr = "0" + istr;
        }
        r.push(istr);
    }
    return r;
}
exports.type2DerivedColumns = {
    image: null,
    string: null,
    number: null,
    boolean: null,
    date: [
        {
            name: "year",
            displayName: strings_1.strings.objects.derivedColumns.year,
            type: core_1.Dataset.DataType.String,
            function: "date.year",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                orderMode: types_1.OrderMode.alphabetically,
            },
        },
        {
            name: "month",
            displayName: strings_1.strings.objects.derivedColumns.month,
            type: core_1.Dataset.DataType.String,
            function: "date.month",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                order: strings_1.strings.dataset.months,
            },
        },
        {
            name: "monthnumber",
            displayName: strings_1.strings.objects.derivedColumns.monthNumber,
            type: core_1.Dataset.DataType.String,
            function: "date.monthnumber",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                orderMode: types_1.OrderMode.alphabetically,
            },
        },
        {
            name: "day",
            displayName: strings_1.strings.objects.derivedColumns.day,
            type: core_1.Dataset.DataType.String,
            function: "date.day",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                orderMode: types_1.OrderMode.alphabetically,
            },
        },
        {
            name: "weekOfYear",
            displayName: strings_1.strings.objects.derivedColumns.weekOfYear,
            type: core_1.Dataset.DataType.String,
            function: "date.weekOfYear",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                orderMode: types_1.OrderMode.alphabetically,
            },
        },
        {
            name: "dayOfYear",
            displayName: strings_1.strings.objects.derivedColumns.dayOfYear,
            type: core_1.Dataset.DataType.String,
            function: "date.dayOfYear",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                orderMode: types_1.OrderMode.alphabetically,
            },
        },
        {
            name: "weekday",
            displayName: strings_1.strings.objects.derivedColumns.weekday,
            type: core_1.Dataset.DataType.String,
            function: "date.weekday",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                order: strings_1.strings.dataset.weekday,
            },
        },
        {
            name: "hour",
            displayName: strings_1.strings.objects.derivedColumns.hour,
            type: core_1.Dataset.DataType.String,
            function: "date.hour",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                order: makeTwoDigitRange(0, 24),
            },
        },
        {
            name: "minute",
            displayName: strings_1.strings.objects.derivedColumns.minute,
            type: core_1.Dataset.DataType.String,
            function: "date.minute",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                order: makeTwoDigitRange(0, 59),
            },
        },
        {
            name: "second",
            displayName: strings_1.strings.objects.derivedColumns.second,
            type: core_1.Dataset.DataType.String,
            function: "date.second",
            metadata: {
                kind: core_1.Dataset.DataKind.Categorical,
                order: makeTwoDigitRange(0, 59),
            },
        },
    ],
};
//# sourceMappingURL=common.js.map
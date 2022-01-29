"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceUndefinedByNull = exports.expect_deep_approximately_equals = exports.getAligntment = exports.isInIFrame = exports.copyToClipboard = exports.convertColumns = exports.getConvertableTypes = exports.getPreferredDataKind = exports.getConvertableDataKind = exports.stringToDataURL = exports.b64EncodeUnicode = exports.showOpenFileDialog = exports.getFileNameWithoutExtension = exports.getExtensionFromFileName = exports.readFileAsDataUrl = exports.readFileAsString = exports.renderDataURLToPNG = exports.parseHashString = exports.toSVGZoom = exports.toSVGNumber = exports.classNames = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const core_1 = require("../../core");
const specification_1 = require("../../core/specification");
const data_types_1 = require("../../core/dataset/data_types");
const chai_1 = require("chai");
function classNames(...args) {
    return args
        .filter((x) => x != null && (typeof x == "string" || x[1] == true))
        .map((x) => (typeof x == "string" ? x : x[0]))
        .join(" ");
}
exports.classNames = classNames;
function toSVGNumber(x) {
    return core_1.prettyNumber(x, 8);
}
exports.toSVGNumber = toSVGNumber;
function toSVGZoom(zoom) {
    return `translate(${core_1.prettyNumber(zoom.centerX)},${core_1.prettyNumber(zoom.centerY)}) scale(${core_1.prettyNumber(zoom.scale)})`;
}
exports.toSVGZoom = toSVGZoom;
function parseHashString(value) {
    // Make sure value doesn't start with "#" or "#!"
    if (value[0] == "#") {
        value = value.substr(1);
    }
    if (value[0] == "!") {
        value = value.substr(1);
    }
    // Split by & and parse each key=value pair
    return value.split("&").reduce((prev, str) => {
        const pair = str.split("=");
        prev[decodeURIComponent(pair[0])] =
            pair.length == 2 ? decodeURIComponent(pair[1]) : "";
        return prev;
    }, {});
}
exports.parseHashString = parseHashString;
function renderDataURLToPNG(dataurl, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataurl;
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            switch (options.mode) {
                case "scale":
                    {
                        canvas.width = width * options.scale;
                        canvas.height = height * options.scale;
                        if (options.background) {
                            ctx.fillStyle = options.background;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        ctx.scale(options.scale, options.scale);
                        ctx.drawImage(img, 0, 0);
                    }
                    break;
                case "thumbnail":
                    {
                        canvas.width = options.thumbnail[0];
                        canvas.height = options.thumbnail[1];
                        if (options.background) {
                            ctx.fillStyle = options.background;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        const maxScale = Math.max(canvas.width / width, canvas.height / height);
                        ctx.scale(maxScale, maxScale);
                        ctx.drawImage(img, 0, 0);
                    }
                    break;
            }
            resolve(canvas);
        };
        img.onerror = () => {
            reject(new Error("failed to load image"));
        };
    });
}
exports.renderDataURLToPNG = renderDataURLToPNG;
function readFileAsString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(new Error(`unable to read file ${file.name}`));
        };
        reader.readAsText(file, "utf-8");
    });
}
exports.readFileAsString = readFileAsString;
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(new Error(`unable to read file ${file.name}`));
        };
        reader.readAsDataURL(file);
    });
}
exports.readFileAsDataUrl = readFileAsDataUrl;
function getExtensionFromFileName(filename) {
    // eslint-disable-next-line
    const m = filename.match(/\.([^\.]+)$/);
    if (m) {
        return m[1].toLowerCase();
    }
    else {
        return null;
    }
}
exports.getExtensionFromFileName = getExtensionFromFileName;
function getFileNameWithoutExtension(filename) {
    // eslint-disable-next-line
    return filename.replace(/\.([^\.]+)$/, "");
}
exports.getFileNameWithoutExtension = getFileNameWithoutExtension;
function showOpenFileDialog(accept) {
    return new Promise((resolve, reject) => {
        const inputElement = document.createElement("input");
        inputElement.type = "file";
        if (accept != null) {
            inputElement.accept = accept.map((x) => "." + x).join(",");
        }
        inputElement.onchange = () => {
            if (inputElement.files.length == 1) {
                resolve(inputElement.files[0]);
            }
            else {
                reject();
            }
        };
        inputElement.click();
    });
}
exports.showOpenFileDialog = showOpenFileDialog;
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}
exports.b64EncodeUnicode = b64EncodeUnicode;
function stringToDataURL(mimeType, content) {
    return "data:" + mimeType + ";base64," + b64EncodeUnicode(content);
}
exports.stringToDataURL = stringToDataURL;
function checkConvertion(type, dataSample) {
    let convertable = true;
    if (type === specification_1.DataType.String) {
        return convertable;
    }
    switch (type) {
        case specification_1.DataType.Boolean:
            for (const data of dataSample) {
                if (data &&
                    data.toString().toLowerCase() != "0" &&
                    data.toString().toLowerCase() != "true" &&
                    data.toString().toLowerCase() != "1" &&
                    data.toString().toLowerCase() != "false" &&
                    data.toString().toLowerCase() != "yes" &&
                    data.toString().toLowerCase() != "no") {
                    convertable = false;
                    break;
                }
            }
            return convertable;
        case specification_1.DataType.Date:
            convertable = true;
            for (const data of dataSample) {
                if (data &&
                    Number.isNaN(Date.parse(data.toString())) &&
                    Number.isNaN(new Date(+data.toString()).getDate())) {
                    convertable = false;
                    break;
                }
            }
            return convertable;
        case specification_1.DataType.Number:
            convertable = true;
            for (const data of dataSample) {
                if (data && Number.isNaN(Number.parseFloat(data.toString()))) {
                    convertable = false;
                    break;
                }
            }
            return convertable;
        default:
            return false;
    }
}
function getConvertableDataKind(type) {
    let kinds;
    switch (type) {
        case specification_1.DataType.Boolean:
            kinds = [specification_1.DataKind.Categorical, specification_1.DataKind.Ordinal];
            break;
        case specification_1.DataType.Date:
            kinds = [specification_1.DataKind.Categorical, specification_1.DataKind.Ordinal, specification_1.DataKind.Temporal];
            break;
        case specification_1.DataType.String:
            kinds = [specification_1.DataKind.Categorical, specification_1.DataKind.Ordinal];
            break;
        case specification_1.DataType.Image:
            kinds = [specification_1.DataKind.Categorical];
            break;
        case specification_1.DataType.Number:
            kinds = [specification_1.DataKind.Categorical, specification_1.DataKind.Numerical];
            break;
    }
    return kinds;
}
exports.getConvertableDataKind = getConvertableDataKind;
function getPreferredDataKind(type) {
    let kind;
    switch (type) {
        case specification_1.DataType.Boolean:
            kind = specification_1.DataKind.Categorical;
            break;
        case specification_1.DataType.Date:
            kind = specification_1.DataKind.Temporal;
            break;
        case specification_1.DataType.String:
            kind = specification_1.DataKind.Categorical;
            break;
        case specification_1.DataType.Image:
            kind = specification_1.DataKind.Categorical;
            break;
        case specification_1.DataType.Number:
            kind = specification_1.DataKind.Numerical;
            break;
    }
    return kind;
}
exports.getPreferredDataKind = getPreferredDataKind;
function getConvertableTypes(type, dataSample) {
    let types;
    switch (type) {
        case specification_1.DataType.Boolean:
            types = [specification_1.DataType.Number, specification_1.DataType.String, specification_1.DataType.Boolean];
            break;
        case specification_1.DataType.Date:
            types = [specification_1.DataType.Number, specification_1.DataType.String, specification_1.DataType.Date];
            break;
        case specification_1.DataType.String:
            types = [
                specification_1.DataType.Number,
                specification_1.DataType.String,
                specification_1.DataType.Boolean,
                specification_1.DataType.Date,
                specification_1.DataType.Image,
            ];
            break;
        case specification_1.DataType.Number:
            types = [
                specification_1.DataType.Number,
                specification_1.DataType.String,
                specification_1.DataType.Boolean,
                specification_1.DataType.Date,
            ];
            break;
        case specification_1.DataType.Image:
            types = [specification_1.DataType.Image, specification_1.DataType.String];
            break;
    }
    return types.filter((t) => {
        if (t == type) {
            return true;
        }
        if (dataSample) {
            return checkConvertion(t, dataSample.map((d) => d && d.toString()));
        }
    });
}
exports.getConvertableTypes = getConvertableTypes;
/** Fill table with values converted to @param type from origin table */
function convertColumns(table, column, originTable, type) {
    const applyConvertedValues = (table, columnName, convertedValues) => {
        table.rows.forEach((value, index) => {
            value[columnName] = convertedValues[index];
        });
    };
    const originColumn = originTable.columns.find((col) => col.name === column.name);
    let columnValues = originTable.rows.map((row) => row[column.metadata.rawColumnName] || row[column.name]);
    const typeBeforeChange = column.type;
    column.type = type;
    columnValues = originTable.rows.map((row) => {
        const value = row[column.metadata.rawColumnName] || row[column.name];
        return value && value.toString();
    });
    try {
        const convertedValues = data_types_1.convertColumn(type, columnValues, table.localeNumberFormat);
        if (convertedValues.filter((val) => val).length === 0) {
            throw Error(`Converting column type from ${originColumn.type} to ${type} failed`);
        }
        applyConvertedValues(table, column.name, convertedValues);
        return null;
    }
    catch (ex) {
        const messgae = `Converting column type from ${originColumn.type} to ${type} failed`;
        console.warn(messgae);
        // rollback type
        column.type = typeBeforeChange;
        return messgae;
    }
}
exports.convertColumns = convertColumns;
function copyToClipboard(str) {
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
}
exports.copyToClipboard = copyToClipboard;
function isInIFrame() {
    try {
        return window.self !== window.top;
    }
    catch (ex) {
        return true;
    }
}
exports.isInIFrame = isInIFrame;
function getAligntment(anchor) {
    let alignX;
    const avgPopupWindowWidth = 500;
    const anchorCloseToWindowBorder = window.innerWidth - anchor.getBoundingClientRect().x < avgPopupWindowWidth;
    let alignLeft = false;
    if (anchorCloseToWindowBorder) {
        alignX = "end-inner";
        alignLeft = true;
    }
    else {
        alignX = "end-outer";
        alignLeft = false;
    }
    return { alignLeft, alignX };
}
exports.getAligntment = getAligntment;
/** Test if a deep equals b with tolerance on numeric values */
function expect_deep_approximately_equals(a, b, tol, weak = false) {
    if (weak && a == null && b == null) {
        return;
    }
    else if (a == null || b == null) {
        // If either of a, b is null/undefined
        chai_1.expect(a).equals(b);
    }
    else if (typeof a == "object" && typeof b == "object") {
        if (a instanceof Array && b instanceof Array) {
            // Both are arrays, recursively test for each item in the arrays
            chai_1.expect(a.length).to.equals(b.length);
            for (let i = 0; i < a.length; i++) {
                expect_deep_approximately_equals(a[i], b[i], tol, weak);
            }
        }
        else if (a instanceof Array || b instanceof Array) {
            // One of them is an array, the other one isn't, error
            throw new Error("type mismatch");
        }
        else {
            // Both are objects, recursively test for each key in the objects
            const keysA = Object.keys(a).sort();
            const keysB = Object.keys(b).sort();
            chai_1.expect(keysA).to.deep.equals(keysB);
            for (const key of keysA) {
                expect_deep_approximately_equals(a[key], b[key], tol, weak);
            }
        }
    }
    else {
        if (typeof a == "number" && typeof b == "number") {
            // If both are numbers, test approximately equals
            chai_1.expect(a).to.approximately(b, tol);
        }
        else {
            // Otherwise, use regular equals
            chai_1.expect(a).equals(b);
        }
    }
}
exports.expect_deep_approximately_equals = expect_deep_approximately_equals;
function replaceUndefinedByNull(value) {
    return value === undefined ? null : value;
}
exports.replaceUndefinedByNull = replaceUndefinedByNull;
//# sourceMappingURL=index.js.map
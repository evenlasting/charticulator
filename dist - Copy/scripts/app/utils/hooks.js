"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = void 0;
const react_1 = require("react");
function useLocalStorage(initialValue, storageKey) {
    const [currentValue, setCurrentValue] = react_1.useState(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (ex) {
            console.log(ex);
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(value));
            setCurrentValue(value);
            return true;
        }
        catch (ex) {
            console.log(ex);
            return false;
        }
    };
    return [currentValue, setValue];
}
exports.useLocalStorage = useLocalStorage;
//# sourceMappingURL=hooks.js.map
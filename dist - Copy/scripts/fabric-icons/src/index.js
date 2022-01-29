"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeIcons = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const fabric_icons_1 = require("./fabric-icons");
const iconAliases_1 = require("./iconAliases");
const DEFAULT_BASE_URL = "https://spoprod-a.akamaihd.net/files/fabric/assets/icons/";
function initializeIcons(baseUrl = DEFAULT_BASE_URL, options) {
    [fabric_icons_1.initializeIcons].forEach((initialize) => initialize(baseUrl, options));
    iconAliases_1.registerIconAliases();
}
exports.initializeIcons = initializeIcons;
//# sourceMappingURL=index.js.map
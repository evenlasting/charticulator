"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlesDragContext = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const core_1 = require("../../../../core");
class HandlesDragContext extends core_1.EventEmitter {
    onDrag(listener) {
        return this.addListener("drag", listener);
    }
    onEnd(listener) {
        return this.addListener("end", listener);
    }
}
exports.HandlesDragContext = HandlesDragContext;
//# sourceMappingURL=common.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveSnappingSession = void 0;
const session_1 = require("./session");
class MoveSnappingSession extends session_1.SnappingSession {
    constructor(handle) {
        super([], handle, 10, handle.options && handle.options.snapToClosestPoint);
    }
    getUpdates(actions) {
        const updates = {};
        for (const action of actions) {
            updates[action.attribute] = action.value;
        }
        return updates;
    }
}
exports.MoveSnappingSession = MoveSnappingSession;
//# sourceMappingURL=move.js.map
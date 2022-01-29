"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIManagerListener = exports.EventManager = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType[EventType["UPDATE_FIELD"] = 0] = "UPDATE_FIELD";
})(EventType = exports.EventType || (exports.EventType = {}));
class EventManager {
    constructor() {
        this.listeners = [];
    }
    subscribe(type, listener) {
        this.listeners.push({
            listener,
            type,
        });
    }
    notify(type, property, value) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i].type === type) {
                this.listeners[i].listener.update(property, value);
            }
        }
    }
}
exports.EventManager = EventManager;
class UIManagerListener {
    constructor(manager) {
        this.manager = manager;
    }
    update(property, value) {
        this.manager.emitSetProperty(property, value);
    }
}
exports.UIManagerListener = UIManagerListener;
//# sourceMappingURL=observer.js.map
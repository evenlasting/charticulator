"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isType = exports.ObjectClasses = exports.ObjectClass = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const common_1 = require("../common");
const specification_1 = require("../specification");
/** A ObjectClass contains the runtime info for a chart object */
class ObjectClass {
    constructor(parent, object, state) {
        this.parent = parent;
        this.object = object;
        this.state = state;
    }
    /** Initialize the state of the object */
    // eslint-disable-next-line
    initializeState() { }
    /** Get the UI spec for property panel */
    getAttributePanelWidgets(manager) {
        return [
            manager.verticalGroup({
                header: "Interactivity",
            }, [
                manager.inputBoolean({ property: "enableTooltips" }, {
                    type: "checkbox",
                    label: "Tooltips",
                }),
                manager.inputBoolean({ property: "enableContextMenu" }, {
                    type: "checkbox",
                    label: "Context menu",
                }),
                manager.inputBoolean({ property: "enableSelection" }, {
                    type: "checkbox",
                    label: "Selection",
                }),
            ]),
        ];
    }
    getTemplateParameters() {
        return null;
    }
    /** Create a default object */
    // eslint-disable-next-line
    static createDefault(...args) {
        const id = common_1.uniqueID();
        const obj = {
            _id: id,
            classID: this.classID,
            properties: {},
            mappings: {},
        };
        obj.properties = common_1.deepClone(this.defaultProperties);
        for (const attr in this.defaultMappingValues) {
            // eslint-disable-next-line
            if (this.defaultMappingValues.hasOwnProperty(attr)) {
                const value = common_1.deepClone(this.defaultMappingValues[attr]);
                obj.mappings[attr] = {
                    type: specification_1.MappingType.value,
                    value,
                };
            }
        }
        return obj;
    }
}
exports.ObjectClass = ObjectClass;
/** The static classID */
ObjectClass.classID = "object";
/** The static type */
ObjectClass.type = null;
/** The metadata associated with the class */
ObjectClass.metadata = {};
/** Default attributes */
ObjectClass.defaultProperties = {
    enableTooltips: true,
    enableContextMenu: true,
    enableSelection: true,
    exposed: true,
};
/** Default mapping values */
ObjectClass.defaultMappingValues = {};
/** Store the registered object classes */
class ObjectClasses {
    /** Create a ObjectClass for a object and its state */
    static Create(parent, object, state) {
        const constructor = ObjectClasses.registeredObjectClasses.get(object.classID);
        if (!constructor) {
            throw new Error(`undefined object class '${object.classID}'`);
        }
        return new constructor(parent, object, state);
    }
    static CreateDefault(classID, ...args) {
        const constructor = ObjectClasses.registeredObjectClasses.get(classID);
        const obj = constructor.createDefault(...args);
        return obj;
    }
    static GetMetadata(classID) {
        const constructor = ObjectClasses.registeredObjectClasses.get(classID);
        if (constructor) {
            return constructor.metadata || null;
        }
        else {
            return null;
        }
    }
    static Register(constructor) {
        ObjectClasses.registeredObjectClasses.set(constructor.classID, constructor);
        if (constructor.type != null) {
            ObjectClasses.RegisterType(constructor.classID, constructor.type);
        }
    }
    static RegisterType(name, ...parents) {
        ObjectClasses.type2Parents.set(name, parents);
    }
    static isType(type, parentType) {
        if (type == parentType) {
            return true;
        }
        const parents = ObjectClasses.type2Parents.get(type);
        if (parents != null) {
            return parents.some((t) => ObjectClasses.isType(t, parentType));
        }
        else {
            return false;
        }
    }
    /**
     * Gets an interator of registered classes.
     */
    static RegisteredClasses() {
        return this.registeredObjectClasses.values();
    }
}
exports.ObjectClasses = ObjectClasses;
ObjectClasses.registeredObjectClasses = new Map();
ObjectClasses.type2Parents = new Map();
exports.isType = ObjectClasses.isType;
//# sourceMappingURL=object.js.map
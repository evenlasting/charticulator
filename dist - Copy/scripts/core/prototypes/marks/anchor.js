"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Special element: Anchor
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorElement = void 0;
const strings_1 = require("../../../strings");
const Specification = require("../../specification");
const specification_1 = require("../../specification");
const mark_1 = require("./mark");
class AnchorElement extends mark_1.MarkClass {
    constructor() {
        super(...arguments);
        /** Get a list of elemnt attributes */
        this.attributeNames = ["x", "y"];
        this.attributes = {
            x: {
                name: "x",
                type: Specification.AttributeType.Number,
            },
            y: {
                name: "y",
                type: Specification.AttributeType.Number,
            },
        };
    }
    /** Initialize the state of an element so that everything has a valid value */
    initializeState() {
        const attrs = this.state.attributes;
        attrs.x = 0;
        attrs.y = 0;
    }
    /** Get bounding rectangle given current state */
    getHandles() {
        return [];
        // let attrs = this.state.attributes as AnchorElementAttributes;
        // let { x, y } = attrs;
        // return [
        //     <Handles.Point>{
        //         type: "point",
        //         x: x, y: y,
        //         actions: []
        //     }
        // ]
    }
    // /** Get link anchors for this mark */
    // public getLinkAnchors(): LinkAnchor.Description[] {
    //     let attrs = this.state.attributes;
    //     return [
    //         {
    //             element: this.object._id,
    //             points: [
    //                 { x: attrs.x, y: attrs.y, xAttribute: "x", yAttribute: "y", direction: { x: 0, y: 1 } }
    //             ]
    //         }
    //     ];
    // }
    static createDefault(glyph) {
        const element = super.createDefault(glyph);
        element.mappings.x = {
            type: specification_1.MappingType.parent,
            parentAttribute: "icx",
        };
        element.mappings.y = {
            type: specification_1.MappingType.parent,
            parentAttribute: "icy",
        };
        return element;
    }
    getAttributePanelWidgets(manager) {
        return [manager.label(strings_1.strings.objects.anchor.label)];
    }
}
exports.AnchorElement = AnchorElement;
AnchorElement.classID = "mark.anchor";
AnchorElement.type = "mark";
AnchorElement.metadata = {
    displayName: "Anchor",
    iconPath: "mark/anchor",
};
//# sourceMappingURL=anchor.js.map
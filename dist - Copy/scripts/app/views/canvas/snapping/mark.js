"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkSnappingSession = void 0;
const actions_1 = require("../../../actions");
const guides_1 = require("../../../../core/prototypes/guides");
const prototypes_1 = require("../../../../core/prototypes");
const session_1 = require("./session");
const specification_1 = require("../../../../core/specification");
class MarkSnappingSession extends session_1.SnappingSession {
    constructor(guides, mark, element, elementState, bound, threshold, findClosestSnappingGuide) {
        super(guides.filter((x) => {
            // element cannot snap to itself
            if (x.element === element) {
                return false;
            }
            // special rules for guides
            if (element.classID === guides_1.GuideClass.classID) {
                // guide cannot snap to a mark
                if (x.element && prototypes_1.isType(x.element.classID, "mark")) {
                    return false;
                }
            }
            return true;
        }), bound, threshold, findClosestSnappingGuide);
        this.mark = mark;
        this.element = element;
    }
    getActions(actions) {
        const g = new actions_1.Actions.MarkActionGroup();
        const updates = {};
        let hasUpdates = false;
        for (const action of actions) {
            switch (action.type) {
                case "snap":
                    {
                        if (action.snapElement == null) {
                            g.add(new actions_1.Actions.SetMarkAttribute(this.mark, this.element, action.attribute, {
                                type: specification_1.MappingType.parent,
                                parentAttribute: action.snapAttribute,
                            }));
                        }
                        else {
                            g.add(new actions_1.Actions.SnapMarks(this.mark, this.element, action.attribute, action.snapElement, action.snapAttribute));
                        }
                    }
                    break;
                case "move":
                    {
                        updates[action.attribute] = action.value;
                        hasUpdates = true;
                    }
                    break;
                case "property":
                    {
                        g.add(new actions_1.Actions.SetObjectProperty(this.element, action.property, action.field, action.value));
                    }
                    break;
                case "value-mapping":
                    {
                        g.add(new actions_1.Actions.SetMarkAttribute(this.mark, this.element, action.attribute, {
                            type: specification_1.MappingType.value,
                            value: action.value,
                        }));
                    }
                    break;
            }
        }
        if (hasUpdates) {
            g.add(new actions_1.Actions.UpdateMarkAttribute(this.mark, this.element, updates));
        }
        // console.log(g);
        return g;
    }
}
exports.MarkSnappingSession = MarkSnappingSession;
//# sourceMappingURL=mark.js.map
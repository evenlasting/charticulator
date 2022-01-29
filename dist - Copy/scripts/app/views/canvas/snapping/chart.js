"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartSnappingSession = void 0;
const specification_1 = require("../../../../core/specification");
const actions_1 = require("../../../actions");
const session_1 = require("./session");
class ChartSnappingSession extends session_1.SnappingSession {
    constructor(guides, markLayout, bound, threshold, findClosestSnappingGuide) {
        super(guides.filter((x) => x.element != markLayout), bound, threshold, findClosestSnappingGuide);
        this.markLayout = markLayout;
    }
    getActions(actions) {
        const result = [];
        for (const action of actions) {
            switch (action.type) {
                case "snap":
                    {
                        if (action.snapElement == null) {
                            result.push(new actions_1.Actions.SetChartElementMapping(this.markLayout, action.attribute, {
                                type: specification_1.MappingType.parent,
                                parentAttribute: action.snapAttribute,
                            }));
                        }
                        else {
                            result.push(new actions_1.Actions.SnapChartElements(this.markLayout, action.attribute, action.snapElement, action.snapAttribute));
                        }
                    }
                    break;
                case "move":
                    {
                        const updates = {};
                        updates[action.attribute] = action.value;
                        result.push(new actions_1.Actions.UpdateChartElementAttribute(this.markLayout, updates));
                    }
                    break;
                case "property":
                    {
                        result.push(new actions_1.Actions.SetObjectProperty(this.markLayout, action.property, action.field, action.value));
                    }
                    break;
                case "value-mapping":
                    {
                        result.push(new actions_1.Actions.SetChartElementMapping(this.markLayout, action.attribute, {
                            type: specification_1.MappingType.value,
                            value: action.value,
                        }));
                    }
                    break;
            }
        }
        return result;
    }
}
exports.ChartSnappingSession = ChartSnappingSession;
//# sourceMappingURL=chart.js.map
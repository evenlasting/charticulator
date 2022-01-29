"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideCoordinatorClass = void 0;
const strings_1 = require("../../../strings");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
const common_1 = require("../common");
class GuideCoordinatorClass extends chart_element_1.ChartElementClass {
    buildConstraints(solver) {
        const attrs = this.state.attributes;
        let t1, t2;
        if (this.getAxis() == "x") {
            t1 = solver.attr(attrs, "x1");
            t2 = solver.attr(attrs, "x2");
        }
        else {
            t1 = solver.attr(attrs, "y1");
            t2 = solver.attr(attrs, "y2");
        }
        const length = this.object.properties.count -
            GuideCoordinatorClass.BaseGuidesCount;
        this.getValueNames().map((name, index) => {
            const t = (1 + index) / (length + 1);
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [1 - t, t1],
                [t, t2],
            ], [[1, solver.attr(attrs, name)]]);
        });
    }
    getValueNames() {
        const attrs = [];
        for (let i = 0; i <
            this.object.properties.count -
                GuideCoordinatorClass.BaseGuidesCount; i++) {
            const name = `value${i}`;
            attrs.push(name);
            if (this.state) {
                if (this.state.attributes[name] == null) {
                    this.state.attributes[name] = 0;
                }
            }
        }
        return attrs;
    }
    get attributeNames() {
        return ["x1", "y1", "x2", "y2"].concat(this.getValueNames());
    }
    get attributes() {
        const r = {
            x1: {
                name: "x1",
                type: Specification.AttributeType.Number,
            },
            y1: {
                name: "y1",
                type: Specification.AttributeType.Number,
            },
            x2: {
                name: "x2",
                type: Specification.AttributeType.Number,
            },
            y2: {
                name: "y2",
                type: Specification.AttributeType.Number,
            },
        };
        for (let i = 0; i <
            this.object.properties.count -
                GuideCoordinatorClass.BaseGuidesCount; i++) {
            const name = `value${i}`;
            r[name] = {
                name,
                type: Specification.AttributeType.Number,
            };
        }
        return r;
    }
    initializeState() {
        this.state.attributes.x1 = -100;
        this.state.attributes.y1 = -100;
        this.state.attributes.x2 = 100;
        this.state.attributes.y2 = 100;
        for (const name of this.getValueNames()) {
            if (this.state.attributes[name] == null) {
                this.state.attributes[name] = 0;
            }
        }
    }
    getAxis() {
        return this.object.properties.axis;
    }
    /** Get handles given current state */
    getHandles() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        const axis = this.getAxis();
        return [
            {
                type: "point",
                x: x1,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
            },
            {
                type: "point",
                x: axis == "y" ? x1 : x2,
                y: axis == "x" ? y1 : y2,
                actions: [
                    {
                        type: "attribute",
                        source: "x",
                        attribute: axis == "y" ? "x1" : "x2",
                    },
                    {
                        type: "attribute",
                        source: "y",
                        attribute: axis == "x" ? "y1" : "y2",
                    },
                ],
            },
        ];
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x1, y1 } = attrs;
        let { x2, y2 } = attrs;
        if (this.getAxis() == "x") {
            y2 = y1;
        }
        else {
            x2 = x1;
        }
        return {
            type: "line",
            visible: true,
            morphing: true,
            x1,
            y1,
            x2,
            y2,
        };
    }
    getBasicValues() {
        return [];
        // uncomment to render main mark guides
        // if (this.getAxis() === "x") {
        //   return ["x1", "x2"];
        // }
        // if (this.getAxis() === "y") {
        //   return ["y1", "y2"];
        // }
    }
    getSnappingGuides() {
        return this.getValueNames()
            .concat(this.getBasicValues())
            .map((name) => {
            return {
                type: this.getAxis(),
                value: this.state.attributes[name],
                attribute: name,
                visible: true,
                visualType: common_1.SnappingGuidesVisualTypes.Coordinator,
                priority: 1,
            };
        });
    }
    /** Get controls given current state */
    getAttributePanelWidgets(manager) {
        return [
            manager.inputNumber({ property: "count" }, {
                showUpdown: true,
                updownTick: 1,
                updownRange: [1, 100],
                minimum: 1,
                maximum: 100,
                label: strings_1.strings.objects.guides.count,
            }),
        ];
    }
}
exports.GuideCoordinatorClass = GuideCoordinatorClass;
GuideCoordinatorClass.classID = "guide.guide-coordinator";
GuideCoordinatorClass.type = "guide";
GuideCoordinatorClass.BaseGuidesCount = 0;
GuideCoordinatorClass.metadata = {
    displayName: "GuideCoordinator",
    iconPath: "guide/coordinator-x",
};
GuideCoordinatorClass.defaultAttributes = {
    axis: "x",
    count: 2,
};
//# sourceMappingURL=guide_coordinator.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidePolarCoordinatorClass = exports.getPointValueName = exports.getRadialValueName = exports.getAngularValueName = exports.PolarGuideBaseAttributeNames = exports.PolarGuidePropertyNames = void 0;
const strings_1 = require("../../../strings");
const solver_1 = require("../../solver");
const Specification = require("../../specification");
const chart_element_1 = require("../chart_element");
exports.PolarGuidePropertyNames = [
    "angularGuidesCount",
    "endAngle",
    "innerRatio",
    "outerRatio",
    "radialGuidesCount",
    "startAngle",
];
exports.PolarGuideBaseAttributeNames = ["x", "y", "x1", "y1", "x2", "y2", "angle1", "angle2", "radial1"];
exports.getAngularValueName = (index) => `angularValue${index}`;
exports.getRadialValueName = (index) => `radialValue${index}`;
exports.getPointValueName = (angularIndex, radialIndex, axis) => `point${angularIndex}${radialIndex}${axis}`;
class GuidePolarCoordinatorClass extends chart_element_1.ChartElementClass {
    // eslint-disable-next-line
    buildConstraints(solver, 
    // eslint-disable-next-line
    constr, manager) {
        const attrs = this.state.attributes;
        const props = this.object.properties;
        const radialY = this.getValueNamesForRadial();
        const chunkSizeY = (1 - 0) / radialY.length;
        const chunkRangesY = radialY.map((c, i) => {
            return [
                0 + (0 + chunkSizeY) * i,
                0 + (0 + chunkSizeY) * i + chunkSizeY,
            ];
        });
        const angularX = this.getValueNamesForAngular();
        const chunkSizeX = (1 - 0) / angularX.length;
        const chunkRangesX = angularX.map((c, i) => {
            return [
                0 + (0 + chunkSizeX) * i,
                0 + (0 + chunkSizeX) * i + chunkSizeX,
            ];
        });
        const [x, y, x1, x2, y1, y2, angle1, angle2, innerRadius, outerRadius,] = solver.attrs(attrs, [
            "x",
            "y",
            "x1",
            "x2",
            "y1",
            "y2",
            "angle1",
            "angle2",
            "radial1",
            "radial2",
        ]);
        attrs.angle1 = props.startAngle;
        attrs.angle2 = props.endAngle;
        solver.makeConstant(attrs, "angle1");
        solver.makeConstant(attrs, "angle2");
        if (Math.abs(attrs.x2 - attrs.x1) < Math.abs(attrs.y2 - attrs.y1)) {
            attrs.radial1 = (props.innerRatio * (attrs.x2 - attrs.x1)) / 2;
            attrs.radial2 = (props.outerRatio * (attrs.x2 - attrs.x1)) / 2;
            // innerRatio * x2 - innerRatio * x1 = 2 * innerRadius
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [props.innerRatio, x2],
                [-props.innerRatio, x1],
            ], [[2, innerRadius]]);
            // outerRatio * x2 - outerRatio * x1 = 2 * outerRadius
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [props.outerRatio, x2],
                [-props.outerRatio, x1],
            ], [[2, outerRadius]]);
        }
        else {
            attrs.radial1 = (props.innerRatio * (attrs.y2 - attrs.y1)) / 2;
            attrs.radial2 = (props.outerRatio * (attrs.y2 - attrs.y1)) / 2;
            // innerRatio * y2 - innerRatio * y1 = 2 * innerRadius
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [props.innerRatio, y2],
                [-props.innerRatio, y1],
            ], [[2, innerRadius]]);
            // outerRatio * y2 - outerRatio * y1 = 2 * outerRadius
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [props.outerRatio, y2],
                [-props.outerRatio, y1],
            ], [[2, outerRadius]]);
        }
        // add constraint 2 * x = x1 + x2
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, x]], [
            [1, x1],
            [1, x2],
        ]);
        // add constraint 2 * y = y1 + y2
        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, y]], [
            [1, y1],
            [1, y2],
        ]);
        // xy
        {
            const angleVarable = [];
            for (let xindex = 0; xindex < angularX.length; xindex++) {
                angleVarable.push(solver.attr(attrs, angularX[xindex]));
            }
            const radialVarable = [];
            for (let yindex = 0; yindex < radialY.length; yindex++) {
                radialVarable.push(solver.attr(attrs, radialY[yindex]));
            }
            for (let xindex = 0; xindex < angularX.length; xindex++) {
                const [t1, t2] = chunkRangesX[xindex];
                const vx1Expr = [
                    [t1, angle2],
                    [1 - t1, angle1],
                ];
                const vx2Expr = [
                    [t2, angle2],
                    [1 - t2, angle1],
                ];
                const vx1 = solver.attr({ value: solver.getLinear(...vx1Expr) }, "valueX", { edit: true });
                const vx2 = solver.attr({ value: solver.getLinear(...vx2Expr) }, "valueX", { edit: true });
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx1Expr, [[1, vx1]]);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx2Expr, [[1, vx2]]);
                solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(attrs, angularX[xindex], {
                    edit: false,
                }), vx1);
            }
            for (let yindex = 0; yindex < radialY.length; yindex++) {
                const [t1, t2] = chunkRangesY[yindex];
                const vy1Expr = [
                    [t1, outerRadius],
                    [1 - t1, innerRadius],
                ];
                const vy2Expr = [
                    [t2, outerRadius],
                    [1 - t2, innerRadius],
                ];
                const vy1 = solver.attr({ value: solver.getLinear(...vy1Expr) }, "valueY", { edit: true });
                const vy2 = solver.attr({ value: solver.getLinear(...vy2Expr) }, "valueY", { edit: true });
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy1Expr, [[1, vy1]]);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy2Expr, [[1, vy2]]);
                solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(attrs, radialY[yindex], {
                    edit: false,
                }), vy2);
            }
            const chartConstraints = this.parent.object.constraints;
            solver.addPlugin(new solver_1.ConstraintPlugins.PolarCoordinatorPlugin(solver, x, y, radialVarable, angleVarable, attrs, chartConstraints, this.object._id, manager));
        }
    }
    getValueNamesForAngular() {
        const attrs = [];
        for (let i = 0; i < this.object.properties.angularGuidesCount; i++) {
            const name = exports.getAngularValueName(i);
            attrs.push(name);
            if (this.state) {
                if (this.state.attributes[name] == null) {
                    this.state.attributes[name] = 0;
                }
            }
        }
        return attrs;
    }
    getValueNamesForRadial() {
        const attrs = [];
        for (let i = 0; i < this.object.properties.radialGuidesCount; i++) {
            const name = exports.getRadialValueName(i);
            attrs.push(name);
            if (this.state) {
                if (this.state.attributes[name] == null) {
                    this.state.attributes[name] = 0;
                }
            }
        }
        return attrs;
    }
    getValueNamesForPoints() {
        const attrs = [];
        for (let i = 0; i < this.object.properties.angularGuidesCount; i++) {
            for (let j = 0; j < this.object.properties.radialGuidesCount; j++) {
                const nameX = exports.getPointValueName(i, j, "X");
                attrs.push(nameX);
                if (this.state) {
                    if (this.state.attributes[nameX] == null) {
                        this.state.attributes[nameX] = 0;
                    }
                }
                const nameY = exports.getPointValueName(i, j, "Y");
                attrs.push(nameY);
                if (this.state) {
                    if (this.state.attributes[nameX] == null) {
                        this.state.attributes[nameX] = 0;
                    }
                }
            }
        }
        return attrs;
    }
    get attributeNames() {
        return exports.PolarGuideBaseAttributeNames.concat(this.getValueNamesForAngular()).concat(this.getValueNamesForRadial());
    }
    get attributes() {
        const attributesType = this.attributeNames.map((name) => {
            return {
                name,
                type: Specification.AttributeType.Number,
            };
        });
        const attributes = {};
        attributesType.forEach((attr) => (attributes[attr.name] = attr));
        return attributes;
    }
    initializeState() {
        const attrs = this.state.attributes;
        attrs.angle1 = 0;
        attrs.angle2 = 360;
        attrs.radial1 = 10;
        attrs.radial2 = 100;
        attrs.x1 = -100;
        attrs.x2 = 100;
        attrs.y1 = -100;
        attrs.y2 = 100;
        attrs.x = attrs.x1;
        attrs.y = attrs.y2;
        attrs.gapX = 4;
        attrs.gapY = 4;
        for (const name of this.getValueNamesForAngular()) {
            if (this.state.attributes[name] == null) {
                this.state.attributes[name] = 0;
            }
        }
        for (const name of this.getValueNamesForRadial()) {
            if (this.state.attributes[name] == null) {
                this.state.attributes[name] = 0;
            }
        }
        for (const name of this.getValueNamesForPoints()) {
            if (this.state.attributes[name] == null) {
                this.state.attributes[name] = 0;
            }
        }
    }
    /** Get handles given current state */
    getHandles() {
        const attrs = this.state.attributes;
        const { x1, y1, x2, y2 } = attrs;
        return [
            {
                type: "line",
                axis: "y",
                value: y1,
                span: [x1, x2],
                actions: [{ type: "attribute", attribute: "y1" }],
            },
            {
                type: "line",
                axis: "y",
                value: y2,
                span: [x1, x2],
                actions: [{ type: "attribute", attribute: "y2" }],
            },
            {
                type: "line",
                axis: "x",
                value: x1,
                span: [y1, y2],
                actions: [{ type: "attribute", attribute: "x1" }],
            },
            {
                type: "line",
                axis: "x",
                value: x2,
                span: [y1, y2],
                actions: [{ type: "attribute", attribute: "x2" }],
            },
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
                x: x2,
                y: y1,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y1" },
                ],
            },
            {
                type: "point",
                x: x1,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x1" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
            {
                type: "point",
                x: x2,
                y: y2,
                actions: [
                    { type: "attribute", source: "x", attribute: "x2" },
                    { type: "attribute", source: "y", attribute: "y2" },
                ],
            },
        ];
    }
    getBoundingBox() {
        const attrs = this.state.attributes;
        const { x, y, x2, y2, x1, y1 } = attrs;
        let radial2 = 0;
        if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
            radial2 = (this.object.properties.outerRatio * (x2 - x1)) / 2;
        }
        else {
            radial2 = (this.object.properties.outerRatio * (y2 - y1)) / 2;
        }
        return {
            type: "circle",
            cx: x,
            cy: y,
            radius: Math.abs(radial2),
        };
    }
    getSnappingGuides() {
        const result = [];
        for (let i = 0; i < this.object.properties.angularGuidesCount; i++) {
            for (let j = 0; j < this.object.properties.radialGuidesCount; j++) {
                const nameX = exports.getPointValueName(i, j, "X");
                const nameY = exports.getPointValueName(i, j, "Y");
                result.push({
                    type: "point",
                    angle: this.state.attributes[nameX],
                    radius: this.state.attributes[nameY],
                    startAngle: this.object.properties.startAngle,
                    endAngle: this.object.properties.endAngle,
                    angleAttribute: nameX,
                    radiusAttribute: nameY,
                    visible: true,
                    cx: this.state.attributes.x,
                    cy: this.state.attributes.y,
                    visibleAngle: this.state.attributes[exports.getAngularValueName(i)],
                    visibleRadius: this.state.attributes[exports.getRadialValueName(j)],
                });
            }
        }
        // add center for coordinates
        result.push({
            type: "point",
            angle: this.state.attributes.x,
            radius: this.state.attributes.y,
            startAngle: this.object.properties.startAngle,
            endAngle: this.object.properties.endAngle,
            angleAttribute: "x",
            radiusAttribute: "y",
            visible: true,
            cx: this.state.attributes.x,
            cy: this.state.attributes.y,
            visibleAngle: 0,
            visibleRadius: 0,
        });
        return result;
    }
    /** Get controls given current state */
    getAttributePanelWidgets(manager) {
        return [
            manager.sectionHeader(strings_1.strings.objects.guides.guideCoordinator),
            manager.inputNumber({ property: "angularGuidesCount" }, {
                showUpdown: true,
                updownTick: 1,
                updownRange: [1, 100],
                minimum: 2,
                maximum: 100,
                label: strings_1.strings.objects.guides.angular,
            }),
            // uncomment to allow configure count of guides in different radiuses
            // manager.row(
            //   strings.objects.guides.radial,
            //   manager.inputNumber(
            //     { property: "radialGuidesCount" },
            //     {
            //       showUpdown: true,
            //       updownTick: 1,
            //       updownRange: [1, 100],
            //       minimum: 1,
            //       maximum: 100,
            //     }
            //   )
            // ),
            manager.vertical(manager.label(strings_1.strings.objects.guides.angle), manager.horizontal([1, 0, 1], manager.inputNumber({ property: "startAngle" }), manager.label("-"), manager.inputNumber({ property: "endAngle" }))),
        ];
    }
}
exports.GuidePolarCoordinatorClass = GuidePolarCoordinatorClass;
GuidePolarCoordinatorClass.classID = "guide.guide-coordinator-polar";
GuidePolarCoordinatorClass.type = "guide";
GuidePolarCoordinatorClass.metadata = {
    displayName: "GuidePolarCoordinator",
    iconPath: "guide/coordinator-polar",
    creatingInteraction: {
        type: "rectangle",
        mapping: { xMin: "x1", yMin: "y1", xMax: "x2", yMax: "y2" },
    },
};
GuidePolarCoordinatorClass.defaultAttributes = {
    angularGuidesCount: 4,
    radialGuidesCount: 4,
};
//# sourceMappingURL=polar_coordinator.js.map
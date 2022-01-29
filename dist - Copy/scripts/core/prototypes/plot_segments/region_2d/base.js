"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region2DConstraintBuilder = exports.SublayoutGroup = exports.DodgingFitters = exports.CrossFitter = exports.PlotSegmentAxisPropertyNames = exports.GridStartPosition = exports.GridDirection = exports.SublayoutAlignment = exports.Region2DSublayoutType = void 0;
const solver_1 = require("../../../solver");
const types_1 = require("../../../specification/types");
const axis_1 = require("../axis");
const strings_1 = require("./../../../../strings");
var Region2DSublayoutType;
(function (Region2DSublayoutType) {
    Region2DSublayoutType["Overlap"] = "overlap";
    Region2DSublayoutType["DodgeX"] = "dodge-x";
    Region2DSublayoutType["DodgeY"] = "dodge-y";
    Region2DSublayoutType["Grid"] = "grid";
    Region2DSublayoutType["Packing"] = "packing";
    Region2DSublayoutType["Jitter"] = "jitter";
})(Region2DSublayoutType = exports.Region2DSublayoutType || (exports.Region2DSublayoutType = {}));
var SublayoutAlignment;
(function (SublayoutAlignment) {
    SublayoutAlignment["Start"] = "start";
    SublayoutAlignment["Middle"] = "middle";
    SublayoutAlignment["End"] = "end";
})(SublayoutAlignment = exports.SublayoutAlignment || (exports.SublayoutAlignment = {}));
var GridDirection;
(function (GridDirection) {
    GridDirection["X"] = "x";
    GridDirection["Y"] = "y";
})(GridDirection = exports.GridDirection || (exports.GridDirection = {}));
var GridStartPosition;
(function (GridStartPosition) {
    GridStartPosition["LeftTop"] = "LT";
    GridStartPosition["RightTop"] = "RT";
    GridStartPosition["LeftBottom"] = "LB";
    GridStartPosition["RigtBottom"] = "RB";
})(GridStartPosition = exports.GridStartPosition || (exports.GridStartPosition = {}));
var PlotSegmentAxisPropertyNames;
(function (PlotSegmentAxisPropertyNames) {
    PlotSegmentAxisPropertyNames["xData"] = "xData";
    PlotSegmentAxisPropertyNames["yData"] = "yData";
    PlotSegmentAxisPropertyNames["axis"] = "axis";
})(PlotSegmentAxisPropertyNames = exports.PlotSegmentAxisPropertyNames || (exports.PlotSegmentAxisPropertyNames = {}));
class CrossFitter {
    constructor(solver, mode) {
        this.solver = solver;
        this.mode = mode;
        this.candidates = [];
    }
    add(src, dst) {
        return this.addComplex(src, [[1, dst]]);
    }
    addComplex(src, dst, dstBias = 0) {
        this.candidates.push([src, dst, dstBias]);
    }
    addConstraint(w) {
        if (this.candidates.length == 0) {
            return;
        }
        for (const candidate of this.candidates) {
            if (this.mode == "min") {
                this.solver.addSoftInequality(w, -candidate[2], [[1, candidate[0]]], candidate[1]);
            }
            else {
                this.solver.addSoftInequality(w, candidate[2], candidate[1], [
                    [1, candidate[0]],
                ]);
            }
        }
    }
}
exports.CrossFitter = CrossFitter;
class DodgingFitters {
    constructor(solver) {
        this.xMin = new CrossFitter(solver, "min");
        this.yMin = new CrossFitter(solver, "min");
        this.xMax = new CrossFitter(solver, "max");
        this.yMax = new CrossFitter(solver, "max");
    }
    addConstraint(w) {
        this.xMin.addConstraint(w);
        this.xMax.addConstraint(w);
        this.yMin.addConstraint(w);
        this.yMax.addConstraint(w);
    }
}
exports.DodgingFitters = DodgingFitters;
/**
 * Describes variables for constraints group. Count of group matches with data cound
 */
class SublayoutGroup {
}
exports.SublayoutGroup = SublayoutGroup;
/**
 * Class builds constrains for plot segments
 * The builder creates constraints depends on sublayout
 */
class Region2DConstraintBuilder {
    constructor(plotSegment, config, x1Name, x2Name, y1Name, y2Name, solver, solverContext) {
        this.plotSegment = plotSegment;
        this.config = config;
        this.x1Name = x1Name;
        this.x2Name = x2Name;
        this.y1Name = y1Name;
        this.y2Name = y2Name;
        this.solver = solver;
        this.solverContext = solverContext;
    }
    getTableContext() {
        return this.plotSegment.parent.dataflow.getTable(this.plotSegment.object.table);
    }
    getExpression(expr) {
        return this.plotSegment.parent.dataflow.cache.parse(expr);
    }
    groupMarksByCategories(categories) {
        // Prepare categories
        const categoriesParsed = categories.map((c) => {
            const imap = new Map();
            for (let i = 0; i < c.categories.length; i++) {
                imap.set(c.categories[i], i);
            }
            return {
                categories: c.categories,
                indexMap: imap,
                stride: 0,
                expression: this.getExpression(c.expression),
            };
        });
        let k = 1;
        for (let i = categoriesParsed.length - 1; i >= 0; i--) {
            const c = categoriesParsed[i];
            c.stride = k;
            k *= c.categories.length;
        }
        const totalLength = k;
        // Gather result
        const result = new Array(totalLength);
        for (let i = 0; i < totalLength; i++) {
            result[i] = [];
        }
        const dateRowIndices = this.plotSegment.state.dataRowIndices;
        const table = this.getTableContext();
        // Gather places
        for (let i = 0; i < dateRowIndices.length; i++) {
            const row = table.getGroupedContext(dateRowIndices[i]);
            let place = 0;
            for (const c of categoriesParsed) {
                const value = c.expression.getStringValue(row);
                place += c.indexMap.get(value) * c.stride;
            }
            // Make sure the place is valid
            if (place == place) {
                result[place].push(i);
            }
        }
        return result;
    }
    orderMarkGroups(groups) {
        const order = this.plotSegment.object.properties.sublayout.order;
        const dateRowIndices = this.plotSegment.state.dataRowIndices;
        const table = this.getTableContext();
        // Sort results
        if (order != null && order.expression) {
            const orderExpression = this.getExpression(order.expression);
            const compare = (i, j) => {
                const vi = orderExpression.getValue(table.getGroupedContext(dateRowIndices[i]));
                const vj = orderExpression.getValue(table.getGroupedContext(dateRowIndices[j]));
                if (vi < vj) {
                    return -1;
                }
                else if (vi > vj) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            for (let i = 0; i < groups.length; i++) {
                groups[i].group.sort(compare);
            }
        }
        if (this.plotSegment.object.properties.sublayout.orderReversed) {
            for (let i = 0; i < groups.length; i++) {
                groups[i].group.reverse();
            }
        }
        return groups;
    }
    /** Make sure gapX correctly correspond to gapXRatio */
    gapX(length, ratio) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const attrs = state.attributes;
        const [gapX, x1, x2] = solver.attrs(attrs, [
            "gapX",
            this.x1Name,
            this.x2Name,
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, ratio * (props.marginX2 + props.marginX2), [[length - 1, gapX]], [
            [ratio, x2],
            [-ratio, x1],
        ]);
    }
    /** Make sure gapY correctly correspond to gapYRatio */
    gapY(length, ratio) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const attrs = state.attributes;
        const [gapY, y1, y2] = solver.attrs(attrs, [
            "gapY",
            this.y1Name,
            this.y2Name,
        ]);
        solver.addLinear(solver_1.ConstraintStrength.HARD, ratio * (props.marginX2 + props.marginX2), [[length - 1, gapY]], [
            [ratio, y2],
            [-ratio, y1],
        ]);
    }
    /**
     * Map elements according to numerical/categorical mapping
     */
    numericalMapping(axis) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const attrs = state.attributes;
        const dataIndices = state.dataRowIndices;
        const table = this.getTableContext();
        switch (axis) {
            case "x":
                {
                    this.numericalMappingX(props, solver, attrs, state, table, dataIndices);
                    // solver.addEquals(ConstraintWeight.HARD, x, x1);
                }
                break;
            case "y": {
                this.numericalMappingY(props, solver, attrs, state, table, dataIndices);
                // solver.addEquals(ConstraintWeight.HARD, y, y2);
            }
        }
    }
    numericalMappingY(props, solver, attrs, state, table, dataIndices) {
        const data = props.yData;
        if (data.type == "numerical") {
            const [y1, y2] = solver.attrs(attrs, [this.y1Name, this.y2Name]);
            const expr = this.getExpression(data.expression);
            const interp = axis_1.getNumericalInterpolate(data);
            for (const [index, markState] of state.glyphs.entries()) {
                const rowContext = table.getGroupedContext(dataIndices[index]);
                const value = expr.getNumberValue(rowContext);
                const t = interp(value);
                solver.addLinear(solver_1.ConstraintStrength.HARD, (t - 1) * props.marginY2 + t * props.marginY1, [
                    [1 - t, y1],
                    [t, y2],
                ], [[1, solver.attr(markState.attributes, "y")]]);
            }
        }
        if (data.type == "categorical") {
            const [y1, y2, gapY] = solver.attrs(attrs, [
                this.y1Name,
                this.y2Name,
                "gapY",
            ]);
            const expr = this.getExpression(data.expression);
            for (const [index, markState] of state.glyphs.entries()) {
                const rowContext = table.getGroupedContext(dataIndices[index]);
                const value = expr.getStringValue(rowContext);
                this.gapY(data.categories.length, data.gapRatio);
                const i = data.categories.indexOf(value);
                solver.addLinear(solver_1.ConstraintStrength.HARD, (data.categories.length - i - 0.5) * props.marginY1 -
                    (i + 0.5) * props.marginY2, [
                    [i + 0.5, y2],
                    [data.categories.length - i - 0.5, y1],
                    [-data.categories.length / 2 + i + 0.5, gapY],
                ], [[data.categories.length, solver.attr(markState.attributes, "y")]]);
            }
        }
    }
    numericalMappingX(props, solver, attrs, state, table, dataIndices) {
        const data = props.xData;
        if (data.type == "numerical") {
            const [x1, x2] = solver.attrs(attrs, [this.x1Name, this.x2Name]);
            const expr = this.getExpression(data.expression);
            const interp = axis_1.getNumericalInterpolate(data);
            for (const [index, markState] of state.glyphs.entries()) {
                const rowContext = table.getGroupedContext(dataIndices[index]);
                const value = expr.getNumberValue(rowContext);
                const t = interp(value);
                solver.addLinear(solver_1.ConstraintStrength.HARD, (1 - t) * props.marginX1 - t * props.marginX2, [
                    [1 - t, x1],
                    [t, x2],
                ], [[1, solver.attr(markState.attributes, "x")]]);
            }
        }
        if (data.type == "categorical") {
            const [x1, x2, gapX] = solver.attrs(attrs, [
                this.x1Name,
                this.x2Name,
                "gapX",
            ]);
            const expr = this.getExpression(data.expression);
            for (const [index, markState] of state.glyphs.entries()) {
                const rowContext = table.getGroupedContext(dataIndices[index]);
                const value = expr.getStringValue(rowContext);
                this.gapX(data.categories.length, data.gapRatio);
                const i = data.categories.indexOf(value);
                solver.addLinear(solver_1.ConstraintStrength.HARD, (data.categories.length - i - 0.5) * props.marginX1 -
                    (i + 0.5) * props.marginX2, [
                    [i + 0.5, x2],
                    [data.categories.length - i - 0.5, x1],
                    [-data.categories.length / 2 + i + 0.5, gapX],
                ], [[data.categories.length, solver.attr(markState.attributes, "x")]]);
            }
        }
    }
    groupMarksByCategoricalMapping(axis) {
        const props = this.plotSegment.object.properties;
        switch (axis) {
            case "x": {
                const data = props.xData;
                return this.groupMarksByCategories([
                    { categories: data.categories, expression: data.expression },
                ]);
            }
            case "y": {
                const data = props.yData;
                return this.groupMarksByCategories([
                    { categories: data.categories, expression: data.expression },
                ]);
            }
            case "xy": {
                const xData = props.xData;
                const yData = props.yData;
                return this.groupMarksByCategories([
                    { categories: xData.categories, expression: xData.expression },
                    { categories: yData.categories, expression: yData.expression },
                ]);
            }
        }
    }
    categoricalMapping(axis, sublayoutContext) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const attrs = state.attributes;
        const props = this.plotSegment.object.properties;
        const categoryMarks = this.groupMarksByCategoricalMapping(axis);
        switch (axis) {
            case "x":
                {
                    // take x axis data to determine count of groups
                    this.categoricalMappingX(props, solver, attrs, categoryMarks, sublayoutContext);
                }
                break;
            case "y":
                {
                    this.categoricalMappingY(props, solver, attrs, categoryMarks, sublayoutContext);
                }
                break;
            case "xy":
                {
                    this.categoricalMappingXY(props, solver, attrs, categoryMarks, sublayoutContext);
                }
                break;
        }
    }
    categoricalMappingXY(props, solver, attrs, categoryMarks, sublayoutContext) {
        const xData = props.xData;
        const yData = props.yData;
        const [x1, x2, y1, y2] = solver.attrs(attrs, [
            this.x1Name,
            this.x2Name,
            this.y1Name,
            this.y2Name,
        ]);
        const xAxis = axis_1.getCategoricalAxis(xData, this.config.xAxisPrePostGap, false);
        const yAxis = axis_1.getCategoricalAxis(yData, this.config.yAxisPrePostGap, true);
        const sublayoutGroups = [];
        for (let yIndex = 0; yIndex < yData.categories.length; yIndex++) {
            const [ty1, ty2] = yAxis.ranges[yIndex];
            for (let xIndex = 0; xIndex < xData.categories.length; xIndex++) {
                const [tx1, tx2] = xAxis.ranges[xIndex];
                const vx1Expr = [
                    [tx1, x2],
                    [1 - tx1, x1],
                ];
                const vx2Expr = [
                    [tx2, x2],
                    [1 - tx2, x1],
                ];
                const vy1Expr = [
                    [ty1, y2],
                    [1 - ty1, y1],
                ];
                const vy2Expr = [
                    [ty2, y2],
                    [1 - ty2, y1],
                ];
                const vx1 = solver.attr({ value: solver.getLinear(...vx1Expr) }, "value", { edit: true });
                const vx2 = solver.attr({ value: solver.getLinear(...vx2Expr) }, "value", { edit: true });
                const vy1 = solver.attr({ value: solver.getLinear(...vy1Expr) }, "value", { edit: true });
                const vy2 = solver.attr({ value: solver.getLinear(...vy2Expr) }, "value", { edit: true });
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx1Expr, [[1, vx1]]);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx2Expr, [[1, vx2]]);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy1Expr, [[1, vy1]]);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy2Expr, [[1, vy2]]);
                sublayoutGroups.push({
                    group: categoryMarks[xIndex * yData.categories.length + yIndex],
                    x1: vx1,
                    y1: vy1,
                    x2: vx2,
                    y2: vy2,
                });
            }
        }
        this.applySublayout(sublayoutGroups, "xy", sublayoutContext);
    }
    categoricalMappingY(props, solver, attrs, categoryMarks, sublayoutContext) {
        const data = props.yData;
        const [x1, x2, y1, y2] = solver.attrs(attrs, [
            this.x1Name,
            this.x2Name,
            this.y1Name,
            this.y2Name,
        ]);
        const axis = axis_1.getCategoricalAxis(data, this.config.yAxisPrePostGap, true);
        const sublayoutGroups = [];
        for (let cindex = 0; cindex < data.categories.length; cindex++) {
            const [t1, t2] = axis.ranges[cindex];
            const vy1Expr = [
                [t1, y2],
                [1 - t1, y1],
            ];
            const vy2Expr = [
                [t2, y2],
                [1 - t2, y1],
            ];
            const vy1 = solver.attr({ value: solver.getLinear(...vy1Expr) }, "value", { edit: true });
            const vy2 = solver.attr({ value: solver.getLinear(...vy2Expr) }, "value", { edit: true });
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy1Expr, [[1, vy1]]);
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vy2Expr, [[1, vy2]]);
            sublayoutGroups.push({
                group: categoryMarks[cindex],
                x1,
                y1: vy1,
                x2,
                y2: vy2,
            });
        }
        this.applySublayout(sublayoutGroups, "y", sublayoutContext);
    }
    categoricalMappingX(props, solver, attrs, categoryMarks, sublayoutContext) {
        const data = props.xData;
        const [x1, x2, y1, y2] = solver.attrs(attrs, [
            this.x1Name,
            this.x2Name,
            this.y1Name,
            this.y2Name,
        ]);
        const axis = axis_1.getCategoricalAxis(data, this.config.xAxisPrePostGap, false);
        const sublayoutGroups = [];
        for (let cindex = 0; cindex < data.categories.length; cindex++) {
            const [t1, t2] = axis.ranges[cindex];
            // t1 * x2 = (1 - t1) * x1
            const vx1Expr = [
                [t1, x2],
                [1 - t1, x1],
            ];
            // t2 * x2 = (1 - t2) * x1
            const vx2Expr = [
                [t2, x2],
                [1 - t2, x1],
            ];
            const vx1 = solver.attr({ value: solver.getLinear(...vx1Expr) }, "value", { edit: true });
            const vx2 = solver.attr({ value: solver.getLinear(...vx2Expr) }, "value", { edit: true });
            // t1 * x2 = (1 - t1) * x2 = 1 * vx1
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx1Expr, [[1, vx1]]);
            // t2 * x2 = (1 - t2) * x2 = 1 * vx2
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, vx2Expr, [[1, vx2]]);
            // save group of constraints
            sublayoutGroups.push({
                group: categoryMarks[cindex],
                x1: vx1,
                y1,
                x2: vx2,
                y2,
            });
        }
        this.applySublayout(sublayoutGroups, "x", sublayoutContext);
    }
    categoricalHandles(axis, sublayout) {
        let handles = [];
        const props = this.plotSegment.object.properties;
        const x1 = this.plotSegment.state.attributes[this.x1Name];
        const y1 = this.plotSegment.state.attributes[this.y1Name];
        const x2 = this.plotSegment.state.attributes[this.x2Name];
        const y2 = this.plotSegment.state.attributes[this.y2Name];
        // We are using sublayouts here
        if (sublayout) {
            const categoryMarks = this.groupMarksByCategoricalMapping(axis);
            const xAxis = axis == "x" || axis == "xy"
                ? axis_1.getCategoricalAxis(props.xData, this.config.xAxisPrePostGap, false)
                : null;
            const yAxis = axis == "y" || axis == "xy"
                ? axis_1.getCategoricalAxis(props.yData, this.config.yAxisPrePostGap, true)
                : null;
            handles = handles.concat(this.sublayoutHandles(categoryMarks.map((x, i) => {
                let ix = i, iy = i;
                if (axis == "xy") {
                    ix = i % xAxis.ranges.length;
                    iy = Math.floor(i / xAxis.ranges.length);
                }
                return {
                    group: x,
                    x1: xAxis ? xAxis.ranges[ix][0] * (x2 - x1) + x1 : x1,
                    y1: yAxis ? yAxis.ranges[iy][0] * (y2 - y1) + y1 : y1,
                    x2: xAxis ? xAxis.ranges[ix][1] * (x2 - x1) + x1 : x2,
                    y2: yAxis ? yAxis.ranges[iy][1] * (y2 - y1) + y1 : y2,
                };
            }), false, false));
        }
        if (axis == "x" || axis == "xy") {
            const data = props.xData;
            const axis = axis_1.getCategoricalAxis(data, this.config.xAxisPrePostGap, false);
            for (let i = 0; i < axis.ranges.length - 1; i++) {
                const p1 = axis.ranges[i][1];
                handles.push({
                    type: "gap",
                    gap: {
                        property: {
                            property: PlotSegmentAxisPropertyNames.xData,
                            field: "gapRatio",
                        },
                        axis: axis_1.AxisMode.X,
                        reference: p1 * (x2 - x1) + x1,
                        value: data.gapRatio,
                        scale: axis.gapScale * (x2 - x1),
                        span: [y1, y2],
                    },
                });
            }
        }
        if (axis == "y" || axis == "xy") {
            const data = props.yData;
            const axis = axis_1.getCategoricalAxis(data, this.config.yAxisPrePostGap, true);
            for (let i = 0; i < axis.ranges.length - 1; i++) {
                const p1 = axis.ranges[i][1];
                handles.push({
                    type: "gap",
                    gap: {
                        property: {
                            property: PlotSegmentAxisPropertyNames.yData,
                            field: "gapRatio",
                        },
                        axis: axis_1.AxisMode.Y,
                        reference: p1 * (y2 - y1) + y1,
                        value: data.gapRatio,
                        scale: axis.gapScale * (y2 - y1),
                        span: [x1, x2],
                    },
                });
            }
        }
        return handles;
    }
    stacking(axis) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const attrs = state.attributes;
        const dataIndices = state.dataRowIndices;
        const [x1, x2, y1, y2] = solver.attrs(attrs, [
            this.x1Name,
            this.x2Name,
            this.y1Name,
            this.y2Name,
        ]);
        const count = dataIndices.length;
        const doStack = count <= 36;
        for (const [index, markState] of state.glyphs.entries()) {
            switch (axis) {
                case "x":
                    {
                        this.stackingX(solver, attrs, doStack, index, state, x1, x2, count, markState);
                    }
                    break;
                case "y":
                    {
                        this.stackingY(solver, attrs, doStack, index, state, y1, y2, count, markState);
                    }
                    break;
            }
        }
        switch (axis) {
            case "x":
                {
                    this.gapX(count, this.plotSegment.object.properties.xData.gapRatio);
                }
                break;
            case "y":
                {
                    this.gapY(count, this.plotSegment.object.properties.yData.gapRatio);
                }
                break;
        }
    }
    stackingY(solver, attrs, doStack, index, state, y1, y2, count, markState) {
        const [gapY] = solver.attrs(attrs, ["gapY"]);
        if (doStack) {
            if (index > 0) {
                const y2Prev = solver.attr(state.glyphs[index - 1].attributes, "y2");
                const y1This = solver.attr(state.glyphs[index].attributes, "y1");
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                    [1, y2Prev],
                    [-1, y1This],
                    [1, gapY],
                ]);
            }
            if (index == 0) {
                const y1This = solver.attr(state.glyphs[index].attributes, "y1");
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, y1]], [[1, y1This]]);
            }
            if (index == state.glyphs.length - 1) {
                const y2This = solver.attr(state.glyphs[index].attributes, "y2");
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, y2]], [[1, y2This]]);
            }
        }
        else {
            const t = (index + 0.5) / count;
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [1 - t, y2],
                [t, y1],
            ], [[1, solver.attr(markState.attributes, "y")]]);
            solver.addLinear(solver_1.ConstraintStrength.WEAK, 0, [
                [1, y2],
                [-1, y1],
            ], [
                [count, solver.attr(markState.attributes, "height")],
                [count - 1, gapY],
            ]);
        }
    }
    stackingX(solver, attrs, doStack, index, state, x1, x2, count, markState) {
        const [gapX] = solver.attrs(attrs, ["gapX"]);
        if (doStack) {
            if (index > 0) {
                const x2Prev = solver.attr(state.glyphs[index - 1].attributes, "x2");
                const x1This = solver.attr(state.glyphs[index].attributes, "x1");
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                    [1, x2Prev],
                    [-1, x1This],
                    [1, gapX],
                ]);
            }
            if (index == 0) {
                const x1This = solver.attr(state.glyphs[index].attributes, "x1");
                // solver.addEquals(ConstraintWeight.HARD, x1, x1This);
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, x1]], [[1, x1This]]);
            }
            if (index == state.glyphs.length - 1) {
                const x2This = solver.attr(state.glyphs[index].attributes, "x2");
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, x2]], [[1, x2This]]);
            }
        }
        else {
            const t = (index + 0.5) / count;
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [1 - t, x1],
                [t, x2],
            ], [[1, solver.attr(markState.attributes, "x")]]);
            solver.addLinear(solver_1.ConstraintStrength.WEAK, 0, [
                [1, x2],
                [-1, x1],
            ], [
                [count, solver.attr(markState.attributes, "width")],
                [count - 1, gapX],
            ]);
        }
    }
    fitGroups(groups, axis) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const fitters = new DodgingFitters(solver);
        const alignment = props.sublayout.align;
        groups.forEach((group) => {
            const markStates = group.group.map((index) => state.glyphs[index]);
            const { x1, y1, x2, y2 } = group;
            for (let index = 0; index < markStates.length; index++) {
                const m1 = markStates[index];
                if (axis == "x" || axis == "xy") {
                    if (alignment.x == SublayoutAlignment.Start) {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "x1"), x1);
                    }
                    else {
                        fitters.xMin.add(solver.attr(m1.attributes, "x1"), x1);
                    }
                    if (alignment.x == SublayoutAlignment.End) {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "x2"), x2);
                    }
                    else {
                        fitters.xMax.add(solver.attr(m1.attributes, "x2"), x2);
                    }
                    if (alignment.x == SublayoutAlignment.Middle) {
                        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                            [1, solver.attr(m1.attributes, "x1")],
                            [1, solver.attr(m1.attributes, "x2")],
                        ], [
                            [1, x1],
                            [1, x2],
                        ]);
                    }
                }
                if (axis == "y" || axis == "xy") {
                    if (alignment.y == SublayoutAlignment.Start) {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "y1"), y1);
                    }
                    else {
                        fitters.yMin.add(solver.attr(m1.attributes, "y1"), y1);
                    }
                    if (alignment.y == SublayoutAlignment.End) {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "y2"), y2);
                    }
                    else {
                        fitters.yMax.add(solver.attr(m1.attributes, "y2"), y2);
                    }
                    if (alignment.y == SublayoutAlignment.Middle) {
                        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                            [1, solver.attr(m1.attributes, "y1")],
                            [1, solver.attr(m1.attributes, "y2")],
                        ], [
                            [1, y1],
                            [1, y2],
                        ]);
                    }
                }
            }
        });
        fitters.addConstraint(solver_1.ConstraintStrength.MEDIUM);
    }
    applySublayout(groups, axis, context) {
        if (!context || context.mode == "disabled") {
            this.fitGroups(groups, axis);
        }
        else {
            this.orderMarkGroups(groups);
            const props = this.plotSegment.object.properties;
            if (context.mode == "x-only" || context.mode == "y-only") {
                if (props.sublayout.type == Region2DSublayoutType.Packing) {
                    this.sublayoutPacking(groups, context.mode == "x-only" ? axis_1.AxisMode.X : axis_1.AxisMode.Y);
                }
                else if (props.sublayout.type == Region2DSublayoutType.Jitter) {
                    this.sublayoutJitter(groups, context.mode == "x-only" ? axis_1.AxisMode.X : axis_1.AxisMode.Y);
                }
                else {
                    this.fitGroups(groups, axis);
                }
            }
            else {
                if (props.sublayout.type == Region2DSublayoutType.Overlap) {
                    this.fitGroups(groups, "xy");
                }
                // Stack X
                if (props.sublayout.type == Region2DSublayoutType.DodgeX) {
                    this.sublayoutDodging(groups, GridDirection.X, context.xAxisPrePostGap);
                }
                // Stack Y
                if (props.sublayout.type == Region2DSublayoutType.DodgeY) {
                    this.sublayoutDodging(groups, GridDirection.Y, context.yAxisPrePostGap);
                }
                // Grid layout
                if (props.sublayout.type == Region2DSublayoutType.Grid) {
                    this.sublayoutGrid(groups);
                }
                // Force layout
                if (props.sublayout.type == Region2DSublayoutType.Packing) {
                    this.sublayoutPacking(groups);
                }
                // Jitter layout
                if (props.sublayout.type == Region2DSublayoutType.Jitter) {
                    this.sublayoutJitter(groups);
                }
            }
        }
    }
    // eslint-disable-next-line
    sublayoutDodging(groups, direction, enablePrePostGap) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const fitters = new DodgingFitters(solver);
        const alignment = props.sublayout.align;
        let maxCount = 0;
        for (const g of groups) {
            maxCount = Math.max(maxCount, g.group.length);
        }
        let dodgeGapRatio = 0;
        let dodgeGapOffset = 0;
        if (!enablePrePostGap) {
            dodgeGapRatio =
                direction == "x"
                    ? props.sublayout.ratioX / (maxCount - 1)
                    : props.sublayout.ratioY / (maxCount - 1);
            dodgeGapOffset = 0;
        }
        else {
            dodgeGapRatio =
                direction == "x"
                    ? props.sublayout.ratioX / maxCount
                    : props.sublayout.ratioY / maxCount;
            dodgeGapOffset = dodgeGapRatio / 2;
        }
        groups.forEach((group) => {
            const markStates = group.group.map((index) => state.glyphs[index]);
            const { x1, y1, x2, y2 } = group;
            const count = markStates.length;
            // If nothing there, skip
            if (count == 0) {
                return;
            }
            for (let index = 0; index < markStates.length; index++) {
                const m1 = markStates[index];
                if (index > 0) {
                    const m0 = markStates[index - 1];
                    switch (direction) {
                        case "x":
                            {
                                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                                    [dodgeGapRatio, x2],
                                    [-dodgeGapRatio, x1],
                                    [1, solver.attr(m0.attributes, "x2")],
                                    [-1, solver.attr(m1.attributes, "x1")],
                                ]);
                            }
                            break;
                        case "y":
                            {
                                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                                    [dodgeGapRatio, y2],
                                    [-dodgeGapRatio, y1],
                                    [1, solver.attr(m0.attributes, "y2")],
                                    [-1, solver.attr(m1.attributes, "y1")],
                                ]);
                            }
                            break;
                    }
                }
                this.setFirstSublayoutDodgingDirection(direction, alignment, solver, m1, y1, fitters, y2, x1, x2);
            }
            const m1 = markStates[0];
            const mN = markStates[markStates.length - 1];
            switch (direction) {
                case "x":
                    {
                        this.setSublayoutDodgingDirectionX(x1, dodgeGapOffset, x2, alignment, solver, m1, fitters, mN);
                    }
                    break;
                case "y":
                    {
                        this.setSublayoutDodgingDirectionY(y1, dodgeGapOffset, y2, alignment, solver, m1, fitters, mN);
                    }
                    break;
            }
        });
        fitters.addConstraint(solver_1.ConstraintStrength.MEDIUM);
    }
    setSublayoutDodgingDirectionY(y1, dodgeGapOffset, y2, alignment, solver, m1, fitters, mN) {
        const y1WithGap = [
            [1, y1],
            [dodgeGapOffset, y2],
            [-dodgeGapOffset, y1],
        ];
        const y2WithGap = [
            [1, y2],
            [dodgeGapOffset, y1],
            [-dodgeGapOffset, y2],
        ];
        if (alignment.y == "start") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(m1.attributes, "y1")]], y1WithGap);
        }
        else {
            fitters.yMin.addComplex(solver.attr(m1.attributes, "y1"), y1WithGap);
        }
        if (alignment.y == "end") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(mN.attributes, "y2")]], y2WithGap);
        }
        else {
            fitters.yMax.addComplex(solver.attr(mN.attributes, "y2"), y2WithGap);
        }
        if (alignment.y == "middle") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [1, solver.attr(m1.attributes, "y1")],
                [1, solver.attr(mN.attributes, "y2")],
            ], [
                [1, y1],
                [1, y2],
            ]);
        }
    }
    setSublayoutDodgingDirectionX(x1, dodgeGapOffset, x2, alignment, solver, m1, fitters, mN) {
        const x1WithGap = [
            [1, x1],
            [dodgeGapOffset, x2],
            [-dodgeGapOffset, x1],
        ];
        const x2WithGap = [
            [1, x2],
            [dodgeGapOffset, x1],
            [-dodgeGapOffset, x2],
        ];
        if (alignment.x == "start") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(m1.attributes, "x1")]], x1WithGap);
        }
        else {
            fitters.xMin.addComplex(solver.attr(m1.attributes, "x1"), x1WithGap);
        }
        if (alignment.x == "end") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(mN.attributes, "x2")]], x2WithGap);
        }
        else {
            fitters.xMax.addComplex(solver.attr(mN.attributes, "x2"), x2WithGap);
        }
        if (alignment.x == "middle") {
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                [1, solver.attr(m1.attributes, "x1")],
                [1, solver.attr(mN.attributes, "x2")],
            ], [
                [1, x1],
                [1, x2],
            ]);
        }
    }
    setFirstSublayoutDodgingDirection(direction, alignment, solver, m1, y1, fitters, y2, x1, x2) {
        switch (direction) {
            case "x":
                {
                    if (alignment.y == "start") {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "y1"), y1);
                    }
                    else {
                        fitters.yMin.add(solver.attr(m1.attributes, "y1"), y1);
                    }
                    if (alignment.y == "end") {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "y2"), y2);
                    }
                    else {
                        fitters.yMax.add(solver.attr(m1.attributes, "y2"), y2);
                    }
                    if (alignment.y == "middle") {
                        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                            [1, solver.attr(m1.attributes, "y1")],
                            [1, solver.attr(m1.attributes, "y2")],
                        ], [
                            [1, y1],
                            [1, y2],
                        ]);
                    }
                }
                break;
            case "y":
                {
                    if (alignment.x == "start") {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "x1"), x1);
                    }
                    else {
                        fitters.xMin.add(solver.attr(m1.attributes, "x1"), x1);
                    }
                    if (alignment.x == "end") {
                        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(m1.attributes, "x2"), x2);
                    }
                    else {
                        fitters.xMax.add(solver.attr(m1.attributes, "x2"), x2);
                    }
                    if (alignment.x == "middle") {
                        solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                            [1, solver.attr(m1.attributes, "x1")],
                            [1, solver.attr(m1.attributes, "x2")],
                        ], [
                            [1, x1],
                            [1, x2],
                        ]);
                    }
                }
                break;
        }
    }
    getGlyphPreSolveAttributes(rowIndices) {
        const attrs = this.solverContext.getGlyphAttributes(this.plotSegment.object.glyph, this.plotSegment.object.table, rowIndices);
        return attrs;
    }
    sublayoutGrid(groups, directionOverride) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        let direction = props.sublayout.grid.direction;
        if (directionOverride != null) {
            direction = directionOverride;
        }
        const alignX = props.sublayout.align.x;
        const alignY = props.sublayout.align.y;
        const xMinFitter = new CrossFitter(solver, "min");
        const xMaxFitter = new CrossFitter(solver, "max");
        const yMinFitter = new CrossFitter(solver, "min");
        const yMaxFitter = new CrossFitter(solver, "max");
        let maxCount = 0;
        groups.forEach((group) => {
            if (maxCount < group.group.length) {
                maxCount = group.group.length;
            }
        });
        let xCount, yCount;
        // Determine xCount and yCount, aka., the number of divisions on each axis
        switch (direction) {
            case "x":
                {
                    if (props.sublayout.grid.xCount != null) {
                        xCount = props.sublayout.grid.xCount;
                        yCount = Math.ceil(maxCount / xCount);
                    }
                    else {
                        xCount = Math.ceil(Math.sqrt(maxCount));
                        yCount = Math.ceil(maxCount / xCount);
                    }
                }
                break;
            case "y":
                {
                    if (props.sublayout.grid.yCount != null) {
                        yCount = props.sublayout.grid.yCount;
                        xCount = Math.ceil(maxCount / yCount);
                    }
                    else {
                        yCount = Math.ceil(Math.sqrt(maxCount));
                        xCount = Math.ceil(maxCount / yCount);
                    }
                }
                break;
            case "x1":
                {
                    xCount = maxCount;
                    yCount = 1;
                }
                break;
            case "y1":
                {
                    yCount = maxCount;
                    xCount = 1;
                }
                break;
        }
        const gapRatioX = xCount > 1 ? props.sublayout.ratioX / (xCount - 1) : 0;
        const gapRatioY = yCount > 1 ? props.sublayout.ratioY / (yCount - 1) : 0;
        const gridStartPosition = props.sublayout.grid.gridStartPosition;
        groups.forEach((group) => {
            const markStates = group.group.map((index) => state.glyphs[index]);
            const { x1, y1, x2, y2 } = group;
            let xMax, yMax;
            if (direction == "x" || direction == "x1") {
                xMax = Math.min(markStates.length, xCount);
                yMax = Math.ceil(markStates.length / xCount);
            }
            else {
                yMax = Math.min(markStates.length, yCount);
                xMax = Math.ceil(markStates.length / yCount);
            }
            // Constraint glyphs
            this.addGlyphConstraints(markStates, direction, xCount, alignY, xMax, yMax, yCount, alignX, gapRatioX, x2, x1, gapRatioY, y2, y1, solver, xMinFitter, xMaxFitter, yMinFitter, yMaxFitter, gridStartPosition);
        });
        xMinFitter.addConstraint(solver_1.ConstraintStrength.MEDIUM);
        xMaxFitter.addConstraint(solver_1.ConstraintStrength.MEDIUM);
        yMinFitter.addConstraint(solver_1.ConstraintStrength.MEDIUM);
        yMaxFitter.addConstraint(solver_1.ConstraintStrength.MEDIUM);
    }
    // eslint-disable-next-line
    addGlyphConstraints(markStates, direction, xCount, alignY, xMax, yMax, yCount, alignX, gapRatioX, x2, x1, gapRatioY, y2, y1, solver, xMinFitter, xMaxFitter, yMinFitter, yMaxFitter, gridStartPosition) {
        if (gridStartPosition === GridStartPosition.LeftBottom ||
            gridStartPosition === GridStartPosition.RigtBottom) {
            markStates = markStates.reverse();
        }
        for (let i = 0; i < markStates.length; i++) {
            let xi, yi;
            if (direction == "x" || direction == "x1") {
                xi = i % xCount;
                if (alignY == "start") {
                    xi = xMax - 1 - ((markStates.length - 1 - i) % xCount);
                    yi = Math.floor((markStates.length - 1 - i) / xCount);
                }
                else {
                    yi = yMax - 1 - Math.floor(i / xCount);
                }
                if (gridStartPosition === GridStartPosition.RightTop ||
                    gridStartPosition === GridStartPosition.RigtBottom) {
                    xi = xCount - 1 - xi; // flip X
                }
            }
            else {
                yi = yMax - 1 - (i % yCount);
                xi = Math.floor(i / yCount);
                if (alignX == "end") {
                    yi = (markStates.length - 1 - i) % yCount;
                    xi = xMax - 1 - Math.floor((markStates.length - 1 - i) / yCount);
                }
                if (gridStartPosition === GridStartPosition.LeftTop ||
                    gridStartPosition === GridStartPosition.LeftBottom) {
                    yi = yCount - 1 - yi; // flip Y
                }
            }
            // Adjust xi, yi based on alignment settings
            if (alignX == "end") {
                xi = xi + xCount - xMax;
            }
            if (alignX == "middle") {
                xi = xi + (xCount - xMax) / 2;
            }
            if (alignY == "end") {
                yi = yi + yCount - yMax;
            }
            if (alignY == "middle") {
                yi = yi + (yCount - yMax) / 2;
            }
            const cellX1 = [
                [(xi / xCount) * (1 + gapRatioX), x2],
                [1 - (xi / xCount) * (1 + gapRatioX), x1],
            ];
            const cellX2 = [
                [((xi + 1) / xCount) * (1 + gapRatioX) - gapRatioX, x2],
                [1 - ((xi + 1) / xCount) * (1 + gapRatioX) + gapRatioX, x1],
            ];
            const cellY1 = [
                [(yi / yCount) * (1 + gapRatioY), y2],
                [1 - (yi / yCount) * (1 + gapRatioY), y1],
            ];
            const cellY2 = [
                [((yi + 1) / yCount) * (1 + gapRatioY) - gapRatioY, y2],
                [1 - ((yi + 1) / yCount) * (1 + gapRatioY) + gapRatioY, y1],
            ];
            const state = markStates[i];
            if (alignX == "start") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(state.attributes, "x1")]], cellX1);
            }
            else {
                xMinFitter.addComplex(solver.attr(state.attributes, "x1"), cellX1);
            }
            if (alignX == "end") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(state.attributes, "x2")]], cellX2);
            }
            else {
                xMaxFitter.addComplex(solver.attr(state.attributes, "x2"), cellX2);
            }
            if (alignX == "middle") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                    [1, solver.attr(state.attributes, "x1")],
                    [1, solver.attr(state.attributes, "x2")],
                ], cellX1.concat(cellX2));
            }
            if (alignY == "start") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(state.attributes, "y1")]], cellY1);
            }
            else {
                yMinFitter.addComplex(solver.attr(state.attributes, "y1"), cellY1);
            }
            if (alignY == "end") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[1, solver.attr(state.attributes, "y2")]], cellY2);
            }
            else {
                yMaxFitter.addComplex(solver.attr(state.attributes, "y2"), cellY2);
            }
            if (alignY == "middle") {
                solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [
                    [1, solver.attr(state.attributes, "y1")],
                    [1, solver.attr(state.attributes, "y2")],
                ], cellY1.concat(cellY2));
            }
        }
    }
    sublayoutHandles(groups, enablePrePostGapX, enablePrePostGapY) {
        this.orderMarkGroups(groups);
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const handles = [];
        let maxCount = 0;
        for (const g of groups) {
            maxCount = Math.max(maxCount, g.group.length);
        }
        if (props.sublayout.type == Region2DSublayoutType.DodgeX) {
            for (const group of groups) {
                for (let i = 0; i < group.group.length - 1; i++) {
                    const state1 = state.glyphs[group.group[i]];
                    const state2 = state.glyphs[group.group[i + 1]];
                    const p1 = state1.attributes.x2;
                    const minY = Math.min(state1.attributes.y1, state1.attributes.y2, state2.attributes.y1, state2.attributes.y2);
                    const maxY = Math.max(state1.attributes.y1, state1.attributes.y2, state2.attributes.y1, state2.attributes.y2);
                    handles.push({
                        type: "gap",
                        gap: {
                            axis: axis_1.AxisMode.X,
                            property: { property: "sublayout", field: "ratioX" },
                            reference: p1,
                            value: props.sublayout.ratioX,
                            scale: (1 / (enablePrePostGapX ? maxCount : maxCount - 1)) *
                                (group.x2 - group.x1),
                            span: [minY, maxY],
                        },
                    });
                }
            }
        }
        if (props.sublayout.type == Region2DSublayoutType.DodgeY) {
            for (const group of groups) {
                for (let i = 0; i < group.group.length - 1; i++) {
                    const state1 = state.glyphs[group.group[i]];
                    const state2 = state.glyphs[group.group[i + 1]];
                    const p1 = state1.attributes.y2;
                    const minX = Math.min(state1.attributes.x1, state1.attributes.x2, state2.attributes.x1, state2.attributes.x2);
                    const maxX = Math.max(state1.attributes.x1, state1.attributes.x2, state2.attributes.x1, state2.attributes.x2);
                    handles.push({
                        type: "gap",
                        gap: {
                            axis: axis_1.AxisMode.Y,
                            property: { property: "sublayout", field: "ratioY" },
                            reference: p1,
                            value: props.sublayout.ratioY,
                            scale: (1 / (enablePrePostGapY ? maxCount : maxCount - 1)) *
                                (group.y2 - group.y1),
                            span: [minX, maxX],
                        },
                    });
                }
            }
        }
        if (props.sublayout.type == Region2DSublayoutType.Grid) {
            // TODO: implement grid sublayout handles
        }
        return handles;
    }
    sublayoutPacking(groups, axisOnly) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const packingProps = this.plotSegment.object.properties.sublayout.packing;
        groups.forEach((group) => {
            const markStates = group.group.map((index) => state.glyphs[index]);
            const { x1, y1, x2, y2 } = group;
            const centerState = {
                cx: 0,
                cy: 0,
            };
            const cx = solver.attr(centerState, "cx", {
                edit: true,
            });
            const cy = solver.attr(centerState, "cy", {
                edit: true,
            });
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cx]], [
                [1, x1],
                [1, x2],
            ]);
            solver.addLinear(solver_1.ConstraintStrength.HARD, 0, [[2, cy]], [
                [1, y1],
                [1, y2],
            ]);
            const points = markStates.map((state) => {
                let radius = 0;
                for (const e of state.marks) {
                    if (e.attributes.size != null) {
                        radius = Math.max(radius, Math.sqrt(e.attributes.size / Math.PI));
                    }
                    else {
                        const w = e.attributes.width;
                        const h = e.attributes.height;
                        if (w != null && h != null) {
                            radius = Math.max(radius, Math.sqrt(w * w + h * h) / 2);
                        }
                    }
                }
                if (radius == 0) {
                    radius = Region2DConstraintBuilder.defaultJitterPackingRadius;
                }
                return [
                    solver.attr(state.attributes, "x"),
                    solver.attr(state.attributes, "y"),
                    radius,
                ];
            });
            solver.addPlugin(new solver_1.ConstraintPlugins.PackingPlugin(solver, cx, cy, points, axisOnly, this.config.getXYScale, {
                gravityX: packingProps && packingProps.gravityX,
                gravityY: packingProps && packingProps.gravityY,
            }));
        });
    }
    sublayoutJitter(groups, axisOnly) {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const jitterProps = this.plotSegment.object.properties.sublayout.jitter;
        groups.forEach((group) => {
            const markStates = group.group.map((index) => state.glyphs[index]);
            const { x1, y1, x2, y2 } = group;
            const points = markStates.map((state) => {
                let radius = 0;
                for (const e of state.marks) {
                    if (e.attributes.size != null) {
                        radius = Math.max(radius, Math.sqrt(e.attributes.size / Math.PI));
                    }
                    else {
                        const w = e.attributes.width;
                        const h = e.attributes.height;
                        if (w != null && h != null) {
                            radius = Math.max(radius, Math.sqrt(w * w + h * h) / 2);
                        }
                    }
                }
                if (radius == 0) {
                    radius = Region2DConstraintBuilder.defaultJitterPackingRadius;
                }
                return [
                    solver.attr(state.attributes, "x"),
                    solver.attr(state.attributes, "y"),
                    radius,
                ];
            });
            solver.addPlugin(new solver_1.ConstraintPlugins.JitterPlugin(solver, x1, y1, x2, y2, points, axisOnly, jitterProps
                ? jitterProps
                : {
                    horizontal: true,
                    vertical: true,
                }));
        });
    }
    getHandles() {
        const state = this.plotSegment.state;
        const props = this.plotSegment.object.properties;
        const xMode = props.xData ? props.xData.type : "null";
        const yMode = props.yData ? props.yData.type : "null";
        let handles = [];
        switch (xMode) {
            case "null":
                {
                    switch (yMode) {
                        case "null":
                            {
                                handles = handles.concat(this.sublayoutHandles([
                                    {
                                        x1: state.attributes[this.x1Name],
                                        y1: state.attributes[this.y1Name],
                                        x2: state.attributes[this.x2Name],
                                        y2: state.attributes[this.y2Name],
                                        group: state.dataRowIndices.map((x, i) => i),
                                    },
                                ], this.config.xAxisPrePostGap, this.config.yAxisPrePostGap));
                            }
                            break;
                        // case "numerical":
                        //   {
                        //   }
                        //   break;
                        case "categorical":
                            {
                                handles = handles.concat(this.categoricalHandles("y", true));
                            }
                            break;
                    }
                }
                break;
            case "numerical":
                {
                    switch (yMode) {
                        // case "null":
                        //   {
                        //   }
                        //   break;
                        // case "numerical":
                        //   {
                        //   }
                        //   break;
                        case "categorical":
                            {
                                handles = handles.concat(this.categoricalHandles("y", false));
                            }
                            break;
                    }
                }
                break;
            case "categorical":
                {
                    switch (yMode) {
                        case "null":
                            {
                                handles = handles.concat(this.categoricalHandles("x", true));
                            }
                            break;
                        case "numerical":
                            {
                                handles = handles.concat(this.categoricalHandles("x", false));
                            }
                            break;
                        case "categorical":
                            {
                                handles = handles.concat(this.categoricalHandles("xy", true));
                            }
                            break;
                    }
                }
                break;
        }
        return handles;
    }
    build() {
        const solver = this.solver;
        const state = this.plotSegment.state;
        const attrs = state.attributes;
        const props = this.plotSegment.object.properties;
        const xMode = props.xData ? props.xData.type : "null";
        const yMode = props.yData ? props.yData.type : "null";
        switch (xMode) {
            case "null":
                {
                    this.buildXNullMode(yMode, solver, attrs, state);
                }
                break;
            case "default":
                {
                    this.buildXDefaultMode(yMode, solver, attrs, state);
                }
                break;
            case "numerical":
                {
                    this.buildXNumericalMode(yMode, solver, attrs, state);
                }
                break;
            case "categorical":
                {
                    this.buildXCategoricalMode(yMode);
                }
                break;
        }
        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(attrs, "x"), solver.attr(attrs, this.x1Name));
        solver.addEquals(solver_1.ConstraintStrength.HARD, solver.attr(attrs, "y"), solver.attr(attrs, this.y1Name));
    }
    buildXCategoricalMode(yMode) {
        switch (yMode) {
            case "null":
                {
                    this.categoricalMapping("x", { mode: "default" });
                }
                break;
            case "default":
                {
                    this.stacking(axis_1.AxisMode.Y);
                    this.categoricalMapping("x", { mode: "disabled" });
                }
                break;
            case "numerical":
                {
                    this.numericalMapping(axis_1.AxisMode.Y);
                    this.categoricalMapping("x", { mode: "x-only" });
                }
                break;
            case "categorical":
                {
                    this.categoricalMapping("xy", { mode: "default" });
                }
                break;
        }
    }
    buildXNumericalMode(yMode, solver, attrs, state) {
        switch (yMode) {
            case "null":
                {
                    // numerical, null
                    this.numericalMapping(axis_1.AxisMode.X);
                    this.applySublayout([
                        {
                            x1: solver.attr(attrs, this.x1Name),
                            y1: solver.attr(attrs, this.y1Name),
                            x2: solver.attr(attrs, this.x2Name),
                            y2: solver.attr(attrs, this.y2Name),
                            group: state.dataRowIndices.map((x, i) => i),
                        },
                    ], "y", {
                        mode: "y-only",
                    });
                }
                break;
            case "default":
                {
                    this.stacking(axis_1.AxisMode.Y);
                    this.numericalMapping(axis_1.AxisMode.X);
                }
                break;
            case "numerical":
                {
                    // numerical, numerical
                    this.numericalMapping(axis_1.AxisMode.X);
                    this.numericalMapping(axis_1.AxisMode.Y);
                }
                break;
            case "categorical":
                {
                    // numerical, categorical
                    this.numericalMapping(axis_1.AxisMode.X);
                    this.categoricalMapping("y", { mode: "y-only" });
                }
                break;
        }
    }
    buildXDefaultMode(yMode, solver, attrs, state) {
        switch (yMode) {
            case "null":
                {
                    this.stacking(axis_1.AxisMode.X);
                    this.applySublayout([
                        {
                            x1: solver.attr(attrs, this.x1Name),
                            y1: solver.attr(attrs, this.y1Name),
                            x2: solver.attr(attrs, this.x2Name),
                            y2: solver.attr(attrs, this.y2Name),
                            group: state.dataRowIndices.map((x, i) => i),
                        },
                    ], "y", {
                        mode: "y-only",
                    });
                }
                break;
            case "default":
                {
                    this.stacking(axis_1.AxisMode.X);
                    this.stacking(axis_1.AxisMode.Y);
                }
                break;
            case "numerical":
                {
                    this.stacking(axis_1.AxisMode.X);
                    this.numericalMapping(axis_1.AxisMode.Y);
                }
                break;
            case "categorical":
                {
                    this.stacking(axis_1.AxisMode.X);
                    this.categoricalMapping("y", { mode: "disabled" });
                }
                break;
        }
    }
    buildXNullMode(yMode, solver, attrs, state) {
        switch (yMode) {
            case "null":
                {
                    // null, null
                    this.applySublayout([
                        {
                            x1: solver.attr(attrs, this.x1Name),
                            y1: solver.attr(attrs, this.y1Name),
                            x2: solver.attr(attrs, this.x2Name),
                            y2: solver.attr(attrs, this.y2Name),
                            group: state.dataRowIndices.map((x, i) => i),
                        },
                    ], "xy", {
                        mode: "default",
                        xAxisPrePostGap: this.config.xAxisPrePostGap,
                        yAxisPrePostGap: this.config.yAxisPrePostGap,
                    });
                }
                break;
            case "default":
                {
                    this.stacking(axis_1.AxisMode.Y);
                    this.applySublayout([
                        {
                            x1: solver.attr(attrs, this.x1Name),
                            y1: solver.attr(attrs, this.y1Name),
                            x2: solver.attr(attrs, this.x2Name),
                            y2: solver.attr(attrs, this.y2Name),
                            group: state.dataRowIndices.map((x, i) => i),
                        },
                    ], "x", {
                        mode: "x-only",
                    });
                }
                break;
            case "numerical":
                {
                    // null, numerical
                    this.numericalMapping(axis_1.AxisMode.Y);
                    this.applySublayout([
                        {
                            x1: solver.attr(attrs, this.x1Name),
                            y1: solver.attr(attrs, this.y1Name),
                            x2: solver.attr(attrs, this.x2Name),
                            y2: solver.attr(attrs, this.y2Name),
                            group: state.dataRowIndices.map((x, i) => i),
                        },
                    ], "x", {
                        mode: "x-only",
                    });
                }
                break;
            case "categorical":
                {
                    // null, categorical
                    this.categoricalMapping("y", { mode: "default" });
                }
                break;
        }
    }
    applicableSublayoutOptions() {
        const { icons, terminology } = this.config;
        const overlapOption = {
            value: Region2DSublayoutType.Overlap,
            label: terminology.overlap,
            icon: icons.overlapIcon,
        };
        const packingOption = {
            value: Region2DSublayoutType.Packing,
            label: terminology.packing,
            icon: icons.packingIcon,
        };
        const dodgeXOption = {
            value: Region2DSublayoutType.DodgeX,
            label: terminology.dodgeX,
            icon: icons.dodgeXIcon,
        };
        const dodgeYOption = {
            value: Region2DSublayoutType.DodgeY,
            label: terminology.dodgeY,
            icon: icons.dodgeYIcon,
        };
        const gridOption = {
            value: Region2DSublayoutType.Grid,
            label: terminology.grid,
            icon: icons.gridIcon,
        };
        const jitterOption = {
            value: Region2DSublayoutType.Jitter,
            label: terminology.jitter,
            icon: icons.jitterIcon,
        };
        const props = this.plotSegment.object.properties;
        const xMode = props.xData ? props.xData.type : "null";
        const yMode = props.yData ? props.yData.type : "null";
        if ((xMode == "null" || xMode == "categorical") &&
            (yMode == "null" || yMode == "categorical")) {
            return [
                dodgeXOption,
                dodgeYOption,
                gridOption,
                packingOption,
                jitterOption,
                overlapOption,
            ];
        }
        return [packingOption, jitterOption, overlapOption];
    }
    isSublayoutApplicable() {
        const props = this.plotSegment.object.properties;
        const xMode = props.xData ? props.xData.type : "null";
        const yMode = props.yData ? props.yData.type : "null";
        // Sublayout is not applicable when one of x, y is scaffold ("default"), or both of them are numerical
        return (xMode != "default" &&
            yMode != "default" &&
            (xMode != "numerical" || yMode != "numerical"));
    }
    // eslint-disable-next-line
    buildSublayoutWidgets(m) {
        const extra = [];
        const props = this.plotSegment.object.properties;
        const type = props.sublayout.type;
        if (type == Region2DSublayoutType.DodgeX ||
            type == Region2DSublayoutType.DodgeY ||
            type == Region2DSublayoutType.Grid ||
            type == Region2DSublayoutType.Overlap) {
            const isXFixed = props.xData && props.xData.type == "numerical";
            const isYFixed = props.yData && props.yData.type == "numerical";
            const alignmentWidgets = [];
            if (!isYFixed) {
                alignmentWidgets.push(m.inputSelect({ property: "sublayout", field: ["align", "y"] }, {
                    type: "radio",
                    options: ["start", "middle", "end"],
                    icons: [
                        "AlignVerticalBottom",
                        "AlignVerticalCenter",
                        "AlignVerticalTop",
                    ],
                    labels: [
                        strings_1.strings.alignment.bottom,
                        strings_1.strings.alignment.middle,
                        strings_1.strings.alignment.top,
                    ],
                    tooltip: strings_1.strings.canvas.alignItemsOnY,
                }));
            }
            if (!isXFixed) {
                alignmentWidgets.push(m.inputSelect({ property: "sublayout", field: ["align", "x"] }, {
                    type: "radio",
                    options: ["start", "middle", "end"],
                    icons: [
                        "AlignHorizontalLeft",
                        "AlignHorizontalCenter",
                        "AlignHorizontalRight",
                    ],
                    labels: [
                        strings_1.strings.alignment.left,
                        strings_1.strings.alignment.middle,
                        strings_1.strings.alignment.right,
                    ],
                    tooltip: strings_1.strings.canvas.alignItemsOnX,
                }));
            }
            extra.push(m.vertical(m.label(strings_1.strings.alignment.alignment), m.horizontal([0, 0, 0], ...alignmentWidgets.reverse(), null)));
            if (type == Region2DSublayoutType.Grid) {
                extra.push(m.vertical(m.label(strings_1.strings.objects.axes.gap), m.vertical(m.label("x: "), m.inputNumber({ property: "sublayout", field: "ratioX" }, { minimum: 0, maximum: 1, percentage: true, showSlider: true }), m.label("y: "), m.inputNumber({ property: "sublayout", field: "ratioY" }, { minimum: 0, maximum: 1, percentage: true, showSlider: true }))));
            }
            else {
                extra.push(m.inputNumber({
                    property: "sublayout",
                    field: type == Region2DSublayoutType.DodgeX ? "ratioX" : "ratioY",
                }, {
                    minimum: 0,
                    maximum: 1,
                    percentage: true,
                    showSlider: true,
                    label: strings_1.strings.objects.axes.gap,
                }));
            }
            if (type == Region2DSublayoutType.Grid) {
                const { terminology } = this.config;
                extra.push(m.vertical(m.label(strings_1.strings.objects.plotSegment.orientation), m.horizontal([0, 0, 1], m.inputSelect({ property: "sublayout", field: ["grid", "direction"] }, {
                    type: "radio",
                    options: [GridDirection.X, GridDirection.Y],
                    icons: ["GripperBarHorizontal", "GripperBarVertical"],
                    labels: [
                        terminology.gridDirectionX,
                        terminology.gridDirectionY,
                    ],
                })), m.inputSelect({
                    property: "sublayout",
                    field: ["grid", "gridStartPosition"],
                }, {
                    type: "radio",
                    icons: [
                        "ArrowTallDownRight",
                        "ArrowTallDownLeft",
                        "ArrowTallUpLeft",
                        "ArrowTallUpRight",
                    ],
                    options: [
                        GridStartPosition.LeftTop,
                        GridStartPosition.RightTop,
                        GridStartPosition.LeftBottom,
                        GridStartPosition.RigtBottom,
                    ],
                    labels: [
                        strings_1.strings.objects.plotSegment.directionDownRight,
                        strings_1.strings.objects.plotSegment.directionDownLeft,
                        strings_1.strings.objects.plotSegment.directionUpLeft,
                        strings_1.strings.objects.plotSegment.directionUpRight,
                    ],
                    label: strings_1.strings.objects.plotSegment.direction,
                })), m.inputNumber({
                    property: "sublayout",
                    field: props.sublayout.grid.direction == "x"
                        ? ["grid", "xCount"]
                        : ["grid", "yCount"],
                }, {
                    label: strings_1.strings.objects.axes.count,
                }));
            }
            if (type != Region2DSublayoutType.Overlap) {
                extra.push(m.vertical(m.label(strings_1.strings.objects.plotSegment.order), m.horizontal([0, 0], m.orderByWidget({ property: "sublayout", field: "order" }, { table: this.plotSegment.object.table, shiftCallout: 15 }), m.inputBoolean({ property: "sublayout", field: "orderReversed" }, { type: "highlight", icon: "Sort" }))));
            }
        }
        if (type == Region2DSublayoutType.Packing) {
            extra.push(m.vertical(m.label(strings_1.strings.objects.plotSegment.gravity), m.inputNumber({ property: "sublayout", field: ["packing", "gravityX"] }, { minimum: 0.1, maximum: 15, label: "X" }), m.inputNumber({ property: "sublayout", field: ["packing", "gravityY"] }, { minimum: 0.1, maximum: 15, label: "Y" })));
        }
        if (type == Region2DSublayoutType.Jitter) {
            extra.push(m.label(strings_1.strings.objects.plotSegment.distribution));
            extra.push(m.horizontal([0, 1, 1], m.inputBoolean({ property: "sublayout", field: ["jitter", "horizontal"] }, { type: "highlight", icon: "HorizontalDistributeCenter" }), m.inputBoolean({ property: "sublayout", field: ["jitter", "vertical"] }, { type: "highlight", icon: "VerticalDistributeCenter" })));
        }
        const options = this.applicableSublayoutOptions();
        return [
            m.verticalGroup({
                header: strings_1.strings.objects.plotSegment.subLayout,
            }, [
                m.vertical(m.horizontal([0, 0], m.inputSelect({ property: "sublayout", field: "type" }, {
                    type: "radio",
                    options: options.map((x) => x.value),
                    icons: options.map((x) => x.icon),
                    labels: options.map((x) => x.label),
                    label: strings_1.strings.objects.plotSegment.type,
                }), 
                // for alignment
                m.inputSelect({ property: "sublayout", field: "type" }, {
                    type: "radio",
                    options: [],
                    icons: [],
                    labels: [],
                }))),
                ...extra,
            ]),
        ];
    }
    buildAxisWidgets(manager, axisName, axis) {
        const props = this.plotSegment.object.properties;
        const data = axis == "x" ? props.xData : props.yData;
        const axisProperty = axis == "x"
            ? PlotSegmentAxisPropertyNames.xData
            : PlotSegmentAxisPropertyNames.yData;
        let axisType = "";
        if (data) {
            switch (data.type) {
                case types_1.AxisDataBindingType.Categorical:
                    axisType = strings_1.strings.objects.axes.categoricalSuffix;
                    break;
                case types_1.AxisDataBindingType.Numerical:
                    axisType = strings_1.strings.objects.axes.numericalSuffix;
                    break;
            }
        }
        return [
            manager.customCollapsiblePanel([
                ...axis_1.buildAxisWidgets(data, axisProperty, manager, axisName),
                ...this.plotSegment.buildGridLineWidgets(data, manager, axisProperty),
            ], {
                header: axisName + axisType,
                styles: {
                    marginLeft: 5,
                },
            }),
        ];
    }
    buildPanelWidgets(m) {
        const { terminology } = this.config;
        if (this.isSublayoutApplicable()) {
            return [
                ...this.buildAxisWidgets(m, terminology.xAxis, "x"),
                ...this.buildAxisWidgets(m, terminology.yAxis, "y"),
                ...this.buildSublayoutWidgets(m),
            ];
        }
        else {
            return [
                ...this.buildAxisWidgets(m, terminology.xAxis, "x"),
                ...this.buildAxisWidgets(m, terminology.yAxis, "y"),
            ];
        }
    }
    // eslint-disable-next-line
    buildPopupWidgets(m) {
        const props = this.plotSegment.object.properties;
        const { icons, terminology } = this.config;
        let sublayout = [];
        if (this.isSublayoutApplicable()) {
            const extra = [];
            const isXFixed = props.xData && props.xData.type == "numerical";
            const isYFixed = props.yData && props.yData.type == "numerical";
            const type = props.sublayout.type;
            if (type == Region2DSublayoutType.DodgeX ||
                type == Region2DSublayoutType.DodgeY ||
                type == Region2DSublayoutType.Grid ||
                type == Region2DSublayoutType.Overlap) {
                if (!isXFixed) {
                    extra.push(m.inputSelect({ property: "sublayout", field: ["align", "x"] }, {
                        type: "dropdown",
                        showLabel: true,
                        labelPosition: 1 /* Bottom */,
                        options: ["start", "middle", "end"],
                        icons: [icons.xMinIcon, icons.xMiddleIcon, icons.xMaxIcon],
                        labels: [
                            terminology.xMin,
                            terminology.xMiddle,
                            terminology.xMax,
                        ],
                        tooltip: strings_1.strings.canvas.alignItemsOnX,
                        hideBorder: true,
                        shiftCallout: 15,
                    }));
                }
                if (!isYFixed) {
                    extra.push(m.inputSelect({ property: "sublayout", field: ["align", "y"] }, {
                        type: "dropdown",
                        showLabel: true,
                        labelPosition: 1 /* Bottom */,
                        options: ["start", "middle", "end"],
                        icons: [icons.yMinIcon, icons.yMiddleIcon, icons.yMaxIcon],
                        labels: [
                            terminology.yMin,
                            terminology.yMiddle,
                            terminology.yMax,
                        ],
                        tooltip: strings_1.strings.canvas.alignItemsOnY,
                        hideBorder: true,
                        shiftCallout: 15,
                    }));
                }
                if (type == "grid") {
                    extra.push(m.sep());
                    extra.push(m.inputSelect({ property: "sublayout", field: ["grid", "direction"] }, {
                        type: "dropdown",
                        showLabel: true,
                        labelPosition: 1 /* Bottom */,
                        options: [GridDirection.X, GridDirection.Y],
                        icons: ["GripperBarHorizontal", "GripperBarVertical"],
                        labels: [
                            terminology.gridDirectionX,
                            terminology.gridDirectionY,
                        ],
                        tooltip: strings_1.strings.canvas.gridDirection,
                        hideBorder: true,
                        shiftCallout: 15,
                    }));
                    extra.push(m.inputSelect({
                        property: "sublayout",
                        field: ["grid", "gridStartPosition"],
                    }, {
                        type: "dropdown",
                        icons: [
                            "ArrowTallDownRight",
                            "ArrowTallDownLeft",
                            "ArrowTallUpLeft",
                            "ArrowTallUpRight",
                        ],
                        options: [
                            GridStartPosition.LeftTop,
                            GridStartPosition.RightTop,
                            GridStartPosition.LeftBottom,
                            GridStartPosition.RigtBottom,
                        ],
                        labels: [
                            strings_1.strings.objects.plotSegment.directionDownRight,
                            strings_1.strings.objects.plotSegment.directionDownLeft,
                            strings_1.strings.objects.plotSegment.directionUpLeft,
                            strings_1.strings.objects.plotSegment.directionUpRight,
                        ],
                        hideBorder: true,
                    }));
                }
                if (type != Region2DSublayoutType.Overlap) {
                    extra.push(m.sep());
                    extra.push(m.orderByWidget({ property: "sublayout", field: "order" }, {
                        table: this.plotSegment.object.table,
                        displayLabel: true,
                        tooltip: strings_1.strings.canvas.elementOrders,
                        shiftCallout: 15,
                    }), m.inputBoolean({ property: "sublayout", field: "orderReversed" }, { type: "highlight", icon: "Sort" }));
                }
            }
            const options = this.applicableSublayoutOptions();
            sublayout = [
                m.inputSelect({ property: "sublayout", field: "type" }, {
                    type: "dropdown",
                    showLabel: true,
                    labelPosition: 1 /* Bottom */,
                    options: options.map((x) => x.value),
                    icons: options.map((x) => x.icon),
                    labels: options.map((x) => x.label),
                    tooltip: strings_1.strings.canvas.sublayoutType,
                    hideBorder: true,
                    shiftCallout: 15,
                }),
                ...extra,
            ];
        }
        const isXStacking = props.xData && props.xData.type == "default";
        const isYStacking = props.yData && props.yData.type == "default";
        if (isXStacking && !isYStacking) {
            if (props.xData.type == "default") {
                sublayout.push(m.label(terminology.xAxis + ": Stacking"));
            }
            sublayout.push(m.inputSelect({ property: "sublayout", field: ["align", "y"] }, {
                type: "dropdown",
                showLabel: true,
                labelPosition: 1 /* Bottom */,
                options: ["start", "middle", "end"],
                icons: [icons.yMinIcon, icons.yMiddleIcon, icons.yMaxIcon],
                labels: [terminology.yMin, terminology.yMiddle, terminology.yMax],
                hideBorder: true,
                shiftCallout: 15,
            }));
        }
        if (isYStacking && !isXStacking) {
            if (props.yData.type == "default") {
                sublayout.push(m.label(terminology.yAxis + ": Stacking"));
            }
            sublayout.push(m.inputSelect({ property: "sublayout", field: ["align", "x"] }, {
                type: "dropdown",
                showLabel: true,
                labelPosition: 1 /* Bottom */,
                options: ["start", "middle", "end"],
                icons: [icons.xMinIcon, icons.xMiddleIcon, icons.xMaxIcon],
                labels: [terminology.xMin, terminology.xMiddle, terminology.xMax],
                hideBorder: true,
                shiftCallout: 15,
            }));
        }
        if (isXStacking && isYStacking) {
            if (props.yData.type == "default") {
                sublayout.push(m.label(terminology.xAxis + " & " + terminology.yAxis + ": Stacking"));
            }
        }
        return [...sublayout];
    }
}
exports.Region2DConstraintBuilder = Region2DConstraintBuilder;
Region2DConstraintBuilder.defaultJitterPackingRadius = 5;
//# sourceMappingURL=base.js.map
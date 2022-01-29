"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharticulatorWorkerProcess = void 0;
const Core = require("../core");
const communication_1 = require("./communication");
class CharticulatorWorkerProcess extends communication_1.WorkerHostProcess {
    constructor() {
        super();
        this.registerRPC("initialize", this.initialize.bind(this));
        this.registerRPC("solveChartConstraints", this.solveChartConstraints.bind(this));
    }
    initialize(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Core.initialize(config);
        });
    }
    solveChartConstraints(chart, chartState, dataset, preSolveValues = null, mappingOnly = false) {
        if (preSolveValues != null && preSolveValues.length > 0) {
            return this.doSolveChartConstraints(chart, chartState, dataset, (solver) => {
                for (const [strength, attrs, attr, value] of preSolveValues) {
                    solver.solver.addEqualToConstant(strength, solver.solver.attr(attrs, attr), value);
                }
            }, mappingOnly);
        }
        return this.doSolveChartConstraints(chart, chartState, dataset, null, mappingOnly);
    }
    doSolveChartConstraints(chart, chartState, dataset, additional = null, mappingOnly = false) {
        const chartManager = new Core.Prototypes.ChartStateManager(chart, dataset, chartState);
        chartManager.solveConstraints(additional, mappingOnly);
        return chartState;
    }
}
exports.CharticulatorWorkerProcess = CharticulatorWorkerProcess;
new CharticulatorWorkerProcess();
//# sourceMappingURL=worker_main.js.map
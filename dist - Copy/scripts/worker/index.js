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
exports.CharticulatorWorker = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const core_1 = require("../core");
const communication_1 = require("./communication");
var worker_main_1 = require("./worker_main");
Object.defineProperty(exports, "CharticulatorWorkerProcess", { enumerable: true, get: function () { return worker_main_1.CharticulatorWorkerProcess; } });
/**
 * The representation of the background worker. This is used from the main process.
 */
class CharticulatorWorker extends communication_1.WorkerRPC {
    constructor(workerLocation) {
        super(workerLocation);
    }
    initialize(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.rpc("initialize", config);
        });
    }
    // eslint-disable-next-line
    solveChartConstraints(chart, chartState, dataset, preSolveValues, mappingOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.rpc("solveChartConstraints", chart, chartState, dataset, preSolveValues, mappingOnly);
            // Copy all attributes from result to chartState
            // let isValidObject = (x: any) => x !== null && typeof (x) == "object";
            // let copyAttributes = (dest: any, src: any) => {
            //     if (src instanceof Array) {
            //         for (let i = 0; i < src.length; i++) {
            //             if (isValidObject(src[i]) && isValidObject(dest[i])) {
            //                 copyAttributes(dest[i], src[i])
            //             } else {
            //                 dest[i] = src[i];
            //             }
            //         }
            //         // Remove extra stuff from dest
            //         if (dest.length > src.length) {
            //             dest.splice(src.length, dest.length - src.length);
            //         }
            //     } else {
            //         for (let i in src) {
            //             if (!src.hasOwnProperty(i)) continue;
            //             if (isValidObject(src[i]) && isValidObject(dest[i])) {
            //                 copyAttributes(dest[i], src[i])
            //             } else {
            //                 dest[i] = src[i];
            //             }
            //         }
            //         for (let i in dest) {
            //             if (!src.hasOwnProperty(i)) {
            //                 delete dest[i];
            //             }
            //         }
            //     }
            // };
            // copyAttributes(chartState, result);
            // Copy only attributes
            const shallowCopyAttributes = (dest, src) => {
                for (const key in src) {
                    // eslint-disable-next-line
                    if (src.hasOwnProperty(key)) {
                        dest[key] = src[key];
                    }
                }
            };
            shallowCopyAttributes(chartState.attributes, result.attributes);
            for (let i = 0; i < chartState.elements.length; i++) {
                const elementState = chartState.elements[i];
                const resultElementState = result.elements[i];
                shallowCopyAttributes(elementState.attributes, resultElementState.attributes);
                // Is this a plot segment
                if (core_1.Prototypes.isType(chart.elements[i].classID, "plot-segment")) {
                    const plotSegmentState = elementState;
                    const resultPlotSegmentState = (resultElementState);
                    for (const [glyphState, resultGlyphState] of core_1.zipArray(plotSegmentState.glyphs, resultPlotSegmentState.glyphs)) {
                        shallowCopyAttributes(glyphState.attributes, resultGlyphState.attributes);
                        for (const [markState, resultMarkState] of core_1.zipArray(glyphState.marks, resultGlyphState.marks)) {
                            shallowCopyAttributes(markState.attributes, resultMarkState.attributes);
                        }
                    }
                }
            }
            for (const [element, resultElement] of core_1.zipArray(chartState.scales, result.scales)) {
                shallowCopyAttributes(element.attributes, resultElement.attributes);
            }
            return chartState;
        });
    }
}
exports.CharticulatorWorker = CharticulatorWorker;
//# sourceMappingURL=index.js.map
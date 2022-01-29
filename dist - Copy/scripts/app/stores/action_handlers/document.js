"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
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
const FileSaver = require("file-saver");
const file_saver_1 = require("file-saver");
const core_1 = require("../../../core");
const actions_1 = require("../../actions");
const utils_1 = require("../../utils");
const app_store_1 = require("../app_store");
const migrator_1 = require("../migrator");
const config_1 = require("../../config");
const template_1 = require("../../template");
const application_1 = require("../../application");
/** Handlers for document-level actions such as Load, Save, Import, Export, Undo/Redo, Reset */
// eslint-disable-next-line
function default_1(REG) {
    // eslint-disable-next-line
    REG.add(actions_1.Actions.Export, function (action) {
        (() => __awaiter(this, void 0, void 0, function* () {
            // Export as vector graphics
            if (action.type == "svg") {
                const svg = yield this.renderLocalSVG();
                const blob = new Blob([svg], { type: "image/svg;charset=utf-8" });
                file_saver_1.saveAs(blob, "charticulator.svg", true);
            }
            // Export as bitmaps
            if (action.type == "png" || action.type == "jpeg") {
                const svgDataURL = utils_1.stringToDataURL("image/svg+xml", yield this.renderLocalSVG());
                utils_1.renderDataURLToPNG(svgDataURL, {
                    mode: "scale",
                    scale: action.options.scale || 2,
                    background: "#ffffff",
                }).then((png) => {
                    png.toBlob((blob) => {
                        file_saver_1.saveAs(blob, "charticulator." + (action.type == "png" ? "png" : "jpg"), true);
                    }, "image/" + action.type);
                });
            }
            // Export as interactive HTML
            if (action.type == "html") {
                const containerScriptText = yield (yield fetch(config_1.getConfig().ContainerURL)).text();
                const template = core_1.deepClone(this.buildChartTemplate());
                const htmlString = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <title>Charticulator HTML Export</title>
            <script type="text/javascript">${containerScriptText}</script>
            <style type="text/css">
              #container {
                display: block;
                position: absolute;
                left: 0; right: 0; top: 0; bottom: 0;
              }
            </style>
          </head>
          <body>
            <div id="container"></div>
            <script type="text/javascript">
              CharticulatorContainer.initialize().then(function() {
                const currentChart = ${JSON.stringify(this.chart)};
                const chartState = ${JSON.stringify(this.chartState)};
                const dataset = ${JSON.stringify(this.dataset)};
                const template = ${JSON.stringify(template)};
                const chartTemplate = new CharticulatorContainer.ChartTemplate(
                  template
                );
                chartTemplate.reset();

                const defaultTable = dataset.tables[0];
                const columns = defaultTable.columns;
                chartTemplate.assignTable(defaultTable.name, defaultTable.name);
                for (const column of columns) {
                  chartTemplate.assignColumn(
                    defaultTable.name,
                    column.name,
                    column.name
                  );
                }

                // links table
                const linksTable = dataset.tables[1];
                const links = linksTable && (linksTable.columns);
                if (links) {
                  chartTemplate.assignTable(linksTable.name, linksTable.name);
                  for (const column of links) {
                    chartTemplate.assignColumn(
                      linksTable.name,
                      column.name,
                      column.name
                    );
                  }
                }
                const instance = chartTemplate.instantiate(dataset);

                const { chart } = instance;

                for (const property of template.properties) {
                  if (property.target.attribute) {
                    CharticulatorContainer.ChartTemplate.SetChartAttributeMapping(
                      chart,
                      property.objectID,
                      property.target.attribute,
                      {
                        type: "value",
                        value: property.default,
                      }
                    );
                  }
                  
                }

                const container = new CharticulatorContainer.ChartContainer({ chart: chart }, dataset);
                const width = document.getElementById("container").getBoundingClientRect().width;
                const height = document.getElementById("container").getBoundingClientRect().height;
                container.mount("container", width, height);
                window.addEventListener("resize", function() {
                  container.resize(
                    document.getElementById("container").getBoundingClientRect().width,
                    document.getElementById("container").getBoundingClientRect().height
                  );
                });
              });
            </script>
          </body>
          </html>
        `;
                const blob = new Blob([htmlString]);
                file_saver_1.saveAs(blob, "charticulator.html", true);
            }
        }))();
    });
    REG.add(actions_1.Actions.ExportTemplate, function (action) {
        action.target.generate(action.properties).then((base64) => {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
                type: "application/x-binary",
            });
            FileSaver.saveAs(blob, action.target.getFileName
                ? action.target.getFileName(action.properties)
                : "charticulator." + action.target.getFileExtension(action.properties));
        });
    });
    REG.add(actions_1.Actions.Save, function (action) {
        this.backendSaveChart()
            .then(() => {
            if (action.onFinish) {
                action.onFinish();
            }
        })
            .catch((error) => {
            if (action.onFinish) {
                action.onFinish(error);
            }
        });
    });
    REG.add(actions_1.Actions.SaveAs, function (action) {
        this.backendSaveChartAs(action.saveAs)
            .then(() => {
            if (action.onFinish) {
                action.onFinish();
            }
        })
            .catch((error) => {
            if (action.onFinish) {
                action.onFinish(error);
            }
        });
    });
    REG.add(actions_1.Actions.Open, function (action) {
        this.backendOpenChart(action.id)
            .then(() => {
            if (action.onFinish) {
                action.onFinish();
            }
        })
            .catch((error) => {
            if (action.onFinish) {
                action.onFinish(error);
            }
        });
    });
    REG.add(actions_1.Actions.Load, function (action) {
        this.historyManager.clear();
        const state = new migrator_1.Migrator().migrate(action.projectData, CHARTICULATOR_PACKAGE.version);
        this.loadState(state);
    });
    REG.add(actions_1.Actions.ImportDataset, function (action) {
        this.currentChartID = null;
        this.dataset = action.dataset;
        this.originDataset = core_1.deepClone(this.dataset);
        this.historyManager.clear();
        this.newChartEmpty();
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.ImportChartAndDataset, function (action) {
        this.currentChartID = null;
        this.currentSelection = null;
        this.dataset = action.dataset;
        this.originDataset = core_1.deepClone(this.dataset);
        this.chart = action.specification;
        this.chartManager = new core_1.Prototypes.ChartStateManager(this.chart, this.dataset, null, {}, {}, action.originSpecification
            ? core_1.deepClone(action.originSpecification)
            : this.chartManager.getOriginChart());
        this.chartManager.onUpdate(() => {
            this.solveConstraintsAndUpdateGraphics();
        });
        this.chartState = this.chartManager.chartState;
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.UpdatePlotSegments, function () {
        this.updatePlotSegments();
        this.solveConstraintsAndUpdateGraphics();
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
    });
    REG.add(actions_1.Actions.UpdateDataAxis, function () {
        this.updateDataAxes();
        this.solveConstraintsAndUpdateGraphics();
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
    });
    REG.add(actions_1.Actions.ReplaceDataset, function (action) {
        this.currentChartID = null;
        this.currentSelection = null;
        this.dataset = action.dataset;
        this.originDataset = core_1.deepClone(this.dataset);
        this.chartManager = new core_1.Prototypes.ChartStateManager(this.chart, this.dataset, null, {}, {}, action.keepState ? this.chartManager.getOriginChart() : null);
        this.chartManager.onUpdate(() => {
            this.solveConstraintsAndUpdateGraphics();
        });
        this.chartState = this.chartManager.chartState;
        this.updatePlotSegments();
        this.updateDataAxes();
        this.updateScales();
        this.solveConstraintsAndUpdateGraphics();
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
    });
    REG.add(actions_1.Actions.ConvertColumnDataType, function (action) {
        this.saveHistory();
        const table = this.dataset.tables.find((table) => table.name === action.tableName);
        if (!table) {
            return;
        }
        const column = table.columns.find((column) => column.name === action.column);
        if (!column) {
            return;
        }
        const originTable = this.originDataset.tables.find((table) => table.name === action.tableName);
        let originColumn = originTable.columns.find((column) => column.name === action.column);
        if (originColumn.metadata.rawColumnName) {
            originColumn = originTable.columns.find((column) => column.name === originColumn.metadata.rawColumnName);
        }
        const result = utils_1.convertColumns(table, column, originTable, action.type);
        if (result) {
            this.messageState.set("columnConvertError", result);
        }
        this.updatePlotSegments();
        this.updateDataAxes();
        this.updateScales();
        this.solveConstraintsAndUpdateGraphics();
        this.emit(app_store_1.AppStore.EVENT_DATASET);
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
    });
    REG.add(actions_1.Actions.Undo, function () {
        const state = this.historyManager.undo(this.saveDecoupledState());
        if (state) {
            const ss = this.saveSelectionState();
            this.loadState(state);
            this.loadSelectionState(ss);
        }
    });
    REG.add(actions_1.Actions.Redo, function () {
        const state = this.historyManager.redo(this.saveDecoupledState());
        if (state) {
            const ss = this.saveSelectionState();
            this.loadState(state);
            this.loadSelectionState(ss);
        }
    });
    REG.add(actions_1.Actions.Reset, function () {
        this.saveHistory();
        this.currentSelection = null;
        this.currentTool = null;
        this.emit(app_store_1.AppStore.EVENT_SELECTION);
        this.emit(app_store_1.AppStore.EVENT_CURRENT_TOOL);
        this.newChartEmpty();
        this.solveConstraintsAndUpdateGraphics();
    });
    REG.add(actions_1.Actions.OpenNestedEditor, function ({ options, object, property }) {
        this.emit(app_store_1.AppStore.EVENT_OPEN_NESTED_EDITOR, options, object, property);
        const editorID = core_1.uniqueID();
        const newWindow = window.open("index.html#!nestedEditor=" + editorID, "nested_chart_" + options.specification._id);
        const listener = (e) => {
            if (e.origin == document.location.origin) {
                const data = e.data;
                if (data.id == editorID) {
                    switch (data.type) {
                        case "initialized" /* Initialized */:
                            {
                                const builder = new template_1.ChartTemplateBuilder(options.specification, options.dataset, this.chartManager, CHARTICULATOR_PACKAGE.version);
                                const template = builder.build();
                                newWindow.postMessage({
                                    id: editorID,
                                    type: application_1.NestedEditorEventType.Load,
                                    specification: options.specification,
                                    dataset: options.dataset,
                                    width: options.width,
                                    template,
                                    height: options.height,
                                    filterCondition: options.filterCondition,
                                }, document.location.origin);
                            }
                            break;
                        case "save" /* Save */:
                            {
                                this.setProperty({
                                    object,
                                    property: property.property,
                                    field: property.field,
                                    value: data.specification,
                                    noUpdateState: property.noUpdateState,
                                    noComputeLayout: property.noComputeLayout,
                                });
                            }
                            break;
                    }
                }
            }
        };
        window.addEventListener("message", listener);
    });
}
exports.default = default_1;
//# sourceMappingURL=document.js.map
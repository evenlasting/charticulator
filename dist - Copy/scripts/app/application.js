"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable max-lines-per-function */
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
exports.Application = exports.NestedEditorEventType = exports.ApplicationExtensionContext = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const main_view_1 = require("./main_view");
const stores_1 = require("./stores");
const views_1 = require("./views");
const core_1 = require("../core");
const worker_1 = require("../worker");
const utils_1 = require("./utils");
const actions_1 = require("./actions");
const file_view_1 = require("./views/file_view");
const default_dataset_1 = require("./default_dataset");
const strings_1 = require("../strings");
const globals_1 = require("./globals");
// Also available from @uifabric/icons (7 and earlier) and @fluentui/font-icons-mdl2 (8+)
const index_1 = require("../fabric-icons/src/index");
index_1.initializeIcons();
const defaults_1 = require("./stores/defaults");
const specification_1 = require("../core/specification");
const app_store_1 = require("./stores/app_store");
class ApplicationExtensionContext {
    constructor(app) {
        this.app = app;
    }
    getGlobalDispatcher() {
        return this.app.appStore.dispatcher;
    }
    /** Get the store */
    getAppStore() {
        return this.app.appStore;
    }
    getApplication() {
        return this.app;
    }
}
exports.ApplicationExtensionContext = ApplicationExtensionContext;
var NestedEditorEventType;
(function (NestedEditorEventType) {
    NestedEditorEventType["Load"] = "load";
    NestedEditorEventType["Save"] = "save";
})(NestedEditorEventType = exports.NestedEditorEventType || (exports.NestedEditorEventType = {}));
class Application {
    getpageView(store) {
        return React.createElement(views_1.PageView, { store: store });
    }
    getAppStore() {
        return this.appStore;
    }
    destroy() {
        ReactDOM.unmountComponentAtNode(document.getElementById(this.containerID));
    }
    initialize(config, containerID, workerConfig, localizaiton, handlers) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.containerID = containerID;
            yield core_1.initialize(config);
            if (workerConfig.worker) {
                this.worker = workerConfig.worker;
            }
            else {
                this.worker = new worker_1.CharticulatorWorker(workerConfig.workerScriptContent);
            }
            yield this.worker.initialize(config);
            this.appStore = new stores_1.AppStore(this.worker, default_dataset_1.makeDefaultDataset());
            if (handlers === null || handlers === void 0 ? void 0 : handlers.nestedEditor) {
                this.nestedEditor = handlers === null || handlers === void 0 ? void 0 : handlers.nestedEditor;
                if (handlers === null || handlers === void 0 ? void 0 : handlers.nestedEditor.onOpenEditor) {
                    this.appStore.addListener(stores_1.AppStore.EVENT_OPEN_NESTED_EDITOR, (options, object, property) => {
                        this.nestedEditor.onOpenEditor(options, object, property);
                    });
                }
            }
            try {
                const CurrencySymbol = core_1.parseSafe(window.localStorage.getItem(globals_1.LocalStorageKeys.CurrencySymbol), core_1.defaultCurrency);
                const DelimiterSymbol = core_1.parseSafe(window.localStorage.getItem(globals_1.LocalStorageKeys.DelimiterSymbol) ||
                    core_1.defaultDelimiter, core_1.defaultDelimiter);
                const GroupSymbol = core_1.parseSafe(window.localStorage.getItem(globals_1.LocalStorageKeys.GroupSymbol), core_1.defaultDigitsGroup);
                const NumberFormatRemove = core_1.parseSafe(window.localStorage.getItem(globals_1.LocalStorageKeys.NumberFormatRemove) ||
                    core_1.defaultNumberFormat.remove, core_1.defaultNumberFormat.remove);
                this.appStore.setLocaleFileFormat({
                    currency: core_1.parseSafe(CurrencySymbol, core_1.defaultCurrency),
                    delimiter: DelimiterSymbol,
                    group: core_1.parseSafe(GroupSymbol, core_1.defaultDigitsGroup),
                    numberFormat: {
                        decimal: NumberFormatRemove === "," ? "." : ",",
                        remove: NumberFormatRemove === "," ? "," : ".",
                    },
                });
                core_1.setFormatOptions({
                    currency: core_1.parseSafe(CurrencySymbol, core_1.defaultCurrency),
                    grouping: core_1.parseSafe(GroupSymbol, core_1.defaultDigitsGroup),
                    decimal: NumberFormatRemove === "," ? "." : ",",
                    thousands: NumberFormatRemove === "," ? "," : ".",
                });
            }
            catch (ex) {
                core_1.setFormatOptions({
                    currency: (_a = [localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.currency, ""]) !== null && _a !== void 0 ? _a : core_1.defaultCurrency,
                    grouping: core_1.defaultDigitsGroup,
                    decimal: (_b = localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.decemalDelimiter) !== null && _b !== void 0 ? _b : core_1.defaultNumberFormat.decimal,
                    thousands: (_c = localizaiton === null || localizaiton === void 0 ? void 0 : localizaiton.thousandsDelimiter) !== null && _c !== void 0 ? _c : core_1.defaultNumberFormat.decimal,
                });
                console.warn("Loadin localization settings failed");
            }
            window.mainStore = this.appStore;
            ReactDOM.render(React.createElement(main_view_1.MainView, { store: this.appStore, ref: (e) => (this.mainView = e), viewConfiguration: this.config.MainView, menuBarHandlers: handlers === null || handlers === void 0 ? void 0 : handlers.menuBarHandlers, tabButtons: handlers === null || handlers === void 0 ? void 0 : handlers.tabButtons, telemetry: handlers === null || handlers === void 0 ? void 0 : handlers.telemetry }), document.getElementById(containerID));
            this.extensionContext = new ApplicationExtensionContext(this);
            // Load extensions if any
            if (config.Extensions) {
                config.Extensions.forEach((ext) => {
                    const scriptTag = document.createElement("script");
                    if (typeof ext.script == "string") {
                        scriptTag.src = ext.script;
                    }
                    else {
                        scriptTag.integrity = ext.script.integrity;
                        scriptTag.src = ext.script.src + "?sha256=" + ext.script.sha256;
                    }
                    scriptTag.onload = () => {
                        // An extension may include script for its initialization
                        const initFn = new Function("application", ext.initialize);
                        initFn(this);
                    };
                    document.body.appendChild(scriptTag);
                });
            }
            yield this.processHashString();
        });
    }
    // eslint-disable-next-line
    setupNestedEditor(id, onInitialized, onSave, onClose, editorMode) {
        const appStore = this.appStore;
        const setupCallback = ((data) => {
            var _a;
            const info = data;
            info.specification.mappings.width = {
                type: specification_1.MappingType.value,
                value: info.width,
            };
            info.specification.mappings.height = {
                type: specification_1.MappingType.value,
                value: info.height,
            };
            const chartManager = new core_1.Prototypes.ChartStateManager(info.specification, info.dataset, null, {}, {}, core_1.deepClone(info.specification));
            // if version wasn't saved in tempalte we asume it is 2.0.3
            if (info.template && info.template.version == undefined) {
                info.template.version = defaults_1.defaultVersionOfTemplate;
            }
            const newState = new stores_1.Migrator().migrate({
                chart: chartManager.chart,
                chartState: chartManager.chartState,
                dataset: chartManager.dataset,
                version: ((_a = info.template) === null || _a === void 0 ? void 0 : _a.version) || defaults_1.defaultVersionOfTemplate,
                originDataset: appStore.originDataset,
            }, CHARTICULATOR_PACKAGE.version);
            appStore.dispatcher.dispatch(new actions_1.Actions.ImportChartAndDataset(info.specification, info.dataset, {
                filterCondition: info.filterCondition,
            }, info.originSpecification));
            if (info.template) {
                info.template.version = newState.version;
            }
            if (onClose) {
                appStore.addListener(stores_1.AppStore.EVENT_NESTED_EDITOR_CLOSE, () => {
                    onClose();
                });
            }
            let type = this.config.CorsPolicy && this.config.CorsPolicy.Embedded
                ? app_store_1.EditorType.Embedded
                : app_store_1.EditorType.Nested;
            // settings from outside overrides the configuration
            if (editorMode) {
                type = editorMode;
            }
            appStore.setupNestedEditor((newSpecification) => {
                const template = core_1.deepClone(appStore.buildChartTemplate());
                if (window.opener) {
                    window.opener.postMessage({
                        id,
                        type: "save" /* Save */,
                        specification: newSpecification,
                        template,
                    }, document.location.origin);
                }
                else {
                    if (this.config.CorsPolicy && this.config.CorsPolicy.TargetOrigins) {
                        window.parent.postMessage({
                            id,
                            type: "save" /* Save */,
                            specification: newSpecification,
                            template,
                        }, this.config.CorsPolicy.TargetOrigins);
                    }
                    if ((this.config.CorsPolicy && this.config.CorsPolicy.Embedded) ||
                        onSave) {
                        onSave({
                            specification: newSpecification,
                            template,
                        });
                    }
                }
            }, type);
        }).bind(this);
        window.addEventListener("message", (e) => {
            if (e.data.id != id) {
                return;
            }
            setupCallback(e.data);
        });
        if (window.opener) {
            window.opener.postMessage({
                id,
                type: "initialized" /* Initialized */,
            }, document.location.origin);
        }
        else {
            if (this.config.CorsPolicy && this.config.CorsPolicy.TargetOrigins) {
                window.parent.postMessage({
                    id,
                    type: "initialized" /* Initialized */,
                }, this.config.CorsPolicy.TargetOrigins);
            }
            else if ((this.config.CorsPolicy &&
                this.config.CorsPolicy.Embedded &&
                onInitialized) ||
                onInitialized) {
                onInitialized(id, (data) => {
                    setupCallback(data);
                });
            }
        }
    }
    processHashString() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load saved state or data from hash
            const hashParsed = utils_1.parseHashString(document.location.hash);
            if (hashParsed.nestedEditor) {
                document.title = strings_1.strings.app.nestedChartTitle;
                this.setupNestedEditor(hashParsed.nestedEditor);
            }
            else if (hashParsed.loadDataset) {
                // Load from a dataset specification json format
                const spec = JSON.parse(hashParsed.dataset);
                const loader = new core_1.Dataset.DatasetLoader();
                const dataset = yield loader.loadDatasetFromSourceSpecification(spec);
                this.appStore.dispatcher.dispatch(new actions_1.Actions.ImportDataset(dataset));
            }
            else if (hashParsed.loadCSV) {
                // Quick load from one or two CSV files
                // default to comma delimiter, and en-US number format
                const localeFileFormat = {
                    delimiter: core_1.defaultDelimiter,
                    numberFormat: core_1.defaultNumberFormat,
                    currency: null,
                    group: null,
                };
                const spec = {
                    tables: hashParsed.loadCSV
                        .split("|")
                        .map((x) => ({ url: x, localeFileFormat })),
                };
                const loader = new core_1.Dataset.DatasetLoader();
                const dataset = yield loader.loadDatasetFromSourceSpecification(spec);
                this.appStore.dispatcher.dispatch(new actions_1.Actions.ImportDataset(dataset));
            }
            else if (hashParsed.load) {
                // Load a saved state
                const value = yield fetch(hashParsed.load);
                const json = yield value.json();
                this.appStore.dispatcher.dispatch(new actions_1.Actions.Load(json.state));
            }
            else {
                this.mainView.refMenuBar.showFileModalWindow(file_view_1.MainTabs.new);
            }
        });
    }
    addExtension(extension) {
        extension.activate(this.extensionContext);
    }
    registerExportTemplateTarget(name, ctor) {
        this.appStore.registerExportTemplateTarget(name, ctor);
    }
    unregisterExportTemplateTarget(name) {
        this.appStore.unregisterExportTemplateTarget(name);
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map
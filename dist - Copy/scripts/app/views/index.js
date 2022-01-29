"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// export * from "./canvas/canvas_view";
var dataset_view_1 = require("./dataset/dataset_view");
Object.defineProperty(exports, "DatasetView", { enumerable: true, get: function () { return dataset_view_1.DatasetView; } });
// export * from "./canvas/marks";
var mark_editor_1 = require("./canvas/mark_editor");
Object.defineProperty(exports, "MarkEditorView", { enumerable: true, get: function () { return mark_editor_1.MarkEditorView; } });
var chart_editor_1 = require("./canvas/chart_editor");
Object.defineProperty(exports, "ChartEditorView", { enumerable: true, get: function () { return chart_editor_1.ChartEditorView; } });
var panels_1 = require("./panels");
Object.defineProperty(exports, "AttributePanel", { enumerable: true, get: function () { return panels_1.AttributePanel; } });
var file_view_1 = require("./file_view");
Object.defineProperty(exports, "FileView", { enumerable: true, get: function () { return file_view_1.FileView; } });
var page_view_1 = require("./page_view");
Object.defineProperty(exports, "PageView", { enumerable: true, get: function () { return page_view_1.PageView; } });
var svgEdit_1 = require("./svgEdit");
Object.defineProperty(exports, "NewEditor", { enumerable: true, get: function () { return svgEdit_1.NewEditor; } });
// import * as React from 'react';
// export class NewEditor extends React.Component<any, any> {
//     render() {
//       return (
//         <div/>
//       );
//     }
//   }
//# sourceMappingURL=index.js.map
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderChartToLocalString = exports.renderChartToString = exports.ChartDisplayView = void 0;
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const core_1 = require("../../../core");
const strings_1 = require("../../../strings");
const renderer_1 = require("../../renderer");
class ChartDisplayView extends React.Component {
    render() {
        const chartState = this.props.manager.chartState;
        const width = chartState.attributes.width;
        const height = chartState.attributes.height;
        const renderer = new core_1.Graphics.ChartRenderer(this.props.manager);
        const graphics = renderer.render();
        return (React.createElement("svg", { x: 0, y: 0, width: width, height: height, viewBox: `0 0 ${width.toFixed(6)} ${height.toFixed(6)}`, 
            /* eslint-disable-next-line */
            xmlns: "http://www.w3.org/2000/svg", 
            /* eslint-disable-next-line */
            xmlnsXlink: "http://www.w3.org/1999/xlink", xmlSpace: "preserve" },
            React.createElement("g", { transform: `translate(${(width / 2).toFixed(6)},${(height / 2).toFixed(6)})` },
                React.createElement(renderer_1.GraphicalElementDisplay, { element: graphics }),
                renderer.renderControls(this.props.manager.chart, this.props.manager.chartState, {
                    centerX: 0,
                    centerY: 0,
                    scale: 1,
                }))));
    }
}
exports.ChartDisplayView = ChartDisplayView;
function renderChartToString(dataset, chart, chartState) {
    const manager = new core_1.Prototypes.ChartStateManager(chart, dataset, chartState);
    return ReactDOMServer.renderToString(React.createElement(ChartDisplayView, { manager: manager }));
}
exports.renderChartToString = renderChartToString;
function renderChartToLocalString(dataset, chart, chartState) {
    const manager = new core_1.Prototypes.ChartStateManager(chart, dataset, chartState);
    const width = chartState.attributes.width;
    const height = chartState.attributes.height;
    const renderer = new core_1.Graphics.ChartRenderer(manager);
    const graphics = renderer.render();
    const urls = new Map();
    const allTasks = [];
    renderer_1.renderGraphicalElementSVG(graphics, {
        chartComponentSync: true,
        externalResourceResolver: (url) => {
            const task = new Promise((resolve, reject) => {
                const img = new Image();
                img.setAttribute("crossOrigin", "anonymous");
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext("2d").drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => {
                    reject(new Error(strings_1.strings.error.imageLoad(url)));
                };
                img.src = url;
            }).then((dataurl) => {
                urls.set(url, dataurl);
            });
            allTasks.push(task);
            return url;
        },
    });
    return Promise.all(allTasks).then(() => {
        return ReactDOMServer.renderToString(React.createElement("svg", { x: 0, y: 0, width: width, height: height, viewBox: `0 0 ${width.toFixed(6)} ${height.toFixed(6)}`, 
            /* eslint-disable-next-line */
            xmlns: "http://www.w3.org/2000/svg", 
            /* eslint-disable-next-line */
            xmlnsXlink: "http://www.w3.org/1999/xlink", xmlSpace: "preserve" },
            React.createElement("g", { transform: `translate(${(width / 2).toFixed(6)},${(height / 2).toFixed(6)})` }, renderer_1.renderGraphicalElementSVG(graphics, {
                chartComponentSync: true,
                externalResourceResolver: (url) => urls.get(url),
            }))));
    });
}
exports.renderChartToLocalString = renderChartToLocalString;
//# sourceMappingURL=chart_display.js.map
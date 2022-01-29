"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableView = void 0;
/**
 * See {@link DatasetView} or {@link TableView}
 * @packageDocumentation
 * @preferred
 */
const React = require("react");
const utils_1 = require("../../utils");
const react_1 = require("@fluentui/react");
/**
 * Component for displaying data samples on loading or in context menu of {@link DatasetView}
 *
 * ![Table view](media://table_view.png)
 *
 * ![Table view](media://table_view_leftside.png)
 */
class TableView extends React.Component {
    render() {
        const table = this.props.table;
        const onTypeChange = this.props.onTypeChange;
        let maxRows = table.rows.length;
        if (this.props.maxRows != null) {
            if (maxRows > this.props.maxRows) {
                maxRows = this.props.maxRows;
            }
        }
        return (React.createElement("table", { className: "charticulator__dataset-table-view" },
            React.createElement("thead", null,
                React.createElement("tr", null, table.columns
                    .filter((c) => !c.metadata.isRaw)
                    .map((c) => (React.createElement("th", { key: c.name }, c.name))))),
            React.createElement("tbody", null,
                onTypeChange && (React.createElement("tr", { key: -1 }, table.columns
                    .filter((c) => !c.metadata.isRaw)
                    .map((c, index) => {
                    const convertableTypes = utils_1.getConvertableTypes(c.type, table.rows.slice(0, 10).map((row) => row[c.name]));
                    return (React.createElement("td", { key: `${c.name}-${index}` }, React.createElement(react_1.Dropdown, { onChange: (ev, newType) => {
                            onTypeChange(c.name, newType.key);
                            this.forceUpdate();
                        }, styles: {
                            title: {
                                borderWidth: "0px",
                            },
                        }, selectedKey: c.type, options: convertableTypes.map((type) => {
                            const str = type.toString();
                            return {
                                key: type,
                                text: str[0].toUpperCase() + str.slice(1),
                            };
                        }) })));
                }))),
                table.rows.slice(0, maxRows).map((r) => (React.createElement("tr", { key: r._id }, table.columns
                    .filter((c) => !c.metadata.isRaw)
                    .map((c, index) => {
                    if (c.metadata.rawColumnName) {
                        return (React.createElement("td", { key: `${c.name}-${index}` }, r[c.metadata.rawColumnName] != null &&
                            r[c.metadata.rawColumnName].toString()));
                    }
                    else {
                        return (React.createElement("td", { key: `${c.name}-${index}` }, r[c.name] != null && r[c.name].toString()));
                    }
                })))),
                table.rows.length > maxRows ? (React.createElement("tr", null, table.columns
                    .filter((c) => !c.metadata.isRaw)
                    .map((c, i) => i == 0 ? (React.createElement("td", { key: i },
                    "(",
                    table.rows.length - maxRows,
                    " more rows)")) : (React.createElement("td", { key: i }, "..."))))) : null)));
    }
}
exports.TableView = TableView;
//# sourceMappingURL=table_view.js.map
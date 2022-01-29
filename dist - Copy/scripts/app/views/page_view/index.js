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
exports.PageView = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
const React = require("react");
const stores_1 = require("../../stores");
const utils_1 = require("../../utils");
class PageView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            svgDataURL: null,
        };
        this.renderImage();
        this.props.store.addListener(stores_1.AppStore.EVENT_GRAPHICS, () => {
            this.renderImage();
        });
    }
    renderImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const svg = yield this.props.store.renderLocalSVG();
            this.setState({
                svgDataURL: utils_1.stringToDataURL("image/svg+xml", svg),
            });
        });
    }
    render() {
        return React.createElement("img", { src: this.state.svgDataURL, className: "full_size" });
    }
}
exports.PageView = PageView;
//# sourceMappingURL=index.js.map
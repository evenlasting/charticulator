"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleClass = void 0;
const common_1 = require("../common");
class ScaleClass extends common_1.ObjectClass {
    // eslint-disable-next-line
    buildConstraint(
    // eslint-disable-next-line
    data, 
    // eslint-disable-next-line
    target, 
    // eslint-disable-next-line
    solver
    // eslint-disable-next-line
    ) { }
    getTemplateParameters() {
        return {
            inferences: [
                {
                    objectID: this.object._id,
                    autoDomainMax: this.object.properties.autoDomainMax,
                    autoDomainMin: this.object.properties.autoDomainMin,
                    scale: {
                        classID: this.object.classID,
                        expressions: [],
                        properties: {
                            mapping: "mapping",
                        },
                    },
                },
            ],
        };
    }
}
exports.ScaleClass = ScaleClass;
ScaleClass.metadata = {
    displayName: "Scale",
    iconPath: "scale/scale",
};
//# sourceMappingURL=scale.js.map
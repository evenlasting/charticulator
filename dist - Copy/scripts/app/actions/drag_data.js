"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExpression = exports.DropZoneData = exports.ScaffoldType = exports.ObjectType = void 0;
class ObjectType {
    constructor(classID, options = null) {
        this.classID = classID;
        this.options = options;
    }
}
exports.ObjectType = ObjectType;
class ScaffoldType {
    constructor(type) {
        this.type = type;
    }
}
exports.ScaffoldType = ScaffoldType;
class DropZoneData {
}
exports.DropZoneData = DropZoneData;
class DataExpression extends DropZoneData {
    constructor(table, expression, valueType, metadata = null, rawColumnExpression, scaleID, allowSelectValue, type) {
        super();
        this.table = table;
        this.expression = expression;
        this.valueType = valueType;
        this.metadata = metadata;
        this.rawColumnExpression = rawColumnExpression;
        this.scaleID = scaleID;
        this.allowSelectValue = allowSelectValue;
        this.type = type;
    }
}
exports.DataExpression = DataExpression;
//# sourceMappingURL=drag_data.js.map
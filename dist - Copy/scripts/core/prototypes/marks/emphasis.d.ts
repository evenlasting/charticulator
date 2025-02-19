import { Style } from "../../graphics";
import { MarkClass } from "./mark";
import { ObjectClass } from "../object";
import { ObjectState, EmphasisMethod, AttributeMap } from "../../specification";
import { Specification } from "../../../container";
/**
 * Represents a mark class that is emphasizable
 */
export declare abstract class EmphasizableMarkClass<PropertiesType extends AttributeMap = AttributeMap, AttributesType extends AttributeMap = AttributeMap> extends MarkClass<PropertiesType, AttributesType> {
    private defaultMethod;
    constructor(parent: ObjectClass, object: Specification.Object<PropertiesType>, state: ObjectState<AttributesType>, defaultMethod?: EmphasisMethod);
    /**
     * Generates styling info for styling emphasized marks
     * @param emphasize If true, emphasis will be applied.
     */
    protected generateEmphasisStyle(emphasize?: boolean): Style;
}

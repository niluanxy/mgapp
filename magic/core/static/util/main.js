import templayed from "LIB_MINJS/templayed.js";
import Defer from "LIB_MINJS/promise.js";
import {isTrueString} from "CORE_FUNCTION/check.js";

export function tpl(template, data) {
    if (isTrueString(template) && data) {
        return templayed(template)(data);
    } else {
        return "";
    }
}

export function defer() {
    return new Defer();
}
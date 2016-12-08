import {isTrueString, isObject} from "LIB_MINJS/check.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import {append} from "CORE_MODULE/dom/editer/main.js";
import {element} from "LIB_MINJS/utils.js";
import templayed from "LIB_MINJS/templayed.js";

function tplProxy(template, data) {
    var el = element(this), tpls;

    if (el && isTrueString(template) && isObject(data)) {
        tpls = templayed(template)(data);
        append.call(el, tpls);
    }

    return this;
}

export function tpl(template, data, setAll) {
    return allProxy.call(this, tplProxy, template, data, setAll);
}
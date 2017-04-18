import {isTrueString, isObject} from "LIB_MINJS/check.js";
import {allProxy} from "MG_MAGIC/proxy.js";
import {html} from "MG_MODULE/dom/attrbute/main.js";
import {element} from "LIB_MINJS/utils.js";
import templayed from "LIB_MINJS/templayed.js";

function tplProxy(template, data) {
    var el = element(this), tpls;

    if (el && isTrueString(template) && isObject(data)) {
        tpls = templayed(template)(data);
        html.call(el, tpls);
    }

    return this;
}

export function tpl(template, data, setAll) {
    return allProxy.call(this, tplProxy, template, data, setAll);
}

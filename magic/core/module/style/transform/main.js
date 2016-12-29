import RootMagic from "CORE_MAGIC/main.js";
import {element} from "LIB_MINJS/utils.js";
import {isTrueString} from "LIB_MINJS/check.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import Transform from "LIB_MINJS/transform.js";


function transformProxy(aKey, aVal) {
    var el = element(this);

    if (el && isTrueString(aKey)) {
        if (!el._translateInit) {
            Transform(el);
            el._translateInit = true;
        }

        if (aVal !== undefined) {
            el[aKey] = aVal;
        } else {
            return el[aKey];
        }
    }

    return this;
}

export function transform(aKey, aVal, setAll){
    return allProxy.call(this, transformProxy, aKey, aVal, setAll);
}
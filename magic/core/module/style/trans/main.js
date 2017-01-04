import RootMagic from "CORE_MAGIC/main.js";
import {element} from "LIB_MINJS/utils.js";
import {isTrueString} from "LIB_MINJS/check.js";
import {css} from "CORE_MODULE/style/other/main.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import Transform from "LIB_MINJS/transform.js";

var KEY_TRANSFROM = "transform", KEY_TRANSTION = "transition";

function transformProxy(aKey, aVal) {
    var el = element(this);

    if (el && isTrueString(aKey)) {
        if (!el._transformInit) {
            Transform(el);
            el._transformInit = true;
        }

        if (aVal !== undefined) {
            el[aKey] = aVal;
        } else {
            return el[aKey];
        }
    }

    return this;
}

export function transform(aKey, aVal, setAll) {
    return allProxy.call(this, transformProxy, aKey, aVal, setAll);
}

function transitionProxy(aVal) {
    var el = element(this), SKEY = RootMagic.stylePrefix + KEY_TRANSTION;

    if (el) {
        if (aVal !== undefined) {
            css.call(el, SKEY, aVal);
        } else {
            return css.call(el, SKEY);
        }
    }

    return this;
}

export function transition(aVal, setAll) {
    return allProxy.call(this, transitionProxy, aVal, setAll);
}
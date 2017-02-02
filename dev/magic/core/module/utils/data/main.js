import {allProxy} from "MG_FUNCTION/proxy.js";
import {element} from "LIB_MINJS/utils.js";
import {dataCore, removeDataCore} from "MG_MAGIC/tools.js";

function dataProxy(aKey, aVal) {
    var el = element(this);

    if (aKey && aVal === undefined) {
        return dataCore(el, aKey);
    } else {
        dataCore(el, aKey, aVal);
    }

    return this;
}

export function data(aKey, aVal, setAll) {
    return allProxy.call(this, dataProxy, aKey, aVal, setAll);
}

function removeDataProxy(aKey) {
    var el = element(this);

    removeDataCore(el, aKey);

    return this;
}

export function removeData(aKey, setAll) {
    return allProxy.call(this, removeDataProxy, aKey, setAll);
}
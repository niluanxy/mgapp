import {element} from "LIB_MINJS/utils.js";

var NAME_STYLE = "_MG_STYLE_",
    NAME_EVENT = "_MG_EVENT_",
    NAME_CORE  = "_MG_CORE_";

function tryVal(ele, space, aKey, aVal) {
    var el = element(ele), data = el[space];
    if (!data) data = el[space] = {};

    if (aKey && aVal !== undefined) {
        data[aKey] = aVal;
        return true;
    } else if (aKey) {
        return data[aKey];
    }

    return null;
}

function delKey(ele, space, aKey) {
    var el = element(ele), data = el[space];

    if (data) delete data[aKey];

    return true;
}

export function dataStyle(el, aKey, aVal) {
    return tryVal(el, NAME_STYLE, aKey, aVal);
}

export function dataCore(el, aKey, aVal) {
    return tryVal(el, NAME_CORE, aKey, aVal);
}

export function removeDataCore(el, aKey) {
    return delKey(el, NAME_CORE, aKey);
}

export function dataEvent(el, aKey, aVal) {
    return tryVal(el, NAME_EVENT, aKey, aVal);
}
import templayed from "LIB_MINJS/templayed.js";
import Defer from "LIB_MINJS/promise.js";
import {isTrueString} from "LIB_MINJS/check.js";
import emitterBase from "LIB_MINJS/emitter.js";
import {uuid as uuidBase} from "LIB_MINJS/utils.js";

export var emitter = emitterBase;

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

export function random(min, max) {
    if (min && max && min != max) {
        return parseInt(Math.random()*(max-min+1)+min,10);
    } else {
        return (''+Math.random()).replace(/\D/g, '').replace(/^0*/, '');
    }
}

export var uuid = uuidBase;

export function time() {
    return new Date().getTime();
}

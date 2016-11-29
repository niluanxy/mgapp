import templayed from "LIB_MINJS/templayed.js";
import Defer from "LIB_MINJS/promise.js";
import fastBase from "LIB_MINJS/fastcall.js";
import {isTrueString} from "LIB_MINJS/check.js";

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

export function time() {
    return new Date().getTime();
}

export var fastCall = fastBase;
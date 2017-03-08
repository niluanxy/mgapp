import templayed from "LIB_MINJS/templayed.js";
import Defer from "LIB_MINJS/promise.js";
import {isTrueString} from "LIB_MINJS/check.js";
import emitterBase from "LIB_MINJS/emitter.js";

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

export function uuid(stand) {
    var d = new Date().getTime(), uuid;

    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });

    return stand ? uuid : uuid.replace(/-/g, '');
}

export function time() {
    return new Date().getTime();
}

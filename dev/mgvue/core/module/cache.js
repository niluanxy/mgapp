import MagicVue from "MV_BASE/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isFunction, isObject, isElement, isArray} from "LIB_MINJS/check.js";

var VIEW_CACHE = [], CFG = MagicVue.config; CFG.maxViewCache = 3;

export function pushView(id, dom, vueScope) {
    VIEW_CACHE.push({
        el: dom,
        uuid: id,
        scope: vueScope
    });

    if (VIEW_CACHE.length > CFG.maxViewCache) {
        VIEW_CACHE.shift();
    }
}

export function popView(id) {
    var pop = null, pos = null;

    if (id != null) {
        var find = findView(id) || {};

        pos = find.index || null;
        pop = find.view || null;
    } else {
        pop = VIEW_CACHE.pop();
        pos = pop ? VIEW_CACHE.length-1 : null;
    }

    for(var i=pos; i<=VIEW_CACHE.length; i++) {
        if (VIEW_CACHE.pop()) i--;
    }

    return pop;
}

export function findView(id) {
    var len = VIEW_CACHE.length;

    for(var i=0; i<len; i++) {
        var find = VIEW_CACHE[i];

        if (find && find.uuid == id) {
            return {index: i, view: find};
        }
    }

    return null;
}

export function lastView() {
    var len = VIEW_CACHE.length;

    return VIEW_CACHE[len-1] || null;
}

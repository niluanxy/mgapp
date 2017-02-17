import MagicVue from "MV_BASE/main.js";
import Router from "LIB_MINJS/router.js";
import {extend} from "LIB_MINJS/utils.js";
import {isObject, isFunction} from "LIB_MINJS/check.js";

var RootRouter, Tables;

function callApply(eveName, before, after) {
    return function() {
        var args = extend([], arguments);

        args.unshift(eveName);
        if (isFunction(before)) before();
        MagicVue.emit.apply(MagicVue.emit, args);
        if (isFunction(after)) after();
    }
}

MagicVue.route = function(map, options) {
    if (RootRouter) {
        RootRouter.on(map, options);
    } else if (isObject(map)) {
        Tables = map;
    }

    return MagicVue;
}

MagicVue.init = function(option, repath) {
    option = option || {};
    option.repath = !!repath;

    option.onBefore = callApply("mgRouteBefore");
    option.onEmit   = callApply("mgRouteEmit");
    option.onAfter  = callApply("mgRouteAfter");
    option.onAlways = callApply("mgRouteAlways");

    RootRouter = Router(Tables || {}, option).init();
    MagicVue.location = RootRouter; Tables = null;

    return MagicVue;
}

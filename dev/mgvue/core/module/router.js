import MagicVue from "MV_BASE/main.js";
import Router from "LIB_MINJS/router.js";
import {extend, applyCall} from "LIB_MINJS/utils.js";
import {isObject, isFunction} from "LIB_MINJS/check.js";

var RootRouter = {}, Tables;

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
    if (RootRouter && RootRouter.on) {
        RootRouter.on(map, options);
    } else if (isObject(map)) {
        Tables = map;
    }

    return MagicVue;
}

MagicVue.init = function(option, repath) {
    var $Router, copy = ["emit", "go", "back", "on", "off"];

    option = option || {};
    option.repath = !!repath;

    option.onBefore = callApply("mgRouteBefore");
    option.onEmit   = callApply("mgRouteEmit");
    option.onAfter  = callApply("mgRouteAfter");
    option.onAlways = callApply("mgRouteAlways");

    $Router = Router(Tables || {}, option).init();
    for(var i=0; i<copy.length; i++) {
        var bindKey = copy[i];

        RootRouter[bindKey] = applyCall(bindKey, $Router);
    }

    MagicVue.location = RootRouter; Tables = null;

    return MagicVue;
}

export default RootRouter;

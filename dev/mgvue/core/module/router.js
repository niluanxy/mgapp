import MagicVue from "MV_CORE/base/main.js";
import Router from "LIB_MINJS/router.js";
import {extend, applyCall} from "LIB_MINJS/utils.js";
import {isObject, isFunction} from "LIB_MINJS/check.js";

var RootRouter = {}, Tables;

function callApply(eveName) {
    return function() {
        var args = extend([], arguments), result = false;

        MagicVue.once(eveName, function() { result = true });

        args.unshift(eveName);
        MagicVue.emit.apply(MagicVue.emit, args);

        // 尝试阻止路由后续的方法执行
        if (!result) this.stopImmediation();
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
    option.onAfter  = callApply("mgRouteAfter");
    option.onAlways = callApply("mgRouteAlways");
    option.onInit   = callApply("mgRouteInit");

    $Router = Router(Tables || {}, option);
    RootRouter.$route = $Router;
    for(var i=0; i<copy.length; i++) {
        var bindKey = copy[i];
        RootRouter[bindKey] = applyCall(bindKey, $Router);
    }

    // 异步初始化启动路由库组件
    setTimeout(function() { $Router.init() });
    MagicVue.location = $Router; Tables = null;

    return MagicVue;
}

export default RootRouter;

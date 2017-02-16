import MagicVue from "MV_BASE/main.js";
import Router from "LIB_MINJS/router.js";
import {isObject} from "LIB_MINJS/check.js";

var RootRouter, Tables;

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

    RootRouter = Router(Tables || {}, option).init();
    MagicVue.location = RootRouter; Tables = null;

    return MagicVue;
}

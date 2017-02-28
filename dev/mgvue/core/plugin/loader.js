import MagicVue from "MV_BASE/main.js";
import templayed from "LIB_MINJS/templayed.js";
import {isFunction, isTrueString} from "LIB_MINJS/check.js";
import {addProxy as addClass} from "MG_MODULE/style/class/main.js";

import {viewModeBind} from "MV_MODULE/view.js";

var CFG = MagicVue.config.loader = {};

CFG.template  = '<div class="header"><h3 class="title">{{title}}</h3></div>';
CFG.template += '<div class="loading"></div>'
CFG.class     = "loader";
CFG.hideClass = "hide";

MagicVue.on("mgViewChange.viewLoader", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    var info = routeGo, view = viewGo, wrap = view.$$render;

    wrap = wrap && wrap.childNodes ? wrap.childNodes[1] : null;

    // 只对异步组件进行处理，同步组件直接忽略
    if (!(view instanceof MagicVue.Vue)) {
        if (isFunction(info.loader)) {
            info.loader(info, wrap, routeType);
        } else {
            wrap.innerHTML = templayed(CFG.template)(info);

            CFG.class += isTrueString(info.loadClass) ? " "+info.loadClass : "";
            addClass.call(wrap, CFG.class);
        }

        viewModeBind(view.$$name, "ready", function() {
            addClass.call(wrap, CFG.hideClass);
        });
    }
});

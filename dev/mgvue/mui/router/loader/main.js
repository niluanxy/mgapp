import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {isFunction, isTrueString} from "LIB_MINJS/check.js";
import {addProxy as addClass} from "MG_MODULE/style/class/main.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {renderHeader} from "MV_UIKIT/header/main.js";

var CFG = ConfigUI.loader = {};

CFG.template  = '<div class="loading"></div>';
CFG.class     = "loader";
CFG.hideClass = "hidden";

MagicVue.on("mgViewChange.viewLoader", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    var info = routeGo, view = viewGo, wrap = view.$$render, $wrap;

    wrap = wrap && wrap.childNodes ? wrap.childNodes[1] : null;
    $wrap = RootMagic(wrap);

    // 只对异步组件进行处理，同步组件直接忽略
    if (!(view instanceof MagicVue.Vue)) {
        if (isFunction(info.loader)) {
            info.loader(info, wrap, routeType);
        } else {
            CFG.class += isTrueString(info.loadClass) ? " "+info.loadClass : "";

            CFG.template = renderHeader(info) + CFG.template;
            $wrap.tpl(CFG.template, info)
                .removeClass(CFG.hideClass).addClass(CFG.class);
        }

        view.$$on("ready", function() {
            $wrap.addClass(CFG.hideClass);
        });

        $wrap.on("animationend", function() {
            $wrap.hide();
        });
    }
});

import Emitter from "LIB_MINJS/emitter.js";
import Ready from "LIB_MINJS/ready.js";
import {isFunction, isTrueString} from "LIB_MINJS/check.js";
import {extend, applyCall} from "LIB_MINJS/utils.js";
import Config from "MV_BASE/config.js";

var MagicVue = {}, RootEmitter = Emitter(), RootVue = new Vue();

MagicVue.config = Config;

// ========================================================
// 核心事件相关方法
// ========================================================
MagicVue.on   = applyCall("on", RootEmitter);
MagicVue.once = applyCall("once", RootEmitter);
MagicVue.off  = applyCall("off", RootEmitter);
MagicVue.emit = applyCall("emit", RootEmitter);
MagicVue.RootEmitter = RootEmitter;


// ========================================================
// Vue 相关接口对象全局暴露
// ========================================================
function vueApply(type, rootScope) {
    return function(ids, bind) {
        var result = null, rootBind = MagicVue[type];

        if (rootBind && isTrueString(ids)) {
            result = rootScope[type](ids, bind);

            if (bind) rootBind[ids] = bind;
        }

        return result;
    }
}

MagicVue.filter    = vueApply("filter", Vue);
MagicVue.directive = vueApply("directive", Vue);
MagicVue.component = vueApply("component", Vue);
MagicVue.Vue = Vue;
MagicVue.RootVue = RootVue;

MagicVue.use = applyCall("use", Vue);
MagicVue.mixin = applyCall("mixin", Vue);

// ========================================================
// 全局对象绑定方法
// ========================================================
MagicVue.$mount = (function() {
    var hasRun = false, $bind;

    return function(bind, callback) {
        if (hasRun) return;

        hasRun = true;
        Ready(function() {
            if (isFunction(bind)) {
                callback = bind; bind = "";
            }

            try {
                $bind = document.querySelectorAll(bind);
            } catch(error) {} finally {
                if (!$bind || $bind.length == 0) {
                    $bind = document.createElement("div");
                    $bind.setAttribute("id", "app");

                    document.body.appendChild($bind);
                } else {
                    $bind = $bind[0];
                }
            }

            MagicVue.$root = $bind;
            if (isFunction(callback)) callback();
        });
    };
})();

export default MagicVue;

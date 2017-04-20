import Emitter from "LIB_MINJS/emitter.js";
import Ready from "LIB_MINJS/ready.js";
import Vue from "vue";
import {isFunction, isTrueString, isObject} from "LIB_MINJS/check.js";
import {extend, applyCall} from "LIB_MINJS/utils.js";
import Config from "MV_CORE/base/config.js";
import * as Tools from "MV_CORE/base/tools.js";

var MagicVue = {}, RootEmitter = Emitter(), RootVue = new Vue();

MagicVue.config = Config; extend(MagicVue, Tools);

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
MagicVue.nextTick  = vueApply("nextTick", Vue);
MagicVue.directive = vueApply("directive", Vue);
MagicVue.component = function(ids, bind, noFix) {
    var result = null, rootBind = MagicVue.component;

    if (rootBind && isTrueString(ids)) {
        if (!noFix && bind && isObject(bind.data)) {
            var oldData = bind.data;
            bind.data = function() {
                return extend({}, oldData);
            }
        }

        result = Vue.component(ids, bind);
        if (bind) rootBind[ids] = bind;
    }

    return result;
}
MagicVue.Vue = Vue;
MagicVue.RootVue = RootVue;

MagicVue.use = applyCall("use", Vue);
MagicVue.mixin = applyCall("mixin", Vue);


// ========================================================
// bind 初始化方法，在 mount 后执行
// ========================================================
MagicVue.$bind = function(callback) {
    RootEmitter.on("__MG__BIND", callback);

    return MagicVue;
}

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

            RootEmitter.emit("__MG__BIND");
            if (isFunction(callback)) callback();
        });
    };
})();

export default MagicVue;

import VueBase from "LIB_MINJS/vue.js";
import EmitterBase from "LIB_MINJS/emitter.js";
import {isFunction, isTrueString} from "LIB_MINJS/check.js";
import {extend, applyCall} from "LIB_MINJS/utils.js";

var MagicVue = {}, RootEmitter = Emitter(), RootVue = new Vue();


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

            if (bind) rootBind[ids] = result;
        }

        return result;
    }
}

MagicVue.filter    = vueApply("filter", RootVue);
MagicVue.component = vueApply("component", RootVue);
MagicVue.directive = vueApply("directive", RootVue);

MagicVue.Vue = Vue;
MagicVue.RootVue = RootVue;

MagicVue.use = applyCall("use", Vue);
MagicVue.mixin = applyCall("mixin", Vue);



export default MagicVue;
import MagicVue from "MV_BASE/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {removeProxy} from "MG_MODULE/dom/editer/main.js";
import {raf} from "MG_STATIC/function/main.js";
import {isFunction, isObject, isTrueString, isElement, isArray} from "LIB_MINJS/check.js";

import * as Cache from "MV_MODULE/cache.js";

var viewMixins, $CACHE_SHOW = null;

export function nameTrans(name, tag) {
    var ret = "ma-"+name;

    ret = ret.replace(/[\-|\\|\/]/g, "-");

    return tag ? "<"+ret+"></"+ret+">" : ret;
}

function createWraper(dom) {
    var $wrap = dom;

    if (!isElement($wrap)) {
        $wrap = document.createElement("div");
        $wrap.innerHTML = "<div></div><div></div>";
        $wrap.className = "view";

        MagicVue.$root.appendChild($wrap);
    }

    MagicVue.emit("mgWrapCreated", $wrap);
    return $wrap.childNodes[0];
}

export function renderView(name, params, $wrap) {
    if (!name.match(/^ma/)) name = nameTrans(name);

    var com = MagicVue.component(name), $parent,
        $render, $wraper = createWraper($wrap);

    if ($wraper != $wrap && $wraper.parentNode) {
        $parent = $wraper.parentNode;
        $parent.setAttribute("view", name);
    }

    $render = new com({ el: $wraper, name: name});

    // 保存到返回对象上，用于同步调用获取参数
    $render.$$name   = name;
    $render.$$render = $parent;

    // 保存到渲染元素上，用于异步组件获取参数
    $wraper.$$params = params || {};
    $wraper.$$render = $parent;

    return $render;
}

/**========================================================
 * view 对象核心扩展属性
 * ======================================================== */
function viewFactory(view) {
    var oldData = view.data, mixins;

    if (!isFunction(oldData)) {
        view.data = function() {
            return extend(true, {
                $params: {}
            }, oldData);
        }
    }

    if (isArray(view.mixins)) {
        view.mixins.push(viewMixins);
    } else {
        view.mixins = [viewMixins];
    }

    return view;
}

function viewParentFix(vueView) {
    var find = vueView.$el.parentNode, $parent;

    vueView.$el.$$scope = vueView;

    do {
        if (find && find.$$scope) {
            $parent = find.$$scope; break;
        }

        find = find.parentNode;
    } while(find && find != MagicVue.$root);

    if (!$parent) $parent = MagicVue.RootVue;
    vueView.$parent = $parent;
}

function makeModeCall(name, eve) {
    if (name.match("/^ma-/")) name = nameTrans(name);

    return "``_mg_view_"+name+"_call"+"."+eve;
}

export function viewModeEmit(scope, eve) {
    if (scope && scope.$options) {
        var name = scope.$options.name, call;

        if (scope.$$render && name) {
            call = makeModeCall(name, eve);
            MagicVue.emit(call, scope);
        }
    }
}

export function viewModeBind(name, eve, callback, onType) {
    if (isTrueString(name) && isTrueString(eve)) {
        var callEve = makeModeCall(name, eve),
            bind = onType ? "on" : "once";

        MagicVue[bind](callEve, callback);
    }
}

viewMixins = {
    created: function() {
        var self = this, $opt = self.$options, $el = $opt.el;

        // 尝试恢复 view 模式组件的渲染参数
        self.$$params = $el ? $el.$$params : {};
        self.$$render = $el ? $el.$$render : null;

        self.$params = self.$$params || {};
        self.$emit("mgViewCreated");

        // 尝试调用 view 模式页面回调事件
        viewModeEmit(self, "created");
    },

    mounted: function() {
        var self = this, $opt = self.$options;

        viewParentFix(self);
        self.$emit("mgViewReady", self.$$params);

        // 尝试调用 view 模式页面回调事件
        viewModeEmit(self, "ready");

        // 默认不是隐藏的页面，则立即触发 显示回调事件
        if (!self.$$defaultHide) {
            self.$emit("mgViewShow", self.$$params);
        } else {
            self.$emit("mgViewHide", self.$$params);
        }
    },

    beforeDestroy: function() {
        var self = this, delEl = self.$$render || self.$el;

        slef.$emit("mgViewHide", self.$$params);
        self.$emit("mgViewDestory");
        raf(function() { removeProxy.call(delEl) });
    }
};


/**========================================================
 * 异步组件加载方法，根据 Vue 和 Webpack 的要求
 * 结合两者，具体原理链接如下：
 *
 * https://cn.vuejs.org/v2/guide/components.html#异步组件
 * ======================================================== */
export function initView(resolve, name) {
    return function(view) {
        var fixView = viewFactory(view), fixName;

        fixName = isObject(resolve) ? resolve.name : name;
        fixName && MagicVue.component(fixName, fixView);

        if (resolve && resolve.el) {
            var component = MagicVue.component(fixName);
            new component({el: resolve.el, name: fixName});
        } else {
            resolve(fixView);
        }
    }
}

/**========================================================
 * 页面注册函数，注册到全局对象中
 * ======================================================== */
export function loadView(viewName, bindView) {
    var bindName = nameTrans(viewName), fixBind;

    // 若为对象，说明为同步加载页面，则调用 工厂函数 进行包装
    if (typeof bindView == "object") {
        fixBind = viewFactory(bindView);
    } else {
        fixBind = function(resolve) {
            bindView(resolve, bindName);
        };
    }

    MagicVue.component(bindName, fixBind);

    return function(url, routeType, routeGo, routeLast) {
        var goParams = extend(true, {}, routeGo.params),
            $viewGo, $viewLast, $cache, $del;

        // 尝试从缓存中获取页面对象
        if ($viewGo = Cache.findView(bindName)) {
            $cache = $viewGo;
            $viewGo = $viewGo.scope;

            $viewGo.$$params = goParams;
            $viewGo.$emit("mgViewShow", goParams);
        } else {
            $viewGo = renderView(bindName, goParams);
            $cache = {id: bindName, el: $viewGo.$$render, scope: $viewGo};
            $del = Cache.pushView($cache, $CACHE_SHOW ? $CACHE_SHOW.id : null);

            // 如果为异步组件，则需要在组件创建后更新 scope 对象
            if (!($viewGo instanceof MagicVue.Vue)) {
                viewModeBind(bindName, "created", function(scope) {
                    $cache.scope = scope;
                });
            }

            // 如果有溢出页面返回，执行页面销毁动作
            if ($del && $del.id && $del.scope && $del.el) {
                $del.scope.$emit("hook:beforeDestroy");
            }
        }

        $viewLast = $CACHE_SHOW ? $CACHE_SHOW.scope : null;
        $CACHE_SHOW = $cache;

        MagicVue.emit("mgViewChange", $viewGo, $viewLast, routeType, routeGo, routeLast);
    }
}

MagicVue.renderView = renderView;
MagicVue.initView = initView;
MagicVue.loadView = loadView;

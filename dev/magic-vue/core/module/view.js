import MagicVue from "MV_BASE/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isFunction, isElement, isArray, isTrueString} from "LIB_MINJS/check.js";

var Vue = MagicVue.Vue, viewMixins, mgViewWrapName = "mgViewRenderWrap";

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

        MagicVue.$root.appendChild($wrap);
    }

    return $wrap.childNodes[1];
}

export function renderView(name, params, $wrap) {
    if (!name.match(/^ma/)) name = nameTrans(name);

    var com = MagicVue.component(name),
        $render, $wraper = createWraper($wrap);

    if ($wraper != $wrap && $wraper.parentNode) {
        $wraper.parentNode.setAttribute("view", name);
    }
    $render = new com({ el: $wraper, name: name});

    $render.$$params = params || {};

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

viewMixins = {
    created: function() {
        var self = this, $parent = self.$parent;

        console.log("=============================")
        console.log("run created")

        // 设置页面的参数对象
        self.$params = self.$$params || {};

        if ($parent && $parent.$options.name == mgViewWrapName) {
            console.log("render by route");
        } else {
            console.log("render by views");
        }
    },

    mounted: function() {
        var self = this, $parent = self.$parent;

        viewParentFix(self);
        console.log("=============================")
        console.log("run mounted")
    },

    beforeDestroy: function() {
        console.log("=============================")
        console.log("run beforeDestroy")
    }
};


/**========================================================
 * 异步组件加载方法，根据 Vue 和 Webpack 的要求
 * 结合两者，具体原理链接如下：
 *
 * https://cn.vuejs.org/v2/guide/components.html#异步组件
 * ======================================================== */
export function initView(resolve) {
    return function(view) {
        var name = resolve.name, component;

        MagicVue.component(name, viewFactory(view));
        component = MagicVue.component(name);
        new component({el: resolve.el, name: name});
    }
}

/**========================================================
 * 页面注册函数，注册到全局对象中
 * ======================================================== */
export function loadView(viewName, bindView) {
    var bindName = nameTrans(viewName);

    // 若为对象，说明为同步加载页面，则调用 工厂函数 进行包装
    if (typeof bindView == "object") {
        bindView = viewFactory(bindView);
    }

    MagicVue.component(bindName, bindView);

    return function(url, routeType, routeGo, routeLast) {
        // var goParams = extend(true, {}, routeGo.params);

        renderView(viewName);
    }
}

MagicVue.renderView = renderView;
MagicVue.initView = initView;
MagicVue.loadView = loadView;

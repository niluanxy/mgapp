import MagicVue from "MV_BASE/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isFunction, isArray, isTrueString} from "LIB_MINJS/check.js";

function nameTrans(name, tag) {
    var ret = "ma-"+name;

    ret = ret.replace(/[\-|\\|\/]/g, "-");

    return tag ? "<"+ret+"></"+ret+">" : ret;
}


/**========================================================
 * view 对象核心扩展属性
 * ======================================================== */
var viewMixins = {
    created: function() {
        var self = this;

        this.$broadcast = function(/* eve, args... */) {
            var args = arguments;

            if (isTrueString(args[0])) {
                self.$emit.apply(self, args);

                MagicVue.broadcast.apply(MagicVue, args);
            }
        }

        this.$dispatch = function(/* eve, args... */) {
            var args = arguments;

            if (isTrueString(args[0])) {
                self.$emit.apply(self, args);

                MagicVue.dispatch.apply(MagicVue, args);
            }
        }


        this.$emit("mgViewCreated");
    },

    mounted: function() {
        this.$emit("mgViewReady");

        if (this.mgDefaultShow) {
            this.$emit("mgViewShow");
        }
    },

    beforeDestroy: function() {
        this.$emit("mgViewDestroy");
    }
};

function viewFactory(view) {
    var oldData = view.data, mixins;

    if (!isFunction(oldData)) {
        view.data = function() {
            return extend(true, {
                params: {}
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

/**========================================================
 * 异步组件加载方法，根据 Vue 和 Webpack 的要求
 * 结合两者，具体原理链接如下：
 *
 * https://cn.vuejs.org/v2/guide/components.html#异步组件
 * ======================================================== */
function initView(resolve) {
    return function(view) {
        // 实例初始化页面组件对象
        resolve(viewFactory(view));
    }
}

/**========================================================
 * 页面注册函数，注册到全局对象中
 * ======================================================== */
function loadView(viewName, viewOption) {
    var bindName = nameTrans(viewName), bindView;

    // 若为对象，说明为同步加载页面，则调用 工厂函数 进行包装
    if (typeof viewOption == "object") {
        bindView = viewFactory(viewOption);
    }

    MagicVue.component(bindName, bindView);

    return function(url, routeType, routeGo, routeLast) {
        var goParams = extend(true, {}, routeGo.params);



    }
}

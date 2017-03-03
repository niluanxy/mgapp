import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";
import {extend} from "LIB_MINJS/utils.js";

import $config from "MV_UIKIT/base/config.js";
import {value, getScope} from "MV_UIKIT/base/tools.js";

function createScroll(scope, CFG, options) {
    var self = scope, $el = $(self.$el), native = self.native,
        scrollOption, dir, bar, $ctrlScope, ctrlKey;

    native = native == null ? CFG.native : !!native;

    if (!native) {
        dir = self.direction; bar = self.scrollBar;

        scrollOption = { lockX: dir === "Y", lockY: dir === "X" };
        scrollOption.pointX = !scrollOption.lockX &&
            value(self.scrollBarX, bar, CFG.scrollBarX, CFG.scrollBar);
        scrollOption.pointY = !scrollOption.lockY &&
            value(self.scrollBarY, bar, CFG.scrollBarY, CFG.scrollBar);

        scrollOption = extend(scrollOption, options || {});
        self.$scroll = new Scroll($el, scrollOption).init();
        window.$$ctrl = self.$scroll;

        // 尝试绑定 ctrl 到页面中
        ctrlKey = self.ctrl;
        $ctrlScope = getScope(self, ctrlKey);
        if ($ctrlScope) $ctrlScope[ctrlKey] = self.$scroll;
    }
}

var CFG_BASE = {
    native: false,

    scrollBar : true,
    scrollBarX: true,
    scrollBarY: true,
},
CFG_SCROLL = $config.scroll = extend({}, CFG_BASE),
CFG_CONTENT = $config.content = extend({}, CFG_BASE, {
    wrapClass : "content",
    bodyClass : "content_body",
    pointClass: "content_point",
});

/**
 * @todo 添加 loading 参数，自动展示加载动画
 */
MagicVue.component("mgContent", {
    name: "mgContent",
    template: '<div><div><slot></slot></div></div>',

    props: {
        "$name": { type: String, default: "mg-content" },

        "ctrl": {}, "native": {},
        "direction": { type: String,  default: "Y"},
        "scrollBar": {}, "scrollBarX": {}, "scrollBarY": {},
    },

    mounted: function() {
        var $parent = this.$parent, option = {wrapClass: ""};

        // 判断是否有 header 和 footer 组件
        if ($parent && $parent.$children) {
            var list = $parent.$children;

            for(var i=0; i<list.length; i++) {
                if (list[i].$name == "mg-header") {
                    option.wrapClass = " has-header"; break;
                }
            }
        }

        createScroll(this, CFG_CONTENT, extend(option, {
            wrapClass : CFG_CONTENT.wrapClass + option.wrapClass,
            bodyClass : CFG_CONTENT.bodyClass,
            pointClass: CFG_CONTENT.pointClass,
        }));
    }
});

MagicVue.component("mgScroll", {
    name: "mgScroll",
    template: '<div><div><slot></slot></div></div>',

    props: {
        "$name": { type: String, default: "mg-scroll" },

        "ctrl": {}, "native": {},
        "direction": { type: String,  default: "Y"},
        "scrollBar": {}, "scrollBarX": {}, "scrollBarY": {},
    },

    data: function() {
        return {
            $scroll: null,
        }
    },

    mounted: function() {
        createScroll(this, CFG_SCROLL);
    }
});

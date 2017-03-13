import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";
import Gesture from "MG_UIKIT/gesture/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isTrueString} from "LIB_MINJS/check.js";
import MgConfig from "MG_UIKIT/base/config.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.content = {
    native: false,
    nativeClass: "native",

    wrapClass  : "content",
    bodyClass  : "content_body",
    pointClass : "content_point",
}

MagicVue.component("mgContent", {
    name: "mgContent",
    template: '<div><div><slot></slot></div></div>',

    props: {
        "$name": { type: String, default: "mg-content" },

        "ctrl": {}, "native": {},
    },

    mounted: function() {
        var self = this, $parent = self.$parent, opt = {wrapClass: ""},
            el = self.$el, $el = RootMagic(el), isNative, $ctrl;

        // 判断是否有 header 和 footer 组件
        if ($parent && $parent.$children) {
            var list = $parent.$children;

            for(var i=0; i<list.length; i++) {
                if (list[i].$name == "mg-header") {
                    opt.wrapClass = " has-header"; break;
                }
            }
        }

        isNative = self.native == null ? CFG.native : !!self.native;

        if (isNative) {
            Gesture.option.movePrevent = false;

            opt.wrapClass = CFG.wrapClass+opt.wrapClass+" "+CFG.nativeClass;
            $el.addClass(opt.wrapClass)
                .children().eq(0).addClass(CFG.bodyClass);

            // 微信中尝试屏蔽 下拉显示网址
            Gesture.on("move", function(e) {
                if (e.cancelable && e.direction == Gesture.MOVE_DOWN
                    && el.scrollTop <= 1) {
                    e.preventDefault();
                }
            });
        } else {
            Gesture.option.movePrevent = MgConfig.gesture.movePrevent;

            $ctrl = new Scroll($el, {
                wrapClass : CFG.wrapClass+" "+opt.wrapClass,
                bodyClass : CFG.bodyClass,
                pointClass: CFG.pointClass,

                lockX : true,  lockY: false,
                pointX: false, pointY: true,
            }).init();

            $ctrl.once("start.refresh", function() {
                $ctrl.refresh();    // 第一次点击时刷新组件
            });

            tryBindCtrl(self, $ctrl); // 尝试绑定 父页面 ctrl 对象
        }
    }
});

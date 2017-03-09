import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isTrueString} from "LIB_MINJS/check.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {value, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.scroll = {
    scrollBar : true,
    scrollBarX: true,
    scrollBarY: true,
};

/**
 * @todo 添加 loading 参数，自动展示加载动画
 */
MagicVue.component("mgScroll", {
    name: "mgScroll",
    template: '<div><div><slot></slot></div></div>',

    props: {
        "$name": { type: String, default: "mg-scroll" },

        "scrollBar": {}, "scrollBarX": {}, "scrollBarY": {},
        "ctrl": {}, "direction": { type: String,  default: "Y"},
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            scrollOption, dir, bar, $ctrl, $ctrlScope, ctrlKey;

        dir = self.direction; bar = self.scrollBar;

        scrollOption = { lockX: dir === "Y", lockY: dir === "X" };
        scrollOption.pointX = !scrollOption.lockX &&
            value(self.scrollBarX, bar, CFG.scrollBarX, CFG.scrollBar);
        scrollOption.pointY = !scrollOption.lockY &&
            value(self.scrollBarY, bar, CFG.scrollBarY, CFG.scrollBar);

        scrollOption = extend(scrollOption, options || {});
        $ctrl = new Scroll($el, scrollOption).init();

        tryBindCtrl(self, $ctrl); // 尝试绑定 父页面 ctrl 对象
    }
});

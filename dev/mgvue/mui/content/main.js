import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";

import $config from "MV_UIKIT/base/config.js";
import {value, getScope} from "MV_UIKIT/base/tools.js";

var CFG = $config.content = {
    native: false,

    scrollBar : true,
    scrollBarX: true,
    scrollBarY: true,
}, componentOption = {
    name: "mgContent",
    template: '<div><div><slot></slot></div></div>',

    props: {
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
        var self = this, $el = $(self.$el), native = self.native,
            scrollOption, dir, bar, $ctrlScope, ctrlKey;

        native = native == null ? CFG.native : !!native;

        if (!native) {
            dir = self.direction; bar = self.scrollBar;

            scrollOption = { lockX: dir === "Y", lockY: dir === "X" };
            scrollOption.pointX = !scrollOption.lockX &&
                value(self.scrollBarX, bar, CFG.scrollBarX, CFG.scrollBar);
            scrollOption.pointY = !scrollOption.lockY &&
                value(self.scrollBarY, bar, CFG.scrollBarY, CFG.scrollBar);

            self.$scroll = new Scroll($el, scrollOption).init();

            // 尝试绑定 ctrl 到页面中
            ctrlKey = self.ctrl;
            $ctrlScope = getScope(self, ctrlKey);
            if ($ctrlScope) $ctrlScope[ctrlKey] = self.$scroll;
        }
    },
};

/**
 * @todo 添加 loading 参数，自动展示加载动画
 */
MagicVue.component("mgContent", componentOption);
MagicVue.component("mgScroll", componentOption);

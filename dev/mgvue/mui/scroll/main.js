import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";
import {extend} from "LIB_MINJS/utils.js";
import {isTrueString} from "LIB_MINJS/check.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {simProperty} from "MV_CORE/base/tools.js";
import {value, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.scroll = {
    scrollBar : false,
    scrollBarX: false,
    scrollBarY: false,
};

export function addRefresh($ctrl, list) {
    if (!$ctrl || !list || !list.length) return;

    for(var i=0; i<list.length; i++) {
        var refresh = list[i].item,
            options = list[i].options;

        $ctrl.attach(refresh, options);
    }
}

/**
 * @todo 添加 loading 参数，自动展示加载动画
 */
MagicVue.component("mgScroll", {
    name: "mg-scroll",
    template: '<div><div><slot></slot></div></div>',

    props: {
        "ctrl": {}, "refresh": {},
        "scrollBar": {}, "scrollBarX": {}, "scrollBarY": {},
        "direction": { type: String,  default: "Y"},
    },

    data: {
        control: null,
        refreshList: [],
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            scrollOption, dir, bar, $ctrl, $ctrlScope, ctrlKey;

        dir = self.direction; bar = self.scrollBar;

        scrollOption = { lockX: dir === "Y", lockY: dir === "X" };
        scrollOption.pointX = !scrollOption.lockX &&
            value(self.scrollBarX, CFG.scrollBarX, CFG.scrollBar);
        scrollOption.pointY = !scrollOption.lockY &&
            value(self.scrollBarY, CFG.scrollBarY, CFG.scrollBar);

        if (scrollOption.lockY && !scrollOption.lockX) {
            scrollOption.bodyClass = "scroll_body_x";
        } else if (scrollOption.lockX && !scrollOption.lockY) {
            scrollOption.bodyClass = "scroll_body_y";
        }

        $ctrl = new Scroll($el, scrollOption).init();
        self.control = $ctrl;
        tryBindCtrl(self, $ctrl); // 尝试绑定 父页面 ctrl 对象

        self.$watch("refresh", function() { $ctrl.refresh() });

        if ($ctrl && self.refreshList) {
            addRefresh($ctrl, self.refreshList);
        }
    }
});

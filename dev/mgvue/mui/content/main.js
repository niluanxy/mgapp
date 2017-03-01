import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import Scroll from "MG_UIKIT/scroll/main.js";

import $config from "MV_UIKIT/base/config.js";

var CFG = $config.content = {
    native: false,
};

/**
 * @todo 添加 loading 参数，自动展示加载动画
 */
MagicVue.component("mgContent", {
    name: "mgContent",
    template: '<div><slot></slot></div>',

    props: ["ctrl", "native", "refresh", "pullUp", "pullUp"],

    mounted: function() {
        var self = this, $el = $(self.$el), native = self.native;

        native = native == null ? CFG.native : !!native;
    },
});

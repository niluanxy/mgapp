import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import $config from "MV_UIKIT/base/config.js";

var CFG = $config.header = {
    type: $config.type,
    class: "bar",
};

MagicVue.component("mgHeader", {
    name: "mgHeader",
    template: "<div><slot></slot></div>",

    props: {
        "$name": { type: String, default: "mg-header" },
        "type": { type: String, default: '' },
    },

    mounted: function() {
        var $el = $(this.$el), type = this.type || CFG.type;

        uiAddClass($el, CFG.class, type);
    }
});

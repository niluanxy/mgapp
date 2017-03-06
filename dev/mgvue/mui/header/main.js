import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import ConfigUi from "MV_UIKIT/base/config.js";

var CFG = ConfigUi.header = {
    type: ConfigUi.type,
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
        var $el = RootMagic(this.$el), type = this.type || CFG.type;

        uiAddClass($el, CFG.class, type);
    }
});

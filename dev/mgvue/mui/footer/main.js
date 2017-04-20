import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {getName} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.footer = {
    class : "footer",
    navfix: "has-navbar",
};

MagicVue.component("mgFooter", {
    name: "mg-footer",
    template: "<div><slot></slot></div>",

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            $parent = self.$parent, cls = "", list;

        cls += CFG.class + " ";
        if (MagicVue.rootNavbar) cls += CFG.navfix;

        list = $parent ? $parent.$children : [];
        for(var i=0; i<list.length; i++) {
            var item = list[i], name = getName(item);

            if (name === "mg-content" && item.$el) {
                RootMagic(item.$el).addClass("has-footer");
            }
        }

        $el.addClass(cls);
    }
});

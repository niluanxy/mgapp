import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";

import ConfigUI from "MV_UIKIT/base/config.js";

var CFG = ConfigUI.card = {
    class: "card",
};

MagicVue.component("mgCard", {
    name: "mg-card",
    template: '<div><slot></slot></div>',

    mounted: function() {
        var self = this, $el = RootMagic(self.$el);

        $el.addClass(CFG.class);
    },
});

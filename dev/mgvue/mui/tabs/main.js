import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import Tabs from "MG_UIKIT/tabs/main.js";

import $config from "MV_UIKIT/base/config.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

var CFG = $config.tabs = {
    type: $config.type,
    class: "tabs",
};

MagicVue.component("mgTabs", {
    name: "mgTabs",
    template: "<div><slot></slot></div>",

    props: ["ctrl", "icon", "type", "border", "striped"],

    mounted: function() {
        var self = this, $el = $(self.$el),
            striped, $ctrl, $ctrlScope, ctrlKey;

        striped = self.striped ? (self.striped == "top" ? "striped-top" : "striped") : "";

        uiAddClass($el, CFG.class, [
            striped,
            self.type || CFG.type,
            self.icon == "only" ? "icon-only" : (self.icon ? "icon" : ""),
            self.border == "top" ? "top" : "",
        ]);

        $ctrl = new Tabs($el).init();

        if (ctrlKey = self.ctrl) {
            $ctrlScope = getScope(self, ctrlKey);
            if ($ctrlScope) $ctrlScope[ctrlKey] = $ctrl;
        }
    },
});

MagicVue.component("mgTabsItem", {
    name: "mgTabsItem",
    props: ["icon"],
    template: '<a>'+
        '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
        '<slot></slot>'+
    '</a>',
})

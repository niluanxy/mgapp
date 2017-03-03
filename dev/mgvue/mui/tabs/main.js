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

    props: {
        "$name": { type: String, default: "mg-tabs" },

        "ctrl"   : {}, "icon"  : {}, "border"  : {},
        "striped": {}, "select": {}, "onSelect": {},
    },

    data: function() {
        return {
            $ctrl: null,
        }
    },

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

        $ctrl = new Tabs($el, {
            onSelect: function(index) {
                self.$emit("onSelect", index);
            }
        }).init();
        self.$ctrl = $ctrl.select(parseInt(self.select) || 0);

        if (ctrlKey = self.ctrl) {
            $ctrlScope = getScope(self, ctrlKey);
            if ($ctrlScope) $ctrlScope[ctrlKey] = $ctrl;
        }
    },

    watch: {
        select: function(newVal) {
            this.$ctrl.select(newVal);
        }
    }
});

MagicVue.component("mgTabsItem", {
    name: "mgTabsItem",
    props: {
        "$name": { type: String, default: "mg-tabs-item" },

        "icon": {},
    },
    template: '<a>'+
        '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
        '<slot></slot>'+
    '</a>',
})

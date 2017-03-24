import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import Tabs from "MG_UIKIT/tabs/main.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {domListener, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.tabs = {
    type: ConfigUI.type,
    class: "tabs",
};

MagicVue.component("mgTabs", {
    name: "mgTabs",
    template: "<div><slot></slot></div>",

    props: {
        "$name": { type: String, default: "mg-tabs" },

        "ctrl"   : {}, "icon"  : {}, "border"  : {},
        "striped": {}, "active": {}, "select": {},
    },

    data: function() {
        return {
            $ctrl: null,
        }
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
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
                self.$emit("select", index);
            }
        }).init();
        
        self.$ctrl = $ctrl.select(parseInt(self.active) || 0);
        tryBindCtrl(self, $ctrl);   // 尝试绑定 父页面 ctrl 对象
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

    mixins: domListener(),
})

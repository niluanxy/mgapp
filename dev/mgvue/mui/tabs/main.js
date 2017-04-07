import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import Tabs from "MG_UIKIT/tabs/main.js";
import {isTrueString} from "LIB_MINJS/check.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {simProperty} from "MV_CORE/base/tools.js";
import {domListener, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.tabs = {
    type: ConfigUI.type,
    class: "tabs",
};

MagicVue.component("mgTabs", {
    name: "mgTabs",
    template: "<div><slot></slot></div>",

    props: {
        "ctrl"   : {}, "icon"  : {}, "border": {},
        "striped": {}, "active": {}, "select": {},
    },

    data: {
        $ctrl: null,
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            striped, $ctrl, $ctrlScope, _active;

        striped = self.striped ? (self.striped == "top" ? "striped-top" : "striped") : "";
        _active = simProperty(self, self.active);

        uiAddClass($el, CFG.class, [
            striped,
            self.type || CFG.type,
            self.icon == "only" ? "icon-only" : (self.icon ? "icon" : ""),
            self.border == "top" ? "top" : "",
        ]);

        $ctrl = new Tabs($el, {
            onSelect: function(index) {
                self.$emit("select", index);
                _active.value = index;
            }
        }).init();

        _active.$watch("value", function(value) {
            $ctrl.select(value, true);
            self.$emit("select", value);
        });

        self.$ctrl = $ctrl.select(parseInt(_active.value) || 0);
        tryBindCtrl(self, $ctrl);   // 尝试绑定 父页面 ctrl 对象
    },
});

MagicVue.component("mgTabsItem", {
    name: "mgTabsItem",
    props: ["icon"],
    template: '<a>'+
        '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
        '<slot></slot>'+
    '</a>',

    mixins: domListener(),
})

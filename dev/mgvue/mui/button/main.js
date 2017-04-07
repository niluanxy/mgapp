import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {isTrueString} from "LIB_MINJS/check.js";
import RootRouter from "MV_MODULE/router.js";
import {uiClass, uiAddClass} from "MG_UIKIT/base/tools.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {domListener} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.button = {
    type :    ConfigUI.type,
    class:    "button",

    block:    ConfigUI.block,
    disabled: ConfigUI.disabled,
};

MagicVue.component("mgButton", {
    name: "mgButton",
    template:
        '<a :link="link">'+
            '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
            '<slot></slot>'+
        '</a>',

    props: {
        "link": {}, "type" : {}, "size"    : {},
        "icon": {}, "block": {}, "disabled": {},
    },

    mixins: domListener(),

    mounted: function() {
        var self = this, $el = RootMagic(self.$el);

        uiAddClass($el, CFG.class, [
            self.type || CFG.type,
            self.size,
            !!self.block ? CFG.block : '',
            !!self.disabled ? CFG.disabled : ''
        ]);
    },

    watch: {
        disabled: function(newVal) {
            RootMagic(this.$el).toggleClass(uiClass(CFG.class, CFG.disabled), !!newVal);
        }
    }
});

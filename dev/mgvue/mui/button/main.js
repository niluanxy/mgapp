import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";
import {uiClass, uiAddClass} from "MG_UIKIT/base/tools.js";

import $config from "MV_UIKIT/base/config.js";

var CFG = $config.button = {
    type :    $config.type,
    class:    "button",

    block:    $config.block,
    disabled: $config.disabled,
};

MagicVue.component("mgButton", {
    name: "mgButton",
    template:
        '<a :link="link">'+
            '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
            '<slot></slot>'+
        '</a>',

    props: {
        "$name": { type: String, default: "mg-button" },

        "link": {}, "type" : {}, "size"    : {},
        "icon": {}, "block": {}, "disabled": {},
    },

    mounted: function() {
        var self = this, $el = $(self.$el);

        uiAddClass($el, CFG.class, [
            self.type || CFG.type,
            self.size,
            !!self.block ? CFG.block : '',
            !!self.disabled ? CFG.disabled : ''
        ]);
    },

    watch: {
        disabled: function(newVal) {
            $(this.$el).toggleClass(uiClass(CFG.class, CFG.disabled), !!newVal);
        }
    }
});

import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {value} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.counter = {
    class: "counter",

    mobile: true,
};

MagicVue.component("mgCounter", {
    name: "mg-counter",
    template:
        '<div>'+
            '<a @tap="decValue" class="button dec">－</a>'+
            '<input :value="currentValue" class="input" type="text" :readonly="readonly" />'+
            '<a @tap="incValue" class="button inc">＋</a>'+
        '</div>',

    props: {
        mobile: {}, value: {}, scope: {},
        min: {default: 0}, max: {default: 999},
    },

    data: {
        readonly: false, currentValue: 0,
    },

    methods: {
        incValue: function() {
            if (this.currentValue+1 <= this.max) {
                var cache = this.currentValue;

                this.currentValue += 1;

                this.$emit("change", this.currentValue, cache, this.scope);
                this.updateInput();
            }
        },

        decValue: function() {
            if (this.currentValue-1 >= this.min) {
                var cache = this.currentValue;

                this.currentValue -= 1;

                this.$emit("change", this.currentValue, cache, this.scope);
                this.updateInput();
            }
        },

        updateInput: function(value) {
            this.$emit("input", this.currentValue);
        }
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el);

        self.readonly = value(self.mobile, CFG.mobile);
        self.currentValue = parseInt(self.value || self.min) || 0;
        self.updateInput();

        self.$watch("value", function(newVal) {
            if (newVal != this.currentValue) {
                this.currentValue = newVal;
            }
        });

        $el.addClass(CFG.class).tapPrevent();
    }
});

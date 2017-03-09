import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";
import Slider from "MG_UIKIT/slider/main.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {value, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.slider = {
    class: "slider",

    autoPlay: 5000,
    loopPlay: true,
};

MagicVue.component("mgSlider", {
    name: "mgSlider",
    template: "<div><slot></slot></div>",

    props: {
        "$name": { type: String, default: "mg-slider" },

        "ctrl": {}, "point": {}, "active": {},
        "auto": { type: String, default: "5000"},
        "loop": { type: String, default: "true"},
        "direction": { type: String, default: "x"},

        "before" : {}, "scroll": {}, "animate": {},
    },

    data: function() {
        return {
            $ctrl: null,
        }
    },

    mounted: function() {
        var self = this, el = self.$el, loop, auto, dir;

        loop = value(self.loop, CFG.loopPlay);
        auto = parseInt(self.auto) || CFG.autoPlay;

        dir = self.direction == "y" ? "y" : "x";

        self.$ctrl = new Slider(el, {
            playLoop: loop, playAuto: auto,
            direction: dir,

            onBefore: function(page) {
                self.$emit("before", page);
            },

            onScroll: function() {
                self.$emit("scroll", page);
            },

            onAnimate: function() {
                self.$emit("animate", page);
            }
        }).init();

        tryBindCtrl(self, self.$ctrl);   // 尝试绑定 父页面 ctrl 对象
    },

    watch: {
        active: function(newVal) {
            this.$ctrl.go(parseInt(newVal) || 0);
        }
    }
});

MagicVue.component("mgSliderItem", {
    name: "mgSliderItem",
    template: "<div><slot></slot></div>",

    props: {
        "$name": { type: String, default: "mg-slider-item" },
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el);

        uiAddClass($el, CFG.class, [
            "item"

        ]);
    }
});
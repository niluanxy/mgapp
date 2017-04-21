import MagicVue from "MV_CORE/base/main.js";
import {isTrueString} from "LIB_MINJS/check.js";
import RootMagic from "MG_CORE/build.js";
import Slider from "MG_UIKIT/slider/main.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";

import RootRouter from "MV_MODULE/router.js";
import ConfigUI from "MV_UIKIT/base/config.js";
import {value, tryBindCtrl} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.slider = {
    class: "slider",

    autoPlay: 5000,
    loopPlay: true,
};

MagicVue.component("mgSlider", {
    name: "mg-slider",
    template: "<div><div><slot></slot></div></div>",

    props: {
        "ctrl": {}, "point": {}, "active": {}, "refresh": {},
        "auto": { type: String, default: "5000"},
        "loop": { type: String, default: "true"},
        "direction": { type: String, default: "x"},
    },

    data: {
        control: null
    },

    mounted: function() {
        var self = this, el = self.$el, loop, auto, dir;

        loop = value(self.loop, CFG.loopPlay);
        auto = parseInt(self.auto) || CFG.autoPlay;

        dir = self.direction == "y" ? "y" : "x";

        self.control = new Slider(el, {
            playLoop: loop, playAuto: auto,
            direction: dir,

            onBefore: function(page) {
                self.$emit("before", page);
            },

            onScroll: function(page) {
                self.$emit("scroll", page);
            },

            onAnimate: function(page) {
                self.$emit("animate", page);
            }
        }).init();

        self.$watch("refresh", function() {
            self.control.refresh();
        });

        self.control.go(parseInt(self.active) || 0);
        tryBindCtrl(self, self.control);   // 尝试绑定 父页面 ctrl 对象
    },

    watch: {
        active: function(newVal) {
            this.$ctrl.go(parseInt(newVal) || 0);
        }
    }
});

MagicVue.component("mgSliderItem", {
    name: "mgSliderItem",
    template: '<div><img v-if="image" :src="image"></img><slot></slot></div>',

    props: {
        "link" : { type: String, default: "" },
        "image": { type: String, default: "" },
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el);

        uiAddClass($el, CFG.class, ["item"]);

        $el.on("tap", function() {
            if (isTrueString(self.link)) {
                RootRouter.go(self.link);
            }
        });
    }
});

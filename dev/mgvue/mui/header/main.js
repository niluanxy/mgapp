import MagicVue from "MV_BASE/main.js";
import $ from "MG_CORE/build.js";

MagicVue.component("mg-header", {
    template: "<div><slot></slot></div>",

    props: ["style"],
    mounted: function() {
        console.log("has run header")
        var $el = $(this.$el);

        $el.addClass("bar-primary");
    }
});

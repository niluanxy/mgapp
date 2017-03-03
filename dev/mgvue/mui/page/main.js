import MagicVue from "MV_BASE/main.js";

MagicVue.component("mgPage", {
    name: "mgPage",
    props: {
        "$name": { type: String, default: "mg-page" }
    },
    template: "<div class='page'><slot></slot></div>",
});

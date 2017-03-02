import MagicVue from "MV_BASE/main.js";

MagicVue.component("mgPage", {
    name: "mgPage",
    template: "<div class='page'><slot></slot></div>",
});

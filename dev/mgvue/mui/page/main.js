import MagicVue from "MV_CORE/base/main.js";

import {getName} from "MV_UIKIT/base/tools.js";

MagicVue.component("mgPage", {
    name: "mg-page",
    template: "<div class='page'><slot></slot></div>",

    data: { name: null, hash: null, params: null },

    mounted: function() {
        var self = this, $parent = self.$parent,
            name = getName($parent);

        if (name && name.match(/^ma\-/)) {
            this.name = name;
            this.hash = $parent.$$hash;
            this.params = $parent.$$params;
        }
    }
});

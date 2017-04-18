import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import Refresh from "MG_UIKIT/scroll/plugins/refresh.js";
import {extend, strFind} from "LIB_MINJS/utils.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {value, getName} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.refresh = {
    type  : "down",
    airt  : "Y",
    rate  : 0.8,
    model : "simple",
    count : 10,
};

MagicVue.component("mgRefresh", {
    name: "mg-refresh",
    template: '<div><slot></slot></div>',

    props: {
        type : {}, airt: {}, model: {},
        rate : {}, item : {},
        count: {default: 10}, total: {default: 100},
    },

    methods: {
        refreshMove: function(scrollX, scrollY) {
            this.$emit("move", scrollX, scrollY);
        },

        refreshBound: function(page, defer) {
            this.$emit("bound", page, defer);
        }
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el), tmp,
            options = {}, $parent = self.$parent, name = getName($parent);

        if (name == "mg-content" || name == "mg-scroll") {
            options.refreshType  = value(self.type,  CFG.type);
            options.refreshAirt  = value(self.airt,  CFG.airt);
            options.refreshCount = value(self.count, CFG.count);
            options.refreshTotal = value(self.total, CFG.total);
            options.refreshModel = value(self.model, CFG.model);

            options.refreshEl    = $el;
            options.refreshItem  = self.item;

            if ($el && (tmp = $el.html())) {
                if (options.refreshModel == "simple") {
                    options.refreshSimpleTmp = tmp;
                } else {
                    options.refreshScrollTmp = tmp;
                }
            }

            if (name == "mg-content") {
                options.refreshClass  = "content_refresh";
                options.refreshParent = ".content";
            } else {
                options.refreshClass  = "scroll_refresh";
                options.refreshParent = ".scroll";
            }

            options.refreshMove = function(scrollX, scrollY) {
                self.refreshMove(scrollX, scrollY);
            }

            options.refreshBound = function(page, defer) {
                self.refreshBound(page, defer);
            }

            if ($parent.refreshList) $parent.refreshList.push({
                item: "refresh", options: options
            });
        }
    }
})

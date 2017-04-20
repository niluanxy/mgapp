import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";
import {each} from "LIB_MINJS/utils.js";
import {isFunction, isString} from "LIB_MINJS/check.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {getName} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.navbar = {
    type: ConfigUI.type,
    class: "tabs",

    rootRender: "mg-navbar",
    rootTemplate: '<div class="app-navbar"><solt></solt></div>',
}, LINK_LIST = [], BAR_HIDE = true;

MagicVue.component("mgNavbar", {
    name: "mg-navbar",
    template: CFG.rootTemplate,

    props: {
        "type": { type: String, default: '' },
        "icon": { type: String, default: '' },
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el), icon, type;

        icon = self.$options.icon || self.icon;
        icon = icon ? (icon == "only" ? "icon-only" : "icon") : "";

        type = self.$options.type || self.type || CFG.type;

        uiAddClass($el, CFG.class, [ type, icon, "footer" ]);

        MagicVue.on("mgViewMounted.Navbar", function(scope, params) {
            var list = scope.$children[0].$children;

            if (BAR_HIDE === false) {
                each(list, function(i, item) {
                    if (getName(item) == "mg-content") {
                        RootMagic(item.$el).addClass("has-navbar");
                        return false;
                    }
                });
            }
        });

        MagicVue.on("mgViewChange.Navbar",
        function(viewGo, viewLast, routeType, routeGo, routeLast) {
            BAR_HIDE = true;    // 重置显示状态

            each(LINK_LIST, function(i, link) {
                if (link && link === routeGo.url) {
                    BAR_HIDE = false; return false;
                }
            });

            MagicVue.rootNavbar = !BAR_HIDE;
            $el.toggleClass(ConfigUI.hide, BAR_HIDE);
        });
    },
});

MagicVue.component("mgNavbarItem", {
    name: "mg-navbar-item",
    template:
        '<a :link="link">'+
            '<i v-if="icon" class="icon" :class="\'icon-\'+icon"></i>'+
            '<slot></slot>'+
        '</a>',

    props: {
        "link": { type: String, default: '' },
        "icon": { type: String, default: '' },
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            link = MagicVue.location.transUrl(self.link);

        MagicVue.on("mgViewChange.NavbarItem",
        function(viewGo, viewLast, routeType, routeGo, routeLast) {
            if (routeGo.url === link) {
                $el.addClass(ConfigUI.actived);
            } else {
                $el.removeClass(ConfigUI.actived);
            }
        });

        uiAddClass($el, CFG.class, ["item"]); LINK_LIST.push(link);
    }
});

MagicVue.on("mgRouteInit.Navbar", function() {
    if (!CFG.rootRender) return;

    var $rootRender = RootMagic(CFG.rootRender), tmp, com;

    if ($rootRender.length === 1) {
        tmp = $rootRender.html();
        tmp = CFG.rootTemplate.replace("<solt></solt>", tmp);

        com = MagicVue.component("mgNavbar");

        new com({
            el: $rootRender[0], template: tmp,
            icon: $rootRender.attr("icon"),
            type: $rootRender.attr("type"),
        });
    }
})

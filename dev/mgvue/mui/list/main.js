import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";

import Router from "MV_CORE/module/router.js";
import ConfigUI from "MV_UIKIT/base/config.js";
import {value} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.list = {
    class: "list",

    inset: false,
    insetClass: "inset",
    embed: false,
    embedClass: "embed",
    embedLeftClass: "embed-left",
};

MagicVue.component("mgList", {
    name: "mg-list",
    template: "<div><slot></slot></div>",

    props: {
        embed: {},      // true || left
        inset: {},      // true
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el),
            inset = value(self.inset, CFG.inset), embed, cls = " ";

        if (inset) cls += " inset";

        switch(self.embed) {
            case "true":
                cls += " embed"; break;
            case "left":
                cls += " embed-left"; break;
        }

        $el.addClass(CFG.class+" "+cls);
        $el.on("tap", ".list-item", function(e) {
            var $tar = RootMagic(e.target), link;

            if ((link = $tar.attr("link"))) {
                Router.go(link);
            }
        });
    }
});

MagicVue.component("mgListItem", {
    name: "mg-list-item",
    template:
        '<div class="list-item">'+
            '<img v-if="avatar" :src="avatar" class="avatar"></img>'+
            '<img v-if="avatarLarge" :src="avatarLarge" class="avatar"></img>'+
            // '<i v-if="icon" :class="\'icon\'+valueIconLeft"></i>'+
            '<span v-if="label" class="label">{{label}}</span>'+
            '<slot></slot>'+
            '<span v-if="labelRight">{{labelRight}}</span>'+
            // '<i v-if="icon-right" class="\'icon\'+iconRight"></i>'+
        '</div>',

    props: {
        link  : {type: String, default: ""},     // URL
        embed : {type: String, default: ""},     // true
        input : {type: String, default: ""},     // true
        inline: {type: String, default: ""},     // first || true || last
        button: {type: String, default: ""},     // true

        avatar: {}, avatarLarge: {},       // URL
        label : {}, labelRight : {},       // true || TEXT
        icon  : {}, iconRight  : {},       // icon
    },

    data: {
        valueButton: "",
    },

    mounted: function() {
        var self = this, $el = RootMagic(self.$el), cls = " ";

        if (self.link)  cls += ConfigUI.touch;
        if (self.embed) cls += " embed";
        if (self.input) cls += " input";
        if (self.inline) {
            cls += " inline";

            if (self.inline == "first") {
                cls += " inline-first";
            } else if (self.inline == "last") {
                cls += " inline-last";
            }
        }

        if (self.button) cls += " button-right";
        if (self.avatar) cls += " avatar";
        if (self.avatarLarge) cls += " avatar-large";
        if (self.label) cls += " label";
        if (self.labelRight) cls += " label-right";

        $el.addClass(cls);
    }
});

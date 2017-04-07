import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {uiAddClass} from "MG_UIKIT/base/tools.js";
import {each} from "LIB_MINJS/utils.js";
import {isFunction, isString} from "LIB_MINJS/check.js";

import ConfigUI from "MV_UIKIT/base/config.js";
import {getName} from "MV_UIKIT/base/tools.js";

var CFG = ConfigUI.header = {
    type: ConfigUI.type,
    class: "bar",

    // 全局 header 是否渲染，为字符串则查找该元素
    rootRender: "body",
    rootTemplate: '<div class="app-header"></div>',

    // 页面 header 是否渲染，仅为 true 或 false
    viewRender: true,

    // 页面 header 自动渲染是否开启，开启需模板生成函数
    autoRender: renderHeader,
    autoTemplate: '<div class="__TYPE__">'
                      +'<h3 class="title">{{header}}</h3>'+
                  '</div>',
}, $AppHeader = null;

export function renderHeader(info) {
    var cls = CFG.class + "-" + CFG.type,
        tmp = CFG.autoTemplate.replace(/__TYPE__/, cls);

    return RootMagic(RootMagic.tpl(tmp, info));
}

function tryFixContent(list) {
    each(list, function(i, item) {
        if (getName(item) == "mg-content") {
            RootMagic(item.$el).addClass("has-header");
            return false;
        }
    });
}

MagicVue.component("mgHeader", {
    name: "mgHeader",
    template: "<div><slot></slot></div>",

    props: {
        "type": { type: String, default: '' },
    },

    mounted: function() {
        var $el = RootMagic(this.$el), type = this.type || CFG.type,
            wrapName = getName(this.$parent);

        if (CFG.viewRender === true) {
            if (wrapName == "mg-page" || wrapName == "mg-modal") {
                uiAddClass($el, CFG.class, type);
                tryFixContent(this.$parent.$children);
            }
        }
    }
});

MagicVue.on("mgRouteInit.Header", function() {
    if (!CFG.rootRender) return;

    $AppHeader = RootMagic(CFG.rootTemplate).addClass(ConfigUI.hide);
    var $insert = isString(CFG.rootRender) ? RootMagic(CFG.rootRender)
                        : RootMagic(MagicVue.$root);

    $insert.prepend($AppHeader);
});

MagicVue.on("mgViewChange.Header", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    $AppHeader.addClass(ConfigUI.hide).html("");

    var appendHtml = "", useAnimate = false;

    if (routeLast && viewLast) {
        useAnimate = true;

        renderHeader(routeLast)
            .appendTo($AppHeader);
    }

    if (routeGo && viewGo) {
        renderHeader(routeGo)
            .appendTo($AppHeader);
    }

    $AppHeader.removeClass(ConfigUI.hide);
});

MagicVue.on("mgViewMounted.Header", function(scope, params) {
    var $el = RootMagic(scope.$el), name = scope.$$name,
        noHeader = true, page = scope.$children, viewInfo,
        childList = page[0] ? page[0].$children : [];

    try {
        each(childList, function(i, item) {
            if (getName(item) == "mg-header") {
                noHeader = false; return false;
            }
        });
    } catch(err) {
        noHeader = false;
    }

    // 如果允许，则尝试自动生成页面的 header 部分
    if (isFunction(CFG.autoRender) && noHeader) {
        var $page = RootMagic(page[0].$el),
            finds = name.replace("ma", '').replace(/\-/g, "/");

        viewInfo = MagicVue.location.fire(finds);
        $page.prepend(CFG.autoRender(viewInfo));

        tryFixContent(childList);   // 修复 content 元素样式
    }
});

MagicVue.on("mgViewAnimated.Header", function() {
    if ($AppHeader) $AppHeader.addClass(ConfigUI.hide);
});

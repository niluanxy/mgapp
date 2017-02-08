import RootMagic from "MG_MAGIC/main.js";
import {uiExtend, uiInit} from "MG_UIKIT/tools/main.js";
import {isTrueString, isArray, isFunction} from "LIB_MINJS/check.js";
import {each, extend} from "LIB_MINJS/utils.js";
import $config from "MG_MAGIC/config.js";

import Place from "MG_UIKIT/place/main.js";
import Scroll from "MG_UIKIT/scroll/core/main.js";

var CFG = $config.picker = {
    class: "picker",

    hideClass: "hide",

    bodyClass: "picker-body",
    showClass: "picker-show",

    itemClass: "picker-item",
    wrapClass: "picker",

    template : "<div value={{value}}>{{show}}</div>"
}, Prototype = {};

/**
 * options: {
 *      data: [
 *          { value: "111", show: "item-111", call: null },
 *          { value: "222", show: "item-222", call: null },
 *          { value: "333", show: "item-333", call: null },
 *          { value: "444", show: "item-444", call: null },
 *      ]
 *
 *
 *      snap:       [boolean]   是否snap滚动模式
 *      modal:      [boolean]   是否弹框
 *      scroll:     [boolean]   内容是否使用 scroll
 *
 *      template:   [string]    子元素渲染模版
 *
 *      onScroll:   [function]  滚动时的回调
 *      onRender:   [function]  渲染时的回调
 *
 *      onSelect:   [function]  选择时的回调
 * }
 */
export default function Picker(el, option, data) {
    var self = this;

    self.$el   = RootMagic(el);
    self.$body = null;
    self.$show = null;

    self.data  = data || null;
    self.value = "";

    self.scroll = null;
    self.isHide = false;
    self.option = uiExtend(CFG, option);
}; Picker.prototype = Prototype;


Prototype.render = function() {
    var self = this, copyData = [], html = "";

    each(self.data, function(i, add) {
        var copy = extend({}, add);

        copy.value = JSON.stringify(add.value);
        copyData.push(copy);
    });

    each(copyData, function(i, value) {
        html += RootMagic.tpl(self.option.template, value);
    });

    self.$body.html(html);
}

Prototype.initData = function() {
    var self = this, opt = self.option, $body = self.$body;

    if (!isArray(self.data) && $body.length) {
        var cacheData = [];

        $body.children().each(function(i, item) {
            var $item = RootMagic(item), add;

            $item.addClass(opt.itemClass);

            add = {
                call : null,
                show : $item.html() || "",
                value: $item.attr('value') || "",
            };

            if (isTrueString(add.value)) {
                try {
                    add.value = JSON.parse(add.value);
                } catch(error) {};
            }

            cacheData.push(add);
        });

        self.data = cacheData;
    }

    return self;
}

Prototype.initDom = function() {
    var self = this, opt = self.option,
        $el = self.$el, $show, $body;

    if (opt.modal && ($show = $el.children("."+opt.showClass)) && !$show.length) {
        $show = RootMagic("<div class='"+opt.showClass+"'></div>");
        $el.prepend($show);
    }

    if (($body = $el.children("."+opt.bodyClass)) && !$body.length) {
        $body = RootMagic("<div class='"+opt.bodyClass+"'></div>");
        $el.append($body);
    }

    $el.addClass(opt.wrapClass);
    $body.children().addClass(opt.itemClass, true);

    self.$body = $body; self.$show = $show;

    return self;
}

Prototype.init = function() {
    var self = this, opt = self.option;

    self.initDom().initData();

    if (!self.$body.length) self.render();

    if (opt.scroll) {
        self.$body.wrap("<div></div>");

        var scrollOption = {
            pointX: false, pointY: false,
            bodyClass: "", preventMove: true,
        };

        if (opt.snap) {
            scrollOption.plugins = "snap";
            scrollOption.snap = opt.itemClass;
        }

        self.scroll = new Scroll(self.$body, scrollOption).init();
    }

    self.$body.on("tap.picker", "."+opt.class+"-item", function(e) {
        console.log(e.target);
        self.select(RootMagic(e.target).index());
        self.hide();
    }); self.select(0);

    return self;
}

Prototype.show = function() {
    var self = this, opt = self.option;

    if (opt.modal && self.$body) {
        self.$body.removeClass(opt.hideClass);

        Place(self.$body, self.$el, "bottom", "right", {
            float: true
        });

        self.isHide = false;
    }

    return self;
}

Prototype.hide = function() {
    var self = this, opt = self.option;

    if (opt.modal && self.$body) {
        self.$body.addClass(opt.hideClass);
        self.isHide = true;
    }

    return self;
}

Prototype.toggle = function(hideSet) {
    var self = this;

    if (hideSet !== undefined) self.isHide = !hideSet;
    self.isHide ? self.show() : self.hide();

    return self;
}

Prototype.select = function(index, isValue) {
    var self = this, opt = self.option,
        select = self.data[index] || {};

    try {
        self.value = JSON.parse(select.value);
    } catch(error) {
        self.value = select.value;
    }

    if (isFunction(select.call)) select.call(self.value, select);

    if (isFunction(opt.onSelect)) opt.onSelect(self.value, select);

    if (opt.modal && self.$show) {
        if (isFunction(opt.onRender)) {
            self.$show.html(opt.onRender(self.value, select));
        } else {
            self.$show.html($target.html());
        }
    }

    return self.value;
}

Prototype.destory = function() {
    var self = this;

    if (self.scroll) self.scroll.destory();
    self.$el.remove();
}


// 绑定到 RootMagic 调用链上
RootMagic.extend({picker: function(el, option, data) {
    return new Picker(el, option, data).init();
}});

RootMagic.fn.extend({picker: function(option, data) {
    return new Picker(this[0], option, data).init();
}});

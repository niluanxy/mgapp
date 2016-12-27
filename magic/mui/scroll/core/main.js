import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {uiInit, uiExtend} from "MUI/tools/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",
}, Prototype = {};

function Scroll(el, option) {
    var self = this;

    self.$el = RootMagic(el);
    self.$body = null;

    self.x = 0;
    self.y = 0;
    self.distX = 0;
    self.distY = 0;
    self.maxScrollX = 0;
    self.maxScrollY = 0;

    self.emitter = Emitter();
    self.gesture = null;

    self.option = uiExtend(option, CFG, "wrapClass bodyClass");
}; Scroll.prototype = Prototype;

Prototype.init = function() {
    var self = this, opt = self.option,
        $el = self.$el, $body, $emit = self.emitter;

    $body = $el.find(opt.bodyClass);
    $body = $body.length ? $body : $el.children().eq(0);

    $el.addClass(opt.wrapClass);
    $body.addClass(opt.bodyClass);

    self.$body = $body;
    self.gesture = new Gesture($body)

    self.gesture.init();

    self.bindEvent();
    $emit.emit("init");

    return self;
}

Prototype.bindEvent = function() {
    this.gesture
    .off("start.core").on("start.core", function(e, touches) {
        e.stopPropagation();
        console.log("======== start....");
    }).off("move.core").on("move.core", function(e, touches) {
        e.stopPropagation();
        console.log("======== move....");
        console.log(e)
    }).off("end.core").on("end.core", function(e, touches) {
        e.stopPropagation();
        console.log("======== end....");
    });

    return this;
}

Prototype.disable = function() {

}

Prototype.resize = function() {

}

Prototype.on = function() {

}

Prototype.off = function() {

}

Prototype.once = function() {

}

Prototype.emit = function() {

}

Prototype.translate = function() {

}

Prototype.refresh = function() {

}

Prototype.scrollTo = function(x, y, time, animate) {

}

Prototype.scrollBy = function(x, y, time, animate) {

}

Prototype.scrollElement = function(select, time, animate) {

}

RootMagic.extend({scroll: function(el, option) {
    return new Scroll(el, option).init();
}});

RootMagic.fn.extend({scroll: function(option) {
    return new Scroll(this[0], option).init();
}})
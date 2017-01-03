import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {raf, clearRaf} from "CORE_STATIC/function/main.js";
import {uiInit, uiExtend} from "MUI/tools/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",

    scrollMaxSpend     : 2,
    scrollAcceleration : 0.0005,
    boundryAcceleration: 0.03,


    lockX: true,
    lockY: false,
    
    onInit: null,
}, Prototype = {};

function Scroll(el, option) {
    var self = this;

    self.$el = RootMagic(el);
    self.$body = null;

    self.x = 0;
    self.y = 0;

    self.distX = 0;
    self.distY = 0;

    self.minScrollX = 0;
    self.minScrollY = 0;

    self.maxScrollX = 0;
    self.maxScrollY = 0;

    self.emitter = Emitter();
    self.gesture = Gesture(self.$el);

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
    self.gesture.init();

    self.bindEvent().refresh();
    $emit.emit("init");

    return self;
}

Prototype.bindEvent = function() {
    var self = this, $emit = self.emitter, thresholdX, thresholdY;

    self.gesture.off("start.core").on("start.core", function(e, touch, touches) {
        thresholdY = self.y;
        $emit.emit("start", e, touch, touches);
    }).off("move.core").on("move.core", function(e, touch, touches) {
        var handle, oldPrevent = e.preventDefault;

        handle = raf(function() {
            self.translate(null, thresholdY + e.deltaY);
        });

        console.log(e)
        e.preventDefault = function() {
            clearRaf(handle);
            oldPrevent.call(e);
        }

        $emit.emit("scroll", e, touch, touches);
    }).off("end.core").on("end.core", function(e, touch, touches) {
        console.log("============ end ");
        console.log("X: "+JSON.stringify(self.computeScroll(e.velocityX)));
        console.log("Y: "+JSON.stringify(self.computeScroll(e.velocityY)));
        $emit.emit("scroll", e, touch, touches);
    });

    return this;
}

Prototype.refresh = function() {
    var self = this, $body = self.$body, offset;

    offset = $body.offset() || {};

    self.maxScrollY = -offset.height;
    self.maxScrollX = -offset.width;

    return self;
}

Prototype.computeScroll = function(spend) {
    var self = this, opt = self.option,
        minus = spend/Math.abs(spend) || 1, 
        maxSpend = opt.scrollMaxSpend, v, t, a, s, e;

    v = Math.abs(spend) < maxSpend ? spend : maxSpend * minus;
    a = opt.scrollAcceleration * minus;
    t = v/a || 0;
    s = t * v / 2;
    e = Math.abs(v) > maxSpend ? "circular" : "quadratic";

    return { scroll: s, easing: e, duration: t }
}

Prototype.translate = function(x, y) {
    var self = this, $body = self.$body;

    // if (x != null) {
    //     $body.transform("translateX", x);
    //     self.x = x;
    // }

    if (y != null) {
        $body.transform("translateY", y);
        self.y = y;
    }

    return self;
}

Prototype.scrollBy = function(x, y, time, animate) {
    var self = this, goX = self.x+x, goY = self.y+y;

    // if (x == null || goX < self.minScrollX || goX > self.maxScrollY) {
    //     goX = self.x;
    // }

    // if (y == null || goY < self.maxScrollY || goY > self.maxScrollY) {
    //     goY = self.y;
    // }

    self.translate(goX, goY);

    return self;
}

Prototype.scrollElement = function(select, time, animate) {

}

RootMagic.extend({scroll: function(el, option) {
    return new Scroll(el, option).init();
}});

RootMagic.fn.extend({scroll: function(option) {
    return new Scroll(this[0], option).init();
}})
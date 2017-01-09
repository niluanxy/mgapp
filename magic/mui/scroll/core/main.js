import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {uiInit, uiExtend} from "MUI/tools/main.js";
import {isFunction, isNumber} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

import {transform, transition} from "MUI/scroll/utils/tools.js";
import Animate from "MUI/scroll/utils/animate.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",

    scrollAnimate     : "quadratic",
    scrollAcceleration: 0.0005,

    boundry            : true,
    boundryRate        : 0.03,
    boundryTime        : 500,
    boundryAnimate     : "ease",
    boundryAcceleration: 0.382,  // 1 - 0.618

    velocityMin: 0.15,

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
    self.scale = 1;

    self.width  = 0;
    self.height = 0;

    self.maxScrollX = 0;
    self.maxScrollY = 0;

    self.animate = null;
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
    self.animate = new Animate($body);

    self.translate(0, 0).bindEvent().refresh();
    $emit.emit("init");

    return self;
}

Prototype.bindEvent = function() {
    var self = this, $emit = self.emitter,
        opt = self.option, thresholdX, thresholdY;

    self.gesture.off("start.core").on("start.core", function(e, touch, touches) {
        thresholdX = self.getScroll("x");
        thresholdY = self.getScroll("y");

        self.animate.stop();
        self.translate(thresholdX, thresholdY);
        $emit.emit("start", thresholdY, thresholdY, self);
    }).off("move.core").on("move.core", function(e, touch, touches) {
        var scrollX, scrollY, rate = opt.boundryAcceleration,
            maxX = self.maxScrollX, maxY = self.maxScrollY;

        if (!opt.lockX) scrollX = thresholdX + e.deltaX;
        if (!opt.lockY) scrollY = thresholdY + e.deltaY;

        // 超过边界，滚动速率放慢
        if (opt.boundry) {
            scrollX = scrollX > 0 ? scrollX * rate : scrollX;
            scrollX = scrollX < maxX ? (scrollX-maxX)*rate+maxX : scrollX;

            scrollY = scrollY > 0 ? scrollY * rate : scrollY;
            scrollY = scrollY < maxY ? (scrollY-maxY)*rate+maxY : scrollY;
        } else {
            scrollX = scrollX > 0 ? 0 : scrollX < maxX ? maxX : scrollX;
            scrollY = scrollY > 0 ? 0 : scrollY < maxY ? maxY : scrollY;
        }

        self.translate(scrollX, scrollY);
        $emit.emit("scroll", scrollX, scrollY, self);
    }).off("end.core").on("end.core", function(e, touch, touches) {
        var scrollX, scrollY, transM, minus, duration, animate,
            lockX = opt.lockX, lockY = opt.lockY,
            vel = e.velocity, velX = e.velocityX, velY = e.velocityY;

        if (Math.abs(vel) > opt.velocityMin) {
            transM = self.computeScroll(vel);

            if (!lockY || !lockX) {
                if (!lockX) {
                    minus = vel*velX >= 0 ? 1 : velX/Math.abs(velX);
                    scrollX = transM.scroll*minus + thresholdX + e.deltaX;
                } else {
                    minus = vel*velY >= 0 ? 1 : velY/Math.abs(velY);
                    scrollY = transM.scroll*minus + thresholdY + e.deltaY;
                }
            } else {
                scrollX = self.computeScroll(velX).scroll;
                scrollY = self.computeScroll(velY).scroll;
            }

            animate = opt.scrollAnimate;
            duration= transM.duration;
        } else {
            scrollX  = self.x;
            scrollY  = self.y;
            duration = 0;
            animate  = "";
        }

        self.scrollTo(scrollX, scrollY, duration, animate, function() {
            $emit.emit("end", self.x, self.y, self);
        });
    });

    return this;
}

Prototype.refresh = function() {
    var self = this, oBody, oWrap;

    oBody = self.$body.offset() || {};
    oWrap = self.$el.offset() || {};

    self.width = oBody.width;
    self.height= oBody.height;

    self.maxScrollX = oWrap.width - oBody.width;
    self.maxScrollY = oWrap.height - oBody.height;

    return self;
}

Prototype.scrollBy = function(stepX, stepY, time, animate, callback) {
    return this.scrollTo(self.x+stepX, self.y+stepY, time, animate, callback);
}

Prototype.scrollTo = function(scrollX, scrollY, time, animate, callback) {
    var self = this, opt = self.option, $emit = self.emitter, boundry, config,
        maxX = self.scrollX, maxY = self.maxScrollY, rate = opt.boundryRate;

    if (scrollX > 0 || scrollX < maxX) {
        boundry = true;
        scrollX = maxX + self.width*rate*(scrollX > 0 ? 1 : -1);
    }

    if (scrollY > 0 || scrollY < maxY) {
        boundry = true;
        scrollY = maxY + self.height*rate*(scrollY > 0 ? 1 : -1);
    }

    time = (time || 0)*(boundry ? 0.5 : 1);

    config = {
        time: time,
        style: self.getTrans(scrollX, scrollY),
        bezier: animate,

        runCall: function() {
            self.x = self.getScroll("x");
            self.y = self.getScroll("y");

            $emit.emit("scroll", self.x, self.y, self);
        },

        endCall: function() {
            console.log("has run transend")
            isFunction(callback) && callback();
        }
    }
    console.log(config)

    self.animate.stop().reset(config).run();

    return self;
}

Prototype.translate = function(x, y, scale) {
    var self = this;

    transform(self.$body, self.getTrans(x, y, scale));

    return this;
}

Prototype.getTrans = function(x, y, scale) {
    var self = this, translateZ = " translateZ(0)";

    self.x = x || self.x || 0;
    self.y = y || self.y || 0;
    self.scale = scale || this.scale || 1;

    return "translate("+self.x+"px,"+self.y+"px) scale("+this.scale+")"+translateZ;
}

Prototype.getScroll = function(direction) {
    var self = this, trans, finds;

    direction = direction === "x" ? 4 : 5;

    trans = transform(self.$body).match(/[-\d\.*\d*]+/g) || [];
    finds = transform.length > 6 ? 8 : 0;

    return Math.round(trans[finds+direction]) || 0;
}

Prototype.computeScroll = function(spend) {
    var self = this, opt = self.option,
        minus = spend/Math.abs(spend) || 1,
        maxSpend = opt.scrollMaxSpend, v, t, a, s, e;

    v = spend;
    a = opt.scrollAcceleration * minus;
    t = Math.abs(v/a || 0);
    s = t * v / 2;
    e = Math.abs(v) > maxSpend ? "circular" : "quadratic";

    return { scroll: s, easing: e, duration: t}
}

RootMagic.extend({scroll: function(el, option) {
    return new Scroll(el, option).init();
}});

RootMagic.fn.extend({scroll: function(option) {
    return new Scroll(this[0], option).init();
}})

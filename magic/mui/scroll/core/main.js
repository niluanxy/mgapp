import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {raf, clearRaf, tick, clearTick} from "CORE_STATIC/function/main.js";
import {uiInit, uiExtend} from "MUI/tools/main.js";
import {isFunction, isNumber} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",

    scrollAnimate     : "cubic-bezier(0.33,0.66,0.66,1)",
    scrollAcceleration: 0.0005,

    boundry            : true,
    boundryTime        : 500,
    boundryAnimate     : "cubic-bezier(0.25,0.1,0.25,1)",
    boundryAcceleration: 0.03,

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

    self.maxScrollX = 0;
    self.maxScrollY = 0;

    self.animateHandle = null;

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
    var self = this, $emit = self.emitter, opt = self.option,
        transHandle, lockX, lockY, thresholdX, thresholdY;

    self.gesture.off("start.core").on("start.core", function(e, touch, touches) {
        thresholdX = self.x;
        thresholdY = self.y;

        lockX = opt.lockX;
        lockY = opt.lockY;

        self.animateStop();
        $emit.emit("start", thresholdY, thresholdY, self);
    }).off("move.core").on("move.core", function(e, touch, touches) {
        var scrollX, scrollY;

        clearRaf(transHandle);
        if (!lockX) scrollX = thresholdX + e.deltaX;
        if (!lockY) scrollY = thresholdY + e.deltaY;
        transHandle = self.translate(scrollX, scrollY);

        $emit.emit("scroll", scrollX, scrollY, self);
    }).off("end.core").on("end.core", function(e, touch, touches) {
        var transX, transY, transM, minus, duration,
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
                scrollX = self.computeScroll(e.velocityX).scroll;
                scrollY = self.computeScroll(e.velocityY).scroll;
            }

            duration = transM.duration;

            self.animate(scrollX, scrollY, duration, opt.scrollAnimate, function() {
                console.log("animate scroll end");
                $emit.emit("end", self.x, self.y, self);
            });
        } else {
            $emit.emit("end", self.x, self.y, self);
        }
    });

    return this;
}

Prototype.refresh = function() {
    var self = this, oBody, oWrap;

    oBody = self.$body.offset() || {};
    oWrap = self.$el.offset() || {};

    self.maxScrollY = oWrap.height - oBody.height;
    self.maxScrollX = oWrap.width - oBody.width;

    return self;
}

Prototype.animateStop = function() {
    clearTick(this.animateHandle);
}

Prototype.animate = function(x, y, time, animate, callback) {
    var self = this, $body = self.$body;

    self.animateStop();

    if ((x !== undefined || y !== undefined) && time && animate) {
        self.translate(x, y, time, animate, function() {
            // 尝试检测是否需要反弹
            if (self.option.boundry) {
                self.boundry(callback);
            } else {
                if(isFunction(callback)) callback(self.x, self.y, self);
            }

            self.animateStop();
            console.log("transition end");
        });

        self.animateHandle = tick(function() {
            // console.log("move: "+$body.transform("translateY"));
        });
    }

    return self;
}

Prototype.translate = function(x, y, time, animate, callback) {
    var self = this, $body = self.$body, transition;

    return raf(function() {
        $body.transition("none").off("transitionend");

        if (x != null) {
            $body.transform("translateX", x);
            self.x = x;
        }

        if (y != null) {
            $body.transform("translateY", y);
            self.y = y;
        }

        if (isNumber(time) && animate) {
            $body.transition("all "+time+"ms "+animate+" 0ms");

            if (isFunction(callback)) {
                $body.once("transitionend", function() {
                    callback(self.x, self.y, self);
                });
            }
        }
    });
}

Prototype.boundry = function(callback, time, animate) {
    var self = this, opt = self.option, scrollX, scrollY, aTime, aAnima;

    aTime  = time || opt.boundryTime;
    aAnima = animate || opt.boundryAnimate;

    if (aTime && aAnima) {
        if (self.x > 0 || self.x < self.maxScrollX) {
            scrollX = self.x > 0 ? 0 : self.maxScrollX;
        }

        if (self.y > 0 || self.y < self.maxScrollY) {
            scrollY = self.y > 0 ? 0 : self.maxScrollY;
        }

        if (scrollX || scrollY) {
            self.translate(scrollX, scrollY, aTime, aAnima, callback);
        } else if (isFunction(callback)) {
            callback(self.x, self.y, self);
        }
    }

    return self;
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

    return { scroll: s, easing: e, duration: t, spend: v }
}

RootMagic.extend({scroll: function(el, option) {
    return new Scroll(el, option).init();
}});

RootMagic.fn.extend({scroll: function(option) {
    return new Scroll(this[0], option).init();
}})
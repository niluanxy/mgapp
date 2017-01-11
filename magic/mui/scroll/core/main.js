import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {uiExtend} from "MUI/tools/main.js";
import {value} from "LIB_MINJS/utils.js";
import {isFunction} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

import {transform} from "MUI/scroll/utils/tools.js";
import Animate from "MUI/scroll/utils/animate.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",

    scrollMaxSpend    : 2,
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
}, Prototype = {}, ABS = Math.abs;

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
            lockX = opt.lockX, lockY = opt.lockY, maxX, maxY,
            vel = e.velocity, velX = e.velocityX, velY = e.velocityY;

        maxX = self.maxScrollX;
        maxY = self.maxScrollY;

        if (ABS(vel) > opt.velocityMin) {
            transM = self.computeScroll(vel);

            if (!lockY || !lockX) {
                transM.scroll = ABS(transM.scroll);

                if (!lockX) {
                    minus = velX/ABS(velX);
                    scrollX = transM.scroll*minus + thresholdX + e.deltaX;
                } else {
                    minus = velY/ABS(velY);
                    scrollY = transM.scroll*minus + thresholdY + e.deltaY;
                }
            } else {
                scrollX = self.computeScroll(velX).scroll;
                scrollY = self.computeScroll(velY).scroll;
            }

            animate = transM.easing;
            duration= transM.duration;
        } else {
            scrollX  = self.x;
            scrollY  = self.y;
            duration = 0;
            animate  = "";
        }

        // 没有越界，且没动画效果，则直接更新状态，触发事件
        if (!duration && scrollX <= 0 && scrollX >= maxX && scrollY <= 0 && scrollY >= maxY) {
            self.updatePos("end");
        } else {
            self.scrollTo(scrollX, scrollY, duration, animate);
        }
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

Prototype.scrollTo = function(scrollX, scrollY, time, animate) {
    var self = this, opt = self.option, $emit = self.emitter, config, boundry,
        maxX = self.maxScrollX, maxY = self.maxScrollY, rate = opt.boundryRate,
        topX, topY, bottomX, bottomY;

    time = Math.round(time || 0);

    // 释放的时候已经越界
    if (self.x > 0 || self.x < maxX || self.y > 0 || self.y < maxY) {
        self.boundry();
    } else if (time && animate) {
        topX = self.width*rate;
        topY = self.height*rate;

        bottomX = scrollX < maxX ? maxX - topX : maxX;
        bottomY = scrollY < maxY ? maxY - topY : maxY;

        config = {
            time: time,
            style: self.getTrans(scrollX, scrollY),
            bezier: animate,

            runCall: function() {
                self.updatePos("scroll");

                // 滚动中越界判断
                if (self.x < bottomX || self.y < bottomY || self.x > topX || self.y > topY ) {
                    self.boundry();
                }
            },

            endCall: function() {
                // 滚动结束越界判断
                if (self.x > 0 || self.y > 0 || self.x < maxX || self.y < maxY) {
                    self.boundry();
                } else {
                    self.updatePos("end");
                }
            }
        }

        self.animate.reset(config).run();
    } else {
        // 无动画效果直接设置样式
        self.translate(scrollX, scrollY);
    }

    return self;
}

Prototype.updatePos = function(eveName) {
    var self = this, $emit = self.emitter;

    self.x = self.getScroll("x");
    self.y = self.getScroll("y");

    if (eveName) $emit.emit(eveName, self.x, self.y, self);

    return self;
}

Prototype.boundry = function() {
    var self = this, opt = self.option,
        x = self.x, y = self.y, maxX, maxY;

    maxX = self.maxScrollX;
    maxY = self.maxScrollY;

    x = x > 0 ? 0 : x < maxX ? maxX : x;
    y = y > 0 ? 0 : y < maxY ? maxY : y;

    if (x != self.x || y != self.y) {
        self.animate.reset({
            time: opt.boundryTime,
            style: self.getTrans(x, y),
            bezier: opt.boundryAnimate,

            runCall: function() {
                self.updatePos("scroll");
            },

            endCall: function() {
                self.updatePos("end");
            }
        }).run();
    }
}

Prototype.translate = function(x, y, scale) {
    var self = this;

    transform(self.$body, self.getTrans(x, y, scale));

    return this;
}

Prototype.getTrans = function(x, y, scale) {
    var self = this, translateZ = " translateZ(0)";

    self.x = value(x, self.x, 0);
    self.y = value(y, self.y, 0);
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
        maxSpend = opt.scrollMaxSpend, v, t, a, s, e;

    v = spend > maxSpend ? maxSpend*(spend/ABS(spend)) : spend;
    a = opt.scrollAcceleration;
    t = ABS(v/a || 0);
    s = t * v / 2;
    e = ABS(spend) > maxSpend ? "circular" : "quadratic";

    return { scroll: s, easing: e, duration: t}
}

RootMagic.extend({scroll: function(el, option) {
    return new Scroll(el, option).init();
}});

RootMagic.fn.extend({scroll: function(option) {
    return new Scroll(this[0], option).init();
}})

import RootMagic from "CORE_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import Gesture from "MUI/gesture/core/main.js";
import {uiExtend} from "MUI/tools/main.js";
import {each, value, trim} from "LIB_MINJS/utils.js";
import {isString, isFunction} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

import {transform} from "MUI/scroll/utils/tools.js";
import Animate from "MUI/scroll/utils/animate.js";

var CFG = $config.scroll = {
    class: "scroll",

    wrapClass: "scroll",
    bodyClass: "scroll_body",

    scrollAnimate     : "circular",
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

    plugins: "",

    onInit: null,
},
Prototype = {}, ABS = Math.abs,
CoreEves = "start scroll end".split(" "), CoreEvesPre = "__";

export var Plugins = {};
export default function Scroll(el, option) {
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

    self.minScrollX = 0;
    self.minScrollY = 0;

    self.boundryTopX = 0;
    self.boundryTopY = 0;
    self.boundryBomX = 0;
    self.boundryBomY = 0;

    self.plugins = {};
    self.animate = null;
    self.emitter = Emitter();
    self.gesture = Gesture(self.$el);

    self.option = uiExtend(option, CFG, "wrapClass bodyClass");
}; Scroll.prototype = Prototype; Scroll.plugins = Plugins;

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

    opt.plugins = (trim("core "+opt.plugins)).split(" ");
    self.translate(0, 0).initEvent().refresh();
    $emit.emit("init");

    return self;
}

Prototype.initEvent = function() {
    var self = this, opt = self.option,
        $gest = self.gesture, $emit = self.emitter;

    each(self.plugins, function(key) {
        self.detach(key);
    });

    each(opt.plugins || [], function(i, val) {
        self.attach(val);
    });

    function emitCall(index, e, touches) {
        var cache = {}, runEve = CoreEves[index];

        $emit.emit(CoreEvesPre+runEve, e, touches, self, cache);

        if (index === 2) {
            self.scrollTo(cache.scrollX, cache.scrollY, cache.duration, cache.animate);
        } else {
            self.translate(cache.scrollX, cache.scrollY);
        }

        $emit.emit(runEve, e, self);
    }

    $gest.off("start").off("move").off("end")
    .on("start", function(e, touch, touches) {
        self.animate.stop();

        // 防止暂停动画时，已经越界太多，导致页面空白问题
        if (self.boundryCheck()) {
            var scrollX = self.getScroll("x"),
                scrollY = self.getScroll("y");

            if (scrollX < self.maxScrollX) {
                scrollX = scrollX < self.boundryBomX ? self.boundryBomX : scrollX;
            } else {
                scrollX = scrollX > self.boundryTopX ? self.boundryTopX : scrollX;
            }

            if (scrollY < self.maxScrollY) {
                scrollY = scrollY < self.boundryBomY ? self.boundryBomY : scrollY;
            } else {
                scrollY = scrollY > self.boundryTopY ? self.boundryTopY : scrollY;
            }

            self.translate(scrollX, scrollY);
        }

        emitCall(0, e, touches);
    }).on("move", function(e, touch, touches) {
        emitCall(1, e, touches);
    }).on("end", function(e, touch, touches) {
        emitCall(2, e, touches);
    });

    return this;
}

Prototype.attach = function(plugin) {
    var self = this, name, attachPlugin, $emit = self.emitter;

    if (isString(plugin) && Plugins[plugin]) {
        attachPlugin = Plugins[plugin];
    } else if (isFunction(plugin)) {
        attachPlugin = plugin;
    }

    if (attachPlugin) {
        attachPlugin = new attachPlugin(self, self.option);
        name = attachPlugin.uuid;

        each(CoreEves, function(i, key) {
            if (isFunction(attachPlugin[key])) {
                var bindEve = CoreEvesPre+key+"."+name;

                $emit.patch(bindEve, function(e, touch, touches, root, translate) {
                    attachPlugin[key](e, touch, touches, root, translate);
                });
            }
        });

        self.plugins[name] = attachPlugin;
    }

    return self;
}

Prototype.detach = function(plugin) {
    var self = this, $emit = self.emitter, del;

    if ((del = self.plugins[plugin])) {
        each(CoreEves, function(i, key) {
            var bindEve = CoreEvesPre+key;

            $emit.unpatch(bindEve+"."+del.uuid);
        });

        delete self.plugins[plugin];
    }

    return self;
}

Prototype.on = function(eve, callback) {
    var self = this;

    self.emitter.on(eve, callback);

    return self;
}

Prototype.off = function(eve, callback) {
    var self = this;

    self.emitter.off(eve, callback);

    return self;
}

Prototype.once = function(eve, callback) {
    var self = this;

    self.emitter.once(eve, callback);

    return self;
}

Prototype.refresh = function(minSX, minSY) {
    var self = this, rate = self.option.boundryRate,
        oBody, oWrap, minX, minY, maxX, maxY, width, height;

    oBody = self.$body.offset() || {};
    oWrap = self.$el.offset() || {};

    width = oBody.width;
    height= oBody.height;

    minX = minSX || 0; minY = minSY || 0;
    maxX = oWrap.width - oBody.width;
    maxY = oWrap.height - oBody.height;

    self.width = width;
    self.height= height;

    self.minScrollX = minX;
    self.minScrollY = minY;
    self.maxScrollX = maxX;
    self.maxScrollY = maxY;

    self.boundryTopX = minX+width*rate;
    self.boundryTopY = minY+width*rate;
    self.boundryBomX = maxX-width*rate;
    self.boundryBomY = maxY-width*rate;

    return self;
}

Prototype.scrollBy = function(stepX, stepY, time, animate, callback) {
    return this.scrollTo(self.x+stepX, self.y+stepY, time, animate, callback);
}

Prototype.scrollTo = function(scrollX, scrollY, time, animate) {
    var self = this, opt = self.option,
        $emit = self.emitter, config, topX, topY, bomX, bomY;

    time = Math.round(time || 0);

    // 释放的时候已经越界
    if (self.boundryCheck()) {
        self.boundry();
    } else if (time) {
        topX = self.boundryTopX; topY = self.boundryTopY;
        bomX = self.boundryBomX; bomY = self.boundryBomY;

        animate = animate || opt.scrollAnimate;

        config = {
            time: time,
            style: self.getTrans(scrollX, scrollY),
            bezier: animate,

            runCall: function() {
                self.updatePos("scroll");

                // 滚动中越界判断
                if (self.boundryCheck(topX, topY, bomX, bomY)) {
                    self.boundry();
                }
            },

            endCall: function() {
                // 滚动结束越界判断
                if (self.boundryCheck()) {
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

Prototype.boundryCheck = function(minX, minY, maxX, maxY) {
    var self = this, aminX, aminY, amaxX, amaxY, sx, sy;

    sx = self.getScroll("x"); sy = self.getScroll("y");

    amaxX = maxX || self.maxScrollX; amaxY = maxY || self.maxScrollY;
    aminX = minX || self.minScrollX; aminY = minY || self.minScrollY;

    return sx > aminX || sx < amaxX || sy > aminY || sy < amaxY;
}

Prototype.boundry = function() {
    var self = this, opt = self.option,
        x = self.x, y = self.y,
        maxX = self.maxScrollX,
        maxY = self.maxScrollY,
        minX = self.minScrollX,
        minY = self.minScrollY;

    x = x > minX ? minX : x < maxX ? maxX : x;
    y = y > minY ? minY : y < maxY ? maxY : y;

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

    v = spend;
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
}});

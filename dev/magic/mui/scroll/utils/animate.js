import RootMagic from "MG_MAGIC/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import {element, extend, each} from "LIB_MINJS/utils.js";
import {tick, clearTick} from "MG_STATIC/function/main.js";

import {transition, transform} from "MG_UIKIT/scroll/utils/tools.js";

/**
 * config: style time bezier runCall endCall
 */
var Animate = function(el) {
    var self = this;

    self.$el = RootMagic(el);

    self.config = {};
    self.timeHandle = null;
    self.tickHandle = null;
}, Prototype = Animate.prototype = {};

Animate.RESETS = "style time bezier runCall endCall".split(" ");
Animate.BEZIER = {
    ease     : "0.25, 0.1, 0.25, 1",
    bounce   : "0.71, 1.35, 0.47, 1.41",
    circular : "0.1, 0.57, 0.1, 1",
    quadratic: "0.33, 0.66, 0.66, 1",
};

Prototype.run = function() {
    var self = this, cfg = self.config,
        endCall = cfg.endCall, runCall = cfg.runCall;

    self.trans().rebind(true);

    self.tickHandle = tick(function() {
        isFunction(runCall) && runCall();
    });

    self.timeHandle = setTimeout(function() {
        self.stop();
        isFunction(endCall) && endCall();
    }, cfg.time + 60);

    return self;
}

Prototype.stop = function() {
    var self = this;

    self.rebind(null);
    transition(self.$el, "none");
    clearTick(self.tickHandle);
    clearTimeout(self.timeHandle);

    return self;
}

Prototype.reset = function(option) {
    var self = this, sets = option || {};

    // 自动先清除旧的信息
    each(Animate.RESETS, function(i, val) {
        self.config[val] = "";
    });

    self.stop();

    each(sets, function(key, val) {
        if (val !== undefined) {
            self.config[key] = val;
        }
    });

    return self;
}

Prototype.trans = function() {
    var self = this, trans, cfg = self.config,
        bezier = cfg.bezier, time = cfg.time;

    if (!bezier || !time) {
        trans = "none";
    } else {
        trans = "all "+time+"ms ";

        if (bezier.match("cubic-bezier")) {
            trans += bezier;
        } else {
            bezier = Animate.BEZIER[bezier];
            trans += "cubic-bezier("+bezier+")";
        }

        trans = bezier ? trans+" 0ms" : "none";
    }

    transition(self.$el, trans);
    transform(self.$el, cfg.style || "");

    return self;
}

Prototype.rebind = function(bind) {
    var self = this, endCall = self.config.endCall,
        eventEnd = "transitionend.scroll_animate";

    self.$el.off(eventEnd);

    if (bind === true) {
        self.$el.on(eventEnd, function() {
            self.stop();
            isFunction(endCall) && endCall();
        });
    }

    return self;
}

export default Animate;

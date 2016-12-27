import RootMagic from "CORE_MAGIC/main.js";
import {time as getTime} from "CORE_STATIC/util/main.js";
import {supportPassive} from "CORE_STATIC/platform/main.js";
import {extend, each} from "LIB_MINJS/utils.js";
import Emitter from "LIB_MINJS/emitter.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.gesture = {
    passive: true,
    delayCall: 4,
    preventMove: true,
};

var Prototype = {}, touchFilter, bindTrans, GestureBindCore,
    bind = "addEventListener", unbind = "removeEventListener",
    key = "start", keyTime = key+"Time", keyX = key+"X", keyY = key+"Y",
    bindStart = "MSPointerDown pointerdown ",
    bindMove  = "MSPointerMove pointermove ",
    bindEnd   = "MSPointerUp pointerup ",
    touchStart = "touchstart", touchMove = "touchmove", touchEnd = "touchend touchcancel",
    mouseStart = "mousedown", mouseMove = "mousemove", mouseEnd = "mouseup",
    touchFind = "changedTouches touches".split(" "),
    touchKeys = "pageX pageY clientX clientY screenX screenY".split(" ");

touchFilter = function(callback, delay) {
    var handle, lastType, find;

    return function(e) {
        var debounce = delay || CFG.delayCall,
            type = e.type, context = this;

        if (!find && type != lastType) {
            clearTimeout(handle);

            lastType = type;
            find = !!type.match(/^touch/);

            handle = setTimeout(function() {
                find = false;
                lastType = "";
                callback.call(context, e);
            }, debounce || 0);
        }
    }
};

bindTrans = function(scope, eveName) {
    var baseCall = scope[eveName];
    scope[eveName] = function(e) {
        baseCall.call(scope, e);
    }
};

GestureBindCore = function(scope) {
    var self = this, fix = "start move end".split(" ");

    self.gesture = scope;
    self.emitter = scope.emit;

    self.startTime = 0;
    self.startTouch= [];
    self.endTime   = 0;
    self.endTouch  = [];

    // 修复绑定事件后 this 对象异常问题
    each(fix, function(i, eveName) {
        bindTrans(self, eveName);
    });
}

GestureBindCore.prototype = {
    getTouch: function(e) {
        var result = [], cache,
            fidLen = touchFind.length,
            keyLen = touchKeys.length;

        each(touchFind, function(i, key) {
            if (e[key] && e[key].length) {
                cache = e[key]; return false;
            }
        });
        cache = cache || [e];

        each(cache, function(i, copy) {
            var touch = {}, key;

            each(touchKeys, function(i, key) {
                if (copy[key] !== undefined) {
                    touch[key] = copy[key];
                }
            });

            result.push(touch);
        });

        return result;
    },

    emit: function() {
        var self = this, emitter = self.emitter;

        emitter.emit.apply(emitter, arguments);
    },

    start: touchFilter(function(e) {
        var self = this,
            time = getTime(), touch = self.getTouch(e);

        self.startTime = time;
        self.startTouch = touch;
        self.emit("start", touch, e, self);
    }),

    move: function(e) {
        if (e.cancelable && CFG.preventMove) {
            e.preventDefault();
        }

        var self = this, touch = this.getTouch(e);

        self.emit("move", touch, e, self);
    },

    end: touchFilter(function(e) {
        var self = this, time = getTime(), touch = self.getTouch(e);

        self.endTime = time;
        self.endTouch = touch;
        self.emit("end", touch, e, self);
    })
};

function Gesture(el, option) {
    var self = this, emitter = Emitter();

    self.el = el || document;
    self.emit = emitter;
    self.option = extend({}, CFG, option);
}; Gesture.prototype = Prototype;

Prototype.filter = touchFilter;

Prototype.init = function() {
    var bindDom = this.el, bindArrs,
        bindCall = "start move end".split(" "),
        bindCore, eveStart, eveMove, eveEnd,
        eveBind = bindDom[bind] ? bind : "attachEvent",
        eveUnbind = bindDom[unbind] ? unbind : "detachEvent";

    // 动态确定生成最终绑定的事件数组
    if (window.ontouchstart !== undefined) {
        eveStart = bindStart + touchStart;
        eveMove  = bindMove + touchMove;
        eveEnd   = bindEnd + touchEnd;
    } else {
        eveStart = bindStart + mouseStart;
        eveMove  = bindMove + mouseMove;
        eveEnd   = bindEnd + mouseEnd;
    }

    bindArrs = [
        eveStart.split(" "),
        eveMove.split(" "),
        eveEnd.split(" "),
    ];

    bindCore = new GestureBindCore(this);

    each(bindArrs, function(i, types) {
        var bindOption = supportPassive && i==0 ? {
            capture: true,
            passive: true,
        } : true, call = bindCall[i];

        call = bindCore[call] || null;

        each(types, function(j, event) {
            bindDom[unbind](event, call);
            bindDom[bind](event, call, bindOption);
        });
    });

    return this;
}

Prototype.on = function(eve, call, scope) {
    var emit = this.emit;
    emit.on.apply(emit, arguments);

    return this;
}

Prototype.off = function(eve, call) {
    var emit = this.emit;
    emit.off.apply(emit, arguments);

    return this;
}

function Creater(el, option) {
    return new Gesture(el, option);
};

// 创建一个默认的单例对象，用于默认实例
var single = new Gesture(), proxy = "on off init filter".split(" ");
for(var i=0; i<proxy.length; i++) {
    var key = proxy[i];

    Creater[key] = (function(eveKey) {
        return function() {
            single[eveKey].apply(single, arguments);
            return Creater;
        }
    })(key);
}

export default Creater;
import RootMagic from "CORE_MAGIC/main.js";
import {time as getTime} from "CORE_STATIC/utils/main.js";
import {extend, each, element} from "LIB_MINJS/utils.js";
import fastCall from "LIB_MINJS/fastcall.js";
import Emitter from "LIB_MINJS/emitter.js";
import {copyEvent} from "CORE_MODULE/event/core/main.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.gesture = {
    passive : true,
    debounce: 10,
    preventMove: true,
},  
    Prototype = {}, touchFilter, getTouch, touchSum,
    touchFind = "changedTouches touches".split(" "), ABS = Math.abs,
    touchKeys = "pageX pageY clientX clientY screenX screenY".split(" ");

getTouch = function(e) {
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
};

touchFilter = function(callback, scope) {
    var lastTouches = [], lastType = "", lastEvent, lastCount = 0;

    return function(event) {
        var touches = getTouch(event), type = event.type,
            sameLast = true, context = scope || this;

        if (touches.length != lastTouches.length) {
            sameLast = false;
        } else {
            each(touches, function(i, touch) {
                var lastTouch = lastTouches[i];

                if (touch.pageX !== lastTouch.pageY ||
                    touch.pageY !== lastTouch.pageY) {
                    sameLast = false; return false;
                }
            });
        }

        if ((!sameLast && lastEvent) || (lastType != type && type.match(/^touch/))) {
            callback.call(context, event, touches);
            lastEvent = null; lastCount++;
        } else {
            lastType = type;
            lastEvent = event;
            lastTouches = touches;

            (function(checkCount, runContext) {
                fastCall(function() {
                    if (checkCount == lastCount && lastEvent) {
                        callback.call(runContext, lastEvent, lastTouches);
                        lastEvent = null;
                    }
                });
            })(lastCount, context);
        }
    }
};

touchSum = function(self, e, touches) {
    var startTime = self.startTime,
        startTouch= self.startTouch[0],

        nowTime   = getTime(),
        nowTouch  = touches[0],
        lastTouch = self.lastTouch[0],

        lastMove, lastTime, ratio, moveMax, xMax,
        xmorMax, direction, deltaTime, deltaX, deltaY;

    if (self.lastType !== "start" && e.type !== self.lastType 
        && nowTouch.pageX == lastTouch.pageX && nowTouch.pageY == lastTouch.pageY) {
        
        lastMove = self.lastMove || {};

        lastTime = lastMove.lastTime;
        lastTouch= lastMove.lastTouch[0];

        nowTime  = self.lastTime;
        nowTouch = self.lastTouch[0];
    } else {
        lastTime = self.lastTime;
    }

    ratio = Math.sqrt((document.documentElement.clientWidth/screen.width) || 1);
    deltaX = nowTouch.pageX - startTouch.pageX;
    deltaY = nowTouch.pageY - startTouch.pageY;
    deltaTime = nowTime - startTime;

    xmorMax = ABS(deltaX) >= ABS(deltaY);
    moveMax = xmorMax ? deltaX : deltaY;

    direction  = xmorMax ? Prototype.MOVE_LEFT : Prototype.MOVE_UP;
    direction *= moveMax >= 0 ? 2 : 1;

    // 计算结果传递到 event 对象上
    e.deltaX = deltaX;
    e.deltaY = deltaY;
    e.deltaTime = deltaTime;

    e.direction = direction;

    // 暂存最后一次滚动的数据
    self.lastMove  = {
        lastType : self.lastType,
        lastTime : self.lastTime,
        lastTouch: self.lastTouch,
    };

    self.lastType  = e.type;
    self.lastTime  = nowTime;
    self.lastTouch = touches;

    // 当前速度：(本次距离-上次距离)/(本次时间-上次时间)
    deltaTime = nowTime - lastTime;
    deltaX = nowTouch.pageX - lastTouch.pageX;
    deltaY = nowTouch.pageY - lastTouch.pageY;

    e.velocityX = deltaX/deltaTime/ratio;
    e.velocityY = deltaY/deltaTime/ratio;
    e.velocity  = xmorMax ? e.velocityX : e.velocityY;

    return self;
};

function Gesture(el, option) {
    var self = this, emitter = Emitter(), opt;

    self.el = element(el) || document;
    self.option = opt = extend({}, CFG, option);
    self.emitter= emitter;

    self.startTime = 0;
    self.startTouch= [{}];
    self.endTime   = 0;
    self.endTouch  = [{}];

    self.lastType  = "";
    self.lastTime  = 0;
    self.lastTouch = [{}];

    self._start = touchFilter(function(e, touches) {
        self.startTime = self.lastTime = getTime();
        self.startTouch= self.lastTouch= touches;

        self.lastType = "start";

        // 初始化 event 对象起始值
        e.deltaX = 0;
        e.deltaY = 0;
        e.deltaTime = 0;

        e.direction = 1;

        e.velocity  = 0;
        e.velocityX = 0;
        e.velocityY = 0;

        self.emit("start", e, touches[0], touches);
    }, self);

    self._move = touchFilter(function(e, touches) {
        if (e.cancelable && opt.preventMove) {
            e.preventDefault();
        }

        touchSum(self, e, touches)
            .emit("move", e, touches[0], touches);
    }, self);

    self._end = touchFilter(function(e, touches) {
        self.endTime = getTime();
        self.endTouch = touches;

        touchSum(self, e, touches)
            .emit("end", e, touches[0], touches);
    }, self);
}; Gesture.prototype = Prototype;

extend(Prototype, {
    MOVE_NONE :  1,
    MOVE_LEFT :  2,
    MOVE_RIGHT:  4,
    MOVE_UP   :  8,
    MOVE_DOWN : 16,
});

Prototype.init = function() {
    var bindArrs, eveBind, eveUnbind, eveStart, eveMove, eveEnd,
        bindCall = "_start _move _end".split(" "), DOC = document,

        bind = "addEventListener", unbind = "removeEventListener",
        bindStart = "MSPointerDown pointerdown ",
        bindMove  = "MSPointerMove pointermove ",
        bindEnd   = "MSPointerUp pointerup ", bindArrs, supportPassive = RootMagic.supportPassive,
        touchStart = "touchstart", touchMove = "touchmove", touchEnd = "touchend touchcancel",
        mouseStart = "mousedown", mouseMove = "mousemove", mouseEnd = "mouseup";

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

    eveBind = DOC[bind] ? bind : "attachEvent",
    eveUnbind = DOC[unbind] ? unbind : "detachEvent";

    Prototype.init = function() {
        var self = this, bindDom = self.el;

        each(bindArrs, function(i, types) {
            var bindOption = supportPassive && i==0 ? {
                capture: true,
                passive: !!self.option.passive,
            } : true, call = bindCall[i];

            call = self[call] || null;

            each(types, function(j, event) {
                bindDom[unbind](event, call);
                bindDom[bind](event, call, bindOption);
            });
        });

        return self.emit("init");
    };

    return this.init();
}

Prototype.on = function(eve, call, scope) {
    this.emitter.on(eve, call, this);

    return this;
}

Prototype.once = function(eve, call, scope) {
    this.emitter.once(eve, call, this);

    return this;
}

Prototype.off = function(eve, call) {
    this.emitter.off(eve, call);

    return this;
}

Prototype.emit = function() {
    var emitter = this.emitter;
    emitter.emit.apply(emitter, arguments);

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
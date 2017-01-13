import RootMagic from "CORE_MAGIC/main.js";
import {time as getTime} from "CORE_STATIC/utils/main.js";
import {extend, each, element, trim} from "LIB_MINJS/utils.js";
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
    var pixRatio = window.devicePixelRatio || 1;

    pixRatio = Math.max(pixRatio, document.documentElement.clientWidth/screen.width || 1);

    function updateSelf(self, e, touches, time, delta) {
        self.lastTime = time || getTime();
        self.lastTouch = touches;

        self.cacheDelta = delta;
    }

    function getDelta(end, start, endTime, startTime) {
        var xmorMax, moveMax, deltaTime, deltaX, deltaY, direction;

        deltaX = end.pageX - start.pageX;
        deltaY = end.pageY - start.pageY;

        xmorMax = ABS(deltaX) >= ABS(deltaY);
        moveMax = xmorMax ? deltaX : deltaY;

        deltaTime = endTime - startTime;

        direction  = xmorMax ? Prototype.MOVE_LEFT : Prototype.MOVE_UP;
        direction *= moveMax >= 0 ? 2 : 1;

        return {
            deltaX   : deltaX,
            deltaY   : deltaY,
            deltaMax : moveMax,
            deltaTime: deltaTime,

            velocity : moveMax/pixRatio/deltaTime,
            velocityX: deltaX/pixRatio/deltaTime,
            velocityY: deltaY/pixRatio/deltaTime,

            direction: direction,
        }
    }

    function setDelta(object, delta) {
        object.delta  = delta.delta;
        object.deltaX = delta.deltaX;
        object.deltaY = delta.deltaY;

        object.deltaTime = delta.deltaTime;
    }

    function setVelocity(object, velocity) {
        object.velocity  = velocity.velocity;
        object.velocityX = velocity.velocityX;
        object.velocityY = velocity.velocityY;

        object.direction = velocity.direction;
    }

    function isDebounce(now, last) {
        var change = ABS(now.velocity/last.velocity);

        return change > 5 || change < 0.2;
    }

    return (touchSum = function(self, e, touches) {
        var allDelta, nowDelta, lastDelta, nowTime, nowTouch, lastTouch;

        nowTime = getTime();

        nowTouch  = touches[0];
        lastTouch = self.lastTouch;
        lastDelta = self.cacheDelta;

        allDelta = getDelta(nowTouch, self.startTouch[0], nowTime, self.startTime);
        nowDelta = getDelta(nowTouch, self.lastTouch[0],  nowTime, self.lastTime);

        // 更新 总的 delta 信息
        setDelta(e, allDelta);

        if (isDebounce(nowDelta, allDelta)) {
            setVelocity(e, lastDelta);
            updateSelf(self, e, touches, nowTime, lastDelta);
        } else {
            setVelocity(e, nowDelta);
            updateSelf(self, e, touches, nowTime, nowDelta);
        }

        return self;
    })(self, e, touches);
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

        self.bind("move").emit("start", e, touches[0], touches);
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
            .unbind("move").emit("end", e, touches[0], touches);
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
    var bindMaps, eveBind, eveUnbind, eveStart, eveMove, eveEnd, DOC = document,

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

    bindMaps = {
        start: eveStart.split(" "),
        move : eveMove.split(" "),
        end  : eveEnd.split(" "),
    };

    eveBind = DOC[bind] ? bind : "attachEvent",
    eveUnbind = DOC[unbind] ? unbind : "detachEvent";

    Prototype.init = function() {
        var self = this, bindDom = self.el;

        self.bind("start").bind("end");

        return self.emit("init");
    };

    Prototype.bind = function(type) {
        var self = this, bindDom = self.el,
            eveNames = bindMaps[type],
            listener = self["_"+type], eveOption;

        eveOption = supportPassive && type=="start" ? {
            capture: true,
            passive: !!self.option.passive,
        } : true;

        each(eveNames, function(i, name) {
            bindDom[eveBind](name, listener);
            bindDom[eveUnbind](name, listener, eveOption);
        });

        return self;
    }

    Prototype.unbind = function(type) {
        var self = this, bindDom = self.el,
            eveNames = bindMaps[type],
            listener = self["_"+type];

        each(eveNames, function(i, name) {
            bindDom[eveUnbind](name, listener);
        });

        return self;
    }

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

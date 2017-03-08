import RootMagic from "MG_MAGIC/main.js";
import {time as getTime} from "MG_STATIC/utils/main.js";
import Support from "MG_CORE/support/main.js";
import {extend, each, element, trim} from "LIB_MINJS/utils.js";
import fastCall from "LIB_MINJS/fastcall.js";
import Emitter from "LIB_MINJS/emitter.js";
import {copyEvent} from "MG_MODULE/event/core/main.js";
import ConfigUI from "MG_UIKIT/base/config.js";

var CFG = ConfigUI.gesture = {
    capture : true,
    passive : true,

    movePrevent : true,
    moveDebounce: false,
},
    Prototype = {}, ABS = Math.abs,
    touchFind = "changedTouches touches".split(" "), ABS = Math.abs,
    touchKeys = "pageX pageY clientX clientY screenX screenY".split(" ");

function getTouch(e) {
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


function touchSum(self, e, touches) {
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
            if (nowDelta.deltaTime > CFG.debounceTime) {
                var timeMore = allDelta.deltaTime/CFG.debounceTime;

                lastDelta.velocity  /= timeMore;
                lastDelta.velocityX /= timeMore;
                lastDelta.velocityY /= timeMore;
            }

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

    self.$el = RootMagic(el || document);
    self.option = opt = extend({}, CFG, option);
    self.emitter= emitter;

    self.startTime = 0;
    self.startTouch= [{}];
    self.endTime   = 0;
    self.endTouch  = [{}];
    self.lastTime  = 0;
    self.lastTouch = [{}];
}; Gesture.prototype = Prototype;

extend(Prototype, {
    MOVE_NONE :  1,
    MOVE_LEFT :  2,
    MOVE_RIGHT:  4,
    MOVE_UP   :  8,
    MOVE_DOWN : 16,
});

Prototype._start = function(e, touches) {
    var self = this, opt = self.option;

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
}

Prototype._move = function(e, touches) {
    var self = this, opt = self.option;

    if (e.cancelable && opt.movePrevent) {
        e.preventDefault();
    }

    if (!opt.moveDebounce || new Date().getTime() - self.lastTime >= opt.moveDebounce) {
        touchSum(self, e, touches)
            .emit("move", e, touches[0], touches);
    }
}

Prototype._end = function(e, touches) {
    var self = this, opt = self.option;

    self.endTime = getTime();
    self.endTouch = touches;

    touchSum(self, e, touches).unbind("move")
        .emit("end", e, touches[0], touches);
}

Prototype.init = function() {
    var binds = [
        {start: "touchstart",    move: "touchmove",     end: "touchend touchcancel"},
        {start: "pointerdown",   move: "pointermove",   end: "pointerup"},
        {start: "MSPointerDown", move: "MSPointerMove", end: "MSPointerUp"},
        {start: "mousedown",     move: "mousemove",     end: "mouseup"}
    ], bindEve, supportPassive = Support.supportPassive, WIN = window;

    for(var i=0; i<binds.length; i++) {
        var item = binds[i], key = "on"+item.start;

        if (WIN[key] !== undefined) {
            bindEve = item; break;
        }
    }

    each(bindEve, function(key, val) {
        if (val.match(/\s/)) {
            var arrs = val.split(" ");

            arrs[0] = arrs[0]+".gesture";
            arrs[1] = arrs[1]+".gesture";

            bindEve[key] = arrs.join(" ");
        } else {
            bindEve[key] = val+".gesture";
        }
    });

    Prototype.init = function() {
        var self = this;

        self.bind("start").bind("end");

        return self.emit("init");
    };

    Prototype.bind = function(type) {
        var self = this, $el = self.$el, opt = self.option,
            eveName = bindEve[type], eveOption, call = "_"+type;

        eveOption = supportPassive ? {
            capture: CFG.capture,
            passive: type=="move" && !opt.movePrevent && opt.passive,
        } : CFG.capture;

        $el.off(eveName).on(eveName, function(e) {
            self[call].call(self, e, getTouch(e));
        }, eveOption);

        return self;
    }

    Prototype.unbind = function(type) {
        var self = this, $el = self.$el;

        $el.off(bindEve[type], CFG.capture);

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

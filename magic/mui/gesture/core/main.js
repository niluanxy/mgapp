import RootMagic from "CORE_MAGIC/main.js";
import {time as getTime} from "CORE_STATIC/util/main.js";
import {extend, each} from "LIB_MINJS/utils.js";
import Emitter from "LIB_MINJS/emitter.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.gesture = {
    delayCall: 4,
    preventMove: true,
};

var Prototype = {}, touchFilter, GestureBindCore,
    bind = "addEventListener", unbind = "removeEventListener",
    key = "start", keyTime = key+"Time", keyX = key+"X", keyY = key+"Y",
    bindEves = "MSPointerDown MSPointerMove MSPointerUp "+
               "pointerdown pointermove pointerup ",
    bindTouch = "touchstart touchmove touchend touchcancel",
    bindMouse = "mousedown mousemove mouseup",
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

GestureBindCore = {
    // startTime  :  0,
    // startTouch : [],

    // endTime  : 0,
    // endTouch : [],

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

    start: touchFilter(function(e) {
        var time = getTime(), touch = this.getTouch(e);

        this.startTime = time;
        this.startTouch = touch;
        this.emit("start", touch, e, this);
    }),

    move: function(e) {
        if (e.cancelable && CFG.preventMove) e.preventDefault();

        var touch = this.getTouch(e);
        this.emit("move", touch, e, this);
    },

    end: touchFilter(function(e) {
        var time = getTime(), touch = this.getTouch(e);

        this.endTime = time;
        this.endTouch = touch;
        this.emit("end", touch, e, this);
    }),

    handleEvent: function(e) {
        switch ( e.type ) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                this.start(e);
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                this.move(e);
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
                this.end(e);
                break;
        }
    }
};

function Gesture(el, option) {
    var self = this, emitter = Emitter();

    self.el = el || document;
    self.emit = emitter;
    self.option = extend({}, CFG, option);

    self.bind = extend({
        emit: function() {
            emitter.emit.apply(emitter, arguments);
        }
    }, GestureBindCore);
}; Gesture.prototype = Prototype;

Prototype.filter = touchFilter;

Prototype.init = function() {
    var bindDom = this.el, DOC = document, bindArrs, bindCore,
        eveBind = DOC[bind] ? bind : "attachEvent",
        eveUnbind = DOC[unbind] ? unbind : "detachEvent";

    // 动态确定生成最终绑定的事件数组
    if (self.ontouchstart !== undefined) {
        bindArrs = (bindEves+bindTouch).split(" ");
    } else {
        bindArrs = (bindEves+bindMouse).split(" ");
    }

    bindCore = this.bind;

    each(bindArrs, function(i, event) {
        DOC[unbind](event, bindCore);
        DOC[bind](event, bindCore, true);
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
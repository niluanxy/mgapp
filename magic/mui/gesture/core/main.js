import RootMagic from "CORE_MAGIC/main.js";
import {time as getTime} from "CORE_STATIC/util/main.js";
import {extend, each} from "LIB_MINJS/utils.js";
import Emitter from "LIB_MINJS/emitter.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.gesture = {
    delayCall: 12,
};

var gesture, emit = Emitter(), coreBind, touchFilter,
    bindEves = "MSPointerDown MSPointerMove MSPointerUp "+
               "pointerdown pointermove pointerup ",
    bindTouch = "touchstart touchmove touchend",
    bindMouse = "mousedown mousemove mouseup",
    touchKeys = "pageX pageY clientX clientY screenX screenY".split(" ");

var touchFilter = function(callback) {
    var handle, lastType, find;

    return function(e) {
        var debounce = CFG.delayCall, type = e.type, context = this;

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

gesture = {
    init: function() {
        var DOC = document, bindArrs,
        bind = "addEventListener", unbind = "removeEventListener",
        key = "start", keyTime = key+"Time", keyX = key+"X", keyY = key+"Y";

        bind = DOC[bind] ? bind : "attachEvent";
        unbind = DOC[unbind] ? unbind : "detachEvent"

        coreBind = {
            // startTime :  0,
            // startTouch: [],

            // endTime :  0,
            // endTouch: [],

            getTouch: function(e) {
                var result = [], cache, len = touchKeys.length;

                cache = e && e.touches ? e.touches : [e];

                each(cache, function(i, copy) {
                    var touch = {}, key;

                    for(var i=0; i<len; i++) {
                        key = touchKeys[i];

                        if (copy[key] !== undefined) {
                            touch[key] = copy[key];
                        }
                    }

                    result.push(touch);
                });

                return result;
            },

            _start: touchFilter(function(e) {
                var time = getTime(), touch = this.getTouch(e);

                this.startTime = time;
                this.startTouch = touch;
                emit.emit("start", touch, e, this);
            }),

            _move: touchFilter(function(e) {
                var touch = this.getTouch(e);

                emit.emit("move", touch, e, this);
            }),

            _end: touchFilter(function(e) {
                var time = getTime(), touch = this.getTouch(e);

                this.endTime = time;
                this.endTouch = touch;
                emit.emit("end", touch, e, this);
            }),

            handleEvent: function(e) {
                switch ( e.type ) {
                    case 'touchstart':
                    case 'pointerdown':
                    case 'MSPointerDown':
                    case 'mousedown':
                        this._start(e);
                        break;
                    case 'touchmove':
                    case 'pointermove':
                    case 'MSPointerMove':
                    case 'mousemove':
                        this._move(e);
                        break;
                    case 'touchend':
                    case 'pointerup':
                    case 'MSPointerUp':
                    case 'mouseup':
                        this._end(e);
                        break;
                }
            }
        };

        // 动态确定生成最终绑定的事件数组
        if (self.ontouchstart !== undefined) {
            bindArrs = (bindEves+bindTouch).split(" ");
        } else {
            bindArrs = (bindEves+bindMouse).split(" ");
        }

        for(var i=0; i<bindArrs.length; i++) {
            var event = bindArrs[i];

            DOC[unbind](event, coreBind);
            DOC[bind](event, coreBind, true);
        }
    },

    on: function(eve, call) {
        emit.on(eve, call, coreBind);
    },

    off: emit.off,
}

RootMagic(gesture.init);
RootMagic.extend({gesture: gesture});

export default gesture;
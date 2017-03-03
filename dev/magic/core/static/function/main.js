import fastBase from "LIB_MINJS/fastcall.js";
import {each} from "LIB_MINJS/utils.js";

export var fast = fastBase;

/* =====================================================
 * raf 相关函数
 * ===================================================== */
var rafCall, rafCancel;

(function() {
    var vendors = ['webkit', 'moz'];

    rafCall = window.requestAnimationFrame;
    rafCancel = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;

    for (var i = 0; i < vendors.length && !rafCall; ++i) {
        var prefix = vendors[i];

        rafCall = window[prefix + 'RequestAnimationFrame'];
        rafCancel = (window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame']);
    }

    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !rafCall || !rafCancel) {

        var lastTime = 0;

        rafCall = function (callback) {
            var now = time(), nextTime = Math.max(lastTime + 16.7, now);

            return setTimeout(function () {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };

        rafCancel = clearTimeout;
    }
})();

export var raf = rafCall;
export var clearRaf = rafCancel;


/* =====================================================
 *  tick 相关函数
 * ===================================================== */
var tickArrs = {}, len = 0, pos = 0, tickCall;

tickCall = function() {
    each(tickArrs, function(i, call) {
        call(i);
    });

    if (len > 0) raf(tickCall);
}

export function tick(callback) {
    if (!len++) raf(tickCall);

    tickArrs[pos++] = callback;

    return pos-1;
}

export function clearTick(handle) {
    if (tickArrs[handle]) {
        --len; // 用于计数，0 则停止循环
        delete tickArrs[handle];
    }
}

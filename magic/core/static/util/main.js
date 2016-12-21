import templayed from "LIB_MINJS/templayed.js";
import Defer from "LIB_MINJS/promise.js";
import fastBase from "LIB_MINJS/fastcall.js";
import emitterBase from "LIB_MINJS/emitter.js";
import {isTrueString} from "LIB_MINJS/check.js";

export function tpl(template, data) {
    if (isTrueString(template) && data) {
        return templayed(template)(data);
    } else {
        return "";
    }
}

export function defer() {
    return new Defer();
}

export function random(min, max) {
    if (min && max && min != max) {
        return parseInt(Math.random()*(max-min+1)+min,10);
    } else {
        return (''+Math.random()).replace(/\D/g, '').replace(/^0*/, '');
    }
}

export function time() {
    return new Date().getTime();
}

export var fastCall = fastBase;

export var emitter = emitterBase;

export function throttle(func, wait, delay) {
    var context, args, result,
        timeout = null, 
        previous = 0,

    later = function() {
        previous = leading === false ? 0 : time();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };

    return function() {
        var now = time();
        if (!previous && delay === true) previous = now;
        var remaining = wait - (now - previous);

        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        }

        return result;
    };
};

export function debounce(func, wait, delay) {
    var timeout, args, context, timestamp, result,

    later = function() {
        var last = time() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (delay) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = time();
        var callNow = !delay && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};
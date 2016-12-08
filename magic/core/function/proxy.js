import {isTrueString, isFunction} from "LIB_MINJS/check.js";
import {slice, element} from "LIB_MINJS/utils.js";

export function eachProxy(/* call, args... */) {
    var call = arguments[0], args;

    if (isFunction(call)) {
        args = slice(arguments, 1);

        for(var i=0; i<this.length; i++) {
            call.apply(this[i], args);
        }
    }

    return this;
}

// 尝试读取或者写入指定的对象
export function keyProxy(aKey, aVal, empty) {
    var el = element(this);

    if (el && isTrueString(aKey)) {
        if (aVal === undefined) {
            return el[aKey];
        } else if (empty && aVal !== undefined) {
            el[aKey] = aVal;
        } else if (aVal != undefined) {
            el[aKey] = aVal;
        }
    }

    return this;
}

// 可全部执行代理方法，用于部分方法可以对所有对象执行
export function allProxy(/* call args... setAll */) {
    var last, args, call,
        len = arguments.length;

    call = arguments[0];
    last = arguments[len-1];
    
    len = last === true ? len-1 : len;
    args = slice(arguments, 1, len);

    if (last === true) {
        args.unshift(call);
        eachProxy.apply(this, args);
        
        return this;
    } else {
        return call.apply(this, args);
    }
}
export var isArray = Array.isArray;

/* 判断是否为一个纯净的对象 */
export function isObject(obj) {
    if (obj == null) return false;

    if (typeof obj !== "object" ||
         obj.nodeType || obj === window) {
        return false;
    }

    if ( obj.constructor &&
            !({}).hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
    }

    return true;
};

// 检测是否为一个空对象
export function isEmptyObject(obj) {
    var count = 0;

    for(var key in obj) count++;

    return count===0;
}

export function isElement(object) {
    return object instanceof Element ||
           object instanceof DocumentFragment ||
           object === document;
}

export function isFunction(call) {
    return typeof call == "function";
};

export function isString(string) {
    return typeof string == "string";
};

export function isNumber(number) {
    return typeof number == "number" && !isNaN(number);
};

export function isTrueString(string) {
    return string && typeof string == "string";
};

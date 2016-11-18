export var isArray = Array.isArray;

/* 判断是否为一个纯净的对象 */
export function isObject(obj) {
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

export function isElement(object) {
    return object instanceof Element || object === document;
}

export function isFunction(call) {
    return typeof call == "function";
};

export function isString(string) {
    return typeof string == "string";
};

export function isTrueString(string) {
    return string && typeof string == "string";
};
var isArray, isObject, isFunction, isString, isTrueString;

isArray = Array.isArray;

/* 判断是否为一个纯净的对象 */
isObject = function(obj) {
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

isFunction = function(call) {
    return typeof call == "function";
};

isString = function(string) {
    return typeof string == "string";
};

isTrueString = function(string) {
    return string && typeof string == "string";
};

export {isObject, isFunction, isString, isArray, isTrueString};
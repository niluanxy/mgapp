import {each} from "LIB_MINJS/utils.js";
import {isTrueString, isFunction} from "LIB_MINJS/check.js";

export function getScope(scope, find) {
    if (scope && isTrueString(find)) {
        do {
            if (scope[find] !== undefined) {
                return scope;
            }

            scope = scope.$parent;
        } while(scope);
    }

    return;
}

export function getValue(scope, find) {
    if (scope && isTrueString(find)) {
        do {
            if (scope[find] !== undefined) {
                return scope[find];
            }

            scope = scope.$parent;
        } while(scope);
    }

    return;
}

export function getVmScope(scope) {
    while(scope.$parent) {
        scope = scope.$parent;

        var $opt = scope.$options,
            name = scope.$$name || $opt.name || $opt._componentTag || "";

        if (name.match(/^ma-/)) return scope;
    }

    return;
}

function factoryProperty(object, bindKey, options) {
    var lastValue = options.get ? options.get() : null;

    object.$calls = object.$calls || {};
    object.$calls[bindKey] = [];

    if (isFunction(options.set)) {
        object.$calls[bindKey].push(options.set);
    }

    options.set = function(value) {
        if (value != lastValue) {
            var calls = object.$calls[bindKey];

            each(calls, function(i, call) {
                call(value); // 运行绑定的方法
            });

            lastValue = value;
        }
    }

    Object.defineProperty(object, bindKey, options);

    if (object.$watch == null) {
        object.$watch = function(key, call) {
            if (!object.$calls[key]) {
                object.$calls[key] = [];
            }

            if (isFunction(call)) {
                object.$calls[key].push(call);
            }
        }
    }

    return object;
}

export function simProperty(scope, find, bind, key) {
    var bindObject = bind || {}, bindKey = key || "value",
        vmScope, bindOptions;

    scope = scope ? scope.$parent : null;

    if ((vmScope = getScope(scope, find))) {
        bindOptions = {
            get: function() {
                return vmScope[find];
            },

            set: function(value) {
                vmScope[find] = value;
            }
        };
    } else {
        bindOptions = {};
    }

    factoryProperty(bindObject, bindKey, bindOptions);

    // 尝试添加钩子，响应绑定元素处自身变化
    if (vmScope && vmScope.$watch) {
        vmScope.$watch(find, function(value) {
            bindObject[bindKey] = value;
        });
    }

    return bindObject;
}

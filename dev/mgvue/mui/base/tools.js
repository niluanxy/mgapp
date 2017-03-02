import {isTrueString} from "LIB_MINJS/check.js";
import {extend, value as valueBase} from "LIB_MINJS/utils.js";

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
    var $options;

    if (scope && scope.$parent) {
        do {
            scope = scope.$parent;

            if (scope && ($opts = scope.$options)) {
                var name = $opts.name || $opts._componentTag || "";

                if (name.match(/^ma-/)) return scope;
            }
        } while(scope);
    }

    return;
}

export function value() {
    var args = extend([], arguments);

    for(var i=0; i<args.length; i++) {
        if (args[i] === "true") {
            args[i] = true;
        } else if (args[i] === "false") {
            args[i] = false;
        }
    }

    return valueBase.apply(null, args);
}

import {isTrueString} from "LIB_MINJS/check.js";

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

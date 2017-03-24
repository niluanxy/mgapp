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
    while(scope.$parent) {
        scope = scope.$parent;

        var $opt = scope.$options,
            name = scope.$$name || $opt.name || $opt._componentTag || "";

        if (name.match(/^ma-/)) return scope;
    }

    return;
}

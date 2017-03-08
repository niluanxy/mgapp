import RootMagic from "MG_CORE/build.js";
import {isTrueString} from "LIB_MINJS/check.js";
import {extend, value as valueBase} from "LIB_MINJS/utils.js";

import ConfigUI from "MV_UIKIT/base/config.js";

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

function makeListener(events) {
    return function() {
        var self = this, $el = RootMagic(self.$el);

        $el.on(events, function(eve) {
            self.$emit(eve.type, eve);
        });
    }
}

export function domListener(events, returnCall) {
    events = events || ConfigUI.nativeListen;

    if (returnCall === true) {
        return makeListener(events);
    } else {
        return [{
            mounted: makeListener(events)
        }]
    }
}

import RootMagic from "MG_CORE/build.js";
import {isTrueString} from "LIB_MINJS/check.js";
import {extend, value as valueBase} from "LIB_MINJS/utils.js";
import {getScope} from "MV_CORE/base/tools.js";

import ConfigUI from "MV_UIKIT/base/config.js";

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

export function tryBindCtrl(scope, ctrl, ctrlName) {
    ctrlName = ctrlName || "ctrl";

    if (isTrueString(scope[ctrlName])) {
        var ctrlKey   = scope[ctrlName],
            findScope = getScope(scope, ctrlKey);

        if (findScope) findScope[ctrlKey] = ctrl;
    }
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

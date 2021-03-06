import Support from "MG_CORE/support/main.js";
import {element} from "LIB_MINJS/utils.js";

function trans(el, type, val) {
    return function(el, val) {
        if (el = element(el)) {
            if (val !== undefined) {
                el.style[type] = val;
            } else {
                return window.getComputedStyle(el, null)[type] || "";
            }
        }

        return "";
    }
}

export function transform(el, val) {
    var PREFIX = Support.stylePrefix, KEY_TRANSFROM;

    KEY_TRANSFROM = PREFIX ? PREFIX+"Transform" : "transform";

    return (transform = trans(el, "transform", val))(el, val);
}

export function transition(el, val) {
    var PREFIX = Support.stylePrefix, KEY_TRANSITION;

    KEY_TRANSITION = PREFIX ? PREFIX+"Transition" : "transition";

    return (transition = trans(el, "transition", val))(el, val);
}

export function getTrans(x, y, scale) {
    var translateZ = " translateZ(0)";

    x = x || 0; y = y || 0; scale = scale || 1;

    return "translate("+x+"px,"+y+"px) scale("+scale+")"+translateZ;
}

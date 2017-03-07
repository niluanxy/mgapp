import Support from "MG_CORE/support/main.js";
import {each, trim} from "LIB_MINJS/utils.js";
import {PluginBind, getPrefix} from "MG_MODULE/event/core/main.js";

var eventMaps = {
    animationstart: "AnimationStart",
    animationiteration: "AnimationIteration",
    animationend: "AnimationEnd",

    transitionstart: "TransitionStart",
    transitionend: "TransitionEnd",
};

function keyMap(key) {
    each(eventMaps, function(key, val) {
        if (Support.vender) {
            eventMaps[key] = Support.vender+val;
        } else {
            eventMaps[key] = key;
        }
    });

    return (keyMap = function(key) {
        return eventMaps[key];
    })(key);
}

function transEvent(args, index) {
    var eves = args[index].split(" "), fix = "";

    each(eves, function(i, value) {
        var pre = getPrefix(value), reg, after;

        if ((after = keyMap(pre)) && after != pre) {
            reg = new RegExp("^"+pre)

            fix += value.replace(reg, after)+" ";
        } else {
            fix += value+" ";
        }
    });

    args[index] = trim(fix);
}

PluginBind("add.trans", function(args /* [bindType, eve] */) {
    transEvent(args, 1);
});

PluginBind("off.trans", function(args /* [eve] */) {
    transEvent(args, 0);
});

PluginBind("emit.trans", function(args /* [eve, args...] */) {
    transEvent(args, 0);
});

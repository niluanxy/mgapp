import {each} from "LIB_MINJS/utils.js";
import RootMagic from "MG_MAGIC/main.js";

RootMagic(function() {
RootMagic.extend({

supportPassive: (function() {
    var canPassive = false;

    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                canPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
    } catch (e) {};

    return canPassive;
})(),

stylePrefix: (function() {
    var vender = ["", "-webkit-", "-moz-", "-ms-"],
        prefix, test = "transform";

    each(vender, function(i, pre) {
        if ((pre+test) in document.body.style) {
            prefix = pre; return false;
        }
    });

    return prefix;
})(),



});
});
    
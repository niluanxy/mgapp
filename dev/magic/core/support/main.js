import {each} from "LIB_MINJS/utils.js";
import RootMagic from "MG_MAGIC/main.js";

var Support = {};

RootMagic(function() {
    /* link: https://github.com/x-tag/x-tag */
    Support.vender = (function() {
        var styles = window.getComputedStyle(document.documentElement, ''),
            vender = (Array.prototype.slice
                .call(styles)
                .join('')
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
            )[1];

        return vender;
    })();

    Support.stylePrefix = (function() {
        var vender = ["", "-webkit-", "-moz-", "-ms-", "-o-"],
            prefix, test = "transform";

        each(vender, function(i, pre) {
            if ((pre+test) in document.body.style) {
                prefix = pre; return false;
            }
        });

        return prefix;
    })();

    Support.supportPassive = (function() {
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
    })();

    RootMagic.extend(Support);
});

export default Support;

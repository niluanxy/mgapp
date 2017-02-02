import {isTrueString as isTrue, isFunction} from "LIB_MINJS/check.js";
import {extend, each} from "LIB_MINJS/utils.js";
import $config from "MG_MAGIC/config.js";

var $cui = $config.ui, keyWrap = "wrapClass",
    keyItem = "itemClass", keyClass = "class";

export function uiInit($el, opt, bindEve, bindCall) {
    var aWrap = opt[keyWrap], style = opt.style, eve,
        aClass = opt[keyClass], rTest = aClass+"(?!-)";

    if (style && !$el.regClass(aClass+"-") && !aWrap.match(rTest)) {
        aWrap += aClass;
        aWrap  = aWrap.replace(new RegExp(rTest, 'g'), aClass+"-"+style); 
    }

    $el.addClass(aWrap)
        .children().addClass(opt[keyItem], true);

    if (isTrue(bindEve) && isFunction(bindCall)) {
        eve = opt[keyItem].match(aClass+"-item")[0];
        eve = eve ? "."+eve : null;

        $el.on(bindEve, eve, bindCall);
    }

    return $el;
}

export function uiExtend() {
    var args = extend([], arguments), copy,
        transArrs, oClass, aClass, regPre;

    if (isTrue(transArrs = args[args.length-1])) {
        transArrs = transArrs.split(" ");
        args.pop();
    } else {
        transArrs = [keyWrap, keyItem];
    }

    args = [{}, $cui].concat(args);
    copy = extend.apply(null, args);

    oClass = copy.class || "";
    aClass = $cui.prefix + oClass;
    regPre = new RegExp(oClass, "g");

    each(transArrs, function(i, fixName) {
        if (copy[fixName]) copy[fixName] = copy[fixName].replace(regPre, aClass);
    });

    copy[keyClass]= aClass;

    return copy;
}
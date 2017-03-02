import {isTrueString as isTrue, isFunction, isArray} from "LIB_MINJS/check.js";
import {extend, each, trim} from "LIB_MINJS/utils.js";
import $cui from "MG_UIKIT/base/config.js";

var keyWrap = "wrapClass", keyItem = "itemClass", keyClass = "class";

export function uiClass(aClass, type) {
    if (aClass && isTrue(type)) {
        return aClass+"-"+type;
    }

    return "";
}

export function uiAddClass($el, aClass, type) {
    if ($el && $el.length && aClass && type) {
        type = isArray(type) ? type : [type];
        var len = type.length, adds = "";

        for(var i=0; i<len; i++) {
            if (isTrue(type[i])) {
                adds += uiClass(aClass, type[i])+" ";
            }
        }

        $el.addClass(trim(adds));
    }
}

function hasStyle($el, aClass, list) {
    var check = list || $cui.styleList, reg = '';

    check = isArray(check) ? check : [check];

    for(var i=0; i<check.length; i++) {
        reg += aClass+"-"+check[i] + "|";
    }

    reg.replace(/\|$/, '');

    return $el.regClass(reg);
}

export function uiInit($el, opt, bindEve, bindCall) {
    var aWrap = opt[keyWrap], style = opt.style, eve,
        aClass = opt[keyClass], rTest = aClass+"(?!-)";

    if (style && !hasStyle($el, aClass) && !aWrap.match(rTest)) {
        aWrap += aClass;
        aWrap  = aWrap.replace(new RegExp(rTest, 'g'), aClass+"-"+style);
    }

    $el.addClass(aWrap)
        .children().addClass(opt[keyItem], true);

    if (isTrue(bindEve) && isFunction(bindCall)) {
        eve = opt[keyItem].match(uiItemClass(aClass))[0];
        eve = eve ? "."+eve : null;

        $el.on(bindEve, eve, bindCall);
    }

    return $el;
}

export function uiItemClass(opt, prefix) {
    var cls = opt && opt.class || opt || "";

    cls = cls ? cls+"-item" : "";
    cls = prefix ? "."+cls : cls;

    return cls;
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

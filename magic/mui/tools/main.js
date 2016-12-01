import {isTrueString as isTrue} from "LIB_MINJS/check.js";

export function fixClass($el, opt) {
    var retClass = [], prefix = opt.prefix;

    if (isTrue(prefix) && $el.regClass(prefix+"-")) {
        // 如果有检测到，则样式已经定义，无需自动添加
    } else if (isTrue(prefix) && isTrue(opt.style)) {
        retClass.push(prefix+"-"+opt.style);
    }

    if (isTrue(opt.wrapClass)) {
        retClass.push(opt.wrapClass);
    }

    return retClass.join(" ");
}

export function fixStyle($el, opt) {
    $el.addClass(fixClass($el, opt))
        .children().addClass(opt.itemClass, true);

    return $el;
}
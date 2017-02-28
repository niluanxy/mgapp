import {isTrueString} from "LIB_MINJS/check.js";
import {allProxy} from "MG_UTILS/proxy.js";
import {element, trim, each} from "LIB_MINJS/utils.js";

export function hasClass(cls) {
    var el = element(this), result, arrays, test, clsName;

    cls = trim(cls);
    if (isTrueString(cls) && el && (clsName = el.className)) {
        test = cls.replace(/\s+/, ' ').split(" ");
        result = true;

        each(test, function(index, value) {
            var reg = new RegExp("(^|\\s)" + value + "(\\s|$)");

            if (!reg.test(clsName)) {
                return result = false;
            }
        });

        return result;
    } else {
        return false;
    }
}

export function regClass(reg) {
    var el = element(this), clsName;

    reg = trim(reg);
    if (isTrueString(reg) && el && (clsName = el.className)) {
        return clsName.match(new RegExp(reg));
    } else {
        return false;
    }
}

export function addProxy(cls) {
    var el = element(this), adds, clsName;

    cls = trim(cls);
    if (isTrueString(cls) && el && el.className !== undefined) {
        adds = cls.replace(/\s+/, ' ').split(" ");
        clsName = el.className || "";
        clsName = clsName.replace(/\s+/, ' ');
        clsName = clsName ? clsName.split(" ") : [];

        for(var i=0; i<adds.length; i++) {
            if (!hasClass.call(el, adds[i])) {
                clsName.push(adds[i]);
            }
        }

        el.className = clsName.join(" ");
    }

    return this;
}

export function addClass(cls, setAll) {
    return allProxy.call(this, addProxy, cls, setAll);
}

function removeProxy(cls) {
    var el = element(this), dels, clsName;

    cls = trim(cls);
    if (isTrueString(cls) && el && el.className !== undefined) {
        dels = cls.replace(/\s+/, ' ').split(" ");
        clsName = el.className || "";
        clsName = clsName.replace(/\s+/, ' ');

        for(var i=0; i<dels.length; i++) {
            var reg = new RegExp("(^|\\s)" + dels[i] + "(\\s|$)", 'g');

            clsName = trim(clsName.replace(reg, ' '));
        }

        el.className = clsName;
    }

    return this;
}

export function removeClass(cls, setAll) {
    return allProxy.call(this, removeProxy, cls, setAll);
}

/**
 * 切换对象的某个类，已包含时移除，未包含时添加
 *
 * @param       {String}    cls - 要切换的类名
 * @param       {Boolean}   set - 是否强制设置
 *
 * @author      mufeng  <smufeng@gmail.com>
 * @version     0.2     <2016-11-22>
 */
function toggleProxy(cls, set) {
    var el = element(this);

    if (set != undefined) {
        // 有 SET 时，为真添加，否则删除
        if (set == true) {
            addProxy.call(el, cls);
        } else {
            removeProxy.call(el, cls);
        }
    } else if (hasClass.call(el, cls)) {
        removeProxy.call(el, cls);
    } else {
        addProxy.call(el, cls);
    }

    return this;
}

export function toggleClass(cls, set, setAll) {
    return allProxy.call(this, toggleProxy, cls, set, setAll);
}

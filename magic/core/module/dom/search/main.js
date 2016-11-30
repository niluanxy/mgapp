import {element, trim} from "CORE_FUNCTION/tools.js";
import {isNumber, isString, isElement} from "LIB_MINJS/check.js";
import {hasClass} from "CORE_MODULE/style/class/main.js";
import RootMagic from "CORE_MAGIC/main.js";

export function index() {
    var par = parent.call(this), items;

    if (par && par.length) {
        par = par[0];
        items  = par.children;

        for(var i=0; i<items.length; i++) {
            if (items[i] == this[0]) {
                return i;
            }
        }
    }

    return -1;  // 默认返回 -1
}

export function parent() {
    var el = element(this);

    return RootMagic(el && el.parentNode);
}

export function children(search) {
    var el = element(this);

    if (search) {
        return RootMagic(search, el);
    } else {
        return RootMagic(el && el.children);
    }
}

export function eq(el, checkAll) {
    if (isNumber(el)) {
        return RootMagic(this[el]);
    } if (isString(el)) {
        var test = trim(el.replace(".", ' ')), arrs = [];

        for(var i=0; i<this.length; i++) {
            var item = this[i];

            if (hasClass.call(item, test)) {
                arrs.push(item);
            }
        }

        return RootMagic(arrs);
    } else if (isElement(el)) {
        return this[0] === el;
    } else if (el instanceof RootMagic) {
        if (checkAll === true) {
            for(var i=0; i<this.length; i++) {
                if (this[i] !== el[i]) return false;
            }

            return true;
        } else {
            return this[0] === el[0];
        }
    }
}

export function below(parent) {
    var par = RootMagic(parent),
        check = this.parent();

    do {
        if (check.eq(par)) {
            return true;
        }

        check = check.parent();
    } while(check.length > 0);

    return false;
}
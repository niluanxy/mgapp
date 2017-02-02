import {element, trim, each} from "LIB_MINJS/utils.js";
import {isNumber, isString, isTrueString, isElement} from "LIB_MINJS/check.js";
import {hasClass} from "MG_MODULE/style/class/main.js";
import RootMagic from "MG_MAGIC/main.js";

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

export function parents(search) {
    var find = [], el = element(this);

    while(el) {
        el = el.parentNode;

        if (!el) {
            break;
        } else if (!search || matchTest(el, search)) {
            find.push(el);
        }
    };

    return RootMagic(find);
}

export function children(search) {
    var el = element(this), child = el ? el.children : [];

    if (isString(search)) {
        return eq.call(RootMagic(child), search);
    } else {
        return RootMagic(child);
    }
}

function matchTest(el, test) {
    return isTrueString(test) && el.matches && el.matches(test);
}

/**
 * 从当前对象中返回新的符合要求的 RootMagic 对象
 */
export function eq(el) {
    if (isNumber(el)) {
        return RootMagic(this[el]);
    } else if (isElement(el)) {
        var find = null;

        each(this, function(i, ele) {
            if (ele == el) {
                find = ele;
                return false;
            }
        });

        return RootMagic(find);
    } else {
        var cache = [];

        each(this, function(i, ele) {
            if (matchTest(ele, el)) {
                cache.push(ele);
            }
        });
        
        return RootMagic(cache);
    }

    return RootMagic();
}

export function below(find) {
    var check = parent.call(this);

    if (find) {
        do {
            if (check.eq(find).length) {
                return true;
            }

            check = check.parent();
        } while(check.length > 0);
    }
        

    return false;
}
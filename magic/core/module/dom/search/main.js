import RootMagic from "../../../magic/main.js";

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
    var el = this[0], parent;

    return RootMagic(el && el.parentNode);
}

export function children(search) {
    var el = this[0];

    if (search) {
        return RootMagic(search, el);
    } else {
        return RootMagic(el && el.children);
    }
}
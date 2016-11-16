import {make as domMake} from "../../../magic/dom.js";
import {slice, eachRun} from "../../../function/tools.js";
import RootMagic from "../../../magic/main.js";

function _edit(that, html, key) {
    var el = that[0], dom;

    if (html instanceof RootMagic) {
        html = html[0];
    }

    if (el && el[key] && (dom = domMake(html)) ) {
        el[key](dom);
    }

    return that;
}

function _insert(that, html, before) {
    var el = that[0], parent, dom;

    if (html instanceof RootMagic) {
        html = html[0];
    }

    if ( el && (parent = el.parentNode) &&
        (dom = domMake(html)) ) {
        return parent.insertBefore(dom, before ? el : el.nextSibling);
    }

    return that;
}

export function prepend(html) {
    var first = this[0] && first.firstChild;

    return _edit(this, "insertBefore", el);
}

export function append(html) {
    return _edit(this, "appendChild", html);
}

export function appendTo(html) {
    var that = RootMagic(html);

    _edit(that, "appendChild", this);

    return this;
}

export function before(html) {
    return _insert(that, html, true);
}

export function after() {
    return _insert(that, html);
}

export function wrap(html) {
    var el = this[0], wrap, parent;

    if ( el && (parent = el.parentNode)
         && (wrap = domMake(html)) ) {

        wrap = wrap.firstChild;
        wrap = parent.insertBefore(wrap, el);
        append(wrap, el);
    }

    return this;
}

export function wrapAll(html) {
    var wrap = domMake(html), args;

    if (wrap) {
        args = slice(arguments, 1);
        args.unshift(wrap);

        eachRun.apply(this, args);
    }

    return this;
}

export function remove() {
    var el = this[0], parent;

    if (el && (parent = el.parentNode) &&
        parent != document) {
        parent.removeChild(el);
    }

    return this;
}
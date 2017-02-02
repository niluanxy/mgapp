import {make as domMake} from "MG_FUNCTION/dom.js";
import {eachProxy, allProxy} from "MG_FUNCTION/proxy.js";
import {slice, element} from "LIB_MINJS/utils.js";
import RootMagic from "MG_MAGIC/main.js";

function domGet(html) {
    var create = null;

    if (html instanceof RootMagic) {
        create = html[0];
    } else {
        create = domMake(html);
    }

    return create;
}

function prependProxy(html) {
    var el = element(this), dom;

    if (el && el.nodeType === 1 &&
        (dom = domGet(html)) ) {
        el.insertBefore(dom, el.firstChild);
    }

    return this;
}

export function prepend(html, setAll) {
    return allProxy.call(this, prependProxy, html, setAll);
}

export function appendProxy(html) {
    var el = element(this), dom;

    if (el && el.nodeType === 1 &&
        (dom = domGet(html)) ) {
        el.appendChild(dom);
    }

    return this;
}

export function append(html, setAll) {
    return allProxy.call(this, appendProxy, html, setAll);
}

export function appendTo(html, setAll) {
    var that = RootMagic(html);

    if (setAll === true) {
        for(var i=0; i<this.length; i++) {
            appendProxy.call(that, this[i]);
        }
    } else {
        appendProxy.call(that, this[0]);
    }

    return this;
}

function insertProxy(html, before) {
    var el = element(this), dom, parent;

    if (el && (parent = el.parentNode) &&
        (dom = domGet(html)) ) {

        parent.insertBefore(dom, before ? el : el.nextSibling);
    }

    return this;
}

export function before(html, setAll) {
    return allProxy.call(this, insertProxy, html, true, setAll);
}

export function after(html, setAll) {
    return allProxy.call(this, insertProxy, html, false, setAll);
}

function wrapProxy(html) {
    var el = element(this), wrap, parent;

    if ( el && (parent = el.parentNode)
         && (wrap = domGet(html)) ) {

        wrap = wrap.firstChild;
        wrap = parent.insertBefore(wrap, el);
        appendProxy.call(wrap, el);
    }

    return this;
}

export function wrap(html, setAll) {
    return allProxy.call(this, wrapProxy, html, setAll);
}

function removeProxy() {
    var el = element(this), parent;

    if (el && (parent = el.parentNode)) {
        parent.removeChild(el);
    }

    return this;
}

export function remove(setAll) {
    return allProxy.call(this, removeProxy, setAll);
}
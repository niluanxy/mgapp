import {strFind, element} from "LIB_MINJS/utils.js";
import {allProxy, keyProxy} from "CORE_FUNCTION/proxy.js";
import {isTrueString, isString} from "LIB_MINJS/check.js";

export function html(html, setAll) {
    return allProxy.call(this, keyProxy, "innerHTML", html, true, setAll);
}

export function outerHtml(html, setAll) {
    return allProxy.call(this, keyProxy, "outerHTML", html, true, setAll);
}

export function text(text, setAll) {
    return allProxy.call(this, keyProxy, "innerText", text, true, setAll);
}

export function tag() {
    var el = element(this);

    return (el ? el.tagName : "").toLowerCase();
}

/**
 * 表单元素设置值或读取值
 */
function valProxy(aVal) {
    var el = element(this), type, aValue;

    if (el && tag.call(el) === "input") {
        type = _attr.call(el, "type") || "";
        type = type.toUpperCase();

        if (strFind("CHECKBOX RADIO", type) >= 0) {
            if (aVal !== undefined) {
                el.checked = !!aVal;
            } else {
                return el.checked ? "on" : "off";
            }
        } else {
            if (aVal !== undefined) {
                el.value = aVal;
            } else {
                return el.value;
            }
        }
    }

    return this;
}

export function val(aVal, setAll) {
    return allProxy.call(this, valProxy, aVal, setAll);
}

export function checked() {
    return valProxy.call(this[0]) === "on";
}

/**
 * 对象的 HTML 属性操作(读或者取)
 */
function attrProxy(aKey, aVal) {
    var el = element(this), nType = el.nodeType ? el.nodeType : 2;

    if (el && el.getAttribute && isTrueString(aKey)) {
        aKey = aKey.toLowerCase(); // 转为小写

        if (aVal === undefined) {
            // val 不存在则为读取属性值
            return el.getAttribute(aKey);
        } else {
            // 否则则为设置具体的属性值
            el.setAttribute(aKey, aVal);
        }
    }

    return this;
}

export function attr(aKey, aVal, setAll) {
    return allProxy.call(this, attrProxy, aKey, aVal, setAll);
}

function removeAttrProxy(aKey) {
    var el = element(this), dels;

    if (el && isTrueString(aKey)) {
        dels = aKey.split(" ");

        for(var i=0; i<dels.length; i++) {
            el.removeAttribute(dels[i].toLowerCase());
        }
    }

    return this;
}

export function removeAttr(aKey, setAll) {
    return allProxy.call(this, removeAttrProxy, aKey, setAll);
}
import {allProxy} from "../../../function/proxy.js";
import {element, extend, trim} from "../../../function/tools.js";
import {isTrueString, isObject} from "../../../function/check.js";
import {dataStyle} from "../../../magic/tools.js";
import {append, remove} from "../../dom/editer/main.js";
import RootMagic from "../../../magic/main.js";

/**
 * TODO: 添加CSS采用拼接字符串的方式，这样删除可以从
 * 尾部删除CSS，可以不干扰样式代码别人自定义的样式
 */
function cssProxy(aKey, aVal) {
    var el = element(this);

    if (el && isTrueString(aKey)) {
        if (aVal === undefined) {
            return getComputedStyle(el)[aKey];
        } else {
            el.style[aKey] = aVal;
        }
    }

    return this;
}

export function css(aKey, aVal, setAll) {
    if (aVal !== undefined) {
        return allProxy.call(this, cssProxy, aKey, aVal, setAll);
    } else {
        return cssProxy.call(this, aKey);
    }
}

function removeCssProxy(aKey) {
    var el = element(this), style, dels;

    if (el && el.attributes && isTrueString(aKey)) {
        style = el.attributes.style;

        if (style = style.value) {
            dels = aKey.split(" ");

            for(var i=0; i<dels.length; i++) {
                var reg = new RegExp(dels[i]+':[^;]*;');
                style = style.replace(reg, '');

                if (style === "") break;
            }
        }

        if (style === "") {
            el.removeAttribute('style');
        } else {
            el.attributes.style.value = trim(style);
        }
    }

    return this;
}

export function removeCss(aKey, setAll) {
    return allProxy.call(this, removeCssProxy, aKey, setAll);
}

/**
 * 获取元素的 尺寸信息
 * @param  {Element} relative [相对定位的对象]
 * @return {Object}           [返回的尺寸信息对象]
 *
 * 如果 el 为字符串，会自动生成一个临时的对象到容器中来
 * 获取对象的尺寸信息，此时必须指定 relative 参数
 *
 * relative 为要插入的容器，因为有时候插入的元素会收到
 * 容器CSS的影响，导致尺寸有变化，为空默认为body元素
 */
export function offset(relative) {
    var el = element(this), relative, body = document.body,
        rect, copy = {}, clone, fix = [], docElem, win = window,
        render = '<div style="height: 0px; visibility: hidden"></div>';

    relative = RootMagic(relative);
    relative = element(relative) || body;

    if (el == document) {
        var width = body.clientWidth,
            height = body.clientHeight;

        rect = {
            top: 0, left: 0, right: width,

            bottom: height, width: width, height: height
        }
    } else {
        if (typeof el == "string") {
            rect  = {top: 0, left: 0, right: 0, bottom: 0};
            clone = el;
        } else if (el.getBoundingClientRect) {
            clone = el.cloneNode(true);
            rect  = el.getBoundingClientRect();
            docElem = el.ownerDocument.documentElement;
        }

        if (!rect.width && !rect.height && relative) {
            css.call(clone, "height", "0px");

            render = element(RootMagic(render));
            append.call(relative, render);
            append.call(render, clone);

            // 先设置对象高度为0，无干扰获取宽度等信息
            fix.push(clone.getBoundingClientRect());

            // 再设置父容器定位，无干扰获取高度等信息
            css.call(render, "position", "absolute");
            removeCss.call(clone, "height");
            removeCss.call(render, "height");
            fix.push(clone.getBoundingClientRect());

            docElem = clone.ownerDocument.documentElement;
            remove.call(render); // 删除创建的临时节点
        }
    }

    extend(copy, rect);
    if (fix && fix.length) {
        // 设置第一次获取尺寸绝对正确地值
        copy.width = fix[0].width;
        copy.top = fix[0].top;
        copy.left = fix[0].left;
        copy.right = fix[0].right;

        // 设置第二次获取尺寸绝对正确地值
        copy.height = fix[1].height;
        copy.bottom = fix[1].bottom;
    }

    copy.top  = copy.top + win.pageYOffset - docElem.clientTop;
    copy.left = copy.left + win.pageXOffset - docElem.clientLeft;

    return copy;
}

export function width(relative) {
    var size = offset.call(this, relative);

    return parseFloat(size.width) || 0;
}

export function height(relative) {
    var size = offset.call(this, relative);

    return parseFloat(size.height) || 0;
}

function showProxy(display) {
    var el = element(this), show, cache;

    if (cssProxy.call(el, "display") == "none") {
        cache = dataStyle(el, "display");
        show = display || cache || "block";
        cssProxy.call(el, "display", show);
    }

    return this;
}

export function show(display, setAll) {
    return allProxy.call(this, showProxy, display, setAll);
}

function hideProxy() {
    var el = element(this), display;

    display = cssProxy.call(el, "display");
    dataStyle(el, "display", display);
    cssProxy.call(el, "display", "none");

    return this;
}

export function hide(setAll) {
    return allProxy.call(this, hideProxy, setAll);
}

/** 
 * 返回元素是否处于显示状态
 *
 * http://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
 */
export function visible() {

}

/**
 * 返回元素是否在窗口可见视图中
 * 
 * https://remysharp.com/2009/01/26/element-in-view-event-plugin
 * https://github.com/mmmeff/jquery.inview2/blob/master/jquery.inview2.js
 * http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
 */
export function inview() {

}
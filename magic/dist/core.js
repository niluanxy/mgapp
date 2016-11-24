(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Magic = factory());
}(this, (function () { 'use strict';

/**
 * 检测字符串是否可以创建为 dom 元素
 */
function check(text) {
    if (typeof text === "string") {
        // 去除字符串中的换行符等
        var txt = text.replace(/[\r\n]/g,"");

        if (txt[0] === "<" &&
         txt[ txt.length - 1 ] === ">" &&
         txt.length >= 3) {
            return true;
        }
    }

    return false;
}

/**
 * 尝试将 text 转为 dom 对象
 *
 * @param       {String}    text - 要转换的DOM字符串
 * @return      {Element}   包含转换好的DOM的一个Body对象
 * @author      mufeng      <smufeng@gmail.com>
 * @version     0.1         <2015-05-30>
 */
function make(text, context) {
    var ret, i, div, tmp, cont, node = [], fragment; // 最终返回的 dom 对象

    if (check(text)) {
        // 修复执行上下文环境
        context = context && context.nodeType ? context.ownerDocument || context : document;
        fragment = context.createDocumentFragment();

        // 创建一个临时的div对象并插入字符串
        div = fragment.appendChild( context.createElement("div") );
        div.innerHTML = text;

        for(i=0; tmp = div.childNodes[i]; i++) node[i] = tmp;

        // 清除 fragment 的内容
        fragment.textContent = "";
        for(i=0; tmp=node[i]; i++) fragment.appendChild(tmp);

        ret = fragment; // 设置返回对象
    } else if (text instanceof Element || text instanceof DocumentFragment) {
        ret = text;     // 如果是DOM元素直接返回
    }

    return ret;    // 返回DOM对象
}

/**
 * 一个简单的JS查询器
 *
 * @param       {String}  select - 查找元素的CSS字符串
 * @param       {Object}  el     - 从何处开始查找元素
 * 
 * @returns     {Array}  返回查找结果数组
 * 
 * @author      mufeng  <smufeng@gmail.com>
 * @version     0.3     <2015-06-05>
 */
function query(select, el) {
    var content, result;    // 定义执行环境及结果变量

    if (typeof select == "string") {
        var elname = select.toLowerCase(); // 转为字符串
        content = el instanceof Element ||
                  el instanceof DocumentFragment ? el : document;

        if (elname == "body") {
            result = document.body;
        } else if (elname == "document") {
            result = document;
        } else if (select.indexOf("#") == 0 && !select.indexOf(" ")) {
            result = content.getElementById(select.slice(1));
        } else {
            result = content.querySelectorAll(select);
        }
    } else if (select instanceof Element) {
        result = select;    // dom元素直接返回
    } else if (select === document) {
        result = document;  // 如果是document直接返回
    }

    if (result.length === undefined) {
        result = [result];
    } else {
        var copy = [];

        for(var i=0; i<result.length; i++) {
            copy.push(result[i]);
        }

        result = copy;
    }

    return result;      // 返回最终的选择结果
}

var isArray = Array.isArray;

/* 判断是否为一个纯净的对象 */
function isObject(obj) {
    if (typeof obj !== "object" ||
         obj.nodeType || obj === window) {
        return false;
    }

    if ( obj.constructor &&
            !({}).hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
    }

    return true;
}

function isElement(object) {
    return object instanceof Element || object === document;
}

function isFunction(call) {
    return typeof call == "function";
}

function isString(string) {
    return typeof string == "string";
}

function isTrueString(string) {
    return string && typeof string == "string";
}

var _CHECK = Object.freeze({
	isArray: isArray,
	isObject: isObject,
	isElement: isElement,
	isFunction: isFunction,
	isString: isString,
	isTrueString: isTrueString
});

/*! 
 * onDomReady.js 1.4.0 (c) 2013 Tubal Martin - MIT license
 * github: https://github.com/tubalmartin/ondomready
 */

var _READY = (function(win, doc) {
    var docElem = doc.documentElement,

        LOAD = "load",
        FALSE = false,
        ONLOAD = "on"+LOAD,
        COMPLETE = "complete",
        READYSTATE = "readyState",
        ATTACHEVENT = "attachEvent",
        DETACHEVENT = "detachEvent",
        ADDEVENTLISTENER = "addEventListener",
        DOMCONTENTLOADED = "DOMContentLoaded",
        ONREADYSTATECHANGE = "onreadystatechange",
        REMOVEEVENTLISTENER = "removeEventListener",

        // W3C Event model
        w3c = ADDEVENTLISTENER in doc,
        top = FALSE,

        // isReady: Is the DOM ready to be used? Set to true once it occurs.
        isReady = FALSE,

        // Callbacks pending execution until DOM is ready
        callbacks = [];

    // Handle when the DOM is ready
    function ready( fn ) {
        if ( !isReady ) {
            
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( !doc.body ) {
                return defer( ready );
            }
            
            // Remember that the DOM is ready
            isReady = true;

            // Execute all callbacks
            while ( fn = callbacks.shift() ) {
                defer( fn );
            }
        }    
    }

    // The ready event handler
    function completed( event ) {
        // readyState === "complete" is good enough for us to call the dom ready in oldIE
        if ( w3c || event.type === LOAD || doc[READYSTATE] === COMPLETE ) {
            detach();
            ready();
        }
    }

    // Clean-up method for dom ready events
    function detach() {
        if ( w3c ) {
            doc[REMOVEEVENTLISTENER]( DOMCONTENTLOADED, completed, FALSE );
            win[REMOVEEVENTLISTENER]( LOAD, completed, FALSE );
        } else {
            doc[DETACHEVENT]( ONREADYSTATECHANGE, completed );
            win[DETACHEVENT]( ONLOAD, completed );
        }
    }

    // Defers a function, scheduling it to run after the current call stack has cleared.
    function defer( fn, wait ) {
        // Allow 0 to be passed
        setTimeout( fn, +wait >= 0 ? wait : 1 );
    }

    // Attach the listeners:

    // Catch cases where onDomReady is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( doc[READYSTATE] === COMPLETE ) {
        // Handle it asynchronously to allow scripts the opportunity to delay ready
        defer( ready );

    // Standards-based browsers support DOMContentLoaded    
    } else if ( w3c ) {
        // Use the handy event callback
        doc[ADDEVENTLISTENER]( DOMCONTENTLOADED, completed, FALSE );

        // A fallback to window.onload, that will always work
        win[ADDEVENTLISTENER]( LOAD, completed, FALSE );

    // If IE event model is used
    } else {            
        // Ensure firing before onload, maybe late but safe also for iframes
        doc[ATTACHEVENT]( ONREADYSTATECHANGE, completed );

        // A fallback to window.onload, that will always work
        win[ATTACHEVENT]( ONLOAD, completed );

        // If IE and not a frame
        // continually check to see if the document is ready
        try {
            top = win.frameElement == null && docElem;
        } catch(e) {}

        if ( top && top.doScroll ) {
            (function doScrollCheck() {
                if ( !isReady ) {
                    try {
                        // Use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        top.doScroll("left");
                    } catch(e) {
                        return defer( doScrollCheck, 50 );
                    }

                    // detach all dom ready events
                    detach();

                    // and execute any waiting functions
                    ready();
                }
            })();
        } 
    } 

    function onDomReady( fn ) { 
        // If DOM is ready, execute the function (async), otherwise wait
        isReady ? defer( fn ) : callbacks.push( fn );
    }

    // Add version
    onDomReady.version = "1.4.0";
    // Add method to check if DOM is ready
    onDomReady.isReady = function(){
        return isReady;
    };
})(window, document);

/**
 * 对数组或者对象，执行指定的回调参数
 * 
 * @param  {Object}   object   [被操作的数组或者对象]
 * @param  {Function} callback [执行操作的函数]
 */
function each(object, callback) {
    if (!object || !isFunction(callback)) return;

    for(var key in object) {
        var item = object[key];
        callback.apply(item, [key, item]);
    }
}

/**
 * 从给定字符串中，查找给定字符串或正则
 */
function strFind(strs, find) {
    var arrs = strs.split(" ");

    for(var i=0; i<arrs.length; i++) {
        if (arrs[i].match(find)) {
            return i;
        }
    }

    return -1;
}

/**
 * 类数组 slice 方法模拟
 */
function slice(array, start, end) {
    var ret = [], aend = end || array.length;

    for(var i=start||0; i<aend; i++) {
        ret.push(array[i]);
    }

    return ret;
}

function trim(string) {
    return string.replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
 * 尝试从 Magic 对象返回一个 element 对象
 */
function element(object) {
    if (object) {
        if (isElement(object)) {
            return object;
        } else if (isElement(object[0])) {
            return object[0];
        }
    }

    return null;
}

/**
 * 合并一个或多个对象到目标对象
 *
 * @param       {Object}    deep     - 是否深度复制
 * @param       {Object}    target   - 目标对象
 * @param       {Object}    obj...   - 要合并一个或多个对象
 * @param       {Boolean}   ignore   - 是否忽略无效值(null,undefined)，默认不忽略
 * @author      mufeng  <smufeng@gmail.com>
 * @version     0.1     <2015-04-10>
 */
function extend(/* deep, target, obj..., last */) {
    var i = 1, argv = arguments, len = argv.length,
        target = argv[0], name, copy, clone,
        pass = false, deep = false;

    // 如果最后一个变量是 true ，表示忽略无效字段
    if (argv[len-1] === true) {
        pass = argv[len-1];
        len--;
    }

    // 如果第一个变量是 true，设置深度复制
    if (argv[0] === true) {
        deep = argv[0];
        target = argv[1];
        i++;
    }

    // 如果只有一个参数时，合并到自身
    if (i === len) {
        target = this;      // 重置复制对象句柄
        i = 0;              // 重置开始复制的对象下标
    }

    for(; i < len; i++) {
        if (argv[i] != null) {
            for(name in argv[i]) {
                var src  = target[name],
                    copy = argv[i][name];

                // 跳过指向自身，防止死循环
                if (target === copy) {
                    continue;
                }

                // 若设置忽略无效值，则忽略
                if (pass && copy == undefined) {
                    continue;
                }

                if (deep && copy && ( isArray(copy) || isObject(copy) ) ) {

                    // 深度复制时，判断是否需要创建新空间
                    if (isArray(copy)) {
                        clone = src && isArray(src) ? src : [];
                    } else {
                        clone = src && isObject(src) ? src : {};
                    }

                    target[name] = extend(deep, clone, copy, pass);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;     // 返回合并后的对象
}

var Magic;
var Prototype;
var Creater;

Magic = function(select, context) {
    if (isFunction(select)) {
        return _READY(select);
    }

    this.length = 0;
    
    if (typeof select === "string") {
        // 判断是否为创建DOM的字符串
        if (check(select)) {
            var make$$1 = make(select);
            if (make$$1.childNodes.length == 1) {
                this[0] = make$$1.childNodes[0];
            } else {
                this[0] = make$$1;
            }

            this.length = 1;
        } else {
            // 否则直接尝试查找对象
            context = context ? context[0] || context : null;
            var qur = query(select, context);
            
            extend(true, this, qur);
            this.length = qur.length;
        }
    } else if (isElement(select) || select === window) {
        // 如果是DOM对象，返回包装的对象
        this[0] = select;
        this.length = 1;
    } else if (select instanceof Magic) {
        return select;
    } else if (select && select.length) {
        var pos = 0, element$$1;

        for(var i=0; i<select.length; i++) {
            element$$1 = select[i];

            if (element$$1 instanceof Element || element$$1 === document) {
                this[pos++] = element$$1;
            }
        }

        this.length = pos;
    }

    return this.length > 0 ? this : null;
};

Prototype = {
    constructor: Magic,

    // 原型有splice属性,对象会变为类数组对象
    splice: [].splice,

    /* 简单的查询方法，返回标准的dom对象 */
    query: function(select) {
        return query(select, this[0]);
    },

    /* 在子类中查找对象 */
    find: function(select) {
        return new Magic(select, this[0]);
    },

    each: function(callback) {
        each(this, callback);

        return this;
    },

    extend: function() {
        var args = slice(arguments);

        if (args[0] === true) {
            args.splice(1, 0, this);
        } else {
            args.unshift(this);
        }
        
        extend.apply(null, args);

        return this;
    }
};

Creater = function(select, context) {
    return new Magic(select, context);
};

each([Creater, Magic], function(index, object) {
    extend(this, {
        extend: extend,
        query: query,
        each: each
    }, _CHECK);
});

// 对象继承链修复
Creater.fn = Creater.prototype = Magic.prototype = Prototype;

var RootMagic$1 = Creater;

function eachProxy(/* call, args... */) {
    var call = arguments[0], args;

    if (isFunction(call)) {
        args = slice(arguments, 1);

        for(var i=0; i<this.length; i++) {
            call.apply(this[i], args);
        }
    }

    return this;
}

// 尝试读取或者写入指定的对象
function keyProxy(aKey, aVal, empty) {
    var el = element(this);

    if (el && isTrueString(aKey)) {
        if (aVal === undefined) {
            return el[aKey];
        } else if (empty && aVal !== undefined) {
            el[aKey] = aVal;
        } else if (aVal != undefined) {
            el[aKey] = aVal;
        }
    }

    return this;
}

// 可全部执行代理方法，用于部分方法可以对所有对象执行
function allProxy(/* call args... setAll */) {
    var last, args, call,
        len = arguments.length;

    call = arguments[0];
    last = arguments[len-1];
    
    len = last === true ? len-1 : len;
    args = slice(arguments, 1, len);

    if (last === true) {
        args.unshift(call);
        eachProxy.apply(this, args);
        
        return this;
    } else {
        return call.apply(this, args);
    }
}

function domGet(html) {
    var create = null;

    if (html instanceof RootMagic$1) {
        create = html[0];
    } else {
        create = make(html);
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

function prepend(html, setAll) {
    return allProxy.call(this, prependProxy, html, setAll);
}

function appendProxy(html) {
    var el = element(this), dom;

    if (el && el.nodeType === 1 &&
        (dom = domGet(html)) ) {
        el.appendChild(dom);
    }

    return this;
}

function append(html, setAll) {
    return allProxy.call(this, appendProxy, html, setAll);
}

function appendTo(html, setAll) {
    var that = RootMagic$1(html);

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

function before(html, setAll) {
    return allProxy.call(this, insertProxy, html, true, setAll);
}

function after(html, setAll) {
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

function wrap(html, setAll) {
    return allProxy.call(this, wrapProxy, html, setAll);
}

function removeProxy() {
    var el = element(this), parent;

    if (el && (parent = el.parentNode)) {
        parent.removeChild(el);
    }

    return this;
}

function remove(setAll) {
    return allProxy.call(this, removeProxy, setAll);
}

var editer = Object.freeze({
	prepend: prepend,
	appendProxy: appendProxy,
	append: append,
	appendTo: appendTo,
	before: before,
	after: after,
	wrap: wrap,
	remove: remove
});

function index() {
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

function parent() {
    var el = element(this);

    return RootMagic$1(el && el.parentNode);
}

function children(search) {
    var el = element(this);

    if (search) {
        return RootMagic$1(search, el);
    } else {
        return RootMagic$1(el && el.children);
    }
}

var search = Object.freeze({
	index: index,
	parent: parent,
	children: children
});

function html(html, setAll) {
    return allProxy.call(this, keyProxy, "innerHTML", html, true, setAll);
}

function outerHtml(html, setAll) {
    return allProxy.call(this, keyProxy, "outerHTML", html, true, setAll);
}

function text(text, setAll) {
    return allProxy.call(this, keyProxy, "innerText", text, true, setAll);
}

/**
 * 表单元素设置值或读取值
 */
function valProxy(aVal) {
    var el = element(this), type, aValue;

    if (el && el.tagName === "INPUT") {
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

function val(aVal, setAll) {
    return allProxy.call(this, valProxy, aVal, setAll);
}

function checked() {
    return valProxy.call(this[0]) === "on";
}

/**
 * 对象的 HTML 属性操作(读或者取)
 */
function attrProxy(aKey, aVal) {
    var el = element(this), nType = el.nodeType ? el.nodeType : 2;

    if (nType === 3 || nType === 8 || nType === 2) {
        return; // 忽略掉 文本节点、注释和属性节点
    }

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

function attr(aKey, aVal, setAll) {
    return allProxy.call(this, attrProxy, aKey, aVal, setAll);
}

function removeAttrProxy(aKey) {
    var el = element(this), dels;

    if (isTrueString(aKey)) {
        dels = aKey.split(" ");

        for(var i=0; i<dels.length; i++) {
            el.removeAttribute(dels[i].toLowerCase());
        }
    }

    return this;
}

function removeAttr(aKey, setAll) {
    return allProxy.call(this, removeAttrProxy, aKey, setAll);
}

var attrbute = Object.freeze({
	html: html,
	outerHtml: outerHtml,
	text: text,
	val: val,
	checked: checked,
	attr: attr,
	removeAttr: removeAttr
});

RootMagic$1.fn.extend(attrbute, editer, search);

function hasClass(cls) {
    var el = element(this), result, arrays, test, clsName;

    if (isTrueString(cls) && el && (clsName = el.className)) {
        test = cls.replace(/\s+/, ' ').split(" ");
        result = true;

        for(var i=0; i<test.length; i++) {
            var reg = new RegExp("(^|\\s)" + test[i] + "(\\s|$)");

            if (!reg.test(clsName)) {
                result = false;
                break;
            }
        }

        return result;
    } else {
        return false;
    }
}

function addProxy(cls) {
    var el = element(this), adds, clsName;

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

function addClass(cls, setAll) {
    return allProxy.call(this, addProxy, cls, setAll);
}

function removeProxy$1(cls) {
    var el = element(this), dels, clsName;

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

function removeClass(cls, setAll) {
    return allProxy.call(this, removeProxy$1, cls, setAll);
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
            removeProxy$1.call(el, cls);
        }
    } else if (hasClass.call(el, cls)) {
        removeProxy$1.call(el, cls);
    } else {
        addProxy.call(el, cls);
    }

    return this;
}

function toggleClass(cls, set, setAll) {
    return allProxy.call(this, toggleProxy, cls, set, setAll);
}

var clase = Object.freeze({
	hasClass: hasClass,
	addClass: addClass,
	removeClass: removeClass,
	toggleClass: toggleClass
});

var NAME_STYLE = "_MG_STYLE_";
var NAME_EVENT = "_MG_EVENT_";
var NAME_CORE  = "_MG_CORE_";


function tryVal(el, space, aKey, aVal) {
    var data = el[space];
    if (!data) data = el[space] = {};

    if (aKey && aVal !== undefined) {
        data[aKey] = aVal;
        return true;
    } else if (aKey) {
        return data[aKey];
    }

    return null;
}

function dataStyle(el, aKey, aVal) {
    return tryVal(el, NAME_STYLE, aKey, aVal);
}

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

function css(aKey, aVal, setAll) {
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

function removeCss(aKey, setAll) {
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
 * relative 为要插入的容器，因为有时候插入的元素会受到
 * 容器CSS的影响，导致尺寸有变化，为空默认为body元素
 */
function offset(relative) {
    var el = element(this), relative, body = document.body,
        rect, copy = {}, clone, fix = [], docElem, win = window,
        render = '<div style="height: 0px; visibility: hidden"></div>';

    relative = RootMagic$1(relative);
    relative = element(relative) || body;

    if (el == document) {
        var width = body.clientWidth,
            height = body.clientHeight;

        rect = {
            top: 0, left: 0, right: width,

            bottom: height, width: width, height: height
        };
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

            render = element(RootMagic$1(render));
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

function width(relative) {
    var size = offset.call(this, relative);

    return parseFloat(size.width) || 0;
}

function height(relative) {
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

function show(display, setAll) {
    return allProxy.call(this, showProxy, display, setAll);
}

function hideProxy() {
    var el = element(this), display;

    display = cssProxy.call(el, "display");
    dataStyle(el, "display", display);
    cssProxy.call(el, "display", "none");

    return this;
}

function hide(setAll) {
    return allProxy.call(this, hideProxy, setAll);
}

/** 
 * 返回元素是否处于显示状态
 */
function visible() {
    var el = element(this),
        rect = offset.call(el),
        opacity = parseFloat(css.call(el, "opacity")),
        display = css.call(el, "display"),
        avisible= css.call(el, "visibility");

    if (rect.width <=0 || rect.height <= 0 ||
        opacity <= 0 || display === "none" ||
        avisible === "hidden") {

        return false;
    }

    return true;
}

/**
 * 返回元素是否在窗口可见视图中
 */
function inview(offsetTop, offsetLeft) {
    var el = element(this),
        show = visible.call(el),
        rect = offset.call(el),
        doce = document.documentElement,
        body = document.body,
        vw, vh, stop, sleft, ft, fl, bt, bl;

    if (!show) return fasle;
    vw = doce.clientWidth;
    vh = doce.clientHeight;

    stop = doce.scrollTop ? doce.scrollTop : body.scrollTop;
    sleft = doce.scrollLeft ? doce.scrollLeft : body.scrollLeft;

    offsetTop = offsetTop || 0;
    offsetLeft = offsetLeft || 0;

    ft = rect.top - stop;
    bt = rect.top - stop + rect.height;
    fl = rect.left - sleft;
    bl = rect.left - sleft + rect.width;

    if ( (ft-offsetTop <= vh && bt >= 0) &&
         (fl-offsetLeft <= vw && bl >= 0) ) {
        return true;
    }

    return false;
}

var other = Object.freeze({
	css: css,
	removeCss: removeCss,
	offset: offset,
	width: width,
	height: height,
	show: show,
	hide: hide,
	visible: visible,
	inview: inview
});

RootMagic$1.fn.extend(clase, other);

try {
    if (typeof window === "object") {
        window.Magic = RootMagic$1;
        if (!window.$) window.$ = RootMagic$1;
    }
} catch(e) {}

RootMagic$1.version = "0.5.0";

return RootMagic$1;

})));

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

// 检测是否为一个空对象
function isEmptyObject(obj) {
    var count = 0;

    for(var key in obj) count++;

    return count===0;
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

function isNumber(number) {
    return typeof number == "number" && !isNaN(number);
}

function isTrueString(string) {
    return string && typeof string == "string";
}

var _CHECK = Object.freeze({
	isArray: isArray,
	isObject: isObject,
	isEmptyObject: isEmptyObject,
	isElement: isElement,
	isFunction: isFunction,
	isString: isString,
	isNumber: isNumber,
	isTrueString: isTrueString
});

var $config = {
    ui: {
        style : "primary",
        active: "active",
    },
};

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
        var item = object[key], runs = [key, item];

        if (key === "length") return;
        if (callback.apply(item, runs) === false) break;
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

    /* 在子类中查找对象 */
    find: function(select) {
        return new Magic(select, this[0]);
    },

    /* 简单的查询方法，返回标准的dom对象 */
    query: function(select) {
        return query(select, this[0]);
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
        extend: function() {
            var args = extend([], arguments), fix = 0;

            if (args[0] === true) fix = 1;

            // 第一个对象非 {}，合并到自身
            if (!isEmptyObject(args[fix])) {
                args.splice(fix, 0, this);
            }

            return extend.apply(this, args);
        },
        query: query,
        each: function(callback) {
            each(this, callback);
        }
    }, _CHECK);
});

// 对象继承链修复
Creater.fn = Creater.prototype = Magic.prototype = Prototype;
Creater.config = $config;

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

function hasClass(cls) {
    var el = element(this), result, arrays, test, clsName;

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

function regClass(reg) {
    var el = element(this), clsName;

    if (isTrueString(reg) && el && (clsName = el.className)) {
        return clsName.match(new RegExp(reg));
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
	regClass: regClass,
	addClass: addClass,
	removeClass: removeClass,
	toggleClass: toggleClass
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

function eq(el, checkAll) {
    if (isNumber(el)) {
        return RootMagic$1(this[el]);
    } if (isString(el)) {
        var test = trim(el.replace(".", ' ')), arrs = [];

        for(var i=0; i<this.length; i++) {
            var item = this[i];

            if (hasClass.call(item, test)) {
                arrs.push(item);
            }
        }

        return RootMagic$1(arrs);
    } else if (isElement(el)) {
        return this[0] === el;
    } else if (el instanceof RootMagic$1) {
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

function below(parent) {
    var par = RootMagic$1(parent),
        check = this.parent();

    do {
        if (check.eq(par)) {
            return true;
        }

        check = check.parent();
    } while(check.length > 0);

    return false;
}

var search = Object.freeze({
	index: index,
	parent: parent,
	children: children,
	eq: eq,
	below: below
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

function tag() {
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

    if (el && isTrueString(aKey)) {
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
	tag: tag,
	val: val,
	checked: checked,
	attr: attr,
	removeAttr: removeAttr
});

RootMagic$1.fn.extend(attrbute, editer, search);

var NAME_STYLE = "_MG_STYLE_";
var NAME_EVENT = "_MG_EVENT_";
var NAME_CORE  = "_MG_CORE_";

function tryVal(ele, space, aKey, aVal) {
    var el = element(ele), data = el[space];
    if (!data) data = el[space] = {};

    if (aKey && aVal !== undefined) {
        data[aKey] = aVal;
        return true;
    } else if (aKey) {
        return data[aKey];
    }

    return null;
}

function delKey(ele, space, aKey) {
    var el = element(ele), data = el[space];

    if (data) delete data[aKey];

    return true;
}

function dataStyle(el, aKey, aVal) {
    return tryVal(el, NAME_STYLE, aKey, aVal);
}

function dataCore(el, aKey, aVal) {
    return tryVal(el, NAME_CORE, aKey, aVal);
}

function removeDataCore(el, aKey) {
    return delKey(el, NAME_CORE, aKey);
}

function dataEvent(el, aKey, aVal) {
    return tryVal(el, NAME_EVENT, aKey, aVal);
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

    if (!el) return {top: 0, left: 0, right: 0,
                     bottom: 0, width: 0, height: 0};

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
        show = display || cache;
        show = show && show != "none" ? show : "block";
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

    if (!el || rect.width <=0 || rect.height <= 0 ||
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

var Emitter;
var Prototype$1 = {};
var $KEY = "##_";

// 获取到修饰后的 key 值
function keyFix(name) {
    name = name.replace(/^\./g, '');
    return $KEY + name;
}

function keyTest(name) {
    var reg = new RegExp("^"+$KEY);

    return name.match(reg);
}

// 在 列表树 中根据路径查询对象
// 如果没有值会返回 null
function pathFind(paths, str, parent) {
    var arr = str.split("/"), par = null;

    for(var i=0; i<arr.length; i++) {
        if (isTrueString(arr[i])) {
            var key = keyFix(arr[i]);

            if (!isObject(paths[key])) {
                return null;
            } else {
                par = paths;
                paths = paths[key];
            }
        }
    }

    return parent ? par : paths;
}

// 在 列表树 中根据路径查询对象
// 如果没有值则会每一级的创建空对象
function pathAdd(paths, str) {
    var arr = str.split("/");

    for(var i=0; i<arr.length; i++) {
        if (isTrueString(arr[i])) {
            var key = keyFix(arr[i]);

            if (!isObject(paths[key])) {
                paths[key] = {};
            }

            paths = paths[key];
        }
    }

    return paths;
}

function arrayCopy(array) {
    var copy = [];

    if (isArray(array)) {
        for(var i=0; i<array.length; i++) {
            copy.push(array[i]);
        }
    }

    return copy;
}

function pathSplit(str) {
    var space, eves, first, split;

    if (str.match(/^.+\s.+$/)) {
        split = str.split(" ");
        space = split[0];
        eves  = split[1];
    } else {
        space = "";
        eves  = str || "";
    }

    first = eves.match(/(^[^\.]*)\./);
    first = first ? first[1] : eves;

    return {space: space, eves: eves, first: first};
}

// 分离出用户调用的事件名，事件参数
// 如果第一个参数为 true，表示执行会忽略根元素自身
function eventArgs(/* args... */) {
    var ret = {}, split, splice = Array.prototype.splice;

    if (arguments.length >= 2 && arguments[0] === true) {
        ret.pass = true;
        split = pathSplit(arguments[1]);
        ret.args = splice.call(arguments, 2);
    } else {
        ret.pass = false;
        split = pathSplit(arguments[0]);
        ret.args = splice.call(arguments, 1);
    }
    
    ret.eves  = split.eves;
    ret.first = split.first;
    ret.space = split.space;

    return ret;
}

// 查找给定路劲下的给定对象
// 没有会创建空对象
function pathObjectAdd(paths, str, key) {
    if (!paths || !key) return null;

    var path = pathAdd(paths, str);

    if ( !(isObject(path[key])) ) {
        path[key] = {};
    }

    return path[key];
}

function pathObjectPush(paths, str, key, call, content) {
    var split = pathSplit(str), path,
        space = split.space,
        eves  = split.eves,
        first = split.first;

    path = pathObjectAdd(paths, space, key);

    if (!isArray(path[first])) {
        path[first] = [];
    }

    path[first].push({
        name: eves, run: call,
        content: content || window || null
    });
}

// 删除给定路劲下的回调对象
// 未给定回调则删除所有
function pathObjectDel(paths, str, key, call) {
    var split = pathSplit(str),
        space = split.space,
        eves  = split.eves,
        first = split.first, path, arrs;

    path = pathFind(paths, space);
    arrs = path[key];

    if (isObject(arrs)) {
        if (eves === first && call === undefined) {
            delete arrs[eves];
        } else {
            arrs = arrs[first] || [];

            for(var i=0; i<arrs.length; i++) {
                var item = arrs[i],
                    name = item.name, run = item.run;

                if (call && name.match("^"+eves) && call === run) {
                    arrs.splice(i--, 1);
                } else if (!call && name.match("^"+eves)) {
                    arrs.splice(i--, 1);
                }
            }
        }
    }
}

// 检测指定对象下，是否有可运行的事件对象
// 严格模式必须有匹配的事件
function eventTest(paths, eFirst, strict) {
    var arrs = "call".split(" "), find = 0;

    for(var i=0; i<arrs.length; i++) {
        var key = arrs[i], runs;

        runs = paths[key] || {};
        runs = runs[eFirst] || [];
    
        if (!!strict === true) {
            for(var j=0; j<runs.length; j++) {
                if (runs[i].name.match("^"+strict)) {
                    find += 1;
                }
            }
        } else {
            find += runs.length;
        }
    }

    return find > 0;
}

/**
 * 获取给定路劲下可以传播事件的对象
 * 
 * @param  {String} strict [严格匹配的事件名]
 */
function eventChild(paths, eFirst, strict) {
    var calls = [];

    for(var key in paths) {
        var item = paths[key], find;

        if (keyTest(key) && eventTest(item, eFirst, strict)) {
            if (!!strict) {
                // 严格模式下，至少要有一个完全匹配的事件
                find = item.call || {};
                find = find[eFirst] || [];

                for(var j=0; j<find.length; j++) {
                    if (find[j].name.match("^"+strict)) {
                        calls.push(item);
                        break;
                    }
                }
            } else {
                calls.push(item);
            }
        }
    }

    return calls;
}

function eventEmit(paths, eName, eFirst, before) {
    var args, propagation;

    before = before || {};
    args = before.arguments || [];
    propagation = !!before.propagation;

    function getCalls(paths, type, eves) {
        var arrs = [];

        if (isObject(paths[type])) {
            paths = paths[type];
            arrs  = paths[eves] || [];
        }

        return arrs;
    }

    function callRuns(calls, eves, once) {
        // 克隆数组，防止数组长度变化
        var copy = arrayCopy(calls), immediation = true,
            continer, stopPropa, stopImmed;

        stopPropa = function() { propagation = false; };
        stopImmed = function(propa) {
            immediation = false;
            // 默认也会终止事件冒泡
            if (propa !== true) propagation = false;
        };

        continer = function() {
            this.stopPropagation = stopPropa;
            this.stopImmediation = stopImmed;
        };

        for(var i=0; i<copy.length; i++) {
            var item = copy[i],
                name = item.name, run = item.run;

            if (name.match("^"+eves)) {
                continer.prototype = item.content || null;
                run.apply(new continer, args);

                if (once === true) break;
            }

            if (!immediation) break;
        }
    }

    if (isObject(paths)) {
        var actions = ["patch", "catch", "call"];

        for(var i=0; i<actions.length; i++) {
            var action = actions[i], eves;
            eves = getCalls(paths, action, eFirst);

            if (propagation && eves.length > 0) {
                callRuns(eves, eName, action == "catch");
                if(action === "catch") break;
            }
        }
    }

    /**
     * 返回本次运行后的数据状态
     */
    return {
        propagation: propagation,
        arguments  : args || [],
    }
}

Emitter = function(tables, parent, prefix) {
    this.tables = tables || {};
    this.parent = parent || null;
    this.prefix = prefix || null;

    return this;
};

Emitter.prototype = Prototype$1;

// 添加一个事件对象
Prototype$1.on = function(eve, call, content) {
    if (isTrueString(eve) && isFunction(call)) {
        pathObjectPush(this.tables, eve, "call", call, content);
    }

    return this;
};

// 添加一个一次性的事件对象
Prototype$1.once = function(eve, call, content) {
    if (isTrueString(eve) && isFunction(call)) {
        var that = this, once;

        once = function() {
            call.apply(this, arguments);
            that.off(eve, once);
        };

        that.on(eve, once, content);
    }

    return this;
};

// 移除一个事件
Prototype$1.off = function(eve, call) {
    if (isTrueString(eve)) {
        pathObjectDel(this.tables, eve, "call", call);
    }

    return this;
};

// 在元素上添加捕获事件
Prototype$1.catch = function(eve, call, content) {
    if (isTrueString(eve) && isFunction(call)) {
        pathObjectPush(this.tables, eve, "catch", call, content);
    }

    return this;
};

// 在元素上移除捕获事件
Prototype$1.uncatch = function(eve, call) {
    if (isTrueString(eve)) {
        pathObjectDel(this.tables, eve, "catch", call);
    }

    return this;
};

// 在元素上添加一个修饰器
Prototype$1.patch = function(eve, call) {
    if (isTrueString(eve) && isFunction(call)) {
        pathObjectPush(this.tables, eve, "patch", call, content);
    }

    return this;
};

// 在元素上移除一个修饰器
Prototype$1.unpatch = function(eve, call) {
    if (isTrueString(eve)) {
        pathObjectDel(this.tables, eve, "patch", call);
    }

    return this;
};

// 在元素上触发事件
Prototype$1.emit = function(/* eve, args... */) {
    var runs = eventArgs.apply(null, arguments),
        path, eves, first;

    if (isTrueString(runs.eves)) {
        first = runs.first;
        eves  = runs.eves;
        path  = pathFind(this.tables, runs.space);

        if (isObject(path)) {
            eventEmit(path, eves, first, {
                arguments: runs.args,
                propagation: true,
            });
        }
    }

    return this;
};

// 向父元素冒泡这个事件
Prototype$1.dispatch = function(/* eve, args... */) {
    var pathCall = [], run = eventArgs(arguments),
        space, before, maps = this.tables;

    if (isTrueString(run.eves)) {
        if (run.space === "") {
            pathCall.push(maps);
        } else {
            spaces = run.space.split("/");

            for(var i=0; i<spaces.length; i++) {
                var key = keyFix(spaces[i]);

                if (isObject(maps[key])) {
                    pathCall.push(maps[key]);
                    maps = maps[key];
                } else {
                    return this;
                }
            }
        }

        before = {
            arguments: run.args,
            propagation: true,
        };

        // 如果忽略自身，则移除自身执行数据
        if (run.pass === true) pathCall.pop();

        for(var i=pathCall.length-1; i>=0; i--) {
            before = eventEmit(pathCall[i],
                run.eves, run.first, before);

            if (!before.propagation) break;
        }
    }

    return this;
};

// 向子元素传播这个事件
Prototype$1.broadcast = function(/* eve, args... */) {
    var run = eventArgs(arguments),
        calls, before, eFirst, eName;

    path = pathFind(this.tables, run.space);
    eName = run.eves; eFirst = run.first;

    if (path && isTrueString(eName)) {
        // 忽略自身，则直接从子级开始执行
        if (run.pass === true) {
            calls = eventChild(path, eFirst, eName);
        } else {
            if (eventTest(path, eFirst, eName)) {
                calls = [path];
            } else {
                return this;
            }
        }

        do {
            var cache = [], child;

            for(var i=0; i<calls.length; i++) {
                var _args = arrayCopy(run.args);

                _args = eventEmit(calls[i], eName, eFirst, {
                    arguments: _args,
                    propagation: true,
                });

                if (_args.propagation === true) {
                    child = eventChild(calls[i], eFirst, eName);
                    cache = cache.concat(child);
                }
            }

            calls = cache;
        } while (calls.length);
    }

    return this;
};

// 构造函数，兼容 new 方式创建对象
var Creater$1 = function() {
    return new Emitter();
}; Creater$1.prototype = Prototype$1;

try {
    if (typeof window === "object") {
        window.Emitter = Creater$1;
    }
} catch(e) {}

function getPrefix(eve) {
    var find = eve.match(/[^\.]*\./);

    if (find) {
        return find[0].replace(".", '');
    } else {
        return eve;
    }
}

function checkIn(event, select) {
    if (event) {
        if (isTrueString(select)) {
            var target = event.target, ret,
                $finds = parent.call(target);

            $finds.find(select).each(function(key, ele) {
                if (ele === target) {
                    ret = true;
                    return false;
                }
            });

            return !!ret;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function fixEvent(event, scope) {
    var fix = extend({}, event);

    fix.stopImmediatePropagation = function() {
        scope.stopImmediation();
        if (event.bubbles) {
            event.stopPropagation();
        }
        event.magicImmediation = false;
        event.magicPropagation = false;
    };

    fix.stopImmediation = function() {
        scope.stopImmediation();
        event.magicImmediation = false;
    };

    fix.stopPropagation = function() {
        scope.stopPropagation();
        if (event.bubbles) {
            event.stopPropagation();
        }
        event.magicPropagation = false;
    };

    fix.preventDefault = function() {
        if (event.bubbles && event.cancelable) {
            event.preventDefault();
        }
    };

    fix.originalEvent = event;

    return fix;
}

function addProxy$1(bind, eve, select, callback, extScope) {
    var el = element(this), adds, scope, handle;

    if (el && isTrueString(eve) && isFunction(callback)) {
        adds = eve.split(" ");
        scope = extScope || RootMagic$1(el);

        each(adds, function(index$$1, eveName) {
            var evePre  = getPrefix(eveName),
                eveCtrl = dataEvent(el, evePre);

            if (!eveCtrl || !eveCtrl.on) {
                eveCtrl = Creater$1();
                dataEvent(el, evePre, eveCtrl);

                // 绑定到原生事件，从而保证事件执行顺序
                el.addEventListener(evePre, function(event) {
                    var args = event.originalArgs, eveName;

                    if (!args || !args.length) {
                        args = [event.type];
                    }

                    args.splice(1, 0, event);
                    eveCtrl.emit.apply(eveCtrl, args);
                });
            }

            (function(Selecter) {
                eveCtrl[bind](eveName, function(event) {
                    if (checkIn(event, Selecter)) {
                        var args = extend([], arguments);

                        args[0] = fixEvent(event, this);
                        callback.apply(scope, args);
                    }
                });
            })(select);
        });
    }

    return this;
}

function addFixArgs(proxy, bind, args) {
    var copy = extend([], args);

    // 修复 select 参数
    if (isFunction(copy[1])) {
        copy.splice(1, 0, null);
    }

    // 修复 extScope 参数
    if (!isObject(copy[3])) {
        copy.splice(3, 0, null);
    }

    copy.unshift(bind);
    copy.unshift(proxy);

    return copy;
}

function on(eve, select, callback, extScope, setAll) {
    return allProxy.apply(this, addFixArgs(addProxy$1, "on", arguments));
}

function once(eve, select, callback, extScope, setAll) {

    return allProxy.apply(this, addFixArgs(addProxy$1, "once", arguments));
}

function propaEmit(/* el, eveName, args... */) {
    var args = $.extend([], arguments),
        el = element(args[0]), eveName = args[1], evePre;

    args = slice(args, 1);
    evePre = getPrefix(eveName);

    do {
        var creEvent, eveCtrl, runArgs;

        runArgs = extend([], args);
        creEvent = new Event(evePre, {
            bubbles: false, cancelable: true,
        });

        if (evePre === eveName) {
            creEvent.originalArgs = runArgs;
            el.dispatchEvent(creEvent);
        } else {
            eveCtrl = dataEvent(el, evePre);

            if (eveCtrl && eveCtrl.emit) {
                runArgs.splice(1, 0, creEvent);
                eveCtrl.emit.apply(eveCtrl, runArgs);
            }
        }

        // 尝试手动进行事件冒泡，为 false 不冒泡
        if (creEvent.magicPropagation !== false) {
            el = el.parentNode;
        } else {
            return;
        }
    } while(el.parentNode);
}

function emitProxy(/* eve, args... */) {
    var el = element(this), runs, scope,
        args = extend([], arguments);

    if (el && isTrueString(args[0])) {
        runs = args[0].split(" ");
        scope = RootMagic$1(el);

        each(runs, function(index$$1, eveName) {
            var runArgs = args.slice(1);

            runArgs.unshift(eveName);
            runArgs.unshift(el);

            propaEmit.apply(null, runArgs);
        });
    }

    return this;
}

function emit(/* eve, args... */) {
    var args = extend([], arguments);
    args.unshift(emitProxy);
    return allProxy.apply(this, args);
}

function offProxy(eve) {
    var el = element(this), dels;

    if (el && isTrueString(eve)) {
        dels = eve.split(" ");

        each(dels, function(index$$1, eveName) {
            var evePre  = getPrefix(eveName),
                eveCtrl = dataEvent(el, evePre);

            if (eveCtrl && eveCtrl.off) {
                eveCtrl.off(eveName);
            }
        });
    }

    return this;
}

function off(eve, setAll) {
    return allProxy.call(this, offProxy, eve, setAll);
}

var core = Object.freeze({
	on: on,
	once: once,
	emit: emit,
	off: off
});

RootMagic$1.fn.extend(core);

function dataProxy(aKey, aVal) {
    var el = element(this);

    if (aKey && aVal === undefined) {
        return dataCore(el, aKey);
    } else {
        dataCore(el, aKey, aVal);
    }

    return this;
}

function data(aKey, aVal, setAll) {
    return allProxy.call(this, dataProxy, aKey, aVal, setAll);
}

function removeDataProxy(aKey) {
    var el = element(this);

    removeDataCore(el, aKey);

    return this;
}

function removeData(aKey, setAll) {
    return allProxy.call(this, removeDataProxy, aKey, setAll);
}

var data$1 = Object.freeze({
	data: data,
	removeData: removeData
});

/**
 * templayed.js 0.2.1 (Uncompressed)
 * http://archan937.github.io/templayed.js/
 */
function templayed(template, vars) {
    var get = function(path, i) {
        i = 1; path = path.replace(/\.\.\//g, function() { i++; return ''; });
        var js = ['vars[vars.length - ', i, ']'], keys = (path == "." ? [] : path.split(".")), j = 0;
        for (j; j < keys.length; j++) { js.push('.' + keys[j]); }
        return js.join('');
    }, tag = function(template) {
        return template.replace(/\{\{(!|&|\{)?\s*(.*?)\s*}}+/g, function(match, operator, context) {
            if (operator == "!") return '';
            var i = inc++;
            return ['"; var o', i, ' = ', get(context), ', s', i, ' = (((typeof(o', i, ') == "function" ? o', i, '.call(vars[vars.length - 1]) : o', i, ') || "") + ""); s += ',
                (operator ? ('s' + i) : '(/[&"><]/.test(s' + i + ') ? s' + i + '.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/>/g,"&gt;").replace(/</g,"&lt;") : s' + i + ')'), ' + "'
            ].join('');
        });
    }, block = function(template) {
        return tag(template.replace(/\{\{(\^|#)(.*?)}}(.*?)\{\{\/\2}}/g, function(match, operator, key, context) {
            var i = inc++;
            return ['"; var o', i, ' = ', get(key), '; ',
                (operator == "^" ?
                        ['if ((o', i, ' instanceof Array) ? !o', i, '.length : !o', i, ') { s += "', block(context), '"; } '] :
                        ['if (typeof(o', i, ') == "boolean" && o', i, ') { s += "', block(context), '"; } else if (o', i, ') { for (var i', i, ' = 0; i', i, ' < o',
                            i, '.length; i', i, '++) { vars.push(o', i, '[i', i, ']); s += "', block(context), '"; vars.pop(); }}']
                ).join(''), '; s += "'].join('');
        }));
    }, inc = 0;

    return new Function("vars", 'vars = [vars], s = "' + block(template.replace(/"/g, '\\"').replace(/\n/g, '\\n')) + '"; return s;');
}

function tplProxy(template, data) {
    var el = element(this), tpls;

    if (el && isTrueString(template) && isObject(data)) {
        tpls = templayed(template)(data);
        append.call(el, tpls);
    }

    return this;
}

function tpl(template, data, setAll) {
    return allProxy.call(this, tplProxy, template, data, setAll);
}

var other$1 = Object.freeze({
	tpl: tpl
});

RootMagic$1.fn.extend(data$1, other$1);

/**
 * references:
 * https://github.com/YuzuJS/setImmediate
 * https://dbaron.org/log/20100309-faster-timeouts
 */

var fastCall$1 = (function() {
    var run = self, pre = "~_fast_call$", doc, addEvent;

    addEvent = run.addEventListener || run.attachEvent;
    doc = run.document;

    if (run.setImmediate) {
        return run.setImmediate;
    } else if (run.process && run.process.nextTick) {
        return run.process.nextTick;
    } else if (run.postMessage) {
        var calls = [];

        addEvent("message", function(e) {
            if (e.source === run && e.data === pre) {
                calls.shift()();
            }
        }, false);

        return function(callback) {
            calls.push(callback);
            run.postMessage(pre, "*");
        }
    } else if (doc && doc.createElement) {
        var html = doc.documentElement, script;
            
        return function(callback) {
            script = doc.createElement("script");

            script.onreadystatechange = function () {
                callback();
                html.removeChild(script);
                script = null;
            };

            html.appendChild(script);
        }
    } else {
        return run.setTimeout;
    }
})();

function Promise() {
    this.next = null;
    this.resolved = null;
    this.rejected = null;

    return this;
}

Promise.prototype.then = function(resolve, reject) {
    if (isFunction(resolve)) this.resolved = resolve;
    if (isFunction(reject))  this.rejected = reject;

    this.next = new Defer();

    return this.next.promise;
};

function Defer() {
    this.status = 'pending';
    this.promise = new Promise();

    return this;
}

function fireCall(status, value) {
    var that = this, promise = that.promise,
        nextDefer, call, ret;

    fastCall$1(function() {
        if (status == "resolve") {
            that.status = "resolved";
            call = promise.resolved;
        } else {
            that.status = "rejected";
            call = promise.rejected;
        }

        nextDefer = promise.next;
        ret = isFunction(call) ? call(value) : undefined;

        if (nextDefer && nextDefer[status]) {
            if (ret && ret.then) {
                ret.then(function(value) {
                    nextDefer.resolve(value);
                }, function(reason) {
                    nextDefer.reject(reason);
                });
            } else {
                nextDefer[status](ret);
            }
        }
    });

    return this;
}

Defer.prototype.resolve = function(value) {
    return fireCall.call(this, "resolve", value);
};

Defer.prototype.reject = function(reason) {
    return fireCall.call(this, "reject", reason);
};

function tpl$1(template, data) {
    if (isTrueString(template) && data) {
        return templayed(template)(data);
    } else {
        return "";
    }
}

function defer() {
    return new Defer();
}

function random(min, max) {
    if (min && max && min != max) {
        return parseInt(Math.random()*(max-min+1)+min,10);
    } else {
        return (''+Math.random()).replace(/\D/g, '').replace(/^0*/, '');
    }
}

function time() {
    return new Date().getTime();
}

var fastCall = fastCall$1;

var emitter = Creater$1;

var util = Object.freeze({
	tpl: tpl$1,
	defer: defer,
	random: random,
	time: time,
	fastCall: fastCall,
	emitter: emitter
});

var errorTpl = {
        e404: { response: {}, statusCode: 404, statusText: "Url Is Not Found" },
        e504: { response: {}, statusCode: 504, statusText: "Request Time Out" },
    };
var header = {
        post: "application/x-www-form-urlencoded;charset=UTF-8",
    };
$config.fetchTimeout = 5000;

function isOption(option) {
    var check = "body method header";

    for(var key in option) {
        if (strFind(check, key) >= 0) {
            return true;
        }
    }

    return false;
}

function addEvent(obj, name, call) {
    return obj.addEventListener(name, call);
}

function tryFormat(data, none) {
    var ret = null;

    try {
        ret = JSON.parse(data);
    } catch (e) {
        ret = none || data;
    }

    return ret;
}

function transData(data) {
    var str = "";

    each(data, function(key, value) {
        str += key+"="+value+"&";
    });

    return str.replace(/\&$/, '');
}

/**
 * TODO:
 * - 通过 getResponseHeader("Content-Type") 自动转换数据格式
 */
function _ajax(method, url, data, option, timeout) {
    var defer = new Defer(), xhr;

    if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
    } else {
        xhr = new XMLHttpRequest();
    }

    addEvent(xhr, "load", function() {
        var res = {
            statusCode: this.status,
            statusText: this.statusText,
            response: tryFormat(this.response),
        };

        defer.resolve(res);
    });

    addEvent(xhr, "timeout", function() {
        defer.reject(errorTpl.e504);
    });

    // 请求超时处理代码
    xhr.timeout = timeout || $config.fetchTimeout;

    try {
        if (method === "GET") {
            url = url+"?"+transData(data);

            xhr.open(method, url, true);
            xhr.withCredentials = true;
            xhr.send();
        } else {
            xhr.open(method, url, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader("Content-type", header.post);
            xhr.send(transData(data));
        }
    } catch(e) {}

    return defer.promise;
}

/**
 * TODO:
 * - 通过 response.headers.get("Content-Type") 自动转换数据格式
 */
function _fetch(method, url, data, option, timeout) {
    var init = {}, defer = new Defer, headers;

    init.method = method;
    extend(init, option);

    init.timeout = timeout || $config.fetchTimeout;
    if (!init.headers) init.headers = {};
    headers = init.headers;

    if (method === "GET") {
        delete init.body;
        url += "?"+transData(data);
    } else {
        init.method = method;
        headers["Content-Type"] = header.post;
        init.body = transData(data);
    }

    self.fetch(url, init).then(function(response) {
        response.json().then(function(data) {
            defer.resolve({
                response: data,
                statusCode: response.status,
                statusText: response.statusText,
            });
        });
    });

    return defer.promise;
}

var fetchProxy = self.fetch && self.Headers ? _fetch : _ajax;

/**
 * TODO:
 * - 常见错误代码处理，比如 404，504 等
 *
 * options: {
 *     mode : ['cors' || null], 
 *         - 是否 cors 模式
 *     cache: [true || false],
 *         - GET下是否缓存，默认不缓存，会自动添加时间戳
 *     header: object,
 *         - 自定义的头部信息，参看 fetch 标准头部
 *     dataTyep: ['json' || 'text' || 'xml']
 *         - 转换返回的数据，为空自动转换
 * }
 * 
 */
function fetch(url, data, option, timeout) {
    var option = option || {}, method,
        last, args = arguments;

    last = args[args.length-1];

    // data option 参数自动判断修复
    if (data && isOption(data)) {
        option = data; data = {};
    } else if (data && !isOption(option)) {
        option = {};
        if (!isObject(data)) data = {};
    } else if (!isObject(data)) {
        data = {};
    }

    // option timeout 参数自动判断修复
    if (option && isNumber(option)) {
        timeout = option; option = {};
    }

    // timeout 参数自动判断修复
    if (!isNumber(last)) {
        timeout = null;
    } else {
        timeout = last;
    }

    method = option.method || "GET";
    delete option.method;

    if (!isTrueString(url)) {
        var error = new Defer();

        error.reject(errorTpl.e404);

        return error.promise;
    } else {
        return fetchProxy(method, url, data, option, timeout);
    }
}

var http = Object.freeze({
	fetch: fetch
});

RootMagic$1.extend(util, http);

try {
    if (typeof window === "object") {
        window.Magic = RootMagic$1;
        if (!window.$) window.$ = RootMagic$1;
    }
} catch(e) {}

RootMagic$1.version = "0.5.0";

return RootMagic$1;

})));

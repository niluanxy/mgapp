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
            result = result.length==1?result[0]:result;
        }
    } else if (select instanceof Element) {
        result = select;    // dom元素直接返回
    } else if (select === document) {
        result = document;  // 如果是document直接返回
    }

    if (!(result instanceof Array)) {
        result = [result];
    }

    return result;      // 返回最终的选择结果
}

var isArray;
var isObject;
var isFunction;
var isString;
var isTrueString;

isArray = Array.isArray;

/* 判断是否为一个纯净的对象 */
isObject = function(obj) {
    if (typeof obj !== "object" ||
         obj.nodeType || obj === window) {
        return false;
    }

    if ( obj.constructor &&
            !({}).hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
    }

    return true;
};

isFunction = function(call) {
    return typeof call == "function";
};

isString = function(string) {
    return typeof string == "string";
};

isTrueString = function(string) {
    return string && typeof string == "string";
};



var _CHECK = Object.freeze({
	get isObject () { return isObject; },
	get isFunction () { return isFunction; },
	get isString () { return isString; },
	get isArray () { return isArray; },
	get isTrueString () { return isTrueString; }
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
    if (typeof argv[len-1] === "boolean") {
        pass = argv[len-1];
        len--;
    }

    // 如果第一个变量是 布尔值，设置是否深度复制
    if (typeof argv[0] === "boolean") {
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

function tryKey(key, val, empty) {
    var object = this[0];

    if (object && isTrueString(key)) {
        if (val === undefined) {
            return object[key];
        } else if (empty && val !== undefined) {
            object[key] = val;
        } else if (val != undefined) {
            object[key] = val;
        }
    }

    return this;
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
    } else if (select instanceof Element) {
        // 如果是DOM对象，返回包装的对象
        this[0] = select;
        this.length = 1;
    } else if (select === document || select === window) {
        this[0] = select;
        this.length = 1;
    } else if (select instanceof Magic) {
        return select;
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
        var args = [this];

        for(var i=0; i<arguments.length; i++) {
            args.push(arguments[i]);
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

function html(html) {
    return tryKey.call(this, "innerHTML", html, true);
}

function outerHTML(html) {
    return tryKey.call(this, "outerHTML", html, true);
}

function text(text) {
    return tryKey.call(this, "innerText", html, true);
}



var attrbute = Object.freeze({
	html: html,
	outerHTML: outerHTML,
	text: text
});

// import * as editer from "./editer/main.js";
// import * as search from "./search/main.js";
console.log("has run 1 attrs");
RootMagic$1.fn.extend(attrbute);

try {
    if (typeof window === "object") {
        window.Magic = RootMagic$1;
        if (!window.$) window.$ = RootMagic$1;
    }
} catch(e) {}

RootMagic$1.version = "0.5.0";

return RootMagic$1;

})));

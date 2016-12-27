import * as _DOM  from "CORE_FUNCTION/dom.js";
import * as _CHECK from "LIB_MINJS/check.js";
import _READY from "LIB_MINJS/ready.js";
import { each as _EACH, slice as _SLICE, extend as _EXTEND} from "LIB_MINJS/utils.js";

import _CONFIG from "./config.js";

var Magic, Prototype, Creater;

Magic = function(select, context) {
    if (_CHECK.isFunction(select)) {
        return _READY(select);
    }

    this.length = 0;
    
    if (typeof select === "string") {
        // 判断是否为创建DOM的字符串
        if (_DOM.check(select)) {
            var make = _DOM.make(select);
            if (make.childNodes.length == 1) {
                this[0] = make.childNodes[0];
            } else {
                this[0] = make;
            }

            this.length = 1;
        } else {
            // 否则直接尝试查找对象
            context = context ? context[0] || context : null;
            var qur = _DOM.query(select, context);
            
            _EXTEND(true, this, qur);
            this.length = qur.length;
        }
    } else if (_CHECK.isElement(select) || select === window) {
        // 如果是DOM对象，返回包装的对象
        this[0] = select;
        this.length = 1;
    } else if (select instanceof Magic) {
        return select;
    } else if (select && select.length) {
        var pos = 0, element, len = select.length;

        for(var i=0; i<len; i++) {
            element = select[i];

            if (element instanceof Element || element === document) {
                this[pos++] = element;
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
        return _DOM.query(select, this[0]);
    },

    each: function(callback) {
        _EACH(this, callback);

        return this;
    },

    push: function(element) {
        var find = new Magic(element),
            start = this.length,
            end = find.length;

        for(var i=0; i<end; i++) {
            var fix = start+i;

            this[fix] = find[i];
        }
        
        this.length = start+end;

        return this;
    },

    extend: function() {
        var args = _SLICE(arguments);

        if (args[0] === true) {
            args.splice(1, 0, this);
        } else {
            args.unshift(this);
        }
        
        _EXTEND.apply(null, args);

        return this;
    }
};

Creater = function(select, context) {
    return new Magic(select, context);
};

_EACH([Creater, Magic], function(index, object) {
    _EXTEND(this, {
        extend: function() {
            var args = _EXTEND([], arguments), fix = 0;

            if (args[0] === true) fix = 1;

            // 第一个对象非 {}，合并到自身
            if (!_CHECK.isEmptyObject(args[fix])) {
                args.splice(fix, 0, this);
            }

            return _EXTEND.apply(this, args);
        },
        query: _DOM.query,
        each: function(callback) {
            _EACH(this, callback);
        }
    }, _CHECK);
});

// 对象继承链修复
Creater.fn = Magic.prototype = Prototype;
Creater.config = _CONFIG;

export default Creater;
import * as _DOM  from "./dom.js";
import * as _CHECK from "../function/check.js";
import _READY from "./ready.js";
import { each as _EACH, slice as _SLICE, extend as _EXTEND} from "../function/tools.js";

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
        var pos = 0, element;

        for(var i=0; i<select.length; i++) {
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

    /* 简单的查询方法，返回标准的dom对象 */
    query: function(select) {
        return _DOM.query(select, this[0]);
    },

    /* 在子类中查找对象 */
    find: function(select) {
        return new Magic(select, this[0]);
    },

    each: function(callback) {
        _EACH(this, callback);

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
        extend: _EXTEND,
        query: _DOM.query,
        each: _EACH
    }, _CHECK);
});

// 对象继承链修复
Creater.fn = Creater.prototype = Magic.prototype = Prototype;

export default Creater;
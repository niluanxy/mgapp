import {isFunction, isArray, isElement, isObject, isTrueString} from "./check.js";

/**
 * 对数组或者对象，执行指定的回调参数
 *
 * @param  {Object}   object   [被操作的数组或者对象]
 * @param  {Function} callback [执行操作的函数]
 */
export function each(object, callback) {
    if (!object || !isFunction(callback)) return;

    for(var key in object) {
        var item = object[key], runs = [key, item];

        if (key === "length") return;
        if (callback.apply(item, runs) === false) break;
    }
};

/**
 * 从给定字符串中，查找给定字符串或正则
 */
export function strFind(strs, find) {
    var arrs = strs.split(" ");

    for(var i=0; i<arrs.length; i++) {
        if (arrs[i].match(find)) {
            return i;
        }
    }

    return -1;
}

// 返回真实数据，忽略 undefined 和 null 和 "" 值
export function value() {
    var args = arguments, len = args.length;

    for(var i=0; i<len; i++) {
        var test = args[i];

        if (test !== undefined && test !== null) {
            return test;
        }
    }

    return undefined;
}

export function arrayRemove(arrs, find, all) {
    for(var i=0; i<arrs.length; i++) {
        if (arrs[i] === find) {
            arrs.splice(i--, 1);
            if (all !== true) return arrs;
        }
    }

    return arrs;
}

/**
 * 类数组 slice 方法模拟
 */
export function slice(array, start, end) {
    var ret = [], aend = end || array.length;

    for(var i=start||0; i<aend; i++) {
        ret.push(array[i]);
    }

    return ret;
}

export function trim(string) {
    if (isTrueString(string)) {
        string = string.replace(/^\s+/, '')
                       .replace(/\s+$/, '')
                       .replace(/\s+/g, ' ');
    }

    return string;
}

/**
 * 尝试从 Magic 对象返回一个 element 对象
 */
export function element(object) {
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
export function extend(/* deep, target, obj..., last */) {
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

                // 若指向自身，跳过，防止死循环
                // 若设置忽略无效值，跳过
                if (target === copy || (pass && copy == undefined)) {
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
};

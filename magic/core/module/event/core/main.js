import Emitter from "LIB_MINJS/emitter.js";
import {isFunction, isTrueString, isObject} from "CORE_FUNCTION/check.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import {element, extend, slice, each} from "CORE_FUNCTION/tools.js";
import {parent} from "CORE_MODULE/dom/search/main.js";
import {dataEvent} from "CORE_MAGIC/tools.js";
import RootMagic from "CORE_MAGIC/main.js";

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
            var target = event.target,
                $finds = parent.call(target);

            $finds.find(select).each(function(key, ele) {
                if (ele === target) return true;
            });

            return false;
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
        event.stopPropagation();
        event.magicImmediation = false;
        event.magicPropagation = false;
    }

    fix.stopImmediation = function() {
        scope.stopImmediation();
        event.magicImmediation = false;
    }

    fix.stopPropagation = function() {
        scope.stopPropagation();
        event.stopPropagation();
        event.magicPropagation = false;
    }

    fix.preventDefault = function() {
        event.preventDefault();
    }

    fix.originalEvent = event;

    return fix;
}

function addProxy(bind, eve, select, callback, extScope) {
    var el = element(this), adds, scope, handle;

    if (el && isTrueString(eve) && isFunction(callback)) {
        adds = eve.split(" ");
        scope = extScope || RootMagic(el);

        each(adds, function(index, eveName) {
            var evePre  = getPrefix(eveName),
                eveCtrl = dataEvent(el, evePre);

            if (!eveCtrl || !eveCtrl.on) {
                eveCtrl = Emitter();
                dataEvent(el, evePre, eveCtrl);

                // 添加原生事件监听支持
                el.addEventListener(evePre, function(event) {
                    eveCtrl.emit(evePre, event);
                });
            }

            eveCtrl[bind](eveName, function(event) {
                if (checkIn(event, select)) {
                    var args = extend([], arguments);

                    args[0] = fixEvent(event, this);
                    callback.apply(scope, args);
                }
            });
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

export function on(eve, select, callback, extScope, setAll) {
    return allProxy.apply(this, addFixArgs(addProxy, "on", arguments));
}

export function once(eve, select, callback, extScope, setAll) {

    return allProxy.apply(this, addFixArgs(addProxy, "once", arguments));
}

function propaEmit(/* el, eveName, args... */) {
    var args = $.extend([], arguments),
        el = element(args[0]), eveName = args[1], evePre;

    args = slice(args, 2);
    evePre = getPrefix(eveName);

    do {
        var creEvent = document.createEvent('Event'),
            eveCtrl = dataEvent(el, evePre), runArgs, runEvent;

        creEvent.initEvent(evePre, false, true);
        runEvent = extend({}, creEvent, {target: el});
        
        if (eveCtrl && eveCtrl.emit) {
            runArgs = extend([], args);
            runArgs.unshift(runEvent);
            runArgs.unshift(eveName);

            eveCtrl.emit.apply(eveCtrl, runArgs);
        }

        // 触发原生DOM同名事件，为 false 不触发
        if (runEvent.magicImmediation !== false) {
            el.dispatchEvent(creEvent);
        }

        // 尝试手动进行事件冒泡，为 false 不冒泡
        if (runEvent.magicPropagation !== false) {
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
        scope = RootMagic(el);

        each(runs, function(index, eveName) {
            var runArgs = args.slice(1);

            runArgs.unshift(eveName);
            runArgs.unshift(el);

            propaEmit.apply(null, runArgs);
        });
    }

    return this;
}

export function emit(/* eve, args... */) {
    var args = extend([], arguments);
    args.unshift(emitProxy);
    return allProxy.apply(this, args);
}

function offProxy(eve) {
    var el = element(this), dels;

    if (el && isTrueString(eve)) {
        dels = eve.split(" ");

        each(dels, function(index, eveName) {
            var evePre  = getPrefix(eveName),
                eveCtrl = dataEvent(el, evePre);

            if (eveCtrl && eveCtrl.off) {
                eveCtrl.off(eveName);
            }
        });
    }

    return this;
}

export function off(eve, setAll) {
    return allProxy.call(this, offProxy, eve, setAll);
}
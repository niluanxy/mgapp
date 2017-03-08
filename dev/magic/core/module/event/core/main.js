import RootMagic from "MG_MAGIC/main.js";
import Emitter from "LIB_MINJS/emitter.js";
import {isFunction, isTrueString, isObject} from "LIB_MINJS/check.js";
import {allProxy} from "MG_MAGIC/proxy.js";
import {uuid} from "MG_STATIC/utils/main.js";
import {element, extend, slice, each} from "LIB_MINJS/utils.js";
import {parent, below, eq} from "MG_MODULE/dom/search/main.js";
import {dataEvent} from "MG_MAGIC/tools.js";

var EventPlugin = Emitter(), EventBus = Emitter();

export function PluginBind(type, callback) {
    EventPlugin.on(type, callback);
}

export function PluginCall(type, args) {
    var copy = extend([], args);

    EventPlugin.emit(type, copy);
    return copy;
}

export function getPrefix(eve) {
    var find = eve.match(/[^\.]*\./);

    if (find) {
        return find[0].replace(".", '');
    } else {
        return eve;
    }
}

function checkIn(event, el, select) {
    var target = event.originalTarget || event.target;

    if (target && el) {
        if (select && (!below.call(target, el) || !eq.call([target], select).length)) {
            return false;
        } else {
            return true;
        }
    }

    return false;
}

function uuidEvent(uuid, eveName) {
    return uuid+"_"+eveName;
}

var copyNames = ("altKey bubbles cancelable cancelable changedTouches composed "+
                "ctrlKey currentTarget defaultPrevented detail eventPhase isTrusted "+
                "metaKey path returnValue shiftKey srcElement target "+
                "targetTouches timeStamp touches type view which").split(" ");
export function copyEvent(event, scope) {
    var fix = {};

    each(copyNames, function(i, key) {
        if (event[key] !== undefined) {
            fix[key] = event[key];
        }
    });

    if (scope) {
        fix.stopImmediatePropagation = function() {
            scope.stopImmediation();
            if (event.bubbles) {
                event.stopPropagation();
            }
            event.magicImmediation = false;
            event.magicPropagation = false;
        }

        fix.stopImmediation = function() {
            scope.stopImmediation();
            event.magicImmediation = false;
        }

        fix.stopPropagation = function() {
            scope.stopPropagation();
            if (event.bubbles) {
                event.stopPropagation();
            }
            event.magicPropagation = false;
        }

        fix.preventDefault = function() {
            if (event.cancelable) {
                event.preventDefault();
            }
        }
    } else {
        fix.preventDefault = function() {
            event.preventDefault();
        }

        fix.stopPropagation = function() {
            event.stopPropagation();
        }

        fix.stopImmediatePropagation = function() {
            event.stopImmediatePropagation();
        }
    }

    fix.originalEvent = event;
    fix.target = event.originalTarget || event.target;

    PluginCall("event", [fix]); // 调用 event 对象处理插件

    return fix;
}

function addProxy(/* bind, eve, select, callback, capture, extScope */) {
    var args = PluginCall("add", arguments),
        el = element(this), adds, scope, handle,

        bind = args[0], eve = args[1], select = args[2],
        callback = args[3], capture = args[4], extScope = args[5];

    capture = isObject(capture) ? capture : !!capture;

    if (el && isTrueString(eve) && isFunction(callback)) {
        adds = eve.split(" "); scope = extScope || el;

        each(adds, function(index, eveName) {
            var evePre  = getPrefix(eveName),
                eveUUID = dataEvent(el, evePre);

            if (!eveUUID) {
                eveUUID = uuid(); dataEvent(el, evePre, eveUUID);

                // 绑定到原生事件，从而保证事件执行顺序
                el.addEventListener(evePre, function(event) {
                    var args = event.originalArgs || [];

                    args[0] = uuidEvent(eveUUID, eveName);

                    if (!(args[1] instanceof Event)) {
                        args.splice(1, 0, event);
                    }

                    EventBus.emit.apply(EventBus, args);
                }, capture);
            }

            (function(Selecter, El) {
                var bindName = uuidEvent(eveUUID, eveName);

                EventBus[bind](bindName, function(event) {
                    if (checkIn(event, El, Selecter)) {
                        var args = extend([], arguments);

                        args[0] = copyEvent(event, this);
                        callback.apply(scope, args);
                    }
                });
            })(select, el);
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

    // 修复 绑定事件参数 参数
    if (copy[3] === undefined) {
        copy.splice(3, 0, false);
    }

    // 修复 extScope 参数
    if (!isObject(copy[3])) {
        copy.splice(4, 0, null);
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

function propaEmit(/* eveName, args... */) {
    var args = extend([], arguments),
        el, creEvent, evePre,
        src = element(this), eveName = args[0];

    el = src; evePre = getPrefix(eveName);

    if (evePre === eveName) {
        creEvent = new Event(evePre, {
            bubbles: true, cancelable: true,
        });

        creEvent.originalArgs = args;
        creEvent.originalTarget = src;

        el.dispatchEvent(creEvent);
    } else {
        creEvent = new Event(eveName, {
            bubbles: false, cancelable: true,
        });

        creEvent.originalArgs = args;
        creEvent.originalTarget = src;

        args.splice(1, 0, creEvent);

        while(el) {
            var eveUUID = dataEvent(el, evePre);

            if (eveUUID) {
                args.splice(0, 1, uuidEvent(eveUUID, eveName));
                EventBus.emit.apply(EventBus, args);
            }

            // 尝试手动进行事件冒泡，为 false 不冒泡
            if (creEvent.magicPropagation !== false) {
                el = el.parentNode;
            } else {
                return;
            }
        };
    }
}

function emitProxy(/* eve, args... */) {
    var args = PluginCall("emit", arguments),
        el = element(this), runs;

    if (el && isTrueString(args[0])) {
        runs = args[0].split(" ");

        each(runs, function(index, eveName) {
            args.splice(0, 1, eveName);
            propaEmit.apply(el, args);
        });
    }

    return this;
}

export function emit(/* eve, args... */) {
    var args = extend([], arguments);
    args.unshift(emitProxy);
    return allProxy.apply(this, args);
}

function offProxy(/* eve */) {
    var args = PluginCall("off", arguments),
        el = element(this), eve = args[0], dels;

    if (el && isTrueString(eve)) {
        dels = eve.split(" ");

        each(dels, function(index, eveName) {
            var evePre  = getPrefix(eveName),
                eveUUID = dataEvent(el, evePre);

            if (eveUUID) EventBus.off(uuidEvent(eveUUID, eveName));
        });
    }

    return this;
}

export function off(eve, setAll) {
    return allProxy.call(this, offProxy, eve, setAll);
}

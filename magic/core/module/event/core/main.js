import Emitter from "LIB_MINJS/emitter.js";
import {isFunction, isTrueString, isObject} from "CORE_FUNCTION/check.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import {element, extend} from "CORE_FUNCTION/tools.js";
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
    if (isObject(event)) {
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

    fix.immediation = true;
    fix.propagation = true;

    fix.stopImmediatePropagation = function() {
        scope.stopImmediation();
        event.stopImmediatePropagation();
        fix.immediation = false;
        fix.propagation = false;
    }

    fix.stopImmediation = function() {
        scope.stopImmediation(true);
        fix.immediation = false;
    }

    fix.stopPropagation = function() {
        scope.stopPropagation();
        event.stopPropagation();
        fix.propagation = false;
    }

    return fix;
}

function addProxy(bind, eve, select, callback) {
    var el = element(this), adds, scope, handle;

    if (el && isTrueString(eve) && isFunction(callback)) {
        adds = eve.split(" ");
        scope = RootMagic(el);

        for(var i=0; i<adds.length; i++) {
            var eveName = getPrefix(adds[i]),
                eveCtrl = dataEvent(el, eveName);

            if (!eveCtrl || !eveCtrl.on) {
                eveCtrl = Emitter();
                dataEvent(el, eveName, eveCtrl);
            }

            eveCtrl[bind](adds[i], function(event) {
                if (checkIn(event, select)) {
                    var args = extend([], arguments);

                    args[0] = fixEvent(event, this);
                    callback.apply(scope, args);
                }
            });
        }
    }

    return this;
}

function addFixArgs(proxy, bind, args) {
    var copy = extend([], args);

    if (isFunction(copy[1])) {
        copy.splice(1, 0, null);
    }

    copy.unshift(bind);
    copy.unshift(proxy);

    return copy;
}

export function on(eve, select, callback, setAll) {
    return allProxy.apply(this, addFixArgs(addProxy, "on", arguments));
}

export function once() {
    return allProxy.apply(this, addFixArgs(addProxy, "once", arguments));
}

function emitProxy(/* eve, args... */) {
    var el = element(this), runs, scope,
        args = extend([], arguments);

    if (el && isTrueString(args[0])) {
        runs = args[0].split(" ");
        scope = RootMagic(el);

        for(var i=0; i<runs.length; i++) {
            var eveName = getPrefix(args[0]),
                eveCtrl = dataEvent(el, eveName), runArgs, creEvent;

            if (eveCtrl && eveCtrl.emit) {
                creEvent = document.createEvent('Event');
                creEvent.initEvent(eveName, true, true);
                creEvent = extend({}, creEvent, {target: el});

                runArgs = args.slice(1);
                runArgs.unshift(creEvent);
                runArgs.unshift(args[0]);

                eveCtrl.emit.apply(eveCtrl, runArgs);
            }
        }
    }

    return this;
}

export function emit(/* eve, args... */) {
    var args = extend([], arguments);
    args.unshift(emitProxy);
    return allProxy.apply(this, args);
}
import fastCall from "LIB_MINJS/fastcall.js";
import {isFunction, isArray} from "LIB_MINJS/check.js";
import {extend, each} from "LIB_MINJS/utils.js";

function Promise() {
    this.next = null;
    this.resolved = null;
    this.rejected = null;

    return this;
}

function addCall(type, call) {
    if (!isFunction(call)) return;

    if (this[type]) {
        if (isArray(this[type])) {
            this[type].push(call);
        } else {
            this[type] = [this[type], call];
        }
    } else {
        this[type] = call;
    }
}

Promise.prototype.then = function(resolve, reject) {
    addCall.call(this, "resolved", resolve);
    addCall.call(this, "rejected", reject);

    if (!this.next) this.next = new Defer();

    return this.next.promise;
}

function Defer() {
    this.status = 'pending';
    this.promise = new Promise();

    return this;
}

function runCalls(calls, args) {
    if (isArray(calls)) {
        each(calls, function(i, call) {
            call.apply(null, args);
        });
    } else if (isFunction(calls)) {
        return calls.apply(null, args);
    }

    return;
}

function fireCall(status) {
    var that = this, promise = that.promise,
        next, call, ret, args = extend([], arguments);

    args = args.slice(1);   // 获得实际的结果数组内容

    fastCall(function() {
        if (status == "resolve") {
            that.status = "resolved";
            call = promise.resolved;
        } else {
            that.status = "rejected";
            call = promise.rejected;
        }

        next = promise.next;
        ret  = runCalls(call, args);

        if (next && next[status]) {
            if (ret && ret.then) {
                ret.then(function() {
                    next.resolve.apply(next, args);
                }, function() {
                    next.reject.apply(next, args);
                });
            } else {
                next[status].apply(next, args);
            }
        }
    });

    return this;
}

Defer.prototype.then = function(resolve, reject) {
    this.promise.then(resolve, reject);

    return this;
}

Defer.prototype.resolve = function(value) {
    var args = extend([], arguments);
    args.unshift("resolve");

    return fireCall.apply(this, args);
}

Defer.prototype.reject = function(reason) {
    var args = extend([], arguments);
    args.unshift("reject");

    return fireCall.apply(this, args);
}

export default Defer;

import fastCall from "LIB_MINJS/fastcall.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend} from "LIB_MINJS/utils.js";

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
}

function Defer() {
    this.status = 'pending';
    this.promise = new Promise();

    return this;
}

function fireCall(status, value) {
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
        ret  = isFunction(call) ? call.apply(null, args) : undefined;

        if (next && next[status]) {
            if (ret && ret.then) {
                ret.then(function(value) {
                    next.resolve.apply(next, args);
                }, function(reason) {
                    next.reject.apply(next, args);
                });
            } else {
                next[status](ret);
            }
        }
    });

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

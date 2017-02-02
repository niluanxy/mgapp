import fastCall from "LIB_MINJS/fastcall.js";
import {isFunction} from "LIB_MINJS/check.js";

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
        nextDefer, call, ret;

    fastCall(function() {
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
}

Defer.prototype.reject = function(reason) {
    return fireCall.call(this, "reject", reason);
}

export default Defer;
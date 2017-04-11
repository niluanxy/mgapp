import fastCall from "LIB_MINJS/fastcall.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend, each} from "LIB_MINJS/utils.js";

function trigerCalls(list, args) {
    var result, list = list || [];

    each(list, function(i, callback) {
        result = callback.apply(null, args);
    });

    return result;
}

function firePromise(action, values) {
    var that = this, args, runs;

    if (this.status == "pending") {
        this.arguments = extend([], values);
        this.status = action == "resolve" ? "resolved" : "rejected";
    }

    args = extend([], this.arguments);

    if (this.status === "resolved") {
        runs = this.resolved;
        this.resolved = [];
    } else {
        runs = this.rejected;
        this.rejected = [];
    }

    fastCall(function() {
        var next = that.next, ret = trigerCalls(runs, args);

        if (next && next[action]) {
            if (ret && ret.then) {
                ret.then(function() {
                    next.resolve.apply(next, args);
                }, function() {
                    next.reject.apply(next, args);
                });
            } else {
                next[action].apply(next, args);
            }
        }
    });

    return this;
}

function Promise() {
    this.next = null;
    this.status = "pending";
    this.arguments = [];

    this.resolved = [];
    this.rejected = [];

    return this;
}

Promise.prototype.then = function(resolve, reject) {
    if (isFunction(resolve)) this.resolved.push(resolve);
    if (isFunction(reject))  this.rejected.push(reject);

    if (!this.next) this.next = new Promise();

    if (this.status !== "pending") {
        var args = this.arguments;

        if (this.status === "resolved") {
            this.resolve.apply(this, args);
        } else {
            this.reject.apply(this, args);
        }
    }

    return this.next;
}

Promise.prototype.resolve = function() {
    return firePromise.call(this, "resolve", arguments);
}

Promise.prototype.reject = function() {
    return firePromise.call(this, "reject", arguments);
}

function Defer() {
    this.promise = new Promise();
    return this;
} Defer.Promise = Promise;

Defer.prototype.then = function(resolve, reject) {
    this.promise.then(resolve, reject);
    return this;
}

Defer.prototype.resolve = function() {
    firePromise.call(this.promise, "resolve", arguments);
    return this;
}

Defer.prototype.reject = function() {
    firePromise.call(this.promise, "reject", arguments);
    return this;
}

export default Defer;

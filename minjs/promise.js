function isfun(call) {
    return typeof call == "function";
}

function Promise() {
    this.next = null;
    this.resolved = null;
    this.rejected = null;

    return this;
}

Promise.prototype.then = function(resolve, reject) {
    if (isfun(resolve)) this.resolved = resolve;
    if (isfun(reject))  this.rejected = reject;

    this.next = new Defer();

    return this.next.promise;
}

function Defer() {
    this.status = 'pending';
    this.promise = new Promise();

    return this;
}

function fireCall(status, value) {
    var promise = this.promise, nextDefer, call, ret;

    if (status == "resolve") {
        this.status = "resolved";
        call = promise.resolved;
    } else {
        this.status = "rejected";
        call = promise.rejected;
    }
    
    nextDefer = promise.next;
    ret = isfun(call) ? call(value) : undefined;

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

    return ret;
}

Defer.prototype.resolve = function(value) {
    return fireCall.call(this, "resolve", value);
}

Defer.prototype.reject = function(reason) {
    return fireCall.call(this, "reject", reason);
}

export default Defer;
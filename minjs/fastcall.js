/**
 * references:
 * https://github.com/YuzuJS/setImmediate
 * https://dbaron.org/log/20100309-faster-timeouts
 */

var fastCall = (function() {
    var run = self, pre = "~_fast_call$", doc, addEvent;

    addEvent = run.addEventListener || run.attachEvent;
    doc = run.document;

    if (run.setImmediate) {
        return run.setImmediate;
    } else if (run.process && run.process.nextTick) {
        return run.process.nextTick;
    } else if (run.postMessage) {
        var calls = [];

        addEvent("message", function(e) {
            if (e.source === run && e.data === pre) {
                calls.shift()();
            }
        }, false);

        return function(callback) {
            calls.push(callback);
            run.postMessage(pre, "*");
        }
    } else if (doc && doc.createElement) {
        var html = doc.documentElement, script;
            
        return function(callback) {
            script = doc.createElement("script");

            script.onreadystatechange = function () {
                callback();
                html.removeChild(script);
                script = null;
            };

            html.appendChild(script);
        }
    } else {
        return run.setTimeout;
    }
})();

export default fastCall;
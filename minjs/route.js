(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = global.document ?
            factory(global, true) :
            function( w ) {
                if (!w.document) {
                    throw new Error("requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global );
    }
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    var EventPath = {}, Event;

    Event = function() {

    };


    if (!noGlobal) {
        window.mEvent = Event;
    }
    return Event;
});

export var supportPassive = (function() {
    var canPassive = false;

    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                canPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
    } catch (e) {};

    return canPassive;
})();
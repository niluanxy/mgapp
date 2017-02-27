import MagicVue from "MV_BASE/main.js";

MagicVue.on("mgViewChange.viewLoader", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    console.log("==================== loader debug ====================")
    console.log("type: "+routeType);
    console.log(viewGo.$options.name + "  "+JSON.stringify(viewGo.$$params));
    console.log("====================")
});

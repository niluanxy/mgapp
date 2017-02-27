import MagicVue from "MV_BASE/main.js";

MagicVue.on("mgViewChange.viewAnimate", function(viewGo, viewLast, routeType) {
    console.log("==================== animate debug ====================")
    console.log("type: "+routeType);
    console.log(viewGo.$options.name + "  "+JSON.stringify(viewGo.$$params));
    console.log("====================")
});

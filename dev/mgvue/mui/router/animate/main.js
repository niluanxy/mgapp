import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";

import ConfigUI from "MV_UIKIT/base/config.js";

var CFG = ConfigUI.view = {
    slideInLeft : "slideInLeft",
    slideInRight: "slideInRight",

    slideOutLeft : "slideOutLeft",
    slideOutRight: "slideOutRight",
};

MagicVue.on("mgViewChange.viewAnimate", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    console.log("==================== animate debug ====================")
    console.log("type: "+routeType);
    console.log(viewGo);
    console.log(viewLast);
    console.log("====================")

    if (viewGo && viewGo.$$render && viewLast && viewLast.$$render) {
        var $goView = RootMagic(viewGo.$$render),
            $laView = RootMagic(viewLast.$$render);

        if (routeType === "go") {
            $goView.addClass(CFG.slideInRight);
            $laView.addClass(CFG.slideOutLeft);
        } else {
            $goView.addClass(CFG.slideInLeft);
            $laView.addClass(CFG.slideOutRight);
        }
    }
});

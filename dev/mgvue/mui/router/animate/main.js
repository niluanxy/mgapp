import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {raf} from "MG_STATIC/function/main.js";

import ConfigUI from "MV_UIKIT/base/config.js";

var CFG = ConfigUI.view = {
    hidden : "hidden",
    animate: "animate",
    display: "display",

    slideInLeft : "slideInLeft",
    slideInRight: "slideInRight",

    slideOutLeft : "slideOutLeft",
    slideOutRight: "slideOutRight",
};

MagicVue.on("mgViewChange.viewAnimate", function(viewGo, viewLast, routeType, routeGo, routeLast) {
    var $goView = RootMagic(viewGo.$$render), $laView;

    if (viewLast && viewLast.$$render) {
        $laView = RootMagic(viewLast.$$render);

        raf(function() {
            $goView.removeClass(CFG.hidden+" "+CFG.animate);
            $goView.addClass(CFG.display);
        });

        raf(function() {
            $laView.removeClass(CFG.hidden+" "+CFG.display);
            $laView.addClass(CFG.animate);
        });

        if (routeType === "go") {
            raf(function() {
                $goView.addClass(CFG.slideInRight);
                $laView.addClass(CFG.slideOutLeft);
            });
        } else {
            raf(function() {
                $goView.addClass(CFG.slideInLeft);
                $laView.addClass(CFG.slideOutRight);
            });
        }

        $goView.once("animationend", function(e) {
            raf(function() {
                $goView.removeClass(CFG.slideInLeft+ " "+CFG.slideInRight);
                $laView.removeClass(CFG.slideOutLeft+" "+CFG.slideOutRight
                    +" "+CFG.animate).addClass(CFG.hidden);

                if (viewLast && viewLast.$emit) viewLast.$emit("mgViewHide");
            });
        });
    } else {
        $goView.removeClass(CFG.hidden).addClass(CFG.display);
    }
});

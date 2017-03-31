import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import {isFunction, isArray, isTrueString} from "LIB_MINJS/check.js";
import {each} from "LIB_MINJS/utils.js";

import RootRouter from "MV_MODULE/router.js";
import ConfigUI from "MV_UIKIT/base/config.js";

var AUTH_BASE, AUTH_PAGE, AUTH_CHECK, OPTION, PASS = [],
    $route, noCheck = false, cacheUrl;

function getAuth(items, base) {
    var arrs = items || [];

    for(var i=0; i<arrs.length; i++) {
        if (arrs[i].auth != null) {
            return arrs[i].auth;
        }
    }

    return base;
}

function nextCall(callback) {
    setTimeout(function() {
        callback();
    });
}

export function authCheck(list, url) {
    list = isArray(list) ? list : [list];

    var result = false, aUrl = $route.transUrl(url);

    each(list, function(i, reg) {
        reg = $route.transMatch(reg);
        reg = reg.replace(/\\S/g, "\\S");
        reg = new RegExp("^"+reg);

        if (aUrl.match(reg)) {
            result = true; return false;
        }
    });

    return result;
}

export function authRember(clear) {
    noCheck = !clear;
}

export function authRepath(url) {
    if (isTrueString(url)) {
        cacheUrl = url;
        nextCall(function() { $route.go(AUTH_PAGE) });
    } else {
        if (cacheUrl) {
            nextCall(function() {
                $route.go(cacheUrl);
                cacheUrl = "";
            });
        }

        if (url === true) authRember();
    }
}

MagicVue.on("mgRouteInit.Auth", function() {
    $route = RootRouter.$route;

    OPTION = $route.option;
    AUTH_BASE = OPTION.authBase  || 1;
    AUTH_PAGE = OPTION.authPage  || OPTION.home;
    AUTH_CHECK= OPTION.authCheck || 2;

    if (OPTION.authPass) PASS = OPTION.authPass.split(" ");
    PASS.push(AUTH_PAGE);                  // 登陆页无需验证
});

MagicVue.on("mgRouteBefore.Auth", function(url, routeType, routeGo, routeLast) {
    var check = true, auth = getAuth(routeGo.items, AUTH_BASE);

    if (!noCheck && auth>=AUTH_CHECK && !authCheck(PASS, url)) {
        if (isFunction(OPTION.authCall)) {
            check = OPTION.authCall(AUTH_BASE, auth, routeGo, url);
        } else {
            check = false;
        }
    }

    if (check === false) {
        this.stopImmediation();
        authRepath(url);
    }
});

MagicVue.authCheck  = authCheck;
MagicVue.authRepath = authRepath;
MagicVue.authRember = authRember;

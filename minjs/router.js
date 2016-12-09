import Emitter from "./emitter.js";
import {keyTest, keyFix} from "./emitter.js";
import {isFunction, isString, isObject} from "./check.js";
import {extend, value} from "./utils.js";

var CFG = {
    home     : "/home",             // 默认首页
    mode     : "",                  // 是否启用H5模式，启用则省略 # 符号（后台需rewrite）
    title    : true,                // 如果有title信息，是否自动更新
    repath   : true,                // 是否自动跳转到首页
    replace  : true,                // 自动将参数不同的页面 replace 加载，默认开启

    notCall  : null,                // 页面未找到时候的回调方法
    notPage  : "",                  // 页面未找到的时候，显示的页面，为空则跳到首页

    onBefore : null,                // 页面跳转前的回调方法
    onEmit   : null,                // 激活时运行的方法
    onLeave  : null,                // 页面 成功跳转后 的回调方法

    onInit   : null,                // 路由初始化时调用的方法
    onSuccess: null,                // 每次跳转成功后的回调方法
    onAlways : null,                // 每次点击，不论是否阻止默认跳转，都会执行的方法

    recurse  : false,               // 路由递归触发方式，forward 正序，backward 反序，默认只最后项
    regexp   : ":[^/-]{1,}",        // 参数匹配正则语句，用于匹配参数信息
};

var Router = function(maps, option) {
    var opt = extend({}, CFG, option), ctrl = Emitter();

    this.ctrl = ctrl;
    this.option = opt;

    this.route = this.ctrl.tables;          // 路由表信息
    this.stack = [];                        // 路由栈信息
    this.last  = null;                      // 当前路由信息

    ctrl.on("routeInit", opt.onInit, this);
    ctrl.on("routeSuccess", opt.onSuccess, this);
    ctrl.on("routeAlways", opt.onAlways, this);

    ctrl.on("routeNotFound", opt.notCall, this);
    ctrl.on("routeNotFound", function() {
        if (opt.notPage) this.go(opt.notPage);
    }, this);
}, Prototype = {};

Prototype.init = function() {
    var opt = this.option, fire;

    this.on(this.maps);
    this.ctrl.emit("routeInit");

    if (opt.repath === true) {
        fire = opt.home;
    } else {
        if (!(fire = this.fire())) {
            if (isFunction(opt.notCall)) {
                opt.notCall();
            }

            fire = opt.notPage || opt.home;
        }
    }

    this.go(fire, true, false, true);

    return this;
}

// 监听浏览器前进后台方法
Prototype.bindBrower = function() {

    return this;
}

function transMatch(url) {
    return url.replace(/:[^/-_]{1,}/g, "([\\S]+)");
}

function transParams(url, match) {
    var params = {}, reg, name, find;

    if (isString(url) && isString(match)) {
        reg = new RegExp(transMatch(match));
        name = match.match(reg);
        find = url.match(reg);

        for(var i=1; i<name.length; i++) {
            var key = name[i].replace(/^:/, '');

            params[key] = find[i];
        }
    }

    return params;
}

// 尝试获取给定的路由对象，无参，获取当前路劲
Prototype.fire = function(url) {
    var aUrl, aFind = null;

    aUrl = url || location.hash;
    aUrl = aUrl.replace(/^#/, '');

    if ((aFind = this.ctrl.find(aUrl))) {
        aFind = extend({}, aFind);
        aFind.url = aUrl;
        aFind.params = transParams(url, aFind.match);
    }

    return aFind;
}

function findPath(maps, prefix) {
    var items = [], fix;

    for(var key in maps) {
        if (keyTest(key)) {
            fix = prefix+key;
            fix = fix.replace(/\/+/g, "/");

            maps[key]._prefix = fix;
            items.push(maps[key]);
        }
    }

    return items;
}

function addPath(url, addOption, context) {
    var route = {}, ctrl = this.ctrl, save, fixUrl,
        dels = "onBefore onEmit onLeave _prefix".split(" ");

    if (isFunction(addOption)) {
        route.onEmit = addOption;
    } else {
        extend(route, addOption);
    }

    fixUrl = transMatch(url);

    for(var key in route) {
        if (!key.match(/^on/)) continue;
        var call = route[key], eve = fixUrl+" "+key;

        eve = eve.replace("on", "on.");
        ctrl.on(eve, call, context);
    }

    save = ctrl.find(fixUrl);
    extend(save, route);
    save["match"] = url;

    for(var i=0; i<dels.length; i++) {
        delete save[dels[i]];
    }
}

// 添加一条新的路由信息
Prototype.on = function(url, addOption, context) {
    if (isString(url)) {
        addPath.call(this, url, addOption, context);
    } else if (isObject(url)) {
        var adds = findPath(url, "/");

        do {
            var cache = [], paths;

            for(var i=0; i<adds.length; i++) {
                var prefix = adds[i]._prefix;

                addPath.call(this, prefix, adds[i], context);
                paths = findPath(adds[i], prefix);
                cache = cache.concat(paths);
            }

            adds = cache;
        } while (adds.length);
    }
    
    return this;
}

// 移除一条路由信息，默认不移除子类
Prototype.off = function(url) {
    this.ctrl.remove(url);

    return this;
}

Prototype.emit = function(url, routeType, routeGo, routeLast, historyAction) {
    var args = [url, routeType, routeGo, routeLast],
        OPT = this.option, CTRL = this.ctrl, STACK = this.stack,
        CALLS = "onBefore onEmit".split(" "), emitResult = false;

    // 尝试运行上个页面的 leave 方法
    args.unshift(routeLast.url + " on.Leave");
    routeLast.url && CTRL.emit.apply(CTRL, args);

    CTRL.once(transMatch(routeGo.match)+" on.Emit", function() { 
        emitResult = true;
    });

    for(var i=0; i<CALLS.length; i++) {
        var eve = url+" "+CALLS[i],
            fix = eve.replace("on", "on.");

        args.shift(); args.unshift(fix);

        CTRL.once(fix, OPT[CALLS[i]], this);
        CTRL.emit.apply(CTRL, args);
    }

    // 检测路由是否跳转成功
    if (emitResult === true) {
        if (routeLast.outClear) STACK.pop();

        if (routeType === "back") {
            for(var i=STACK.length-1; i>=0; i--) {
                var del = STACK[i];

                STACK.pop();
                if (del.url === routeGo.url) break;
            }
        }

        STACK.push(routeGo); this.last = routeGo;

        args.shift(); args.unshift("routeSuccess");
        CTRL.emit.apply(CTRL, args);

        // 修改浏览器内置的 history 数据
        historyAction += "State";
        if (self.history && self.history[historyAction]) {
            var state = {
                url: url,
                title: routeGo.title,
            };

            self.history[historyAction](state, state.title, "#"+state.url);
        }
    }

    args.shift(); args.unshift("routeAlways");
    CTRL.emit.apply(CTRL, args);

    return this;
}

// 跳转到给定 URL 或者 路由对象
Prototype.go = function(url, inReplace, outClear, inRefresh) {
    var clear, refresh, routeGo, routeLast, routePrev, OPT = this.option,
        STACK = this.stack, CTRL = this.ctrl, routeType, historyAction;

    if (url && (routeGo = this.fire(url))) {
        routePrev = STACK[STACK.length-2] || {};
        routeLast = this.last || {};
        routeType = routeGo.url === routePrev.url ? "back" : "go";

        clear   = value(inReplace, routeGo.replace, routeLast.outClear);
        refresh = value(inRefresh, routeGo.refresh);

        // 当前页面和跳转页面相同时，后续操作判断
        if (routeGo.url === routeLast.url) {
            if (refresh) clear = true;
            else         return this;
        }

        // 如果开启相同参数自动 replace 加载，则自动处理
        if (OPT.replace && routeGo.match === routeLast.match) {
            clear = true;
        }

        // 尝试标记页面退出自动清理标记
        if (clear) routeLast.outClear = true;
        routeGo.outClear = outClear;

        this.emit(url, routeType, routeGo, routeLast, clear ? "replace" : "push");
    } else if (url && !routeGo) {
        CTRL.emit("routeNotFound", url);
    }

    return this;
}

Prototype.back = function(url) {
    var STACK = this.stack, routeLast = this.last || {}, routeGo;

    routeGo = url ? this.fire(url) : STACK[STACK.length-2];

    if (routeGo && routeGo.url) {
        this.emit(routeGo.url, "back", routeGo, routeLast, "replace");
    }

    return this;
}

// 从浏览记录中，清除给定的 URL 或通过索引查找
Prototype.clear = function(index) {

}

// 构造函数，兼容 new 方式创建对象
var Creater = function(maps, option) {
    return new Router(maps, option);
}; Creater.prototype = Router.prototype = Prototype;

export default Creater;
import Emitter from "./emitter.js";
import {keyTest, keyFix} from "./emitter.js";
import {isFunction, isString, isObject} from "./check.js";
import {extend} from "./utils.js";

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
    onAlways : null,                // 每次点击，不论是否阻止默认跳转，都会执行的方法

    recurse  : false,               // 路由递归触发方式，forward 正序，backward 反序，默认只最后项
    regexp   : ":[^/-]{1,}",        // 参数匹配正则语句，用于匹配参数信息
};

var Router = function(maps, option) {
    this.ctrl = Emitter();
    this.option = extend({}, CFG, option);

    this.route = this.ctrl.tables;          // 路由表信息
    this.stack = [];                        // 路由栈信息
    this.last  = null;                      // 当前路由信息
}, Prototype = {};

Prototype.init = function() {
    var opt = this.option, fire;

    this.on(this.maps);

    if (opt.repath === true) {
        fire = opt.home;
    } else {
        fire = this.fire();

        if (!isRouteItem(fire)) {
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

// 尝试获取给定的路由对象，无参，获取当前路劲
Prototype.fire = function(url) {
    var aUrl, aFind;

    aUrl = url || location.hash;
    aUrl = aUrl.replace(/^#/, '');

    if ((aFind = this.ctrl.find(aUrl))) {
        aFind = extend({}, aFind);
        aFind.url = aUrl;
    } else {
        aFind = {};
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

function addPath(url, option, context) {
    var route = {}, ctrl = this.ctrl, save,
        dels = "onBefore onEmit onLeave _prefix".split(" ");

    if (isFunction(option)) {
        route.onEmit = option;
    } else {
        extend(route, option);
    }

    for(var key in route) {
        if (!key.match(/^on/)) continue;
        var call = route[key], eve = url+" "+key;

        eve = eve.replace("on", "on.");
        ctrl.on(eve, call, context);
    }

    save = ctrl.find(url);
    extend(save, route);

    for(var i=0; i<dels.length; i++) {
        delete save[dels[i]];
    }
}

// 添加一条新的路由信息
Prototype.on = function(url, option, context) {
    if (isString(url)) {
        addPath.call(this, url, option, context);
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

function callEvent(url, fireRoute, lastRoute, prevRoute) {
    var result = false, opt = this.option, ctrl = this.ctrl,
        args, calls = "onBefore onEmit".split(" ");

    args = [url, fireRoute, lastRoute, prevRoute];

    // 尝试运行上个页面的 leave 方法
    args.unshift(lastRoute.url + " on.Leave");
    lastRoute.url && ctrl.emit.apply(ctrl, args);
    
    // 添加句柄，用来判断是否执行 emit 方法
    ctrl.once(url+" on.Emit", function() {
        result = true;
    });

    // 执行匹配路由绑定的相关方法
    for(var i=0; i<calls.length; i++) {
        var eve = url+" "+calls[i],
            fix = eve.replace("on", "on.");

        args.shift(); args.unshift(fix);

        ctrl.once(fix, opt[calls[i]], this, true);
        ctrl.emit.apply(ctrl, args);
    }

    return result;
}

// 跳转到给定 URL 或者 路由对象
Prototype.go = function(url, inReplace, outClear, inRefresh) {
    var clear, refresh, rgo = this.fire(url), args,
        stack = this.stack, rnow = this.last || {}, rprev;

    rprev   = stack[stack.length-2] || {};
    clear   = inReplace || rgo.replace || rnow.outClear;
    refresh = inRefresh !== undefined ? inRefresh : rgo && rgo.refresh;

    if (!rgo.url || (rnow && rgo.url == rnow.url && !refresh)) return this;

    // clear 为真，清除旧的路由信息
    if (clear) stack.pop();
    rgo.outClear = true;

    args = [url, rgo, rnow, rprev];
    if (callEvent.apply(this, args)) {
        stack.push(rgo); this.last = rgo;

        var onAlways= this.option.onAlways;
        onAlways && onAlways.apply(this, args);
    }

    return this;
}

Prototype.back = function(url) {

}

// 从浏览记录中，清除给定的 URL 或通过索引查找
Prototype.clear = function(index) {

}

// 构造函数，兼容 new 方式创建对象
var Creater = function(maps, option) {
    return new Router(maps, option);
}; Creater.prototype = Router.prototype = Prototype;

export default Creater;
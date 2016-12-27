import Emitter from "./emitter.js";
import {keyTest, keyFix} from "./emitter.js";
import fastCall from "./fastcall.js";
import {isFunction, isString, isObject} from "./check.js";
import {extend, value} from "./utils.js";

var CFG = {
    home     : "/home",             // 默认首页
    repath   : true,                // 是否自动跳转到首页
    single   : false,               // 单例模式，相同路由页面 replace 加载，默认开启
    native   : true,                // 尝试响应原生事件，若不关心浏览器事件，请禁用

    notCall  : null,                // 页面未找到时候的回调方法
    notPage  : "",                  // 页面未找到的时候，显示的页面，为空则跳到首页

    onBefore : null,                // 页面跳转前的回调方法
    onEmit   : null,                // 激活时运行的方法，可简写为 on
    onLeave  : null,                // 页面 成功跳转后 的回调方法

    onInit   : null,                // 路由初始化时调用的方法
    onSuccess: null,                // 每次跳转成功后的回调方法
    onAlways : null,                // 每次点击，不论是否阻止默认跳转，都会执行的方法

    recurse  : false,               // 路由递归触发方式，forward 正序，backward 反序，默认只最后项
    regexp   : ":[^/]{1,}",         // 默认参数匹配替换的正则语句
};

var Router = function(maps, option) {
    var opt = extend({}, CFG, option), ctrl = Emitter();

    this.ctrl = ctrl;
    this.option = opt;

    this.route = this.ctrl.tables;          // 路由表信息
    this.stack = [];                        // 路由栈信息
    this.backBlock = 1;                     // 记录需要back修复系统路由栈的次数

    this.last  = null;                      // 当前路由信息
    this.prev  = null;                      // 上次路由信息

    ctrl.on("routeInit", opt.onInit, this);
    ctrl.on("routeSuccess", opt.onSuccess, this);
    ctrl.on("routeAlways", opt.onAlways, this);

    ctrl.on("routeNotFound", opt.notCall, this); 
    ctrl.on("routeNotFound", function() {
        if (opt.notPage) this.go(opt.notPage);
    }, this);
}, Prototype = {};

Router.prototype = Prototype;

Prototype.init = function() {
    var opt = this.option, fire;

    this.on(this.maps);
    opt.native && this.bindBrower();
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

Prototype.transMatch = function(url) {
    var reg = this.option.regexp || ":[^/-_]{1,}";

    reg = new RegExp(reg, "g");

    return url.replace(reg, "([\\S]+)");
}

Prototype.transUrl = function(url, fix) {
    return (url || '').replace(/^[\#|\/]*/g, fix || '/');
}

Prototype.transParams = function(url, match) {
    var params = {}, reg, name, find;

    url = this.transUrl(url);
    if (isString(url) && isString(match)) {
        reg = new RegExp(this.transMatch(match));
        name = match.match(reg);
        find = url.match(reg);

        if (find && find.length == name.length) {
            for(var i=1; i<name.length; i++) {
                var key = name[i].replace(/^:/, '');

                params[key] = find[i];
            }
        }
    }

    return params;
}

// 尝试获取给定的路由对象，无参，获取当前路劲
Prototype.fire = function(url) {
    var aUrl, aFind = null, cacheArr = [], cacheCall;

    aUrl = this.transUrl(url || location.hash);
    cacheCall = function(parent, find) {
        cacheArr.push(extend({}, find));
    };

    if ((aFind = this.ctrl.find(aUrl, false, cacheCall))) {
        aFind = extend({}, aFind);
        aFind.url = aUrl;
        aFind.items = cacheArr.reverse();
        aFind.params = this.transParams(url, aFind.match);
    }

    return aFind;
}

Prototype.findPath = function(maps, prefix) {
    var items = [], fix, finds;

    if (arguments.length == 1) {
        finds = this.route;
        prefix = "/";
    } else {
        finds = maps;
    }

    for(var key in finds) {
        if (keyTest(key)) {
            fix = this.transUrl(prefix+key, '/');

            finds[key]._prefix = fix;
            items.push(finds[key]);
        }
    }

    return items;
}

Prototype.addPath = function(url, addOption, context) {
    var route = {}, ctrl = this.ctrl, save, fixUrl,
        dels = "on onBefore onEmit onLeave _prefix".split(" ");

    if (isFunction(addOption)) {
        route.onEmit = addOption;
    } else {
        extend(route, addOption);
    }

    fixUrl = this.transMatch(url);
    save = ctrl.add(fixUrl);
    save.match = url;

    for(var key in route) {
        if (key.match(/^on/)) {
            var call = route[key], eve = fixUrl+" ";

            eve += key == "on" ? "onEmit" : key;
            eve  = eve.replace(/(\s)(on)/, '$1$2.');
            ctrl.on(eve, call, context);
        } if (!key.match(/^\//)) {
            save[key] = route[key];
        }
    }

    for(var i=0; i<dels.length; i++) {
        delete save[dels[i]];
    }
}

// 添加一条新的路由信息
Prototype.on = function(url, addOption, context) {
    if (isString(url)) {
        this.addPath(url, addOption, context);
    } else if (isObject(url)) {
        var adds = this.findPath(url, "/");

        do {
            var cache = [], paths;

            for(var i=0; i<adds.length; i++) {
                var prefix = adds[i]._prefix;

                this.addPath(prefix, adds[i], context);
                paths = this.findPath(adds[i], prefix);
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

Prototype.emit = function(url, routeType, routeGo, routeLast, stateType) {
    var args = [url, routeType, routeGo, routeLast],
        OPT = this.option, CTRL = this.ctrl, STACK = this.stack,
        CALLS = "onBefore onEmit".split(" "), emitResult = false;

    // 尝试运行上个页面的 leave 方法
    args.unshift(routeLast.url + " on.Leave");
    routeLast.url && CTRL.emit.apply(CTRL, args);

    CTRL.once(this.transMatch(routeGo.match)+" on.Emit", function() { 
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

        this.backBlock = -1;
        if (routeType === "back") {
            for(var i=STACK.length-1; i>=0; i--) {
                var del = STACK[i];

                STACK.pop();
                this.backBlock++;
                if (del.url === routeGo.url) break;
            }
        }

        STACK.push(routeGo);
        this.prev  = STACK[STACK.length-2];
        this.last  = routeGo;

        args.shift(); args.unshift("routeSuccess");
        CTRL.emit.apply(CTRL, args);

        // 修改浏览器内置的 history 数据
        this.historyUpdate(routeGo.url, routeGo.title, stateType);
    }

    args.shift(); args.unshift("routeAlways");
    CTRL.emit.apply(CTRL, args);

    return this;
}

// 跳转到给定 URL 或者 路由对象
Prototype.go = function(url, inReplace, outClear, inRefresh) {
    var clear, refresh, single, routeGo, routeLast, routePrev,
        STACK = this.stack, OPT = this.option, routeType, historyAction;

    url = this.transUrl(url);

    if (url && (routeGo = this.fire(url))) {
        routePrev = this.prev || {};
        routeLast = this.last || {};
        routeType = routeGo.url === routePrev.url ? "back" : "go";

        clear   = value(inReplace, routeGo.replace, routeLast.outClear);
        single  = value(routeGo.single, OPT.single);
        refresh = value(inRefresh, routeGo.refresh);

        // 当前页面和跳转页面相同时，后续操作判断
        if (routeGo.url === routeLast.url) {
            if (refresh) clear = true;
            else         return this;
        }

        // 如果开启相同参数自动 replace 加载，则自动处理
        if (single && routeGo.match === routeLast.match) {
            clear = true;
        }

        // 尝试标记页面退出自动清理标记
        if (clear) routeLast.outClear = true;
        routeGo.outClear = outClear;

        this.emit(url, routeType, routeGo, routeLast, clear ? "replace" : "push");
    } else if (url && !routeGo) {
        this.ctrl.emit("routeNotFound", url, routeLast);
    }

    return this;
}

Prototype.back = function(url, native) {
    var STACK = this.stack, routeLast = this.last || {}, routeGo;

    routeGo = url ? this.fire(url) : STACK[STACK.length-2];

    if (routeGo && routeGo.url && routeGo.url !== routeLast.url) {
        // 如果为 native 触发，则需要添加一条记录以修复返回栈
        if (native && self.history) self.history.pushState(null, null, null);
        this.emit(routeGo.url, "back", routeGo, routeLast, "replace");
    }

    return this;
}

Prototype.historyUpdate = function(url, title, stateType) {
    var that = this, history = self.history, action;

    if (history && history.pushState && history.back) {
        if (that.backBlock > 0) {
            (function(clearCount) {
                var handle = setInterval(function() {
                    history.back();
                    if (--clearCount <= 0) {
                        clearInterval(handle);
                    }
                }, 5);
            })(that.backBlock);
        } else {
            action = stateType+"State";
            history[action](null, title, "#"+url);
        }
    }
}

// 监听浏览器前进后台方法
Prototype.bindBrower = function() {
    var that = this;

    // 所有事件全部认为 back 动作，简化逻辑
    self.addEventListener("popstate", function(event) {
        var block = --that.backBlock, last = that.last;

        if (block ==  0) {
            history.replaceState(null, last.title, "#"+last.url);
        } else if (block < 0) {
            that.back(null, true);
        }
    });

    return this;
}

// 构造函数，兼容 new 方式创建对象
var Creater = function(maps, option) {
    return new Router(maps, option);
};

export default Creater;
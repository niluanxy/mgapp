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
    var Emitter, Prototype = {}, $KEY = "##_";

    // 获取到修饰后的 key 值
    function keyFix(name) {
        name = name.replace(/^\./g, '');
        return $KEY + name;
    }

    function keyTest(name) {
        var reg = new RegExp("^"+$KEY);

        return name.match(reg);
    }

    function isFunction(call) {
        return typeof call == "function";
    }

    function isObject(object) {
        return object && typeof object == "object";
    }

    function isArray(array) {
        return array && array instanceof Array;
    }

    function isString(str) {
        return str && typeof str == "string";
    }

    // 在 列表树 中根据路径查询对象
    // 如果没有值会返回 null
    function pathFind(paths, str, parent) {
        var arr = str.split("/"), par = null;

        for(var i=0; i<arr.length; i++) {
            if (isString(arr[i])) {
                var key = keyFix(arr[i]);

                if (!isObject(paths[key])) {
                    return null;
                } else {
                    par = paths;
                    paths = paths[key];
                }
            }
        }

        return parent ? par : paths;
    }

    // 在 列表树 中根据路径查询对象
    // 如果没有值则会每一级的创建空对象
    function pathAdd(paths, str) {
        var arr = str.split("/");

        for(var i=0; i<arr.length; i++) {
            if (isString(arr[i])) {
                var key = keyFix(arr[i]);

                if (!isObject(paths[key])) {
                    paths[key] = {};
                }

                paths = paths[key];
            }
        }

        return paths;
    }

    function arrayCopy(array) {
        var copy = [];

        if (isArray(array)) {
            for(var i=0; i<array.length; i++) {
                copy.push(array[i]);
            }
        }

        return copy;
    }

    function pathSplit(str) {
        var space, eves, first, split;

        if (str.match(/^.+\s.+$/)) {
            split = str.split(" ");
            space = split[0];
            eves  = split[1];
        } else {
            space = "";
            eves  = str || "";
        }

        first = eves.match(/(^[^\.]*)\./);
        first = first ? first[1] : eves;

        return {space: space, eves: eves, first: first};
    }

    // 分离出用户调用的事件名，事件参数
    // 如果第一个参数为 true，表示执行会忽略根元素自身
    function eventArgs(arguments) {
        var ret = {}, split;

        if (arguments.length >= 2 && arguments[0] === true) {
            ret.pass = true;
            split = pathSplit(arguments[1]);
            ret.args = Array.prototype.splice(2);
        } else {
            ret.pass = false;
            split = pathSplit(arguments[0]);
            ret.args  = Array.prototype.splice(1);
        }
        
        ret.eves  = split.eves;
        ret.first = split.first;
        ret.space = split.space;
 
        return ret;
    }

    // 查找给定路劲下的给定对象
    // 没有会创建空对象
    function pathObjectAdd(paths, str, key) {
        if (!paths || !key) return null;

        var path = pathAdd(paths, str);

        if ( !(isObject(path[key])) ) {
            path[key] = {};
        }

        return path[key];
    }

    function pathObjectPush(paths, str, key, call, content) {
        var split = pathSplit(str), path,
            space = split.space,
            eves  = split.eves,
            first = split.first;

        path = pathObjectAdd(paths, space, key);

        if (!isArray(path[first])) {
            path[first] = [];
        };

        path[first].push({
            name: eves, run: call,
            content: content || window || null
        });
    }

    // 删除给定路劲下的回调对象
    // 未给定回调则删除所有
    function pathObjectDel(paths, str, key, call) {
        var split = pathSplit(str),
            space = split.space,
            eves  = split.eves,
            first = split.first, path, arrs;

        path = pathFind(paths, space);
        arrs = path[key];

        if (isObject(arrs)) {
            if (eves === first && call === undefined) {
                delete arrs[eves];
            } else {
                arrs = arrs[first] || [];

                for(var i=0; i<arrs.length; i++) {
                    var item = arrs[i],
                        name = item.name, run = item.run;

                    if (call && name.match("^"+eves) && call === run) {
                        arrs.splice(i--, 1);
                    } else if (!call && name.match("^"+eves)) {
                        arrs.splice(i--, 1);
                    }
                }
            }
        }
    }

    // 检测指定对象下，是否有可运行的事件对象
    // 严格模式必须有匹配的事件
    function eventTest(paths, eFirst, strict) {
        var arrs = "call".split(" "), find = 0;

        for(var i=0; i<arrs.length; i++) {
            var key = arrs[i], runs;

            runs = paths[key] || {};
            runs = runs[eFirst] || [];
        
            if (!!strict === true) {
                for(var j=0; j<runs.length; j++) {
                    if (runs[i].name.match("^"+strict)) {
                        find += 1;
                    }
                }
            } else {
                find += runs.length;
            }
        }

        return find > 0;
    }

    /**
     * 获取给定路劲下可以传播事件的对象
     * 
     * @param  {String} strict [严格匹配的事件名]
     */
    function eventChild(paths, eFirst, strict) {
        var calls = [];

        for(var key in paths) {
            var item = paths[key], find;

            if (keyTest(key) && eventTest(item, eFirst, strict)) {
                if (!!strict) {
                    // 严格模式下，至少要有一个完全匹配的事件
                    find = item.call || {};
                    find = find[eFirst] || [];

                    for(var j=0; j<find.length; j++) {
                        if (find[j].name.match("^"+strict)) {
                            calls.push(item);
                            break;
                        }
                    }
                } else {
                    calls.push(item);
                }
            }
        }

        return calls;
    }

    function eventEmit(paths, eName, eFirst, before) {
        var args, propagation;

        before = before || {};
        args = before.arguments || [];
        propagation = !!before.propagation;

        function getCalls(paths, type, eves) {
            var arrs = [];

            if (isObject(paths[type])) {
                paths = paths[type];
                arrs  = paths[eves] || [];
            }

            return arrs;
        };

        function callRuns(calls, eves, once) {
            // 克隆数组，防止数组长度变化
            var copy = arrayCopy(calls), immediation = true,
                continer, stopPropa, stopImmed;

            stopPropa = function() { propagation = false; };
            stopImmed = function(propa) {
                immediation = false;
                // 默认也会终止事件冒泡
                if (propa !== true) propagation = false;
            };

            continer = function() {
                this.stopPropagation = stopPropa;
                this.stopImmediation = stopImmed;
            };

            for(var i=0; i<copy.length; i++) {
                var item = copy[i],
                    name = item.name, run = item.run;

                if (name.match("^"+eves)) {
                    continer.prototype = item.content || null;
                    run.apply(new continer, args);

                    if (once === true) break;
                }

                if (!immediation) break;
            }
        };

        if (isObject(paths)) {
            var actions = ["patch", "catch", "call"];

            for(var i=0; i<actions.length; i++) {
                var action = actions[i], eves;
                eves = getCalls(paths, action, eFirst);

                if (propagation && eves.length > 0) {
                    callRuns(eves, eName, action == "catch");
                    if(action === "catch") break;
                }
            }
        }

        /**
         * 返回本次运行后的数据状态
         */
        return {
            propagation: propagation,
            arguments  : args || [],
        }
    }

    Emitter = function(tables, parent, prefix) {
        this.tables = tables || {};
        this.parent = parent || null;
        this.prefix = prefix || null;

        return this;
    };

    Emitter.prototype = Prototype;

    // 添加一个事件对象
    Prototype.on = function(eve, call, content) {
        if (isString(eve) && isFunction(call)) {
            pathObjectPush(this.tables, eve, "call", call, content);
        }

        return this;
    }

    // 添加一个一次性的事件对象
    Prototype.once = function(eve, call, content) {
        if (isString(eve) && isFunction(call)) {
            var that = this, once;

            once = function() {
                call.apply(that, arguments);
                that.off(eve, once);
            };

            that.on(eve, once, content);
        }

        return this;
    }

    // 移除一个事件
    Prototype.off = function(eve, call) {
        if (isString(eve)) {
            pathObjectDel(this.tables, eve, "call", call);
        }

        return this;
    }

    // 在元素上添加捕获事件
    Prototype.catch = function(eve, call, content) {
        if (isString(eve) && isFunction(call)) {
            pathObjectPush(this.tables, eve, "catch", call, content);
        }

        return this;
    }

    // 在元素上移除捕获事件
    Prototype.uncatch = function(eve, call) {
        if (isString(eve)) {
            pathObjectDel(this.tables, eve, "catch", call);
        }

        return this;
    }

    // 在元素上添加一个修饰器
    Prototype.patch = function(eve, call) {
        if (isString(eve) && isFunction(call)) {
            pathObjectPush(this.tables, eve, "patch", call, content);
        }

        return this;
    }

    // 在元素上移除一个修饰器
    Prototype.unpatch = function(eve, call) {
        if (isString(eve)) {
            pathObjectDel(this.tables, eve, "patch", call);
        }

        return this;
    }

    // 在元素上触发事件
    Prototype.emit = function(/* eve, args... */) {
        var runs = eventArgs(arguments), path, eves, first;

        if (isString(runs.eves)) {
            first = runs.first;
            eves  = runs.eves;
            path  = pathFind(this.tables, runs.space);

            if (isObject(path)) {
                eventEmit(path, eves, first, {
                    arguments: runs.args,
                    propagation: true,
                });
            }
        }

        return this;
    }

    // 向父元素冒泡这个事件
    Prototype.dispatch = function(/* eve, args... */) {
        var pathCall = [], run = eventArgs(arguments),
            space, before, maps = this.tables;

        if (isString(run.eves)) {
            if (run.space === "") {
                pathCall.push(maps);
            } else {
                spaces = run.space.split("/");

                for(var i=0; i<spaces.length; i++) {
                    var key = keyFix(spaces[i]);

                    if (isObject(maps[key])) {
                        pathCall.push(maps[key]);
                        maps = maps[key];
                    } else {
                        return this;
                    }
                }
            }

            before = {
                arguments: run.args,
                propagation: true,
            };

            // 如果忽略自身，则移除自身执行数据
            if (run.pass === true) pathCall.pop();

            for(var i=pathCall.length-1; i>=0; i--) {
                before = eventEmit(pathCall[i],
                    run.eves, run.first, before);

                if (!before.propagation) break;
            }
        }

        return this;
    }

    // 向子元素传播这个事件
    Prototype.broadcast = function(/* eve, args... */) {
        var run = eventArgs(arguments),
            calls, before, eFirst, eName;

        path = pathFind(this.tables, run.space);
        eName = run.eves; eFirst = run.first;

        if (path && isString(eName)) {
            // 忽略自身，则直接从子级开始执行
            if (run.pass === true) {
                calls = eventChild(path, eFirst, eName);
            } else {
                if (eventTest(path, eFirst, eName)) {
                    calls = [path];
                } else {
                    return this;
                }
            }

            do {
                var cache = [], child;

                for(var i=0; i<calls.length; i++) {
                    var _args = arrayCopy(run.args);

                    _args = eventEmit(calls[i], eName, eFirst, {
                        arguments: _args,
                        propagation: true,
                    });

                    if (_args.propagation === true) {
                        child = eventChild(calls[i], eFirst, eName);
                        cache = cache.concat(child);
                    }
                }

                calls = cache;
            } while (calls.length);
        }

        return this;
    }

    // 构造函数，兼容 new 方式创建对象
    var Creater = function() {
        return new Emitter();
    }; Creater.prototype = Prototype;

    if (!noGlobal) {
        window.Emitter = Creater;
    }

    return Creater;
});

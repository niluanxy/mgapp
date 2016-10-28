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
    var EventPath = {}, Event, $KEY = "##_";

    // 获取到修饰后的 key 值
    function keyfix(name) {
        name = name.replace(/^\./g, '');
        return $KEY + name;
    }

    function isFun(call) {
        return typeof call == "function";
    }

    function isObj(object) {
        return typeof object == "object";
    }

    function isArray(array) {
        return array instanceof Array;
    }

    function isString(str) {
        return typeof str == "string";
    }

    // 在 列表树 中根据路径查询对象
    // 如果没有值会返回 null
    function pathFind(paths, str, parent) {
        var arr = str.split("."), par;

        for(var i=0; i<arr.length; i++) {
            var key = keyfix(arr[i]);

            if (!paths[key] || !isObj(paths[key])) {
                return null;
            } else {
                par = paths;
                paths = paths[key];
            }
        }

        return parent ? par : paths;
    }

    // 在 列表树 中根据路径查询对象
    // 如果没有值则会每一级的创建空对象
    function pathAdd(paths, str) {
        var arr = str.split(".");

        for(var i=0; i<arr.length; i++) {
            var key = keyfix(arr[i]);

            if (!paths[key] || !isObj(paths[key])) {
                paths[key] = {};
            }

            paths = paths[key];
        }

        return paths;
    }

    // 从数组中删除匹配的对象
    function arrayDel(array, object) {
        if (object === undefined) return;

        for(var i=0; i<array.length; i++) {
            if (array[i] == object) {
                array.splice(i, 1);
                break;
            }
        }
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

    // 查找给定路劲下的给定数组
    // 没有会创建内容
    function pathArrayAdd(paths, str, key) {
        var path = pathAdd(paths, str);

        if (!(isArray(path[key])) ) {
            path[key] = [];
        }

        return path[key];
    }

    function pathArrayFind(paths, str, key) {
        var path = pathFind(paths, str),
            arrs = path ? path[key] : null;

        return arrs || null;
    }

    // 删除给定路劲下的某个数组的值
    // 未限定值则删除所有
    function pathArrayDel(paths, str, key, call) {
        var path = pathFind(paths, str),
            arrs = path ? path[key] : null;

        if (arrs != null) {
            if (isFun(call)) {
                arrayDel(arrs, call);
            } else {
                delete path[key];
            }
        }
    }

    function eventArgs(arguments) {
        var ret = {args: [], eve: ""};

        ret.eve = arguments[0];
        for(var i=1; i<arguments.length; i++) {
            ret.args.push(arguments[i]);
        }

        return ret;
    }

    function eventEmit(space, before) {
        var cointer, args, stopCall = false,
            _patch, _catch, _call, _copy;

        bofore = before || {};
        args = before.arguments || [];
        cointer = {
            propagation: !!before.propagation,
            immediation: !!before.immediation,

            stopPropagation: function() {
                this.propagation = false;
            },

            stopImmediation: function() {
                this.immediation = false;
                this.stopPropagation();
            }
        }

        if (space && before.propagation && before.propagation) {
            // 先运行 path 方法，对运行参数进行操作
            _patch = space["patch"] || [];
            if (_patch && _patch.length > 0) {
                // 克隆数组，防止数组长度变化
                _copy = arrayCopy(_patch);

                for(var i=0; i<_copy.length; i++) {
                    _copy[i].apply(cointer, args);
                }
            }

            // 若有 catch 方法，运行最上层 catch 方法并结束
            _catch = space["catch"] || [];
            if (_catch && _catch.length > 0) {
                _catch[0].apply(cointer, args);
                stopCall = true;
            }

            _call = space["call"] || [];
            if (!stopCall && _call && _call.length > 0) {
                // 克隆数组，防止数组长度变化
                _copy = arrayCopy(_call);

                for(var i=0; i<_copy.length; i++) {
                    _copy[i].apply(cointer, args);
                    if (!cointer.immediation) break;
                }
            }
        }

        /**
         * 返回本次运行后的数据状态
         */
        return {
            propagation: cointer.propagation,
            immediation: cointer.immediation,
            arguments  : args || [],
        }
    }

    Event = function() {
        this.maps = {};
    };

    // 阻止本次的事件冒泡
    Event.prototype.stopPropagation = function() {
        this.propagation = false;
    }

    // 阻止本次的事件冒泡，并阻止后续运行
    Event.prototype.stopImmediation = function() {
        this.immediation = false;
    }

    // 添加一个事件对象
    Event.prototype.on = function(eve, call) {
        if (isString(eve) && isFun(call)) {
            pathArrayAdd(this.maps, eve, "call")
            .push(call);
        }

        return this;
    }

    // 添加一个一次性的事件对象
    Event.prototype.once = function(eve, call) {
        if (isString(eve) && isFun(call)) {
            var that = this, once;

            once = function() {
                call.apply(that, arguments);
                that.off(eve, once);
            };

            that.on(eve, once);
        }

        return this;
    }

    // 移除一个事件
    Event.prototype.off = function(eve, call) {
        if (isString(eve)) {
            pathArrayDel(this.maps, eve, "call", call);
        }

        return this;
    }

    // 在元素上添加捕获事件
    Event.prototype.catch = function(eve, call) {
        if (isString(eve) && isFun(call)) {
            pathArrayAdd(this.maps, eve, "catch")
            .unshift(call);
        }

        return this;
    }

    // 在元素上移除捕获事件
    Event.prototype.uncatch = function(eve, call) {
        if (isString(eve)) {
            pathArrayDel(this.maps, eve, "catch", call);
        }

        return this;
    }

    // 在元素上添加一个修饰器
    Event.prototype.patch = function(eve, call) {
        if (isString(eve) && isFun(call)) {
            pathArrayAdd(this.maps, eve, "patch")
            .push(call);
        }

        return this;
    }

    // 在元素上移除一个修饰器
    Event.prototype.unpatch = function(eve, call) {
        if (isString(eve)) {
            pathArrayDel(this.maps, eve, "patch", call);
        }

        return this;
    }

    // 移除指定类型的第一个对象
    Event.prototype.shift = function(eve, key) {
        if (isString(eve) && isString(key)) {
            var path = pathFind(this.maps, eve),
                find = path ? path[key] : null;

            if (find && isArray(find)) {
                return find.shift();
            }
        }

        return null;
    }

    // 在元素上触发事件
    Event.prototype.emit = function(/* eve, args... */) {
        var runs = eventArgs(arguments), space;

        if (isString(runs.eve)) {
            space = pathFind(this.maps, runs.eve);

            if (space && isObj(space)) {
                eventEmit(space, {
                    arguments: runs.args,
                    immediation: true,
                    propagation: true,
                });
            }
        }

        return this;
    }

    // 向父元素冒泡这个事件
    Event.prototype.dispatch = function(/* eve, args... */) {
        var pathCall = [], runs = eventArgs(arguments),
            eves, before, maps = this.maps;

        if (isString(runs.eve)) {
            eves = runs.eve.split(".");

            for(var i=0; i<eves.length; i++) {
                var key = keyfix(eves[i]);

                if (isObj(maps[key])) {
                    pathCall.push(maps[key]);
                    maps = maps[key];
                } else {
                    return this;
                }
            }

            // 小于说明不是完全匹配事件路劲
            if (i < eves.length) return this;

            before = {
                arguments: runs.args,
                immediation: true,
                propagation: true,
            };

            for(var i=pathCall.length-1; i>=0; i--) {
                before = eventEmit(pathCall[i], before);

                if (!before.propagation) break;
            }
        }

        return this;
    }

    // 向子元素传播这个事件
    Event.prototype.broadcast = function(/* eve, args... */) {
        var runs = eventArgs(arguments),
            path, old, before, reg = new RegExp("^"+$KEY);

        path = pathFind(this.maps, runs.eve);

        if (path && isString(runs.eve)) {
            before = {
                arguments: runs.args,
                immediation: true,
                propagation: true,
            };

            do {
                before = eventEmit(path, before);
                if (!before.propagation) break;

                old = path;
                for(var key in path) {
                    if (key.match(reg)) {
                        path = path[key];
                        break;
                    }
                }
            } while (old != path);
        }

        return this;
    }


    if (!noGlobal) {
        window.mEvent = Event;
    }
    return Event;
});

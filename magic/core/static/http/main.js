import Defer from "LIB_MINJS/promise.js";
import {strFind, each, extend} from "LIB_MINJS/utils.js";
import {isTrueString, isNumber, isObject} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";
import RootMagic from "CORE_MAGIC/main.js";

var errorTpl = {
        e404: { response: {}, statusCode: 404, statusText: "Url Is Not Found" },
        e504: { response: {}, statusCode: 504, statusText: "Request Time Out" },
    },
    header = {
        post: "application/x-www-form-urlencoded;charset=UTF-8",
    };
$config.fetchTimeout = 5000;

function isOption(option) {
    var check = "body method header";

    for(var key in option) {
        if (strFind(check, key) >= 0) {
            return true;
        }
    }

    return false;
}

function addEvent(obj, name, call) {
    return obj.addEventListener(name, call);
}

function tryFormat(data, none) {
    var ret = null;

    try {
        ret = JSON.parse(data);
    } catch (e) {
        ret = none || data;
    }

    return ret;
}

function transData(data) {
    var str = "";

    each(data, function(key, value) {
        str += key+"="+value+"&";
    });

    return str.replace(/\&$/, '');
}

/**
 * TODO:
 * - 通过 getResponseHeader("Content-Type") 自动转换数据格式
 */
function _ajax(method, url, data, option, timeout) {
    var defer = new Defer(), xhr;

    if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
    } else {
        xhr = new XMLHttpRequest();
    }

    addEvent(xhr, "load", function() {
        var res = {
            statusCode: this.status,
            statusText: this.statusText,
            response: tryFormat(this.response),
        };

        defer.resolve(res);
    });

    addEvent(xhr, "timeout", function() {
        defer.reject(errorTpl.e504);
    });

    // 请求超时处理代码
    xhr.timeout = timeout || $config.fetchTimeout;

    try {
        if (method === "GET") {
            url = url+"?"+transData(data);

            xhr.open(method, url, true);
            xhr.withCredentials = true;
            xhr.send();
        } else {
            xhr.open(method, url, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader("Content-type", header.post);
            xhr.send(transData(data));
        }
    } catch(e) {};

    return defer.promise;
}

/**
 * TODO:
 * - 通过 response.headers.get("Content-Type") 自动转换数据格式
 */
function _fetch(method, url, data, option, timeout) {
    var init = {}, defer = new Defer, headers;

    init.method = method;
    extend(init, option);

    init.timeout = timeout || $config.fetchTimeout;
    if (!init.headers) init.headers = {};
    headers = init.headers;

    if (method === "GET") {
        delete init.body;
        url += "?"+transData(data);
    } else {
        init.method = method;
        headers["Content-Type"] = header.post;
        init.body = transData(data);
    }

    self.fetch(url, init).then(function(response) {
        response.json().then(function(data) {
            defer.resolve({
                response: data,
                statusCode: response.status,
                statusText: response.statusText,
            });
        });
    });

    return defer.promise;
}

var fetchProxy = self.fetch && self.Headers ? _fetch : _ajax;

/**
 * TODO:
 * - 常见错误代码处理，比如 404，504 等
 *
 * options: {
 *     mode : ['cors' || null], 
 *         - 是否 cors 模式
 *     cache: [true || false],
 *         - GET下是否缓存，默认不缓存，会自动添加时间戳
 *     header: object,
 *         - 自定义的头部信息，参看 fetch 标准头部
 *     dataTyep: ['json' || 'text' || 'xml']
 *         - 转换返回的数据，为空自动转换
 * }
 * 
 */
export function fetch(url, data, option, timeout) {
    var option = option || {}, method,
        last, args = arguments;

    last = args[args.length-1];

    // data option 参数自动判断修复
    if (data && isOption(data)) {
        option = data; data = {};
    } else if (data && !isOption(option)) {
        option = {};
        if (!isObject(data)) data = {};
    } else if (!isObject(data)) {
        data = {};
    }

    // option timeout 参数自动判断修复
    if (option && isNumber(option)) {
        timeout = option; option = {};
    }

    // timeout 参数自动判断修复
    if (!isNumber(last)) {
        timeout = null;
    } else {
        timeout = last;
    }

    method = option.method || "GET";
    delete option.method;

    if (!isTrueString(url)) {
        var error = new Defer();

        error.reject(errorTpl.e404);

        return error.promise;
    } else {
        return fetchProxy(method, url, data, option, timeout);
    }
}
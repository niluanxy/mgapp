import {isTrueString, isObject} from "CORE_FUNCTION/check.js";
import {allProxy} from "CORE_FUNCTION/proxy.js";
import {append} from "CORE_MODULE/dom/editer/main.js";
import {element} from "CORE_FUNCTION/tools.js";

/**
 * templayed.js 0.2.1 (Uncompressed)
 * http://archan937.github.io/templayed.js/
 */
function templayed(template, vars) {
    var get = function(path, i) {
        i = 1; path = path.replace(/\.\.\//g, function() { i++; return ''; });
        var js = ['vars[vars.length - ', i, ']'], keys = (path == "." ? [] : path.split(".")), j = 0;
        for (j; j < keys.length; j++) { js.push('.' + keys[j]); };
        return js.join('');
    }, tag = function(template) {
        return template.replace(/\{\{(!|&|\{)?\s*(.*?)\s*}}+/g, function(match, operator, context) {
            if (operator == "!") return '';
            var i = inc++;
            return ['"; var o', i, ' = ', get(context), ', s', i, ' = (((typeof(o', i, ') == "function" ? o', i, '.call(vars[vars.length - 1]) : o', i, ') || "") + ""); s += ',
                (operator ? ('s' + i) : '(/[&"><]/.test(s' + i + ') ? s' + i + '.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/>/g,"&gt;").replace(/</g,"&lt;") : s' + i + ')'), ' + "'
            ].join('');
        });
    }, block = function(template) {
        return tag(template.replace(/\{\{(\^|#)(.*?)}}(.*?)\{\{\/\2}}/g, function(match, operator, key, context) {
            var i = inc++;
            return ['"; var o', i, ' = ', get(key), '; ',
                (operator == "^" ?
                        ['if ((o', i, ' instanceof Array) ? !o', i, '.length : !o', i, ') { s += "', block(context), '"; } '] :
                        ['if (typeof(o', i, ') == "boolean" && o', i, ') { s += "', block(context), '"; } else if (o', i, ') { for (var i', i, ' = 0; i', i, ' < o',
                            i, '.length; i', i, '++) { vars.push(o', i, '[i', i, ']); s += "', block(context), '"; vars.pop(); }}']
                ).join(''), '; s += "'].join('');
        }));
    }, inc = 0;

    return new Function("vars", 'vars = [vars], s = "' + block(template.replace(/"/g, '\\"').replace(/\n/g, '\\n')) + '"; return s;');
};

function tplProxy(template, data) {
    var el = element(this), tpls;

    if (el && isTrueString(template) && isObject(data)) {
        tpls = templayed(template)(data);
        append.call(el, tpls);
    }

    return this;
}

export function tpl(template, data, setAll) {
    return allProxy.call(this, tplProxy, template, data, setAll);
}
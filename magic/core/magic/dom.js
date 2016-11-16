/**
 * 检测字符串是否可以创建为 dom 元素
 */
export function check(text) {
    if (typeof text === "string") {
        // 去除字符串中的换行符等
        var txt = text.replace(/[\r\n]/g,"");

        if (txt[0] === "<" &&
         txt[ txt.length - 1 ] === ">" &&
         txt.length >= 3) {
            return true;
        }
    }

    return false;
};

/**
 * 尝试将 text 转为 dom 对象
 *
 * @param       {String}    text - 要转换的DOM字符串
 * @return      {Element}   包含转换好的DOM的一个Body对象
 * @author      mufeng      <smufeng@gmail.com>
 * @version     0.1         <2015-05-30>
 */
export function make(text, context) {
    var ret, i, div, tmp, cont, node = [], fragment; // 最终返回的 dom 对象

    if (check(text)) {
        // 修复执行上下文环境
        context = context && context.nodeType ? context.ownerDocument || context : document;
        fragment = context.createDocumentFragment();

        // 创建一个临时的div对象并插入字符串
        div = fragment.appendChild( context.createElement("div") );
        div.innerHTML = text;

        for(i=0; tmp = div.childNodes[i]; i++) node[i] = tmp;

        // 清除 fragment 的内容
        fragment.textContent = "";
        for(i=0; tmp=node[i]; i++) fragment.appendChild(tmp);

        ret = fragment; // 设置返回对象
    } else if (text instanceof Element || text instanceof DocumentFragment) {
        ret = text;     // 如果是DOM元素直接返回
    }

    return ret;    // 返回DOM对象
};

/**
 * 一个简单的JS查询器
 *
 * @param       {String}  select - 查找元素的CSS字符串
 * @param       {Object}  el     - 从何处开始查找元素
 * 
 * @returns     {Array}  返回查找结果数组
 * 
 * @author      mufeng  <smufeng@gmail.com>
 * @version     0.3     <2015-06-05>
 */
export function query(select, el) {
    var content, result;    // 定义执行环境及结果变量

    if (typeof select == "string") {
        var elname = select.toLowerCase(); // 转为字符串
        content = el instanceof Element ||
                  el instanceof DocumentFragment ? el : document;

        if (elname == "body") {
            result = document.body;
        } else if (elname == "document") {
            result = document;
        } else if (select.indexOf("#") == 0 && !select.indexOf(" ")) {
            result = content.getElementById(select.slice(1));
        } else {
            result = content.querySelectorAll(select);
        }
    } else if (select instanceof Element) {
        result = select;    // dom元素直接返回
    } else if (select === document) {
        result = document;  // 如果是document直接返回
    }

    if (result.length === undefined) {
        result = [result];
    } else {
        var copy = [];

        for(var i=0; i<result.length; i++) {
            copy.push(result[i]);
        }

        result = copy;
    }

    return result;      // 返回最终的选择结果
};
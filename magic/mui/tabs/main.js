import RootMagic from "CORE_MAGIC/main.js";
import {uiInit, uiExtend} from "MUI/tools/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.tabs = {
    class: "tabs",

    wrapClass: "",
    itemClass: "tabs-item",
};

/**
 * options: {
 *     style: [string] 默认的样式
 *     
 *     wrapClass: [string] 父容器额外添加的 class
 *     itemClass: [string] 子容器额外添加的 class
 *     
 *     onSelect : [function] 选择某个项目时调用
 * }
 */
export default function Tabs(el, option) {
    this.$el = RootMagic(el);
    this.index  = 0;
    this.value  = null;
    this.option = uiExtend(CFG, option);
}

Tabs.prototype.init = function() {
    var that = this, $el = this.$el;

    uiInit($el, this.option, "click", function(e) {
        that.select(RootMagic(e.target).index());
    });

    return this;
}

Tabs.prototype.select = function(index) {
    var $el = this.$el, opt = this.option,
        $childs = $el.children(),
        actClass = opt.active, $item;

    $childs.eq("."+actClass).removeClass(actClass);

    $item = $childs.eq(index).addClass(actClass);
    this.index = index;
    this.value = $item.attr("value");
    if (isFunction(opt.onSelect)) {
        opt.onSelect(index);
    }

    return this;
}

Tabs.prototype.destory = function() {
    this.$el.remove();
}

// 绑定到 RootMagic 调用链上
RootMagic.fn.extend({tabs: function(options) {
    return new Tabs(this[0], options).init();
}});
import RootMagic from "CORE_MAGIC/main.js";
import {fixStyle} from "MUI/tools/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend} from "CORE_FUNCTION/tools.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.tabs = {
    prefix: "tabs",

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
function Tabs(el, option) {
    this.$el = RootMagic(el);
    this.index  = 0;
    this.value  = null;
    this.option = extend({}, $config.ui, CFG, option);
}

Tabs.prototype.init = function() {
    var that = this, $el = this.$el, opt = this.option;

    fixStyle($el, opt)
    .on("click", "."+opt.itemClass, function(e) {
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

RootMagic.fn.extend({
    tabs: function(options) {
        return new Tabs(this[0], options).init();
    }
});
import RootMagic from "CORE_MAGIC/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend} from "CORE_FUNCTION/tools.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.tabs = {
    active: $config.classActive,
    wrapClass: "",
    itemClass: "tabs-item",
};

/**
 * options: {
 *     onSelect : [function] 选择某个项目时调用
 * }
 */
function Tabs(el, option) {
    this.$el = RootMagic(el);
    this.index  = 0;
    this.value  = null;
    this.option = extend({}, CFG, option);
}

Tabs.prototype.init = function() {
    var that = this, $el = this.$el,
        opt = this.option, itemClass = opt.itemClass;

    $el.addClass(opt.wrapClass)
       .children().addClass(itemClass, true);

    $el.on("click", "."+itemClass, function(e) {
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
import RootMagic from "CORE_MAGIC/main.js";
import {uiExtend} from "MUI/tools/main.js";
import {isFunction, isElement} from "LIB_MINJS/check.js";
import {extend, arrayRemove} from "LIB_MINJS/utils.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.popup = {
    class: "pop",
    style: null,

    insertTo : "body", 

    wrapIndex: 100,
    hideClass: "hide",
    blurClass: "blur",

    wrapClass: "pop-wrap",
    itemClass: "pop-item",
}, SHOWS = "UI_POPUP_SHOW", INDEX = "UI_POPUP_INDEX";

/**
 * option: {
 *     blur:     [DOM] 要模糊化的元素
 *     insertTo: [string || DOM] 要插入的位置
 * }
 */
export default function Popup(el, option) {
    this.$el = RootMagic(el);
    this.$wrap  = null;
    this.$blur  = null;
    this.isHide = true;
    this.option = uiExtend(CFG, option);
}

Popup.prototype.init = function() {
    var opt = this.option, $insert, $wrap, hideClass = opt.hideClass;

    $insert = RootMagic(opt.insertTo);
    $wrap = $insert.children("."+opt.wrapClass);

    if (!$wrap.length) {
        var createHtml = '<div class="' + opt.wrapClass + " "+ hideClass +
                '" style="z-index:' + opt.wrapIndex + ';"></div>';

        if ($insert.tag() != "body" && $insert.css("position") == "static") {
            $insert.css("position", "relative");
        }

        $wrap = RootMagic(createHtml).appendTo($insert);
    }

    // 当前容器若第一次创建，则初始化相关数据
    if (!$wrap.data(SHOWS)) {
        $wrap.data(SHOWS, []).data(INDEX, 0);
    }
    this.$wrap = $wrap;
    this.$blur = RootMagic(opt.blur);

    this.$el.wrap('<div class="'+opt.itemClass + " " + hideClass +'"></div>');
    this.$el = this.$el.parent();
    this.$el.appendTo($wrap);

    return this;
}

Popup.prototype.show = function() {
    var opt = this.option, hide = opt.hideClass,
        $wrap = this.$wrap,
        show  = $wrap.data(SHOWS),
        index = $wrap.data(INDEX);

    this.$wrap.removeClass(hide);
    this.$blur.addClass(opt.blurClass);
    this.$el.css("z-index", ++index)
        .removeClass(hide);

    this.isHide = false;

    // 更新容器 UI 数据
    show.push(this.$el);
    $wrap.data(INDEX, index);

    return this;
}

Popup.prototype.hide = function() {
    var needShow = false, $wrap = this.$wrap,
        hide  = this.option.hideClass,
        shows = $wrap.data(SHOWS), index = $wrap.data(INDEX),
        elidx = parseInt(this.$el.css("z-index"));

    this.$el.addClass(hide);
    this.isHide = true;

    //  更新容器 UI 数据
    if (arrayRemove(shows, this.$el).length) needShow = true;
    if (elidx == index) $wrap.data(INDEX, elidx-1);
    
    if (!needShow) {
        $wrap.addClass(hide);
        $wrap.data(INDEX, 0);
    }

    return this;
}

Popup.prototype.toggle = function(set) {
    var toggle = set || this.isHide;
    
    toggle ? this.show() : this.hide();

    return this;
}

Popup.prototype.destroy = function() {
    this.$el.remove();
}

// 绑定到 RootMagic 调用链上
RootMagic.fn.extend({popup: function(el, option) {
    var ext = extend({}, option, {insertTo: this[0]});
    return new Popup(el, ext).init();
}});

RootMagic.extend({popup: function(el, option) {
    return new Popup(el, option).init();
}})
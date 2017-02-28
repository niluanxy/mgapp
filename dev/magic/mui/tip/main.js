import RootMagic from "MG_MAGIC/main.js";
import {uiExtend} from "MG_UIKIT/core/tools.js";
import {extend, value} from "LIB_MINJS/utils.js";
import {isFunction, isString} from "LIB_MINJS/check.js";
import Popup from "MG_UIKIT/popup/main.js";
import $config from "MG_UIKIT/core/config.js";

var CFG = $config.tip = {
    class: "tip",

    wrapClass: "tip",
    backClass: "tip-back",

    textClass: "text",
    iconClass: "icon",

    show  : 1400,           // 默认显示时间
    delay : 0,              // 默认延迟显示时间

    insertTo : "body",      // 插入到哪个元素中
}, Prototype = {};

/**
 * options: {
 *     live   : [boolean]  是否永久显示
 *     icon   : [string]   要显示的图标类名
 *     modal  : [boolean]  是否模态方式
 *     onHide : [function] 消息隐藏后的回调方法
 * }
 */
export default function Tips(text, option) {
    this.$el    = null;
    this.$back  = null;
    this.$ctrl  = null;

    this.text   = text || "";
    this.delay  = null;
    this.option = uiExtend(CFG, option);
} Tips.prototype = Prototype;


Prototype.make = function(text, icon) {
    var option = this.option,
        $html = RootMagic('<div class="'+option.wrapClass+'"></div>');

    $html.append('<span class="'+option.textClass+'">'+text+'</span>');
    if (icon) $html.prepend('<i class="'+option.iconClass+' '+icon+'"></i>');

    return $html;
}

Prototype.init = function() {
    var opt = this.option, $ctrl, $dom, $back;

    $dom  = this.make(this.text, opt.icon);
    $back = RootMagic('<div class="'+opt.backClass+'"></div>');
    $ctrl = new Popup($dom, {insertTo: opt.insertTo}).init();

    $ctrl.$el.append($dom).append($back);

    this.$el   = $dom;
    this.$back = $back;
    this.$ctrl = $ctrl;

    return this;
}

Prototype.show = function(text, icon, extOption) {
    var that = this, $ctrl = that.$ctrl, txt, opt;

    if (icon && !isString(icon) && !extOption) {
        extOption = icon; icon = null;
    }
    opt = extend({}, this.option, extOption || {}, true);

    txt  = value(text, that.text);
    icon = value(icon, opt.icon);

    that.$el.html(this.make(txt, icon));
    opt.modal ? that.$back.show() : that.$back.hide();

    clearTimeout(that.delay);
    that.delay = setTimeout(function() {
        $ctrl.show();

        if (!opt.live) {
            that.delay = setTimeout(function() {
                $ctrl.hide();
            }, opt.show);
        }
    }, opt.delay || 0);

    return this;
}

Prototype.hide = function(delay, callback) {
    var opt = this.option, $ctrl = this.$ctrl,
        args = arguments, hideCall;

    if (isFunction(delay)) {
        callback = delay;
        delay = null;
    }

    delay = value(delay, opt.delay, 0);
    hideCall = isFunction(callback) ? callback : opt.onHide;

    clearTimeout(this.delay);
    this.delay = setTimeout(function() {
        $ctrl.hide();
        isFunction(hideCall) && hideCall();
    }, delay || 0);

    return this;
}

Prototype.toggle = function(setShow) {
    setShow = setShow || this.$ctrl.isHide;
    setShow ? this.show() : this.hide();

    return this;
}

Prototype.destroy = function() {
    this.$el.remove();
    this.$back.remove();
    this.$ctrl.$el.remove();
}

// 绑定到 RootMagic 调用链上
RootMagic.extend({tip: function(text, option) {
    return new Tips(text, option).init();
}});

RootMagic.fn.extend({tip: function(text, option) {
    var opt = extend({insertTo: this[0]}, option);
    return new Tips(text, opt).init();
}});
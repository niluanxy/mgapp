import RootMagic from "CORE_MAGIC/main.js";
import {uiExtend} from "MUI/tools/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend} from "LIB_MINJS/utils.js";
import $config from "CORE_MAGIC/config.js";

import Scroll from "MUI/scroll/core/main.js";

var CFG = $config.slider = {
    class: "slider",

    wrapClass : "slider",
    itemsWrap : "wrapper",
    pointWrap : "points",

    initClass : "init",
    itemClass : "slider-item",
    pointClass: "point-item",

    moveVel   : 1,
    moveRate  : 0.3,

    autoPlay  : 5000,
    playLoop  : true,

    directionX: true,
    directionY: false,
}, Prototype = {};

/**
 * options: {
 *      style: [string] 默认的样式
 *
 *      itemsWrap: [string] item包含容器 class
 *      pointWrap: [string] point包含容器 class
 *
 *      itemClass : [string] item class
 *      pointClass: [string] point class
 *
 *      onBefore : [function] 滑动前的回调
 *      onScroll : [function] 滑动结束的回调
 *      onAnimate: [function] 滑动动画结束的回调
 *
 *      directionX: [boolean] 是否 x 方向滑动，默认
 *      directionY: [boolean] 是否 y 放下滑动
 * }
 */
function Slider(el, options) {
    this.$el    = RootMagic(el);
    this.scroll = null;

    this.index  = 0;
    this.handle = null;
    this.maxPage = 0;

    this.width  = 0;
    this.height = 0;

    this.option = uiExtend(CFG, options);
}; Slider.prototype = Prototype;

Prototype.init = function() {
    var self = this, opt = self.option,
        $el = self.$el, $wrap, $point, offset;

    $el.addClass(opt.wrapClass)
    $wrap = $el.children().addClass(opt.itemsWrap);
    $wrap.children().addClass(opt.itemClass, true);

    self.scroll = new Scroll($el, {
        wrapClass: "", bodyClass: "",

        lockX: !opt.directionX,
        lockY: !opt.directionY,
    }).init();

    offset = $el.offset();
    self.width  = offset.width;
    self.height = offset.height;

    $wrap.addClass(opt.initClass);

    return self.initEvent();
}

Prototype.initEvent = function() {
    var self = this, opt = self.option,
        $emit = self.scroll.emitter;

    if (opt.directionX && opt.directionY) {
        opt.autoPlay = false;
    }

    $emit.off("start.slider").off("end.slider")
    .on("start.slider", function(e, scroll, touches) {
        console.log("slider start")
        self.setAutoPlay(false);
        isFunction(opt.onBefore) && opt.onBefore();
    }).on("end.slider", function(e, scroll, touches) {
        if ((opt.directionX + opt.directionY) == 2) {
            if (Math.abs(e.velocity) > opt.moveVel) {
                self.next(Math.abs(e.velocityX) > Math.abs(e.velocityY) ? "x" : "y");
            }
        } else {

        }

        isFunction(opt.onScroll) && opt.onScroll();
    }).on("animated", function() {
        console.log("animated end")
        isFunction(opt.onAnimate) && opt.onAnimate();
    })

    self.setAutoPlay(true);

    return self;
}

Prototype.setAutoPlay = function(enable) {
    var self = this, opt = self.option;

    if (enable && opt.autoPlay > 0) {
        self.handle = setInterval(function() {
            self.next();
        }, opt.autoPlay);
    } else if (!enable){
        clearInterval(self.handle);
    }

    return self;
}

Prototype.go = function() {

}

Prototype.next = function() {

}

Prototype.back = function() {

}

Prototype.destory = function() {
    this.$el.remove();
}

RootMagic.fn.extend({slider: function(option) {
    return new Slider(this[0], option).init();
}});

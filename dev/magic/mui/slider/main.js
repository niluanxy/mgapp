import RootMagic from "MG_MAGIC/main.js";
import {uiExtend} from "MG_UIKIT/base/tools.js";
import {isFunction} from "LIB_MINJS/check.js";
import {extend} from "LIB_MINJS/utils.js";
import ConfigUI from "MG_UIKIT/base/config.js";

import Scroll from "MG_UIKIT/scroll/core/main.js";

var CFG = ConfigUI.slider = {
    class: "slider",

    wrapClass : "slider",
    itemsWrap : "wrapper",
    pointWrap : "points",

    initClass : "init",
    itemClass : "slider-item",
    pointClass: "point-item",

    moveVel    : 0.25,
    moveRate   : 0.3,
    preventMove: true,

    animate  : "quadratic",
    duration : 500,

    playAuto : 5000,
    playLoop : true,

    direction : "x",
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
 *      direction: [string] x 滑动方向还是 y 滑动方向
 * }
 */
export default function Slider(el, options) {
    this.$el    = RootMagic(el);
    this.$wrap  = null;
    this.$point = null;

    this.scroll = null;

    this.page = 0;
    this.handle = null;

    this.maxPage = 0;
    this.baseSize= 0;

    this.option = uiExtend(CFG, options);
}; Slider.prototype = Prototype;

Prototype.init = function() {
    var self = this, opt = self.option,
        $el = self.$el, $wrap, $point, offset;

    $el.addClass(opt.wrapClass)
    $wrap = $el.children().addClass(opt.itemsWrap);
    $wrap.children().addClass(opt.itemClass, true);

    opt.direction = opt.direction.toUpperCase();
    opt.direction = opt.direction == "X" ? "X" : "Y";

    self.$wrap = $wrap;
    self.scroll = new Scroll($el, {
        wrapClass: "", bodyClass: "",
        pointX: false, pointY: false,

        lockX: opt.direction !== "X",
        lockY: opt.direction === "X",
        preventMove: opt.preventMove,
    }).init();

    self.refresh().updatePage(0);
    $wrap.addClass(opt.initClass);

    return self.initEvent().initPoint();
}

Prototype.initPoint = function() {
    var self = this, opt = self.option, $point;

    if (opt.pointWrap && opt.pointClass) {
        $point = self.$el.children("."+opt.pointWrap);
        if ($point.length < 1) {
            $point = RootMagic("<div class='"+opt.pointWrap+"'></div>");
        }

        $point.tpl("{{#points}}<span class='"+opt.pointClass+"'></span>{{/points}}",
                {points: {length: self.maxPage+1}}).appendTo(self.$el);

        self.$point = $point.children();
        self.$point.eq(0).addClass(opt.actived);
    } else {
        self.$point = null;
    }

    return self;
}

Prototype.initEvent = function() {
    var self = this, opt = self.option, $emit = self.scroll.emitter;

    $emit.unpatch("_start.slider").unpatch("_end.slider").off("animated.slider")
    .patch("_start.slider", function(e, touches, scroll, translate) {
        self.setAutoPlay(false);
        isFunction(opt.onBefore) && opt.onBefore(self, self.page);
    }).patch("_end.slider", function(e, touches, scroll, translate) {
        var dir = opt.direction, base = self.baseSize, vel, delta;

        delta = e["delta"+dir]; vel = e["velocity"+dir];

        if (Math.abs(vel) > opt.moveVel || Math.abs(delta)/base > opt.moveRate) {
            self.updatePage(self.page - Math.abs(vel)/vel);
        }

        translate["scroll"+dir] = self.page*base*-1;
        translate.animate  = opt.animate;
        translate.duration = opt.duration;
        self.setAutoPlay(true);

        isFunction(opt.onScroll) && opt.onScroll(self, self.page);
    }).on("animated.slider", function(scroll) {
        var $wrap = self.$wrap, base = self.baseSize, maxBase, truePage;

        maxBase  = base*self.maxPage;
        truePage = opt.direction == "X" ? scroll.x : scroll.y;
        truePage = parseInt(self.maxPage - (maxBase+truePage)/base);

        self.updatePage(truePage).updatePoint(truePage);
        isFunction(opt.onAnimate) && opt.onAnimate(self, self.page);
    })

    self.setAutoPlay(true);

    return self;
}

Prototype.refresh = function() {
    var self = this, opt = self.option, items,
        $el = self.$el, $wrap = self.$wrap, offset;

    offset = $el.offset();
    items = $wrap.children().length;

    self.maxPage = items-1;
    self.baseSize = opt.direction == "X" ? offset.width : offset.height;

    return self;
}

Prototype.setAutoPlay = function(enable) {
    var self = this, opt = self.option;

    if (enable && opt.playAuto > 0) {
        clearInterval(self.handle);
        self.handle = setInterval(function() {
            self.next();
        }, opt.playAuto);
    } else if (!enable){
        clearInterval(self.handle);
    }

    return self;
}

Prototype.updatePage = function(next) {
    var self = this, opt = self.option, base = self.baseSize,
        $scroll = self.scroll, dir = opt.direction, opage = self.page;

    if (opt.playLoop) {
        next = next > self.maxPage ? 0 : next < 0 ? self.maxPage : next;
    } else {
        next = next > self.maxPage ? self.maxPage : next < 0 ? 0 : next;
    }

    self.page = next;
    $scroll["minScroll"+dir] = next*base*-1;
    $scroll["maxScroll"+dir] = (next+1)*base*-1;

    // 修复 滑动到底部，无法退回第一项 的问题
    if (opage == self.maxPage && self.page == 0) {
        $scroll["maxScroll"+dir] = (self.maxPage+1)*base*-1;
    }

    return self;
}

Prototype.updatePoint = function(next) {
    var self = this, opt = self.option,
        $point = self.$point, actCls = opt.actived;

    if ($point && ($point.length-1) == self.maxPage) {
        $point.eq("."+actCls).removeClass(actCls);
        $point.eq(next).addClass(actCls);
    }

    return self;
}

Prototype.go = function(next) {
    var scrollX, scrollY, self = this, opt = self.option,
        $scroll = self.scroll, base = self.baseSize, dir = opt.direction;

    isFunction(opt.onBefore) && opt.onBefore(self, self.page);
    self.updatePage(next);

    if (dir == "X") {
        scrollX = self.page*base*-1;
    } else {
        scrollY = self.page*base*-1;
    }

    isFunction(opt.onScroll) && opt.onScroll(self, self.page);
    $scroll.scrollTo(scrollX, scrollY, opt.duration, opt.animate);
}

Prototype.next = function() {
    return this.go(this.page+1);
}

Prototype.prev = function() {
    return this.go(this.page-1);
}

Prototype.destory = function() {
    this.$el.remove();
    this.setAutoPlay(false);
}

RootMagic.fn.extend({slider: function(option) {
    return new Slider(this[0], option).init();
}});

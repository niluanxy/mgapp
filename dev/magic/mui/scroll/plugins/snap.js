import Scroll from "MG_UIKIT/scroll/core/main.js";
import {uiExtend} from "MG_UIKIT/core/tools.js";
import {value} from "LIB_MINJS/utils.js";
import $config from "MG_UIKIT/core/config.js";

var CFG = $config.scroll.snap = {
    snap       : "",
    snapTime   : 500,
    snapResize : null,
    snapResizeX: null,
    snapResizeY: null,
    snapAnimate: "circular",
}, Prototype = {}, ABS = Math.abs;

/**
 * 参数说明：
 *      snap:           选择的元素，空则选择 child
 *      sanpTime:       修正位置时的动画时间
 *      snapAnimate:    修正时的动画效果
 *
 *      snapResize :     如果有值，自动修正容器对应方向尺寸
 */
export default function Snap(scope, option) {
    this.scope = scope;
    this.option = uiExtend(CFG, option);

    this.width  = 0;
    this.height = 0;
}; Scroll.register("snap", Snap, Prototype);



Prototype.init = function(root) {
    this.refresh();
}

Prototype.refresh = function() {
    var self = this, opt = self.option,
        $snap, offset, scope = self.scope,
        $el = scope.$el, $body = scope.$body,

    $snap = $body.find(opt.snap);
    $snap = $snap.length ? $snap : $body.children().eq(0);

    offset = $snap.offset();

    self.width  = offset.width;
    self.height = offset.height;

    if (value(opt.snapResizeX, opt.snapResizeY, opt.snapResize)) {
        var fixSize, wrapOffset = $el.offset();

        if (!opt.lockX && (fixSize = value(opt.snapResizeX, opt.snapResize)) ) {
            fixSize = fixSize == "auto" ? parseInt(wrapOffset.width/offset.width+0.5) : fixSize;
            wrapOffset.width = fixSize*offset.width;
        }

        if (!opt.lockY && (fixSize = value(opt.snapResizeY, opt.snapResize)) ) {
            fixSize = fixSize == "auto" ? parseInt(wrapOffset.height/offset.height+0.5) : fixSize;
            wrapOffset.height = fixSize*offset.height;
        }

        $el.width(wrapOffset.width).height(wrapOffset.height);
    }
}


Prototype.end = function(e, touches, root, translate) {
    var self = this, opt = self.option,
        width = self.width, height = self.height,
        sx, sy, minus, upfix;

    sx = translate.scrollX; sy = translate.scrollY;

    if (!opt.lockX) {
        minus = e.velocityY > 0 ? 1 : -1;
        upfix = minus > 0 ? -1 : 0;

        sx = parseInt((sx + width/2*minus)/width+upfix) * width;
    }

    if (!opt.lockY) {
        minus = e.velocityY > 0 ? 1 : -1;
        upfix = minus > 0 ? -1 : 0;

        sy = parseInt((sy + height/2*minus)/height+upfix) * height;
    }

    translate.scrollX = sx;
    translate.scrollY = sy;

    if (!translate.duration) {
        translate.duration = opt.snapTime;
        translate.animate  = opt.snapAnimate;
    }
}

import RootMagic from "MG_MAGIC/main.js";
import Scroll from "MG_UIKIT/scroll/core/main.js";
import {extend, value} from "LIB_MINJS/utils.js";
import {uiExtend} from "MG_UIKIT/base/tools.js";
import $config from "MG_UIKIT/base/config.js";

import {transform, getTrans} from "MG_UIKIT/scroll/utils/tools.js";

var CFG = $config.scroll.point = {
    pointHide : "hide",
    pointClass: "scroll_point",
}, Prototype = {}, ABS = Math.abs;

function Point(scope, option) {
    var self = this;

    self.scope = scope;
    self.option= uiExtend(CFG, option);

    self.offsetX = 0;
    self.offsetY = 0;
    self.$pointX = null;
    self.$pointY = null;

    self.wrapSize = {};
    self.bodySize = {};

    self.pointXShow  = false;
    self.pointYShow  = false;
    self.pointHandle = null;
}; Scroll.register("point", Point, Prototype);

Prototype.init = function(root) {
    var self = this, opt = self.option, cls, $point;

    opt.direction = opt.direction == "x" ? "X" : "Y";

    if (opt.pointX == true) {
        cls = opt.pointClass+"_x";
        if (!($point = root.$el.find("."+cls)).length) {
            $point = RootMagic("<div class='"+cls+"'></div>");
            $point.addClass(opt.pointHide).appendTo(root.$el);
        } self.$pointX = $point;
    }

    if (opt.pointY == true) {
        cls = opt.pointClass+"_y";
        if (!($point = root.$el.find("."+cls)).length) {
            $point = RootMagic("<div class='"+cls+"'></div>");
            $point.addClass(opt.pointHide).appendTo(root.$el);
        } self.$pointY = $point;
    }

    self.refresh();
}

Prototype.refresh = function() {
    var self = this, opt = self.option, root = self.scope,
        woff, coff, ratioX = 0, ratioY = 0;

    woff = root.$el.offset(); coff = root.$body.offset();
    self.wrapSize = woff; self.bodySize = coff;

    if (opt.pointX == true) {
        ratioX = woff.width/coff.width;
        ratioX = ratioX >= 1 ? 1 : ratioX;
        self.$pointX.width(ratioX*woff.width);
    }

    if (opt.pointY == true) {
        ratioY = woff.height/coff.height;
        ratioY = ratioY >= 1 ? 1 : ratioY;
        self.$pointY.height(ratioY*woff.height);
    }

    return self;
}

Prototype.translate = function(x, y) {
    var self = this, opt = self.option,
        wsize = self.wrapSize, bsize = self.bodySize;

    x = x/bsize.width*wsize.width;
    y = y/bsize.height*wsize.height;

    transform(self.$pointX, getTrans(x, null));
    transform(self.$pointY, getTrans(null, y));

    return self;
}

Prototype.start = function(e, touches, root, translate) {
    clearTimeout(this.pointHandle);
}

Prototype.move = function(e, touches, root, translate) {
    this.translate(-translate.scrollX, -translate.scrollY);
    this.togglePoint(true, true);
}

Prototype.togglePoint = function(typeX, typeY) {
    var self = this, opt = self.option;

    typeX = typeX == null ? undefined : !typeX;
    typeY = typeY == null ? undefined : !typeY;

    if (self.$pointX && self.pointXShow == typeX) {
        self.$pointX.toggleClass(opt.pointHide, typeX);
        self.pointXShow = !typeX;
    }

    if (self.$pointY && self.pointYShow == typeX) {
        self.$pointY.toggleClass(opt.pointHide, typeY);
        self.pointYShow = !typeY;
    }
};

Prototype.end = function(e, touches, root, translate) {
    var self = this, opt = self.option, transM;

    transM = root.computeScroll(e.velocity);

    // 没有越界，且没动画效果，直接隐藏指示条
    if ((ABS(transM.scroll) < 5) && !root.boundryCheck()) {
        self.togglePoint(false, false);
    } else {
        self.pointHandle = setTimeout(function() {
            self.togglePoint(false, false);
        }, transM.duration+50);

        root.once("boundry", function() {
            clearTimeout(self.pointHandle);
            self.togglePoint(true, true);
        });

        root.once("animated", function() {
            self.togglePoint(false, false);
        });
    }
}

Prototype.scroll = function(root, scrollX, scrollY) {
    this.translate(-scrollX, -scrollY);
}

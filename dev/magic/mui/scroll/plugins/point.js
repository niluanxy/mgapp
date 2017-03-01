import RootMagic from "MG_MAGIC/main.js";
import Scroll from "MG_UIKIT/scroll/core/main.js";
import {extend, value} from "LIB_MINJS/utils.js";
import {uiExtend} from "MG_UIKIT/base/tools.js";
import $config from "MG_UIKIT/base/config.js";

import {transform, getTrans} from "MG_UIKIT/scroll/utils/tools.js";

var CFG = $config.scroll.point = {
    pointHide : "",
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
        self.$pointX.width(ratioX*woff.width);
    }

    if (opt.pointY == true) {
        ratioY = woff.height/coff.height;
        self.$pointY.height(ratioY*woff.height);
    }

    return self;
}

Prototype.translate = function(x, y) {
    var self = this, opt = self.option,
        wsize = self.wrapSize, bsize = self.bodySize;

    x = x/bsize.width*wsize.width;
    y = y/bsize.height*wsize.height;

    transform(self.$pointY, getTrans(x, y));

    return self;
}

Prototype.move = function(e, touches, root, translate) {
    this.translate(-translate.scrollX, -translate.scrollY);
}

Prototype.scroll = function(root, scrollX, scrollY) {
    this.translate(-scrollX, -scrollY);
}

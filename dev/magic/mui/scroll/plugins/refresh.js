import RootMagic from "MG_MAGIC/main.js";
import Scroll from "MG_UIKIT/scroll/core/main.js";
import {isFunction} from "LIB_MINJS/check.js";
import Defer from "LIB_MINJS/promise.js";
import {throttle} from "LIB_MINJS/utils.js";
import {uiExtend} from "MG_UIKIT/base/tools.js";
import ConfigUI from "MG_UIKIT/base/config.js";

var CFG = ConfigUI.scroll.refresh = {
    refreshCache : false,
    refreshAirt  : "Y",
    refreshHide  : "hide",
    refreshClass : "scroll_refresh",
    refreshParent: "scroll",

    refreshRate  : 0.8,
    refreshType  : "down",
    refreshModel : "simple",        // scroll | simple

    refreshSimpleTmp: '{pageNow} / {pageAll}',
    refreshScrollTmp: "",

    refreshEl    : "",
    refreshItem  : "",

    refreshCount : 10,
    refreshTotal : 100,

    refreshMove  : null,
    refreshBound : null,
}, Prototype = {};

function Refresh(scope, option) {
    var self = this;

    self.scope = scope;
    self.option= uiExtend(CFG, option);

    self.$el   = null;
    self.$item = null;

    self.page   = 0;
    self.pageMax= 0;

    self.status = null;
    self.handle = null;
    self.template = "";

    self.itemWidth = 0;
    self.itemHeight = 0;
    self.itemBoundary = 0;
}; Scroll.register("refresh", Refresh, Prototype);


Prototype.refresh = function(scope) {
    var self = this, $el, $item, offset, opt = self.option;

    $item = scope.$el.find(opt.refreshItem);

    if ($item && $item.length) {
        self.$item = $item;
    } else {
        self.$item = null;
    }

    if (opt.refreshEl instanceof RootMagic) {
        self.$el = opt.refreshEl;
    } else if (isTrueString(opt.refreshEl)) {
        self.$el = scope.$el.find(opt.refreshEl)
    }

    opt.refreshAirt = opt.refreshAirt.toUpperCase();

    if (self.$item && (offset = self.$item.offset())) {
        self.itemWidth  = offset.width;
        self.itemHeight = offset.height;

        if (opt.refreshAirt == "Y") {
            self.itemBoundary = offset.height*opt.refreshCount;
        } else {
            self.itemBoundary = offset.width*opt.refreshCount;
        }
    }

    self.computeRefresh(scope.x, scope.y);
}

Prototype.updatePage = function(page) {
    var self = this, aPage = page || self.page;

    if (self.$el && self.template) {
        self.$el.tpl(self.template, {
            pageNow: aPage,
            pageAll: self.option.refreshTotal,
        });
    }
}

Prototype.init = function(scope) {
    var self = this, cls = "", $parent,
        tmp, opt = self.option;

    cls += opt.refreshClass+"_"+opt.refreshType;
    cls += " "+opt.refreshModel;

    opt.refreshRate = parseFloat(opt.refreshRate) || 0.8;
    opt.refreshAirt = opt.refreshAirt.toUpperCase();

    tmp = opt.refreshModel == "simple" ? opt.refreshSimpleTmp
                                       : opt.refreshScrollTmp;
    tmp = tmp.replace(/{/g, "{{"); tmp = tmp.replace(/}/g, "}}");
    self.template = tmp;

    self.refresh(scope, opt);

    if (self.$el != null) {
        self.$el.addClass(cls);

        $parent = self.$el.parents(opt.refreshParent);
        if (!$parent.isEmpty()) self.$el.appendTo($parent);
    }

    self.toggleRefresh(false);
    self.updatePage(1);
}

Prototype.computeRefresh = throttle(function(scrollX, scrollY) {
    var self = this, opt = self.option,
        size = self.itemBoundary, tmp, page, rate, isBound;

    if (opt.refreshAirt == "Y") {
        page = Math.abs(parseInt(scrollY/size))+1;
        rate = Math.abs(scrollY%size/size);
        isBound = rate >= opt.refreshRate;
    } else {
        page = Math.abs(parseInt(scrollX/size))+1;
        rate = Math.abs(scrollX%size/size);
        isBound = rate >= opt.refreshRate;
    }

    if (page != self.page) {
        self.page = page;
        self.updatePage(page);
    }

    if ((page+1) > self.pageMax && isBound) {
        self.pageMax = page+1;

        if (isFunction(opt.refreshBound)) {
            var defer = Defer().then(function() {
                self.scope.refresh();
            });

            opt.refreshBound(self.pageMax, defer);
        }
    }

    if (isFunction(opt.refreshMove)) {
        opt.refreshMove(scrollX, scrollY);
    }
}, 200);

Prototype.toggleRefresh = function(show) {
    var self = this, $el = self.$el, opt = self.option;

    if (show && self.status != "show") {
        $el.removeClass(opt.refreshHide);
        self.status = "show";
    } else if (!show && self.status != "hide") {
        $el.addClass(opt.refreshHide);
        self.status = "hide";
    }
}

Prototype.move = function(e, touches, root, translate) {
    var scrollX = root.x + translate.scrollX,
        scrollY = root.y + translate.scrollY;

    this.toggleRefresh(true);
    this.computeRefresh(scrollX, scrollY);
}

Prototype.end = function(e, touches, root, translate) {
    var self = this, $el = self.$el, transM;

    transM = root.computeScroll(e.velocity);

    // 没动画效果，直接隐藏
    if (Math.abs(transM.scroll) < 5) {
        self.toggleRefresh(false);
    } else {
        self.handle = setTimeout(function() {
            self.toggleRefresh(false);
        }, transM.duration+50);

        root.once("boundry", function() {
            clearTimeout(self.handle);
            self.toggleRefresh(false);
        });

        root.once("animated", function() {
            self.toggleRefresh(false);
        });
    }
}

Prototype.scroll = function(root, scrollX, scrollY) {
    var self = this, opt = self.option;

    scrollX += root.x; scrollY += root.y;

    if (opt.refreshModel == "simple") {
        self.computeRefresh(scrollX, scrollY);
    }
}

export default Refresh;

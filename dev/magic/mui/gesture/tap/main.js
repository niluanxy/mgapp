import RootMagic from "MG_MAGIC/main.js";
import {each, throttle} from "LIB_MINJS/utils.js";
import {time as getTime} from "MG_STATIC/utils/main.js";
import Gesture from "MG_UIKIT/gesture/core/main.js";
import $config from "MG_UIKIT/base/config.js";

var CFG = $config.tap = {
    active: $config.active,
    activeItem : '.touch',
    activeShow : 150,
    activeDelay: 200,
    activeClear: true,              // 移动时，是否清除激活效果

    pixMove :  5,
    badMove : 30,
    moveMode: "pix",
    throttle: 16,

    doubleTime  : 140,
    maxTapTime  : 250,

    hideKeyboard: true,
    preventClick: false,
}, TapCore = {
    startX: 0,
    startY: 0,
    startTime: 0,

    activeTime : 0,
    activeItems: RootMagic(),
    activeHandle: null,

    lastInput: null,
    preventCount: 0,

    clearActive: function(saveTime) {
        delayClear(this.activeHandle);
        this.activeItems.removeClass(CFG.active, true);
        this.activeTime = saveTime ? getTime() : 0;
    },

    addActive: function() {
        delayClear(this.activeHandle);
        this.activeItems.addClass(CFG.active, true);
        this.activeTime = getTime();
    }
}, delay = setTimeout, delayClear = clearTimeout;

function findActive(target) {
    var finds = RootMagic(), test = CFG.activeItem.split(" "), $test;

    $test = RootMagic(target).parents().push(target);

    each(test, function(i, match) {
        finds.push($test.eq(match));
    });

    return finds;
}

function notMove(touch, mode) {
    var mode  = mode || CFG.moveMode,
        space = mode == "pix" ? CFG.pixMove : CFG.badMove;

    return (Math.abs(touch.pageX - TapCore.startX) < space) &&
           (Math.abs(touch.pageY - TapCore.startY) < space);
}

(Gesture.tapInit = function() {
    Gesture.off("start.tap").on("start.tap", function(event, touch, touches) {
        var self = this, addDelay = CFG.activeDelay || 0;

        if (self.startTime - TapCore.startTime > CFG.doubleTime) {
            TapCore.startX = touch.pageX;
            TapCore.startY = touch.pageY;
            TapCore.startTime = self.startTime;

            TapCore.clearActive();
            TapCore.activeItems = findActive(event.target);
            TapCore.activeHandle = delay(function() {
                TapCore.addActive();
            }, addDelay);
        } else {
            TapCore.startX = 0;
            TapCore.startY = 0;
        }
    }).off("move.tap").on("move.tap", throttle(function(event, touch, touches) {
        var actClass = CFG.active;

        // 如果移动了，则清除元素 class 类效果
        if (CFG.activeClear && !notMove(touch)) {
            TapCore.clearActive(true);
        }
    }, CFG.throttle)).off("end.tap").on("end.tap", function(event, touch, touches) {
        var self = this, space = self.endTime - TapCore.startTime,
            actTime = TapCore.activeTime, clrDelay = CFG.activeShow;

        if (space < CFG.maxTapTime && notMove(touch)) {
            RootMagic(event.target).emit("tap");
        }

        // 如果未添加 active , 不缩减显示时间
        if (actTime <= 0) {
            TapCore.addActive();
        } else {
            clrDelay = clrDelay - (getTime() - actTime);
            clrDelay = clrDelay > 0 ? clrDelay : 0;
        }

        TapCore.activeHandle = delay(function() {
            TapCore.clearActive();
        }, clrDelay);
    });
})();

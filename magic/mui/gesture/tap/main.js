import RootMagic from "CORE_MAGIC/main.js";
import {each} from "LIB_MINJS/utils.js";
import {time as getTime} from "CORE_STATIC/util/main.js";
import Gesture from "MUI/gesture/core/main.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.tap = {
    active: $config.ui.active,
    activeItem : '.touch .tabs-item [class|="button"]',
    activeShow : 150,
    activeDelay: 200,
    activeClear: true,              // 移动时，是否清除激活效果

    pixMove :  5,
    badMove : 30,
    moveMode: "pix",

    doubleTime  : 140,
    maxTapTime  : 240,

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
    Gesture.off("start.tap").on("start.tap", function(touches, event, scope) {
        var touch = touches[0] || {}, addDelay = CFG.activeDelay || 0;

        if (scope.startTime - TapCore.startTime > CFG.doubleTime) {
            TapCore.startX = touch.pageX;
            TapCore.startY = touch.pageY;
            TapCore.startTime = scope.startTime;

            TapCore.clearActive();
            TapCore.activeItems = findActive(event.target);
            TapCore.activeHandle = delay(function() {
                TapCore.addActive();
            }, addDelay);
        } else {
            TapCore.startX = 0;
            TapCore.startY = 0;
        }
    }).off("move.tap").on("move.tap", function(touches, event, scope) {
        var actClass = CFG.active, touch = touches[0] || {};

        // 如果移动了，则清除元素 class 类效果
        if (CFG.activeClear && !notMove(touch)) {
            TapCore.clearActive(true);
        }
    }).off("end.tap").on("end.tap", function(touches, event, scope) {
        var touch = touches[0] || {},
            space = scope.endTime - TapCore.startTime,
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
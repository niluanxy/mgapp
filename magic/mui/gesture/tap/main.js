import RootMagic from "CORE_MAGIC/main.js";
import Gesture from "MUI/gesture/core/main.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.tap = {
    activeItem: $config.ui.activeItem,

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

    lastTime : 0,
    lastInput: null,
    preventCount: 0,
};

function notMove(touch) {
    var space = CFG.moveMode == "pix" ? CFG.pixMove : CFG.badMove;

    return (Math.abs(touch.pageX - TapCore.startX) < space) &&
           (Math.abs(touch.pageY - TapCore.startY) < space);
}

Gesture.on("start.tap", function(touch, event, scope) {
    touch = touch[0] || {};

    if (scope.startTime - TapCore.lastTime > CFG.doubleTime) {
        TapCore.startX = touch.pageX;
        TapCore.startY = touch.pageY;
        TapCore.lastTime = scope.startTime;
    } else {
        TapCore.startX = 0;
        TapCore.startY = 0;
    }
});

Gesture.on("end.tap", function(touch, event, scope) {
    touch = touch[0] || {};

    if (scope.endTime - TapCore.lastTime < CFG.maxTapTime && notMove(touch)) {
        console.log("should run once tap");
        console.log(event);
        RootMagic(event.target).emit("tap");
    } else {
        console.log("don't run once tap");
    }
});
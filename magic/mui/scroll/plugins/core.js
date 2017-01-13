import {default as Scroll, Plugins} from "MUI/scroll/core/main.js";
import {extend} from "LIB_MINJS/utils.js";

var Prototype = {}, Name = "core", ABS = Math.abs;

function Core(scope, option) {
    this.scope = scope;

    this.thresholdX = 0;
    this.thresholdY = 0;

    this.option = extend({}, option);
};
Core.prototype = Prototype; Core.uuid = Name; Plugins[Name] = Core;

Prototype.start = function(e, touches, root, translate) {
    var self = this, scrollX, scrollY;

    scrollX = root.getScroll("x");
    scrollY = root.getScroll("y");

    self.thresholdX = scrollX;
    self.thresholdY = scrollY;

    return extend(translate, {
        scrollX: scrollX,
        scrollY: scrollY,
    });
}

Prototype.scroll = function(e, touches, root, translate) {
    var self = this, ropt = root.option,
        rate, minX, minY, maxX, maxY, scrollX, scrollY;

    rate = ropt.boundryAcceleration;
    minX = root.minScrollX; minY = root.minScrollY;
    maxX = root.maxScrollX; maxY = root.maxScrollY;

    if (!ropt.lockX) scrollX = self.thresholdX + e.deltaX;
    if (!ropt.lockY) scrollY = self.thresholdY + e.deltaY;

    // 超过边界，滚动速率放慢
    if (ropt.boundry) {
        scrollX = scrollX > minX ? (scrollX-minX)*rate+minX : scrollX;
        scrollX = scrollX < maxX ? (scrollX-maxX)*rate+maxX : scrollX;

        scrollY = scrollY > minY ? (scrollY-minY)*rate+minY : scrollY;
        scrollY = scrollY < maxY ? (scrollY-maxY)*rate+maxY : scrollY;
    } else {
        scrollX = scrollX > minX ? minX : scrollX < maxX ? maxX : scrollX;
        scrollY = scrollY > minY ? minY : scrollY < maxY ? maxY : scrollY;
    }

    return extend(translate, {
        scrollX: scrollX,
        scrollY: scrollY,
    });
}

Prototype.end = function(e, touches, root, translate) {
    var self = this, ropt = root.option,
        lockX, lockY, minus, duration, animate,
        vel, velX, velY, minX, minY, maxX, maxY, transM;

    lockX = ropt.lockX; lockY = ropt.lockY;

    minX = root.minScrollX; minY = root.minScrollY;
    maxX = root.maxScrollX; maxY = root.maxScrollY;

    vel = e.velocity; velX = e.velocityX; velY = e.velocityY;

    if (ABS(vel) > ropt.velocityMin) {
        transM = root.computeScroll(vel);

        if (!lockY || !lockX) {
            transM.scroll = ABS(transM.scroll);

            if (!lockX) {
                minus = velX/ABS(velX);
                scrollX = transM.scroll*minus + self.thresholdX + e.deltaX;
            } else {
                minus = velY/ABS(velY);
                scrollY = transM.scroll*minus + self.thresholdY + e.deltaY;
            }
        } else {
            scrollX = root.computeScroll(velX).scroll;
            scrollY = root.computeScroll(velY).scroll;
        }

        animate = transM.easing;
        duration= transM.duration;
    } else {
        scrollX  = root.x;
        scrollY  = root.y;
        duration = 0;
        animate  = "";
    }

    // 没有越界，且没动画效果，则直接更新状态，触发事件
    if (!duration && scrollX <= minX && scrollX >= maxX && scrollY <= minY && scrollY >= maxY) {
        translate.scrollX = root.x;
        translate.scrollY = root.y;
    } else {
        extend(translate, {
            scrollX: scrollX,
            scrollY: scrollY,

            animate : animate,
            duration: duration,
        });
    }

    return translate;
}

export default Core;

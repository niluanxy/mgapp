import Scroll from "MUI/scroll/core/main.js";
import {extend} from "LIB_MINJS/utils.js";

var Prototype = {}, ABS = Math.abs;

export default function Core(scope, option) {
    this.scope = scope;

    this.thresholdX = 0;
    this.thresholdY = 0;

    this.option = extend({}, option);
}; Scroll.register("core", Core, Prototype);



Prototype.start = function(e, touches, root, translate) {
    var self = this, scrollX, scrollY;

    scrollX = translate.scrollX || root.getScroll("x");
    scrollY = translate.scrollY || root.getScroll("y");

    // 防止暂停动画时，已经越界太多，导致页面空白问题
    // if (root.boundryCheck()) {
    //     if (scrollX < root.maxScrollX) {
    //         scrollX = scrollX < root.boundryBomX ? root.boundryBomX : scrollX;
    //     } else {
    //         scrollX = scrollX > root.boundryTopX ? root.boundryTopX : scrollX;
    //     }
    //
    //     if (scrollY < root.maxScrollY) {
    //         scrollY = scrollY < root.boundryBomY ? root.boundryBomY : scrollY;
    //     } else {
    //         scrollY = scrollY > root.boundryTopY ? root.boundryTopY : scrollY;
    //     }
    // }

    self.thresholdX = scrollX;
    self.thresholdY = scrollY;

    extend(translate, {
        scrollX: scrollX,
        scrollY: scrollY,
    });
}

Prototype.scroll = function(e, touches, root, translate) {
    var self = this, rootOpt = root.option,
        rate, minX, minY, maxX, maxY, scrollX, scrollY;

    rate = rootOpt.boundryAcceleration;
    minX = root.minScrollX; minY = root.minScrollY;
    maxX = root.maxScrollX; maxY = root.maxScrollY;

    if (!rootOpt.lockX) scrollX = self.thresholdX + e.deltaX;
    if (!rootOpt.lockY) scrollY = self.thresholdY + e.deltaY;

    // 超过边界，滚动速率放慢
    if (rootOpt.boundry) {
        scrollX = scrollX > minX ? (scrollX-minX)*rate+minX : scrollX;
        scrollX = scrollX < maxX ? (scrollX-maxX)*rate+maxX : scrollX;

        scrollY = scrollY > minY ? (scrollY-minY)*rate+minY : scrollY;
        scrollY = scrollY < maxY ? (scrollY-maxY)*rate+maxY : scrollY;
    } else {
        scrollX = scrollX > minX ? minX : scrollX < maxX ? maxX : scrollX;
        scrollY = scrollY > minY ? minY : scrollY < maxY ? maxY : scrollY;
    }

    extend(translate, {
        scrollX: scrollX,
        scrollY: scrollY,
    });
}

Prototype.end = function(e, touches, root, translate) {
    var self = this, rootOpt = root.option,
        lockX, lockY, minus, duration, animate,
        vel, velX, velY, minX, minY, maxX, maxY, transM;

    lockX = rootOpt.lockX; lockY = rootOpt.lockY;

    minX = root.minScrollX; minY = root.minScrollY;
    maxX = root.maxScrollX; maxY = root.maxScrollY;

    vel = e.velocity; velX = e.velocityX; velY = e.velocityY;

    if (ABS(vel) > rootOpt.velocityMin) {
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
    if (!duration && !root.boundryCheck()) {
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
}

import RootMagic from "CORE_MAGIC/main.js";
import {extend, value, element} from "LIB_MINJS/utils.js";
import {isElement} from "LIB_MINJS/check.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.place = {
    hideClass: "hide",

    outer    : false,
    float    : false,
    zindex   : 100,
}, Prototype = {}, OFFSET = {
    'top'    : 0,
    'left'   : 0,
    'center' : 0.5,
    'right'  : 1,
    'bottom' : 1
}, REVER = "UI_PLACE_REVER";

/**
 * 相对某元素执行定位操作
 * @param {Element}     el          [要定位的对象]
 * @param {Element}     relative    [相对定位的元素]
 * @param {String}      top         [上下定位参数及修正]
 * @param {String}      left        [左右定位参数及修正]
 *
 * option : {
 *     outer:     false [default]   [是否元素外插入，默认内部]
 *     float:     false [default]   [定位元素的 z-index 值]
 *     zindex:    100   [default]   [显示不下时是否自动浮动]
 * }
 *
 * top : ["top offset",  "center offset", "bottom offset"]
 * left: ["left offset", "center offset", "right offset"]
 *
 * 其中 offset 为元素偏移修正，为要定位元素的倍数，说明如下:
 *
 * "top -1"  表示在垂直方向，对顶布局，同时偏移定位元素自身高度
 *    的 -1 倍，即向上偏移定位元素 1.0倍 的高度距离;
 *
 * "left 0.5"  表示在平衡方向，对最左布局，同时偏移定位元素自身
 *    宽度的 0.5 倍，即向右偏移定位元素 0.5倍 的高度距离;
 *
 */
function relRoot(el, out) {
    var relative, node = el;

    do {
        if (out && node == el) continue;

        if (getComputedStyle(node).position != "static") {
            relative = node; break;
        }
    } while(node = el.parentNode);

    return relative || document.body;
}

export default function Place(el, relative, top, left, option) {
    var BODY = document.body;

    if (!isElement(relative)) {
        option = left; left = top;
        top = relative; relative = BODY;
    } else {
        relative = element(relative) || BODY;
    }

    el = element(el) || el;
    option = extend({}, CFG, option);

    if (!el || !top || !left) return;

    var parent, $parent, offset, $el = RootMagic(el), place = [],
        topfix, leftfix, zindex, outer, float,
        relOffset = RootMagic(relative).offset(), eleOffset;

    outer = !!option.outer;
    float = !!option.float;
    zindex = option.zindex;

    if (outer === true) {
        parent = relRoot(relative);
    } else if (outer instanceof Element) {
        parent = outer;
    } else {
        parent = relative;
    }

    $parent = RootMagic(parent);
    eleOffset = $el.offset(parent);

    if (parent != BODY && $parent.css("position") == "static") {
        $parent.css("position", "relative");
    }

    place[0] = top.split(" ");
    place[1] = left.split(" ");

    // 如果实际定位的元素不是元素自身，需要修正坐标值
    if (parent != relative) {
        var tmp = Place.outerRect(parent);
        offset = Place.outerRect(relative);

        offset.top  -= tmp.top;
        offset.left -= tmp.left;

        offset.top  += OFFSET[place[0][0]] * relOffset.height;
        offset.left += OFFSET[place[1][0]] * relOffset.width;
    } else {
        offset = {};

        offset.top  = OFFSET[place[0][0]] * relOffset.height;
        offset.left = OFFSET[place[1][0]] * relOffset.width;
    }

    topfix  = parseFloat(place[0][1]) || 0;
    leftfix = parseFloat(place[1][1]) || 0;

    offset.top  += eleOffset.height * topfix;
    offset.left += eleOffset.width  * leftfix;

    // 重置元素位置反转标记
    $el.data(REVER, false);

    // 如果设置了自动浮动，检测是否超出显示
    if (float === true) {
        var screen = RootMagic(document).offset(),
            fwidth = eleOffset.width - relOffset.width,
            fheight= eleOffset.height + relOffset.height,
            pleft  = place[1][0] == "left",
            pbottom= place[0][0] == "bottom", rever = false;

        if (pleft && relOffset.left + eleOffset.width > screen.width) {
            offset.left -= fwidth;
            rever = true;
        } else if (!pleft && relOffset.left - fwidth < 0) {
            offset.left += fwidth;
            rever = true;
        }

        if (pbottom && relOffset.top + fheight > screen.height) {
            offset.top -= fheight;
            rever = true;
        } else if (!pbottom && offset.top < 0 && relOffset.top - eleOffset.height < 0) {
            offset.top += fheight;
            rever = true;
        }

        if ($el[0] && rever) $el.data(REVER, true);
    }

    $el.css("top", offset.top+"px");
    $el.css("left", offset.left+"px");
    $el.css("z-index", zindex);
    $el.css("position", "absolute");

    $el.appendTo(parent);
};

// 绑定到 RootMagic 调用链上
RootMagic.extend({place: function(el, relative, top, left, option) {
    Place(el, relative, top, left, option);
}});

RootMagic.fn.extend({place: function(el, top, left, option) {
    Place(el, this[0], top, left, option);
}});
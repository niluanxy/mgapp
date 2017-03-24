import MagicVue from "MV_CORE/base/main.js";
import RootMagic from "MG_CORE/build.js";
import Tip from "MG_UIKIT/tip/main.js";
import Ready from "LIB_MINJS/ready.js";

import ConfigUI from "MV_UIKIT/base/config.js";

var CFG = ConfigUI.tip = {};

MagicVue.$bind(function() {
    CFG.insertTo = MagicVue.$root;

    var $tip = new Tip(null, {
        insertTo: CFG.insertTo,
    }).init();

    MagicVue.tip = function(text, icon, extOption) {
        $tip.show(text, icon, extOption);
    }

    MagicVue.tipHide = function() {
        $tip.hide();
    }

    /* 创建缓存对象，初始化 svg 动画图标 */
    var $cache = $('<div class="tip" style="visibility: hidden;'+
        ' position: absolute;'+
        '"><i class="icon loading"></i></div>');

    $cache.appendTo(CFG.insertTo);
    setTimeout(function() { $cache.remove(); }, 500);
});

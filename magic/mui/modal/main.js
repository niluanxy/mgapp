import RootMagic from "CORE_MAGIC/main.js";
import Popup from "MUI/popup/main.js";
import $config from "CORE_MAGIC/config.js";

var CFG = $config.modal = {
    insertTo : "body", 

    wrapClass: "pop-item modal",
    autoClose: "modal-close",
}, SHOWS = "UI_POPUP_SHOW", INDEX = "UI_POPUP_INDEX";

/**
 * option: {
 *     insertTo: [string || DOM] 要插入的位置
 *     autoHide: [boolean] 点击背景是否自动隐藏，默认 false
 * }
 */
export default function Modal(el, option) {
    this.$el = el;
    this.$wrap  = null;
    this.$ctrl  = null;
    this.isHide = true;
    this.option = extend({}, $config.ui, CFG, option);
}

Modal.prototype.init = function() {

}


// 绑定到 RootMagic 调用链上
RootMagic.fn.extend({modal: function(el, option) {
    var ext = extend({}, option, {insertTo: this[0]});
    return new Popup(el, ext).init();
}});

RootMagic.extend({modal: function(el, option) {
    return new Popup(el, option).init();
}})
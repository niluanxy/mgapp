import MagicVue from "public/magic/build.js";

require("public/main.css");     // 全局公用样式文件加载

MagicVue.$mount("#mgapp", function() {
    var load = MagicVue.loadView, init = MagicVue.initView;

    MagicVue.route({
        "/home": {
            header: "首页测试",
            on: load("home", require("pages/home")),
        },

        "/user": {
            header: "用户中心",
            on: load("user", function(resolve, name) {
                require(["pages/user"], init(resolve, name));
            }),
        }
    }).init({
        home: "home",
    }, true);
});

export default MagicVue;

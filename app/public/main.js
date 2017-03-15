import MagicVue from "PUBLIC/magic/build.js";

MagicVue.$mount("#mgapp", function() {
    var load = MagicVue.loadView, init = MagicVue.initView;

    MagicVue.route({
        "/home": {
            title: "首页测试",
            on: load("home", require("pages/home")),
        },

        "/user": {
            title: "用户中心",
            on: load("user", function(resolve, name) {
                require(["pages/user"], init(resolve, name));
            }),
        }
    }).init({
        home: "home",
    }, true);
});

export default MagicVue;

$$.$mount("#mgapp", function() {
    var load = $$.loadView, init = $$.initView;

    $$.route({
        "/home": {
            title: "首页",
            on: load("home", function(resolve, name) {
                setTimeout(function() {
                    init(resolve, name)({
                        template: "<mg-page>"+
                            '<mg-header><h3 class="title">{{title}}</h3></mg-header>'+
                            '<mg-content>'+
                                '<input type="text" v-model="print"></br>'+
                                '<p v-for="x in 10">{{print}}</p>'+
                                '<mg-button :disabled="dis" block="true" link="#user">你好</mg-button>'+
                                '<a class="button-primary" @click="root">root</a>'+
                                '<a class="button-primary" @click="log">log</a>'+
                                '<mg-tabs striped="true" :select="sel">'+
                                    '<mg-tabs-item>用户</mg-tabs-item>'+
                                    '<mg-tabs-item>商品</mg-tabs-item>'+
                                    '<mg-tabs-item>列表</mg-tabs-item>'+
                                '</mg-tabs>'+
                            '</mg-content>'+
                        "</mg-page>",

                        data: {
                            title: "首页测试",
                            print: "default",
                            dis: false,
                            sel: 2,
                        },

                        methods: {
                            root: function() {
                                this.dis = !this.dis;
                                console.log(this.dis);
                            },

                            log: function() {
                                this.sel++;
                                if (this.sel > 2) this.sel = 0;
                                console.log(this.sel);
                            }
                        }
                    });
            	}, 100);
            }),
        },

        "/user": {
            title: "用户中心",
            on: load("user", {
                template: "<div><div>user name: {{name}}</div><ma-home></ma-home></div>",
                data: {
                    name: "jack",
                }
            }),
        },
    }).init({
        home: "home",
    }, true);
});

$$.$mount("#mgapp", function() {
    var load = $$.loadView, init = $$.initView;

    $$.route({
        "/home": {
            title: "首页测试",
            on: load("home", function(resolve, name) {
                setTimeout(function() {
                    init(resolve, name)({
                        template: "<mg-page>"+
                            '<mg-header><h3 class="title">{{title}}</h3></mg-header>'+
                            '<mg-content>'+
                                '<input type="text" v-model="print"></br>'+
                                '<p v-for="x in 10">{{print}}</p>'+
                                '<mg-button :disabled="dis" block="true" link="#user">user</mg-button>'+
                                '<mg-button  block="true" link="#home">home</mg-button>'+
                                '<mg-button block="true" @tap="back">back</mg-button>'+
                                '<mg-button block="true" link="#shop/123">shop</mg-button>'+
                                '<mg-button @tap="root">root</mg-button>'+
                                '<mg-button @click="log">log</mg-button>'+
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
                            },

                            back: function() {
                                $$.location.back();
                            }
                        }
                    });
            	}, 1000);
            }),
        },

        "/user": {
            title: "用户中心",
            on: load("user", {
                template: "<mg-page>"+
                    "<mg-header><h3 class='title'>{{title}}</h3></mg-header>"+
                    "<mg-content>"+
                        "<div>user name: {{name}}</div>"+
                        '<mg-button block="true" link="#user">user</mg-button>'+
                        '<mg-button block="true" link="#home">home</mg-button>'+
                        '<mg-button block="true" link="#shop/123">shop</mg-button>'+
                        '<mg-button block="true" @tap="back">back</mg-button>'+
                    "</mg-content>"+
                "</mg-page>",

                data: {
                    name: "jack",
                    title: "用户中心"
                },

                methods: {
                    back: function() {
                        $$.location.back();
                    }
                }
            }),
        },

        "/shop/:shopid": {
            title: "商品中心",
            on: load("shop", {
                template: "<mg-page>"+
                    "<mg-header><h3 class='title'>{{title}}</h3></mg-header>"+
                    "<mg-content>"+
                        "<div>user name: {{name}}</div>"+
                        '<mg-button block="true" link="#user">user</mg-button>'+
                        '<mg-button block="true" link="#home">home</mg-button>'+
                        '<mg-button block="true" link="#shop">shop</mg-button>'+
                    "</mg-content>"+
                "</mg-page>",

                data: {
                    name: "jack",
                    title: "商品中心"
                },
            }),
        }
    }).init({
        home: "home",
    }, true);
});

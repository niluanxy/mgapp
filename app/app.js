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
                            '<input type="text" v-model="print"></br>'+
                            '<p>{{print}}</p>'+
                            '<a class="button-primary" @click="root">root</a>'+
                            '<a class="button-primary" @click="log">log</a>'+
                        "</mg-page>",

                        data: {
                            title: "首页测试",
                            print: "default",
                        },

                        methods: {
                            root: function() {
                                console.log(this);
                            },

                            log: function() {
                                console.log("hello world: "+this.print);
                            }
                        }
                    });
            	}, 3000);
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

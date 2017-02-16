$$.$mount("#mgapp", function() {
    var load = $$.loadView, init = $$.initView;

    Vue.component("ma-home", function(resolve) {
    	setTimeout(function() {
            init(resolve)({
                template: "<div>"+
                    '<input type="text" v-model="print"></br>'+
                    '<p>{{print}}</p>'+
                    '<a class="button-primary" @click="root">root</a>'+
                    '<a class="button-primary" @click="log">log</a>'+
                "</div>",

                data: {
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
    });

    $$.route({
        "/home": {
            title: "首页",
            on: function() {
                // new Vue({
                //     el: $$.$root,
                //     template: "<ma-home></ma-home>"
                // })
                $$.renderView("ma-home")
            },
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
    }).init(null, true);
});

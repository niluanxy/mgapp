module.exports = {
    style: require("./style.css"),
    template: require("./template.html"),

    data: {
        title: "首页测试 ###",
        print: "default 111",
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
            console.log(this)
        },

        back: function() {
            $$.location.back();
        }
    }
}

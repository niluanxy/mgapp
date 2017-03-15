module.exports = {
    template: require("./template.html"),

    data: {
        name: "jack",
        title: "用户中心",
        test: {age: 123, name: "params"},
    },

    methods: {
        back: function() {
            $$.location.back();
        }
    }
}

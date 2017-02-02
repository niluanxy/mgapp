$(function() {
    var route = $.router(null, {home: "user"}); window.route = route;

    function delog(url, type, routeGo, routeLast) {
        // console.log("======================")
        // console.log("url:    "+url);
        // console.log("type:   "+type);
        // console.log("params: "+JSON.stringify(routeGo.params));
        $("#result").append("<p>"+type+" -- "+url+"</p>");
        // $.fastCall(function() {
        //     console.log(route.stack)
        // })
    }

    route.on("/user", delog);
    route.on("/user/main", delog);
    route.on("list", delog);
    route.on("list/good/:goodid", delog);
    route.on({
        "/allocation": {
            auth: 2,

            "/list/:type/:status/:day_fr/:day_to": {
                title: "调拨",
                on: delog,
            },
            "/create": {
                title: "新建调拨单",
                on: delog,
            },

            "/shop/:good/user/:item": {
                title: "test",
                on: delog,
            }
        }
    })
    route.on("shop/user/main", delog);
    route.init();

    $("#one").on("click", function() {
        route.go("user");
    })

    $("#two").on("click", function() {
        route.go("/user/main");
    })

    $("#three").on("click", function() {
        route.go("list");
    })

    $("#four").on("click", function() {
        route.go("/list/good/1001");
    })

    $("#five").on("click", function() {
        route.go("/list/good/2001");
    })

    $("#six").on("click", function() {
        route.go("/list/good/2001", null, null, true);
    })

    $("#back").on("click", function() {
        route.back();
    })

    $("#backone").on("click", function() {
        route.back("user");
    })

    $("body").on("tap", function() {
        console.log("body tap dispatch")
    })

    $("body").on("tap", "#one", function() {
        console.log("body one tap dispatch")
    })

    window.ctrl = $("#scroll").scroll({
        plugins: "snap",
        snapResize: 8,
        // lockY: true, lockX: false,
    });

    window.slider = $("#slider").slider({
        
    });
})

var gulp                = require("gulp-param")(require("gulp"), process.argv),
    Q                   = require("q"),
    open                = require("opn"),
    webpack             = require("webpack"),
    webpackDevServer    = require("webpack-dev-server"),
    webSocket           = require('ws');


var DIR    = require("./base").DIR,
    ALIAS  = require("./base").ALIAS,
    CONCAT = require("./base").CONCAT,
    log    = require("./base").log,

    task_mixin_build = require("./mixin").build,

    task_minjs_build = require("./minjs").build,

    task_magic_build = require("./magic").build,

    task_mgvue_main_build  = require("./mgvue").buildMain,
    task_mgvue_style_build = require("./mgvue").buildStyle,

    task_mgapp_main_build  = require("./mgapp").buildMain,
    task_mgapp_style_build = require("./mgapp").buildStyle,
    task_mgapp_assets_build= require("./mgapp").buildAssets,
    task_mgapp_main_fix    = require("./mgapp").fix,
    task_mgapp_config      = require("./mgapp").config,
    task_mgapp_callback    = require("./mgapp").callback;


function startDebugWatch() {
    gulp.watch([DIR.MIXIN+"**/*"]).on("change", task_mixin_build);
    gulp.watch([DIR.MINJS+"**/*.js"]).on("change", task_minjs_build);

    gulp.watch([DIR.MAGIC+"**/*.js", DIR.MINJS+"**/*.js"])
            .on("change", task_magic_build);

    gulp.watch([DIR.MIXIN+"**/*", DIR.MGVUE+"style/**/*"])
            .on("change", task_mgvue_style_build);
    gulp.watch([DIR.MAGIC+"**/*.js", DIR.MINJS+"**/*.js",
                DIR.MGVUE+"**/*.js", DIR.MINJS+"**/*.js"])
            .on("change", task_mgvue_main_build);
}

function startDevWatch() {
    var wss = new webSocket.Server({ port: 3001 });

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function(client) {
            if (client.readyState === webSocket.OPEN) {
                client.send(data);
            }
        });
    };

    gulp.watch([DIR.MIXIN+"**/*", DIR.MGVUE+"style/**/*",
                DIR.APP_PUBLIC+"**/*.scss", DIR.APP_MODULE+"**/*.scss",
                "!"+DIR.APP_PUBLIC+"style/mixin.scss"])
        .on("change", task_mgapp_style_build);

    gulp.watch([DIR.APP+"index.html", DIR.APP_ASSETS+"**/*",
                "!"+DIR.APP_ASSETS+"debug"])
        .on("change", function() {
            task_mgapp_assets_build().then(function() {
                wss.broadcast("_MG_RELOAD_");
            });
        });

    gulp.watch([DIR.MINJS+"**/*.js", DIR.MAGIC+"**/*.js",
                DIR.MGVUE+"**/*.js", DIR.APP_PUBLIC+"**/*.js",
                DIR.APP_MODULE+"**/*.js"])
        .on("change", function() {
            task_mgapp_main_build().then(function() {
                wss.broadcast("_MG_RELOAD_");
            });
        });
}

function startServer(d, r) {
    var args = arguments, server, compile, DEBUG, RELEASE,
        defer_build = Q.defer(), defer_assets = Q.defer();

    DEBUG = args[0] ? true : false;
    RELEASE = args[1] ? true : false;
    process.env.NODE_ENV = args[1] ? 'production' : 'development';

    if (DEBUG === true) startDebugWatch();

    if (RELEASE === false) {
        Q.all([task_mgapp_style_build(), task_mgapp_assets_build()])
        .then(function() { defer_assets.resolve() });

        compile = webpack(task_mgapp_config());
        compile.run(task_mgapp_callback(function(error) {
            if (!error) defer_build.resolve();
        }));

        Q.all([defer_assets.promise, defer_build.promise])
        .then(function() {
            task_mgapp_main_fix().then(function() {
                log("--- mgapp main build finish");

                server = new webpackDevServer(compile, {
                    hot: true, noInfo: true, quiet: true,
                    publicPath: '/pages/', contentBase: DIR.APP_DIST,
                });

                server.listen(3000, "0.0.0.0", function() {
                    log("----------------------------------------------", "verbose");
                    log("Server has run on http://localhost:3000", "verbose");
                    log("----------------------------------------------", "verbose");
                    open("http://localhost:3000");
                });
            });
        });

        startDevWatch();    // 开启自动刷新功能
    } else {
        task_build().then(function() {
            browserSync.init({
                server: { baseDir: DIR.APP_DIST }
            });
        });
    }
}

module.exports = {
    server: startServer,
};

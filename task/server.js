var gulp                = require("gulp-param")(require("gulp"), process.argv),
    extend              = require("extend"),
    Q                   = require("q"),
    extend              = require("extend"),
    source              = require("vinyl-source-stream"),
    rollup              = require("rollup-stream"),
    replace             = require("gulp-replace"),
    rollupReplace       = require("rollup-plugin-replace"),
    rollupAlias         = require("rollup-plugin-alias"),
    rollupUglify        = require("rollup-plugin-uglify"),
    del                 = require("del"),
    concat              = require("gulp-concat"),
    px2rem              = require("gulp-px2rem"),
    gulpif              = require("gulp-if"),
    autoprefixer        = require("gulp-autoprefixer"),
    sass                = require("gulp-sass"),
    minifycss           = require("gulp-clean-css"),
    fs                  = require("fs"),
    webpack             = require("webpack"),
    open                = require("opn"),
    webpackUglifyJS     = require('uglifyjs-webpack-plugin'),
    webSocket           = require('ws');


import {DIR, ALIAS, CONCAT, log} from "base.js";
import {px2remConfig} from "mixin.js";

import {task_mixin_style_build} from "mixin.js";
import {task_minjs_build} from "minjs.js";
import {task_magic_build} from "magic.js";
import {task_mgvue_main_build, task_mgvue_style_build} from "mgvue.js";
import {task_mgapp_main_build, task_mgapp_main_fix,
        task_mgapp_assets_build, task_mgapp_style_build,
        createConfig, webpackCallback} from "mgapp.js";

function debugWatch() {
    gulp.watch([DIR_MIXIN+"**/*"]).on("change", task_mixin_build);
    gulp.watch([DIR_MINJS+"**/*.js"]).on("change", task_minjs_build);

    gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js"])
            .on("change", task_magic_build);

    gulp.watch([DIR_MIXIN+"**/*", DIR_MGVUE+"style/**/*"])
            .on("change", task_mgvue_style_build);
    gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js",
                DIR_MGVUE+"**/*.js", DIR_MINJS+"**/*.js"])
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

    // gulp.watch([DIR_MIXIN+"**/*", DIR_MGVUE+"style/**/*",
    //             DIR_APP_PUBLIC+"**/*.scss", DIR_APP_MODULE+"**/*.scss",
    //             "!"+DIR_APP_PUBLIC+"style/mixin.scss"])
    //     .on("change", task_build_mgapp_style);
    //
    // gulp.watch([DIR_APP+"index.html", DIR_APP_ASSETS+"**/*",
    //             "!"+DIR_APP_ASSETS+"debug"])
    //     .on("change", task_build_mgapp_assets);

    gulp.watch([DIR_MINJS+"**/*.js", DIR_MAGIC+"**/*.js",
                DIR_MGVUE+"**/*.js", DIR_APP_PUBLIC+"**/*.js",
                DIR_APP_MODULE+"**/*.js"])
        .on("change", function() {
            task_mgapp_main_build().then(function() {
                wss.broadcast("_MG_RELOAD_");
            });
        });
}

export function task_build_all() {

}

export function task_build() {

}

export function server(d, r) {
    var args = arguments, DEBUG, server, compile, wss,
        defer_build = Q.defer(), defer_assets = Q.defer();

    DEBUG = args[0] ? true : false;
    RELEASE = args[1] ? true : false;
    process.env.NODE_ENV = args[1] ? 'production' : 'development';

    if (DEBUG === true) debugWatch();

    if (RELEASE === false) {
        Q.all([
            task_mgapp_style_build()
            task_mgapp_assets_build(),
        ]).then(function() {
            defer_assets.resolve();
        });

        compile = webpack(createConfig());
        compile.run(webpackCallback(function(error) {
            if (!error) defer_build.resolve();
        }));

        Q.all([defer_assets.promise, defer_build.promise])
        .then(function() {
            task_mgapp_main_fix().then(function() {
                server = new webpackDevServer(compile, {
                    hot: true, noInfo: true, quiet: true,
                    publicPath: '/pages/', contentBase: DIR_APP_DIST,
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
                server: { baseDir: DIR_APP_DIST }
            });
        });
    }
}

var gulp                = require("gulp-param")(require("gulp"), process.argv),
    del                 = require("del"),
    Q                   = require("q"),
    extend              = require("extend"),
    source              = require("vinyl-source-stream"),
    rollup              = require("rollup-stream"),
    rollupReplace       = require("rollup-plugin-replace"),
    rollupAlias         = require("rollup-plugin-alias"),
    rollupUglify        = require("rollup-plugin-uglify");

var DIR   = require("./base").DIR,
    ALIAS = require("./base").ALIAS,
    log   = require("./base").log;

function createPlugins(moduleName) {
    var RELEASE = process.env.NODE_ENV == 'production';

    return [
        rollupAlias(extend({}, ALIAS)),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: RELEASE ? '"production"' : '"development"',
        }),
        (RELEASE && rollupUglify({ mangle: { except: [moduleName] } })),
    ];
}

function task_router_build() {
    var defer_build = Q.defer();

    del(DIR.APP_ASSETS+"emitter.js").then(function() {
        rollup({
            entry: DIR.MINJS+"emitter.js",
            format: 'umd', exports: 'named',
            moduleName: "Emitter", plugins: createPlugins("Emitter"),
        })
        .pipe(source('emitter.js'))
        .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- minjs emitter.js build finish");
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}

function task_emiter_build() {
    var defer_build = Q.defer();

    del(DIR.APP_ASSETS+"router.js").then(function() {
        rollup({
            entry: DIR.MINJS+"router.js",
            format: 'umd', exports: 'named',
            moduleName: "Router", plugins: createPlugins("Router"),
        })
        .pipe(source('router.js'))
        .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- minjs router.js build finish");
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}

function task_minjs_build() {
    var defer_build = Q.defer();

    Q.all([
        task_router_build(),
        task_emiter_build()
    ]).then(function() {
        log("minjs task all finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

module.exports = { build: task_minjs_build };

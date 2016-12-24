var gulp                = require("gulp-param")(require("gulp"), process.argv),
    shell               = require("gulp-shell"),
    Q                   = require("q"),
    del                 = require("del"),
    moment              = require("moment"),
    colors              = require("colors"),
    concat              = require("gulp-concat"),
    replace             = require("gulp-replace"),
    rename              = require("gulp-rename"),
    autoprefixer        = require("gulp-autoprefixer"),
    shell               = require("gulp-shell"),
    gulpif              = require("gulp-if"),
    minifycss           = require("gulp-clean-css"),
    px2rem              = require("gulp-px2rem"),
    browserSync         = require("browser-sync"),
    throttle            = require("throttle-debounce/throttle"),
    debounce            = require("throttle-debounce/debounce"),
    rollup              = require("rollup-stream"),
    rollupReplace       = require("rollup-plugin-replace"),
    rollupAlias         = require("rollup-plugin-alias"),
    rollupUglify        = require("rollup-plugin-uglify"),
    source              = require("vinyl-source-stream"),
    webpack             = require("webpack-stream"),
    sass                = require("gulp-sass");

colors.setTheme({  
    silly: 'rainbow',  
    input: 'grey',  
    verbose: 'cyan',  
    prompt: 'red',  
    info: 'green',  
    data: 'blue',  
    help: 'cyan',  
    warn: 'yellow',  
    debug: 'magenta',  
    error: 'red',
    time: 'gray'
});

var px2remConfig = {
    rootValue: 20,
    unitPrecision: 5,
    propertyBlackList: [],
    propertyWhiteList: [],
    replace: true,
    mediaQuery: false,
    minPx: 3
};

var DIR_WWW   = __dirname + "/",
    DIR_MIXIN = __dirname + "/mixin/",
    DIST_MIXIN = DIR_MIXIN + "dist",

    DIR_MINJS =  __dirname + "/minjs/",
    DIR_DIST  =  __dirname + "/dist/",

    DIR_MAGIC = __dirname + "/magic/";

var DIR_MAGIC_ALIAS = {
    resolve: ['.jsx', '.js'],

    LIB_MINJS: DIR_MINJS,

    MUI: DIR_MAGIC+"mui",

    CORE_FUNCTION: DIR_MAGIC+"core/function",
    CORE_MAGIC : DIR_MAGIC+"core/magic",
    CORE_MODULE: DIR_MAGIC+"core/module",
    CORE_STATIC: DIR_MAGIC+"core/static",
};

var reload = throttle(20, function() {
    browserSync.reload();
});

function log(str, style) {
    style = style || "info";

    var _time = moment().format("HH:mm:ss").time;

    console.log("["+_time+"] "+str[style]);
}

var BUILD_RELEASE = false;

/**===============================================
 * mixin 文件合并脚本函数
 =================================================*/
function task_build_mixin() {
    var DIST_MIXIN = DIR_DIST,
        defer_core = Q.defer(),
        defer_uikit = Q.defer(),
        defer_vars = Q.defer(),
        defer_all = Q.defer();

    clear_mixin().then(function() {
        // 核心文件合并
        gulp.src([DIR_MIXIN+"core/config.scss",
            DIR_MIXIN+"core/function.scss",
            DIR_MIXIN+"core/zindex.scss",
            DIR_MIXIN+"core/color.scss",
            DIR_MIXIN+"core/text.scss",
            DIR_MIXIN+"core/base.scss"])
        .pipe(concat("mixin_core.scss"))
        .pipe(gulp.dest(DIST_MIXIN))
        .on("finish", function() { defer_core.resolve(); })

        // UI文件合并
        gulp.src([DIR_MIXIN+"uikit/tools.scss",
            DIR_MIXIN+"uikit/component/**/*.scss"])
        .pipe(concat("mixin_uikit.scss"))
        .pipe(gulp.dest(DIST_MIXIN))
        .on("finish", function() { defer_uikit.resolve(); })

        // 变量文件合并
        gulp.src([DIR_MIXIN+"uikit/varible/element/button.scss",
            DIR_MIXIN+"uikit/varible/**/*.scss"])
        .pipe(concat("mixin_vars.scss"))
        .pipe(gulp.dest(DIST_MIXIN))
        .on("finish", function() { defer_vars.resolve(); })

        return Q.all([
            defer_core.promise,
            defer_uikit.promise,
            defer_vars.promise
        ]).then(function() {
            log("--- mixin concat finish");
        });
    }).then(function() {
        gulp.src([DIST_MIXIN+"mixin_core.scss",
            DIST_MIXIN+"mixin_vars.scss",
            DIST_MIXIN+"mixin_uikit.scss",
            DIR_MIXIN+"build.scss"])
        .pipe(concat("mixin.scss"))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(BUILD_RELEASE, minifycss()))
        .pipe(gulp.dest(DIST_MIXIN))
        .on("finish", function() {
            log("mixin build to css finish");
            defer_all.resolve();
        })
    })

    return defer_all.promise;
}
gulp.task("dev-build-mixin", task_build_mixin);

function clear_mixin() {
    return del(DIST_MIXIN);
}

/**===============================================
 * minjs 文件合并脚本函数
 =================================================*/
function task_build_minjs() {
    var defer_emit = Q.defer(), defer_route = Q.defer(),
        defer_all = Q.defer(), plugins;

    plugins = [
        rollupAlias(DIR_MAGIC_ALIAS),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (BUILD_RELEASE && rollupUglify()),
    ];

    del(DIR_DIST+"emitter.js").then(function() {
        rollup({
            entry: DIR_MINJS+"emitter.js",
            format: 'umd',
            exports: "named",
            moduleName: "Emitter",
            plugins: plugins,
        })
        .pipe(source('emitter.js'))
        .pipe(gulp.dest(DIR_DIST))
        .on("finish", function() {
            log("--- minjs emitter.js build finish");
            defer_emit.resolve();
        });
    });

    del(DIR_DIST+"router.js").then(function() {
        rollup({
            entry: DIR_MINJS+"router.js",
            format: 'umd',
            moduleName: "Router",
            plugins: plugins,
        })
        .pipe(source('router.js'))
        .pipe(gulp.dest(DIR_DIST))
        .on("finish", function() {
            log("--- minjs router.js build finish");
            defer_route.resolve();
        });
    });

    Q.all([
        defer_emit.promise,
        defer_route.promise
    ]).then(function() {
        log("minjs task all finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}
gulp.task("dev-build-minjs", task_build_minjs);

/**===============================================
 * magic 文件合并脚本函数
 =================================================*/
function task_build_magic() {
    var defer_all = Q.defer(), defer_core = Q.defer(),
        defer_mui = Q.defer(), plugins,

    DIR_CORE = DIR_MAGIC+"core/",
    DIR_MUI  = DIR_MAGIC+"mui/",

    oldBuild = BUILD_RELEASE ? /(\w)(\.Magic=)(\w\(\))/
                             : /(\(global.Magic = factory\(\)\)\;)/,
    newBuild = BUILD_RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$)$1.$=$3;'
                             : '$1\n\tif(typeof define === "undefined" && !global.$) '+
                               'global.$ = factory();';

    plugins = [
        rollupAlias(DIR_MAGIC_ALIAS),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (BUILD_RELEASE && rollupUglify({
            mangle: { 
                except: ['Magic'] 
            }
        })),
    ];

    clear_magic().then(function() {
        rollup({
            entry: DIR_CORE+"build.js",
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_DIST))
        .on("finish", function() {
            log("--- magic core build finish");
            defer_core.resolve();
        });

        gulp.src([DIR_CORE+"build.js",
            DIR_MUI+"build.js"])
        .pipe(concat("_magic_concat.js"))
        .pipe(gulp.dest(DIR_DIST))
        .on("finish", function() {
            rollup({
                entry: DIR_DIST+"/_magic_concat.js",
                format: 'umd',
                moduleName: "Magic",
                plugins: plugins,
            })
            .pipe(source('magic.ui.js'))
            .pipe(replace(oldBuild, newBuild))
            .pipe(gulp.dest(DIR_DIST))
            .on("finish", function() {
                log("--- magic mui build finish");
                del(DIR_DIST+"/_magic_concat.js");
                defer_mui.resolve();
            });
        });

        return Q.all([
            defer_core.promise,
            defer_mui.promise,
        ]);
    }).then(function() {
        log("magic task all finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}
gulp.task("dev-build-magic", task_build_magic);

function clear_magic() {
    return Q.all([
        del(DIR_DIST+"magic.js"),
        del(DIR_DIST+"magic.ui.js")
    ]);
}

gulp.task("build", function(r) {
    BUILD_RELEASE = r ? true : false;

    task_build_mixin()
    .then(function() {
        return task_build_minjs();
    }).then(function() {
        return task_build_magic();
    });
})

gulp.task("serve", function() {
    browserSync.init({
        server: {
            baseDir: DIR_WWW
        }
    });

    gulp.watch([DIR_MIXIN+"**/*"],    ["dev-build-mixin"]);
    gulp.watch([DIR_MINJS+"**/*.js"], ["dev-build-minjs"]);
    gulp.watch([DIR_MAGIC+"**/*.js"], ["dev-build-magic"]);

    gulp.watch([DIR_DIST+"**/*"]).on("change", reload);
});

gulp.task("clean", function() {
    clear_mixin();
})
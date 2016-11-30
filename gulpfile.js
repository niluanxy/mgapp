var gulp                = require('gulp-param')(require('gulp'), process.argv),
    shell               = require('gulp-shell'),
    Q                   = require("q"),
    del                 = require("del"),
    moment              = require("moment"),
    colors              = require('colors'),
    concat              = require("gulp-concat"),
    rename              = require("gulp-rename"),
    autoprefixer        = require("gulp-autoprefixer"),
    shell               = require('gulp-shell'),
    px2rem              = require("gulp-px2rem"),
    rollup              = require("rollup-stream"),
    rollupReplace       = require('rollup-plugin-replace'),
    rollupUglify        = require('rollup-plugin-uglify'),
    rollupAlias         = require("rollup-plugin-alias"),
    source              = require('vinyl-source-stream'),
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

var DIR_MIXIN = __dirname + "/mixin/",
    DIST_MIXIN = DIR_MIXIN + "dist",

    DIR_MINJS =  __dirname + "/minjs/",

    DIR_MAGIC = __dirname + "/magic/",
    DIST_MAGIC = DIR_MAGIC + "dist";

var DIR_MAGIC_ALIAS = {
    resolve: ['.jsx', '.js'],

    LIB_MINJS: DIR_MINJS,

    MUI: DIR_MAGIC+"mui",

    CORE_FUNCTION: DIR_MAGIC+"core/function",
    CORE_MAGIC : DIR_MAGIC+"core/magic",
    CORE_MODULE: DIR_MAGIC+"core/module",
    CORE_STATIC: DIR_MAGIC+"core/static",
};

function log(str, style) {
    style = style || "info";

    var _time = moment().format("HH:mm:ss").time;

    console.log("["+_time+"] "+str[style]);
}


/**===============================================
 * mixin 文件合并脚本函数
 =================================================*/
function task_concat_mixin() {
    var DIST_MIXIN = DIR_MIXIN+"dist/",
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
        .pipe(gulp.dest(DIST_MIXIN))
        .pipe(gulp.dest(DIST_MIXIN))
        .on("finish", function() {
            log("mixin build to css finish");
            defer_all.resolve();
        })
    })

    return defer_all.promise;
}

function clear_mixin() {
    return del(DIST_MIXIN);
}

/**===============================================
 * magic 文件合并脚本函数
 =================================================*/
function task_build_magic() {
    var defer_all = Q.defer(), defer_core = Q.defer(),
        defer_mui = Q.defer(), plugins,

    DIR_CORE = DIR_MAGIC+"core/",
    DIR_MUI  = DIR_MAGIC+"mui/";

    plugins = [
        rollupAlias(DIR_MAGIC_ALIAS),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (process.env.NODE_ENV === 'production' && rollupUglify()),
    ];

    clear_magic().then(function() {
        rollup({
            entry: DIR_CORE+"build.js",
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.js'))
        .pipe(gulp.dest(DIST_MAGIC))
        .on("finish", function() {
            log("--- magic core build finish");
            defer_core.resolve();
        });

        gulp.src([DIR_CORE+"build.js",
            DIR_MUI+"build.js"])
        .pipe(concat("concat.js"))
        .pipe(gulp.dest(DIST_MAGIC))
        .on("finish", function() {
            rollup({
                entry: DIST_MAGIC+"/concat.js",
                format: 'umd',
                moduleName: "Magic",
                plugins: plugins,
            })
            .pipe(source('magic.ui.js'))
            .pipe(gulp.dest(DIST_MAGIC))
            .on("finish", function() {
                log("--- magic mui build finish");
                del(DIST_MAGIC+"/concat.js");
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

function clear_magic() {
    return del(DIST_MAGIC);
}

gulp.task("build", function() {
    task_concat_mixin().then(function() {
        return task_build_magic();
    })
})

gulp.task("clean", function() {
    clear_mixin();
})
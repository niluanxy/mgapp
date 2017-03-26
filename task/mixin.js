var gulp            = require("gulp"),
    extend          = require("extend"),
    del             = require("del"),
    Q               = require("q"),
    concat          = require("gulp-concat"),
    px2rem          = require("gulp-px2rem"),
    gulpif          = require("gulp-if"),
    autoprefixer    = require("gulp-autoprefixer"),
    sass            = require("gulp-sass"),
    cssImport       = require("gulp-cssimport");

var DIR    = require("./base").DIR,
    ALIAS  = require("./base").ALIAS,
    CONCAT = require("./base").CONCAT,
    log    = require("./base").log;

function clean_mixin_build() {
    return Q.all([
        del(DIR.CONCAT+CONCAT.MIXIN_CORE),
        del(DIR.CONCAT+CONCAT.MIXIN_VARS),
        del(DIR.CONCAT+CONCAT.MIXIN_UIKIT)
    ]);
}

function task_mixin_concat() {
    var defer_core = Q.defer(), defer_uikit = Q.defer(),
        defer_vars = Q.defer(), defer_all = Q.defer();

    clean_mixin_build().then(function() {
        // 核心文件合并
        gulp.src([
            DIR.MIXIN+"core/config.scss",
            DIR.MIXIN+"core/function.scss",
            DIR.MIXIN+"core/zindex.scss",
            DIR.MIXIN+"core/color.scss",
            DIR.MIXIN+"core/text.scss",
            DIR.MIXIN+"core/base.scss"
        ])
        .pipe(concat(CONCAT.MIXIN_CORE))
        .pipe(gulp.dest(DIR.CONCAT))
        .on("finish", function() { defer_core.resolve(); })

        // 变量文件合并
        gulp.src([
            DIR.MIXIN+"uikit/varible/element/button.scss",
            DIR.MIXIN+"uikit/varible/**/*.scss"
        ])
        .pipe(concat(CONCAT.MIXIN_VARS))
        .pipe(gulp.dest(DIR.CONCAT))
        .on("finish", function() { defer_vars.resolve(); })

        // UI文件合并
        gulp.src([
            DIR.MIXIN+"uikit/tools.scss",
            DIR.MIXIN+"uikit/component/**/*.scss"
        ])
        .pipe(concat(CONCAT.MIXIN_UIKIT))
        .pipe(gulp.dest(DIR.CONCAT))
        .on("finish", function() { defer_uikit.resolve(); })
    });

    Q.all([ defer_core.promise,
            defer_vars.promise,
            defer_uikit.promise
    ]).then(function() {
        gulp.src([
            DIR.CONCAT+CONCAT.MIXIN_CORE,
            DIR.CONCAT+CONCAT.MIXIN_VARS,
            DIR.CONCAT+CONCAT.MIXIN_UIKIT,
            DIR.MIXIN+"build.scss"
        ])
        .pipe(concat(CONCAT.MIXIN_BUILD))
        .pipe(gulp.dest(DIR.CONCAT))
        .on("finish", function() { defer_all.resolve() });
    });

    return defer_all.promise;
}

var px2remConfig = {
    rootValue: 20,
    unitPrecision: 5,
    propertyBlackList: [],
    propertyWhiteList: [],
    replace: true,
    mediaQuery: false,
    minPx: 3
};

function task_mixin_build() {
    var defer_build = Q.defer(), RELEASE;

    RELEASE = process.env.NODE_ENV == 'production';

    task_mixin_concat().then(function() {
        log("--- mixin concat finish");

        gulp.src([DIR.CONCAT+CONCAT.MIXIN_BUILD])
        .pipe(sass.sync({
            outputStyle: RELEASE ? "compressed" : "nested",
        }).on('error', sass.logError))
        .pipe(cssImport())
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("mixin build css finish");
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}

module.exports = {
    config: px2remConfig,

    build : task_mixin_build,
    clean : clean_mixin_build,
    concat: task_mixin_concat,
};

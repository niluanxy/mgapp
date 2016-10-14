var gulp         = require('gulp-param')(require('gulp'), process.argv),
    shell        = require('gulp-shell'),
    Q            = require("q"),
    del          = require("del"),
    moment       = require("moment"),
    colors       = require('colors'),
    concat       = require("gulp-concat"),
    rename       = require("gulp-rename"),
    shell        = require('gulp-shell'),
    sass         = require("gulp-sass");

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

var DIR_MIXIN = "mixin/";

function log(str, style) {
    style = style || "info";

    var _time = moment().format("HH:mm:ss").time;

    console.log("["+_time+"] "+str[style]);
}


/**===============================================
 * mixin 文件合并脚本函数
 =================================================*/
function task_concat_mixin() {
    var MIXIN_DIST = DIR_MIXIN+"dist/",
        defer_core = Q.defer(),
        defer_uikit = Q.defer(),
        defer_vars = Q.defer(),
        defer_all = Q.defer();

    del(MIXIN_DIST).then(function() {
        gulp.src([DIR_MIXIN+"core/config.scss",
            DIR_MIXIN+"core/function.scss",
            DIR_MIXIN+"core/zindex.scss",
            DIR_MIXIN+"core/color.scss",
            DIR_MIXIN+"core/text.scss",
            DIR_MIXIN+"core/base.scss"])
        .pipe(concat("mixin_core.scss"))
        .pipe(gulp.dest(MIXIN_DIST))
        .on("finish", function() { defer_core.resolve(); })

        gulp.src([DIR_MIXIN+"uikit/tools.scss",
            DIR_MIXIN+"uikit/component/**/*.scss"])
        .pipe(concat("mixin_uikit.scss"))
        .pipe(gulp.dest(MIXIN_DIST))
        .on("finish", function() { defer_uikit.resolve(); })

        gulp.src(DIR_MIXIN+"uikit/varible/**/*.scss")
        .pipe(concat("mixin_vars.scss"))
        .pipe(gulp.dest(MIXIN_DIST))
        .on("finish", function() { defer_vars.resolve(); })

        return Q.all([
            defer_core.promise,
            defer_uikit.promise,
            defer_vars.promise
        ])
    }).then(function() {
        gulp.src([MIXIN_DIST+"mixin_core.scss",
            MIXIN_DIST+"mixin_vars.scss",
            MIXIN_DIST+"mixin_uikit.scss",
            DIR_MIXIN+"build.scss"])
        .pipe(concat("mixin.scss"))
        .pipe(gulp.dest(MIXIN_DIST))
        .pipe(sass())
        .pipe(gulp.dest(MIXIN_DIST))
        .on("finish", function() {
            log("all has finish");
            defer_all.resolve();
        })
    })

    return defer_all.promise;
}

gulp.task("build", function() {
    task_concat_mixin();
})
var gulp    = require("gulp-param")(require("gulp"), process.argv),
    Q       = require("q"),
    extend  = require("extend"),
    log     = require("./task/base.js").log;

var bindTask = gulp.task;
gulp.task = function(/* name, depends, function */) {
    var args = extend([], arguments), func;

    func = args[args.length-1];

    args[args.length-1] = function(r) {
        if (arguments[0] == true) {
            process.env.NODE_ENV = 'production';
        } else {
            process.env.NODE_ENV = 'development';
        }

        return func();
    }

    return bindTask.apply(gulp, args);
}


/*==========================================================================
 *  mixin 部分编译脚本
 *==========================================================================*/
gulp.task("clean-mixin", require("./task/mixin").clean);

gulp.task("dev-build-mixin", require("./task/mixin").build);


/*==========================================================================
 *  minjs 部分编译脚本
 *==========================================================================*/
gulp.task("dev-build-minjs", require("./task/minjs").build);


/*==========================================================================
 *  magic 部分编译脚本
 *==========================================================================*/
gulp.task("dev-build-magic", require("./task/magic").build);


/*==========================================================================
 *  magic 部分编译脚本
 *==========================================================================*/
gulp.task("clean-mgvue", require("./task/mgvue").clean);

gulp.task("dev-build-mgvue", require("./task/mgvue").build);
gulp.task("dev-build-mgvue-style", require("./task/mgvue").buildStyle);

var gulp    = require("gulp-param")(require("gulp"), process.argv),
    Q       = require("q"),
    extend  = require("extend");

gulp.bindTask = gulp.task;
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

    return gulp.bindTask.apply(gulp, args);
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
 *  mgvue 部分编译脚本
 *==========================================================================*/
gulp.task("clean-mgvue", require("./task/mgvue").clean);
gulp.task("dev-build-mgvue", require("./task/mgvue").build);
gulp.task("dev-build-mgvue-style", require("./task/mgvue").buildStyle);

/*==========================================================================
 *  mgapp 部分编译脚本
 *==========================================================================*/
gulp.task("clean-dist", require("./task/mgapp").cleanDist);
gulp.task("clean-style", require("./task/mgapp").cleanStyle);
gulp.task("clean-assets", require("./task/mgapp").cleanAssets);
gulp.task("dev-build-mgapp", require("./task/mgapp").build);
gulp.task("dev-build-mgapp-main", require("./task/mgapp").buildMain);
gulp.task("dev-build-mgapp-style", require("./task/mgapp").buildStyle);
gulp.task("dev-build-mgapp-assets", require("./task/mgapp").buildAssets);

/*==========================================================================
 *  开发打包 核心脚本
 *==========================================================================*/
gulp.task("build", require("./task/mgapp").build);
gulp.bindTask("serve", require("./task/server").server);

/*==========================================================================
 *  clean 清理脚本
 *==========================================================================*/
gulp.task("clean", function() {
    return Q.all([
        require("./task/mixin").clean(),
        require("./task/mgvue").clean(),

        require("./task/mgapp").cleanDist(),
        require("./task/mgapp").cleanStyle(),
        require("./task/mgapp").cleanAssets()
    ]);
})

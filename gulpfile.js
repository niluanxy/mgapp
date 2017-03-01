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

var DIR_APP   = __dirname + "/app/",
    DIR_DEV   = __dirname + "/dev/",

    DIR_MIXIN = DIR_DEV + "mixin/",
    DIR_MINJS = DIR_DEV + "minjs/",
    DIR_MAGIC = DIR_DEV + "magic/",
    DIR_MAGIC_VUE = DIR_DEV + "mgvue/",

    DIR_APP_LIBS = DIR_APP + "libs/";

var CONCAT_PRE        = "_concat_",

    CONCAT_MIXIN_CORE = CONCAT_PRE+"mixin-core.scss",
    CONCAT_MIXIN_VARS = CONCAT_PRE+"mixin-vars.scss",
    CONCAT_MIXIN_UIKIT= CONCAT_PRE+"minix-uikit.scss",
    CONCAT_MIXIN_BUILD= "mixin.scss",

    CONCAT_MAGIC_BASE = CONCAT_PRE+"magic.js",
    CONCAT_MAGIC_UIKIT= CONCAT_PRE+"magic.ui.js",

    CONCAT_MGVUE_BASE = CONCAT_PRE+"mgvue.js",
    CONCAT_MGVUE_UIKIT= CONCAT_PRE+"mgvue.ui.js";

var DIR_MAGIC_ALIAS = {
    resolve: ['.jsx', '.js'],

    LIB_MINJS: DIR_MINJS,

    MG_CORE    : DIR_MAGIC+"core",
    MG_UTILS   : DIR_MAGIC+"utils",
    MG_MAGIC   : DIR_MAGIC+"core/magic",
    MG_MODULE  : DIR_MAGIC+"core/module",
    MG_STATIC  : DIR_MAGIC+"core/static",
    MG_UIKIT   : DIR_MAGIC+"mui",

    MV_CORE    : DIR_MAGIC_VUE+"core",
    MV_BASE    : DIR_MAGIC_VUE+"core/base",
    MV_MODULE  : DIR_MAGIC_VUE+"core/module",
    MV_PLUGIN  : DIR_MAGIC_VUE+"core/plugin",
    MV_UIKIT   : DIR_MAGIC_VUE+"mui",
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
function task_concat_mixin() {
    var defer_core = Q.defer(),
        defer_uikit = Q.defer(),
        defer_vars = Q.defer(),
        defer_all = Q.defer();

    clean_mixin().then(function() {
        // 核心文件合并
        gulp.src([DIR_MIXIN+"core/config.scss",
            DIR_MIXIN+"core/function.scss",
            DIR_MIXIN+"core/zindex.scss",
            DIR_MIXIN+"core/color.scss",
            DIR_MIXIN+"core/text.scss",
            DIR_MIXIN+"core/base.scss"])
        .pipe(concat(CONCAT_MIXIN_CORE))
        .pipe(gulp.dest(DIR_DEV))
        .on("finish", function() { defer_core.resolve(); })

        // 变量文件合并
        gulp.src([DIR_MIXIN+"uikit/varible/element/button.scss",
            DIR_MIXIN+"uikit/varible/**/*.scss"])
        .pipe(concat(CONCAT_MIXIN_VARS))
        .pipe(gulp.dest(DIR_DEV))
        .on("finish", function() { defer_vars.resolve(); })

        // UI文件合并
        gulp.src([DIR_MIXIN+"uikit/tools.scss",
            DIR_MIXIN+"uikit/component/**/*.scss"])
        .pipe(concat(CONCAT_MIXIN_UIKIT))
        .pipe(gulp.dest(DIR_DEV))
        .on("finish", function() { defer_uikit.resolve(); })

        return Q.all([
            defer_core.promise,
            defer_vars.promise,
            defer_uikit.promise
        ]).then(function() {
            log("--- mixin concat finish");
        });
    }).then(function() {
        gulp.src([DIR_DEV+CONCAT_MIXIN_CORE,
            DIR_DEV+CONCAT_MIXIN_VARS,
            DIR_DEV+CONCAT_MIXIN_UIKIT,
            DIR_MIXIN+"build.scss"])
        .pipe(concat(CONCAT_MIXIN_BUILD))
        .pipe(gulp.dest(DIR_DEV))
        .on("finish", function() {
            log("--- mixin build to css finish");
            defer_all.resolve();
        })
    })

    return defer_all.promise;
}

function task_build_mixin() {
    var build = Q.defer();

    task_concat_mixin().then(function() {
        gulp.src([DIR_DEV+CONCAT_MIXIN_BUILD])
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(BUILD_RELEASE, minifycss()))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            clean_mixin_build();
            log("mixin build css finish");
            build.resolve();
        });
    });

    return build.promise;
}
gulp.task("dev-build-mixin", task_build_mixin);

function clean_mixin_build() {
    return Q.all([
        del(DIR_DEV+CONCAT_MIXIN_CORE),
        del(DIR_DEV+CONCAT_MIXIN_VARS),
        del(DIR_DEV+CONCAT_MIXIN_UIKIT)
    ]);
}

function clean_mixin() {
    var css = DIR_DEV+CONCAT_MIXIN_BUILD;

    return Q.all([
        clean_mixin_build(),
        del(DIR_DEV+CONCAT_MIXIN_BUILD),
        del(css.replace(/scss$/, "css"))
    ]);
}
gulp.task("clean-mixin", clean_mixin);

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

    del(DIR_APP_LIBS+"emitter.js").then(function() {
        rollup({
            entry: DIR_MINJS+"emitter.js",
            format: 'umd',
            exports: "named",
            moduleName: "Emitter",
            plugins: plugins,
        })
        .pipe(source('emitter.js'))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            log("--- minjs emitter.js build finish");
            defer_emit.resolve();
        });
    });

    del(DIR_APP_LIBS+"router.js").then(function() {
        rollup({
            entry: DIR_MINJS+"router.js",
            format: 'umd',
            moduleName: "Router",
            plugins: plugins,
        })
        .pipe(source('router.js'))
        .pipe(gulp.dest(DIR_APP_LIBS))
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
    newBuild = BUILD_RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$)$1.$=$1.Magic;'
                             : '$1\n\tif(typeof define === "undefined" && !global.$) '+
                               'global.$ = global.Magic;';

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

    gulp.src(DIR_CORE+"build.js")
    .pipe(rename(CONCAT_MAGIC_BASE))
    .pipe(gulp.dest(DIR_DEV))
    .on("finish", function() {
        rollup({
            entry: DIR_DEV+CONCAT_MAGIC_BASE,
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            log("--- magic core build finish");
            defer_core.resolve();
        });
    });

    gulp.src([DIR_MUI+"build.js"])
    .pipe(rename(CONCAT_MAGIC_UIKIT))
    .pipe(gulp.dest(DIR_DEV))
    .on("finish", function() {
        rollup({
            entry: DIR_DEV+CONCAT_MAGIC_UIKIT,
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.ui.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            log("--- magic uikit build finish");
            defer_mui.resolve();
        });
    });

    Q.all([
        defer_core.promise,
        defer_mui.promise,
    ]).then(function() {
        clean_magic();
        log("magic task all finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}
gulp.task("dev-build-magic", task_build_magic);

function clean_magic() {
    return Q.all([
        del(DIR_DEV+CONCAT_MAGIC_BASE),
        del(DIR_DEV+CONCAT_MAGIC_UIKIT)
    ]);
}

/**===============================================
 * magic vue 文件合并脚本函数
 =================================================*/
function task_build_mgvue() {
    var defer_all = Q.defer(), defer_core = Q.defer(),
        defer_mui = Q.defer(), plugins,

    DIR_CORE = DIR_MAGIC_VUE+"core/",
    DIR_MUI  = DIR_MAGIC_VUE+"mui/",

    oldBuild = BUILD_RELEASE ? /(\w)(\.MagicVue=)(\w\(\))/
                             : /(\(global.MagicVue = factory\(\)\)\;)/,
    newBuild = BUILD_RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$)$1.$$=$1.MagicVue;'
                             : '$1\n\tif(typeof define === "undefined" && !global.$$) '+
                               'global.$$ = global.MagicVue;';

    plugins = [
        rollupAlias(DIR_MAGIC_ALIAS),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (BUILD_RELEASE && rollupUglify({
            mangle: {
                except: ['MagicVue']
            }
        })),
    ];

    gulp.src(DIR_CORE+"build.js")
    .pipe(rename(CONCAT_MGVUE_BASE))
    .pipe(gulp.dest(DIR_DEV))
    .on("finish", function() {
        rollup({
            entry: DIR_DEV+CONCAT_MGVUE_BASE,
            format: 'umd',
            moduleName: "MagicVue",
            plugins: plugins,
        })
        .pipe(source('mgvue.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            log("--- mgvue core build finish");
            defer_core.resolve();
        });
    });

    gulp.src([DIR_MUI+"build.js"])
    .pipe(rename(CONCAT_MGVUE_UIKIT))
    .pipe(gulp.dest(DIR_DEV))
    .on("finish", function() {
        rollup({
            entry: DIR_DEV+CONCAT_MGVUE_UIKIT,
            format: 'umd',
            moduleName: "MagicVue",
            plugins: plugins,
        })
        .pipe(source('mgvue.ui.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_LIBS))
        .on("finish", function() {
            log("--- mgvue uikit build finish");
            defer_mui.resolve();
        });
    });

    Q.all([
        defer_core.promise,
        defer_mui.promise,
    ]).then(function() {
        clean_magic();
        log("mgvue task all finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}
gulp.task("dev-build-mgvue", task_build_mgvue);

function clean_mgvue() {
    return Q.all([
        del(DIR_DEV+CONCAT_MGVUE_BASE),
        del(DIR_DEV+CONCAT_MGVUE_UIKIT)
    ]);
}


/**===============================================
 * 项目整体相关函数
 =================================================*/
gulp.task("build", function(r) {
    BUILD_RELEASE = r ? true : false;

    task_build_mixin()
    .then(function() {
        return task_build_minjs();
    }).then(function() {
        return task_build_magic();
    }).then(function() {
        return task_build_mgvue();
    })
})

gulp.task("serve", function() {
    browserSync.init({
        server: {
            baseDir: DIR_APP
        }
    });

    gulp.watch([DIR_MIXIN+"**/*"],    ["dev-build-mixin"]);
    gulp.watch([DIR_MINJS+"**/*.js"], ["dev-build-minjs"]);
    
    gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js"], ["dev-build-magic"]);
    gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js",
                DIR_MAGIC_VUE+"**/*.js", DIR_MINJS+"**/*.js"], ["dev-build-mgvue"]);

    gulp.watch([DIR_APP_LIBS+"/*", DIR_APP+"/*"]).on("change", reload);
});

gulp.task("clean", function() {
    return Q.all([
        clean_mixin(),
        clean_magic(),
        clean_mgvue()
    ]);
})

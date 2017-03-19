var gulp                = require("gulp-param")(require("gulp"), process.argv),
    shell               = require("gulp-shell"),
    Q                   = require("q"),
    del                 = require("del"),
    moment              = require("moment"),
    colors              = require("colors"),
    concat              = require("gulp-concat"),
    replace             = require("gulp-replace"),
    replaceTask         = require("gulp-replace-task"),
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
    rollupCommonjs      = require("rollup-plugin-commonjs"),
    rollupNodeResolve   = require("rollup-plugin-node-resolve"),
    source              = require("vinyl-source-stream"),
    sass                = require("gulp-sass"),
    extend              = require("extend"),
    webpack             = require("webpack"),
    webpackDevServer    = require("webpack-dev-server"),
    gulpWebpack         = require("webpack-stream"),
    webpackUglifyJS     = require('uglifyjs-webpack-plugin');

colors.setTheme({ silly: 'rainbow', input: 'grey', verbose: 'cyan',
    prompt: 'red', info: 'green', data: 'blue', help: 'cyan',
    warn: 'yellow', debug: 'magenta', error: 'red', time: 'gray'
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

var DIR_BASE  = __dirname,
    DIR_APP   = DIR_BASE + "/app/",
    DIR_DEV   = DIR_BASE + "/dev/",

    DIR_MIXIN = DIR_DEV + "mixin/",
    DIR_MINJS = DIR_DEV + "minjs/",
    DIR_MAGIC = DIR_DEV + "magic/",
    DIR_MGVUE = DIR_DEV + "mgvue/",

    DIR_CONCAT = DIR_DEV + "concat/",

    DIR_APP_PUBLIC = DIR_APP + "public/",
    DIR_APP_ASSETS = DIR_APP + "assets/",
    DIR_APP_MODULE = DIR_APP + "module/",

    DIR_APP_DIST   = __dirname + "/dist/";

var CONCAT_PRE        = "_concat_",

    CONCAT_MIXIN_CORE = CONCAT_PRE+"mixin-core.scss",
    CONCAT_MIXIN_VARS = CONCAT_PRE+"mixin-vars.scss",
    CONCAT_MIXIN_UIKIT= CONCAT_PRE+"minix-uikit.scss",
    CONCAT_MIXIN_BUILD= "mixin.scss",

    CONCAT_MAGIC_BASE = CONCAT_PRE+"magic.js",
    CONCAT_MAGIC_UIKIT= CONCAT_PRE+"magic.ui.js",

    CONCAT_MGVUE_STYLE_VARS = CONCAT_PRE+"mgvue-vars.scss",
    CONCAT_MGVUE_STYLE_UIKIT= CONCAT_PRE+"mgvue-uikit.scss",
    CONCAT_MGVUE_STYLE_BUILD= "mgvue.scss",

    CONCAT_MGVUE_BASE = CONCAT_PRE+"mgvue.js",
    CONCAT_MGVUE_UIKIT= CONCAT_PRE+"mgvue.ui.js";

var DIR_ALIAS = {
    resolve: ['.jsx', '.js', ".scss", ".jpg", ".jpeg", ".png"],

    LIB_MINJS: DIR_MINJS,

    MG_CORE  : DIR_MAGIC+"core",
    MG_UTILS : DIR_MAGIC+"utils",
    MG_MAGIC : DIR_MAGIC+"core/magic",
    MG_MODULE: DIR_MAGIC+"core/module",
    MG_STATIC: DIR_MAGIC+"core/static",
    MG_UIKIT : DIR_MAGIC+"mui",

    MV_CORE  : DIR_MGVUE+"core",
    MV_BASE  : DIR_MGVUE+"core/base",
    MV_MODULE: DIR_MGVUE+"core/module",
    MV_PLUGIN: DIR_MGVUE+"core/plugin",
    MV_UIKIT : DIR_MGVUE+"mui",

    ASSETS: DIR_APP_ASSETS,
    PUBLIC: DIR_APP_PUBLIC,
    MODULE: DIR_APP_MODULE,
        STYLE: DIR_APP_MODULE+"style",
        STORE: DIR_APP_MODULE+"store",
        COMPONENT: DIR_APP_MODULE+"component",

    pages: DIR_APP+"pages",
};

var reload = throttle(20, function() {
    browserSync.reload();
});

function log(str, style) {
    style = style || "info";

    var _time = moment().format("HH:mm:ss").time;

    console.log("["+_time+"] "+str.toString()[style]);
}

var BUILD_RELEASE = false, bindTask = gulp.task;

gulp.bindTask = bindTask;
gulp.task = function(taskName, taskFunction) {
    bindTask(taskName, function(r) {
        BUILD_RELEASE = r ? true : false;

        if (BUILD_RELEASE === true) {
            process.env.node_env = 'development';
        } else {
            process.env.node_env = 'production';
        }

        return taskFunction();
    })
}

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
        .pipe(gulp.dest(DIR_CONCAT))
        .on("finish", function() { defer_core.resolve(); })

        // 变量文件合并
        gulp.src([DIR_MIXIN+"uikit/varible/element/button.scss",
            DIR_MIXIN+"uikit/varible/**/*.scss"])
        .pipe(concat(CONCAT_MIXIN_VARS))
        .pipe(gulp.dest(DIR_CONCAT))
        .on("finish", function() { defer_vars.resolve(); })

        // UI文件合并
        gulp.src([DIR_MIXIN+"uikit/tools.scss",
            DIR_MIXIN+"uikit/component/**/*.scss"])
        .pipe(concat(CONCAT_MIXIN_UIKIT))
        .pipe(gulp.dest(DIR_CONCAT))
        .on("finish", function() { defer_uikit.resolve(); })
    });

    Q.all([
        defer_core.promise,
        defer_vars.promise,
        defer_uikit.promise
    ]).then(function() {
        gulp.src([DIR_DEV+CONCAT_MIXIN_CORE,
            DIR_DEV+CONCAT_MIXIN_VARS,
            DIR_DEV+CONCAT_MIXIN_UIKIT,
            DIR_MIXIN+"build.scss"])
        .pipe(concat(CONCAT_MIXIN_BUILD))
        .pipe(gulp.dest(DIR_CONCAT))
        .on("finish", function() {
            defer_all.resolve();
        })
    });

    return defer_all.promise;
}

function task_build_mixin() {
    var build = Q.defer();

    task_concat_mixin().then(function() {
        log("--- mixin concat finish");

        gulp.src([DIR_DEV+CONCAT_MIXIN_BUILD])
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(BUILD_RELEASE, minifycss()))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
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
        del(DIR_CONCAT+CONCAT_MIXIN_CORE),
        del(DIR_CONCAT+CONCAT_MIXIN_VARS),
        del(DIR_CONCAT+CONCAT_MIXIN_UIKIT)
    ]);
}

function clean_mixin() {
    var css = DIR_CONCAT+CONCAT_MIXIN_BUILD;

    return Q.all([
        clean_mixin_build(),
        del(DIR_CONCAT+CONCAT_MIXIN_BUILD),
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
        rollupAlias(DIR_ALIAS),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (BUILD_RELEASE && rollupUglify()),
    ];

    del(DIR_APP_ASSETS+"emitter.js").then(function() {
        rollup({
            entry: DIR_MINJS+"emitter.js",
            format: 'umd',
            exports: "named",
            moduleName: "Emitter",
            plugins: plugins,
        })
        .pipe(source('emitter.js'))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- minjs emitter.js build finish");
            defer_emit.resolve();
        });
    });

    del(DIR_APP_ASSETS+"router.js").then(function() {
        rollup({
            entry: DIR_MINJS+"router.js",
            format: 'umd',
            moduleName: "Router",
            plugins: plugins,
        })
        .pipe(source('router.js'))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
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
        rollupAlias(DIR_ALIAS),
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
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() {
        rollup({
            entry: DIR_CONCAT+CONCAT_MAGIC_BASE,
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- magic core build finish");
            defer_core.resolve();
        });
    });

    gulp.src([DIR_MUI+"build.js"])
    .pipe(rename(CONCAT_MAGIC_UIKIT))
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() {
        rollup({
            entry: DIR_CONCAT+CONCAT_MAGIC_UIKIT,
            format: 'umd',
            moduleName: "Magic",
            plugins: plugins,
        })
        .pipe(source('magic.ui.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
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
        del(DIR_CONCAT+CONCAT_MAGIC_BASE),
        del(DIR_CONCAT+CONCAT_MAGIC_UIKIT)
    ]);
}



/**===============================================
 * magic vue style 文件合并脚本函数
 =================================================*/
function task_concat_mgvue_style() {
    var defer_all = Q.defer(), defer_var = Q.defer(),
        defer_com = Q.defer(), DIR = DIR_MGVUE+"style/";

    gulp.src(DIR+"/varible/*.scss")
    .pipe(concat(CONCAT_MGVUE_STYLE_VARS))
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() { defer_var.resolve() });

    gulp.src(DIR+"/component/*.scss")
    .pipe(concat(CONCAT_MGVUE_STYLE_UIKIT))
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() { defer_com.resolve() });

    Q.all([defer_var, defer_com, task_concat_mixin()])
    .then(function() {
        gulp.src([DIR_CONCAT+CONCAT_MIXIN_CORE,
            DIR_CONCAT+CONCAT_MIXIN_VARS,
            DIR_CONCAT+CONCAT_MGVUE_STYLE_VARS,
            DIR_CONCAT+CONCAT_MIXIN_UIKIT,
            DIR_CONCAT+CONCAT_MGVUE_STYLE_UIKIT,
            DIR_MGVUE+"style/build.scss"
        ])
        .pipe(concat(CONCAT_MGVUE_STYLE_BUILD))
        .pipe(gulp.dest(DIR_CONCAT))
        .on("finish", function() { defer_all.resolve() });
    });

    return defer_all.promise;
}

function task_build_mgvue_style() {
    var defer_build = Q.defer();

    task_concat_mgvue_style()
    .then(function() {
        log("--- mgvue style concot finish");

        gulp.src(DIR_CONCAT+CONCAT_MGVUE_STYLE_BUILD)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(BUILD_RELEASE, minifycss()))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("mgvue style build css finish");
            clean_mgvue_style();
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}
gulp.task("dev-build-mgvue-style", task_build_mgvue_style);

function clean_mgvue_style() {
    return Q.all([
        clean_mixin(),
        del(DIR_CONCAT+CONCAT_MGVUE_STYLE_VARS),
        del(DIR_CONCAT+CONCAT_MGVUE_STYLE_UIKIT),
        del(DIR_CONCAT+CONCAT_MGVUE_STYLE_BUILD)
    ]);
}

/**===============================================
 * magic vue 文件合并脚本函数
 =================================================*/
function task_build_mgvue() {
    var defer_all = Q.defer(), defer_core = Q.defer(),
        defer_mui = Q.defer(), plugins, alias,

    DIR_CORE = DIR_MGVUE+"core/", DIR_MUI  = DIR_MGVUE+"mui/",

    oldBuild = BUILD_RELEASE ? /(\w)(\.MagicVue=)(\w\(\))/
                             : /(\(global.MagicVue = factory\(\)\)\;)/,
    newBuild = BUILD_RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$$)$1.$$=$1.MagicVue;'+
                               'if("undefined"==typeof define&&!$1.$)$1.$=$1.MagicVue.Magic;'
                             : '$1\n\tif(typeof define === "undefined" && !global.$$) '+
                               'global.$$ = global.MagicVue;'+
                               '\n\tif(typeof define === "undefined" && !global.$) '+
                                 'global.$ = global.MagicVue.Magic;';

    alias = extend({}, DIR_ALIAS);
    alias.vue = BUILD_RELEASE ? "vue/dist/vue.min.js" : "vue/dist/vue.js";
    alias.vue = DIR_BASE+"/node_modules/"+alias.vue;

    plugins = [
        rollupAlias(alias),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: BUILD_RELEASE ? '"production"' : '"development"',
        }),
        rollupCommonjs(),
        rollupNodeResolve({ jsnext: true, main: true, browser: true }),
        (BUILD_RELEASE && rollupUglify({
            mangle: {
                except: ['MagicVue']
            }
        })),
    ];

    gulp.src(DIR_CORE+"build.js")
    .pipe(rename(CONCAT_MGVUE_BASE))
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() {
        rollup({
            entry: DIR_CONCAT+CONCAT_MGVUE_BASE,
            format: 'umd',
            moduleName: "MagicVue",
            plugins: plugins,
        })
        .pipe(source('mgvue.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- mgvue core build finish");
            defer_core.resolve();
        });
    });

    gulp.src([DIR_MUI+"build.js"])
    .pipe(rename(CONCAT_MGVUE_UIKIT))
    .pipe(gulp.dest(DIR_CONCAT))
    .on("finish", function() {
        rollup({
            entry: DIR_CONCAT+CONCAT_MGVUE_UIKIT,
            format: 'umd',
            moduleName: "MagicVue",
            plugins: plugins,
        })
        .pipe(source('mgvue.ui.js'))
        .pipe(replace(oldBuild, newBuild))
        .pipe(gulp.dest(DIR_APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("--- mgvue uikit build finish");
            defer_mui.resolve();
        });
    });

    Q.all([
        defer_core.promise,
        defer_mui.promise,
    ]).then(function() {
        clean_mgvue();
        log("mgvue task all finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}
gulp.task("dev-build-mgvue", task_build_mgvue);

function clean_mgvue() {
    return Q.all([
        del(DIR_CONCAT+CONCAT_MGVUE_BASE),
        del(DIR_CONCAT+CONCAT_MGVUE_UIKIT)
    ]);
}

/**===============================================
 * app相关打包任务
 =================================================*/
function task_app_style_concat() {
    var defer_all = Q.defer(), defer_concat = Q.defer(),
        _DIR_STYLE;

    _DIR_STYLE = DIR_APP_PUBLIC + "style/";

    task_concat_mgvue_style().then(function() {
        gulp.src([DIR_CONCAT+CONCAT_MIXIN_CORE,
            DIR_CONCAT+CONCAT_MIXIN_VARS,
            DIR_CONCAT+CONCAT_MGVUE_STYLE_VARS,
            _DIR_STYLE + "varible/*.scss",
            DIR_CONCAT+CONCAT_MIXIN_UIKIT,
            DIR_CONCAT+CONCAT_MGVUE_STYLE_UIKIT,
            _DIR_STYLE + "component/*.scss"
        ])
        .pipe(concat("mixin.scss"))
        .pipe(gulp.dest(_DIR_STYLE))
        .on("finish", function() { defer_concat.resolve() })

        return defer_concat;
    }).then(function() {
        defer_all.resolve();
    });

    return defer_all.promise;
}

function task_build_mgapp_assets() {
    var defer_all = Q.defer(), defer_assets = Q.defer(),
        defer_html = Q.defer();

    gulp.src([ DIR_APP+"assets/**/*" ])
    .pipe(gulp.dest(DIR_APP_DIST+"assets/"))
    .on("finish", function() { defer_assets.resolve() })

    gulp.src(DIR_APP+"index.html")
    .pipe(gulp.dest(DIR_APP_DIST))
    .on("finish", function() { defer_html.resolve() })

    Q.all([defer_html, defer_assets])
    .then(function() {
        log("magic app assets task finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}

function task_build_mgapp_style() {
    var defer_all = Q.defer();

    task_app_style_concat().then(function() {
        log("--- task app style concat finish");

        gulp.src([DIR_APP_PUBLIC+"style/mixin.scss",
            DIR_APP_PUBLIC+"main.scss"])
        .pipe(concat("main.scss"))
        .pipe(replace(/PUBLIC/g, DIR_APP_PUBLIC))
        .pipe(replace(/ASSETS/g, DIR_APP_ASSETS))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(BUILD_RELEASE, minifycss()))
        .pipe(gulp.dest(DIR_APP_DIST+"assets/"))
        .on("finish", function() {
            log("magic app style build css finish");
            defer_all.resolve();
        });
    });

    return defer_all.promise;
}
gulp.task("dev-build-mgapp-style", task_build_mgapp_style);

function initWebpackConfig() {
    var alias, plugins = [], entry;

    alias = extend({}, DIR_ALIAS); delete alias.resolve;
    alias.vue = BUILD_RELEASE ? "vue/dist/vue.min.js" : "vue/dist/vue.js";

    if (BUILD_RELEASE) {
        plugins.push(new webpackUglifyJS());
    } else {
        plugins.push(new webpack.HotModuleReplacementPlugin());
        plugins.push(new webpack.NamedModulesPlugin());
    }

    if (BUILD_RELEASE) {
        entry = "./app/public/main.js";
    } else {
        entry = [
            'webpack-dev-server/client?http://localhost:3000',
            'webpack/hot/only-dev-server',
            "./app/public/main.js"
        ]
    }

    return {
        entry: entry,
        context: DIR_BASE,

        output: {
            publicPath: '/pages/',
            path: DIR_APP_DIST+"pages/",

            filename: '[name].js',

            library: 'MagicVue',
            libraryTarget: "umd",
        },

        module: {
            rules: [
                { test: /pages\/.*index\.js$/, use: [ "mgvue-loader" ] },
                { test: /\.html$/, use: [ "html-loader" ] },
                { test: /\.css$/, use: [ "style-loader", "css-loader" ] }
            ],
        },

        resolve: { alias: alias }, plugins: plugins,
    }
}

function task_build_mgapp() {
    var defer_all = Q.defer(), defer_build = Q.defer(), oldBuild, newBuild;

    oldBuild = BUILD_RELEASE ? /(\w)(\.MagicVue=)(\w\(\))/
                             : /else\s*root\[\"MagicVue\"\] = factory\(\);/;
    newBuild = BUILD_RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$$)$1.$$=$1.MagicVue;'+
                               'if("undefined"==typeof define&&!$1.$)$1.$=$1.MagicVue.Magic;'
                             : 'else {\n\t\troot.MagicVue = root.$$$ = factory().default;'+
                               ' \n\t\troot.Magic = root.$ = root.MagicVue.Magic;\n\t}';
    webpack(initWebpackConfig(), function(err, stats) {
        var error = null;

        if (err) {
            log(err.stack || err, "error");
            if (err.details) log(err.details, "error");
            error = err.details || err.stack || err;
        }

        if (stats.hasErrors() || stats.hasWarnings()) {
            var info = stats.toJson(), style;

            if (stats.hasErrors()) {
                log(info.errors, "error");
            } else {
                log(info.warnings, "warn");
            }

            error = info.errors || null;
        }

        defer_build.resolve(error);
    });

    defer_build.promise.then(function(error) {
        if (error) {
            defer_all.resolve();
        } else {
            log("--- magic app webpack build finish");

            gulp.src(DIR_APP_DIST+"pages/main*.js")
            .pipe(replace(oldBuild, newBuild))
            .pipe(gulp.dest(DIR_APP_DIST+"assets/"))
            .on("finish", function() {
                del(DIR_APP_DIST+"pages/main*.js")
                .then(function() {
                    log("magic app all task build finish");
                    defer_all.resolve();
                });
            });
        }
    });

    return defer_all.promise;
}
gulp.task("dev-build-mgapp", task_build_mgapp);

function clean_mgapp() {
    return del([DIR_APP_DIST+"**/*"]);
}

function clean_assets() {
    return del([ DIR_APP_ASSETS+"debug" ]);
}

/**===============================================
 * 项目整体相关函数
 =================================================*/
gulp.task("build-all", function() {
    task_build_mixin()
    .then(function() {
        return task_build_minjs();
    }).then(function() {
        return task_build_magic();
    }).then(function() {
        return task_build_mgvue_style();
    }).then(function() {
        return task_build_mgvue();
    })
})

gulp.task("build", function(r) {
    return Q.all([
        task_build_mgapp_style(),
        task_build_mgapp_assets()
    ]).then(function() {
        return task_build_mgapp();
    });
})

gulp.bindTask("serve", function(d, r) {
    var args = arguments, DEBUG, alias, server

    DEBUG = args[0] ? true : false;
    BUILD_RELEASE = args[1] ? true : false;

    alias = extend({}, DIR_ALIAS); delete alias.resolve;
    alias.vue = BUILD_RELEASE ? "vue/dist/vue.min.js" : "vue/dist/vue.js";

    server = new webpackDevServer(webpack(initWebpackConfig()), {
        hot: true,

        publicPath: '/pages/',
        contentBase: DIR_APP_DIST,
    });

    server.listen(3000, "127.0.0.1", function() {
        console.log("Starting server on http://localhost:3000");
    });
    // browserSync.init({
    //     server: {
    //         baseDir: DIR_APP_DIST
    //     }
    // });
    //
    // if (DEBUG === true) {
    //     gulp.watch([DIR_MIXIN+"**/*"],    ["dev-build-mixin"]);
    //     gulp.watch([DIR_MINJS+"**/*.js"], ["dev-build-minjs"]);
    //
    //     gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js"], ["dev-build-magic"]);
    //
    //     gulp.watch([DIR_MIXIN+"**/*", DIR_MGVUE+"style/**/*"], ["dev-build-mgvue-style"]);
    //     gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js",
    //                 DIR_MGVUE+"**/*.js", DIR_MINJS+"**/*.js"], ["dev-build-mgvue"]);
    // }
    //
    // gulp.watch([DIR_MIXIN+"**/*", DIR_MGVUE+"style/**/*",
    //             DIR_APP_PUBLIC+"**/*.scss"], ["dev-build-mgapp-style"]);
    //
    // gulp.watch([DIR_MAGIC+"**/*.js", DIR_MINJS+"**/*.js",
    //             DIR_MGVUE+"**/*.js", DIR_MINJS+"**/*.js",
    //             DIR_APP_PUBLIC+"**/*.js"], ["dev-build-mgapp"]);
    //
    // gulp.watch([DIR_APP_DIST+"**/*", DIR_APP+"/index.html"]).on("change", reload);
});

gulp.task("clean", function() {
    return Q.all([
        clean_mixin(),
        clean_magic(),
        clean_mgvue(),
        clean_mgvue_style(),
        clean_mgapp(),
        clean_assets()
    ]);
})

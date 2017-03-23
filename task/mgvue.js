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
    rollupCommonjs      = require("rollup-plugin-commonjs"),
    rollupNodeResolve   = require("rollup-plugin-node-resolve"),
    del                 = require("del"),
    concat              = require("gulp-concat"),
    px2rem              = require("gulp-px2rem"),
    gulpif              = require("gulp-if"),
    autoprefixer        = require("gulp-autoprefixer"),
    sass                = require("gulp-sass"),
    minifycss           = require("gulp-clean-css");

var DIR    = require("./base").DIR,
    ALIAS  = require("./base").ALIAS,
    CONCAT = require("./base").CONCAT,
    log    = require("./base").log,

    px2remConfig      = require("./mixin").config;
    task_mixin_concat = require("./mixin").concat,
    clean_mixin_build = require("./mixin").clean;


function task_mgvue_style_concat() {
    var defer_all = Q.defer(), defer_var = Q.defer(),
        defer_com = Q.defer(), PATH = DIR.MGVUE+"style/";

    gulp.src(PATH+"/varible/*.scss")
    .pipe(concat(CONCAT.MGVUE_STYLE_VARS))
    .pipe(gulp.dest(DIR.CONCAT))
    .on("finish", function() { defer_var.resolve() });

    gulp.src(PATH+"/component/*.scss")
    .pipe(concat(CONCAT.MGVUE_STYLE_UIKIT))
    .pipe(gulp.dest(DIR.CONCAT))
    .on("finish", function() { defer_com.resolve() });

    Q.all([
        defer_var.promise,
        defer_com.promise,
        task_mixin_concat()
    ]).then(function() {
        gulp.src([DIR.CONCAT+CONCAT.MIXIN_CORE,
                  DIR.CONCAT+CONCAT.MIXIN_VARS,
              DIR.CONCAT+CONCAT.MGVUE_STYLE_VARS,
                  DIR.CONCAT+CONCAT.MIXIN_UIKIT,
              DIR.CONCAT+CONCAT.MGVUE_STYLE_UIKIT,
              DIR.MGVUE+"style/build.scss"
        ])
        .pipe(concat(CONCAT.MGVUE_STYLE_BUILD))
        .pipe(gulp.dest(DIR.CONCAT))
        .on("finish", function() { defer_all.resolve() });
    });

    return defer_all.promise;
}

function clean_mgvue_style_concat() {
    return Q.all([
        clean_mixin_build(),
        del(DIR.CONCAT+CONCAT.MGVUE_STYLE_VARS),
        del(DIR.CONCAT+CONCAT.MGVUE_STYLE_UIKIT),
        del(DIR.CONCAT+CONCAT.MGVUE_STYLE_BUILD)
    ]);
}

function task_mgvue_style_build() {
    var defer_build = Q.defer(), RELEASE;

    RELEASE = process.env.NODE_ENV == 'production';

    task_mgvue_style_concat().then(function() {
        log("--- mgvue style concot finish");

        gulp.src(DIR.CONCAT+CONCAT.MGVUE_STYLE_BUILD)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(RELEASE, minifycss()))
        .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
        .on("finish", function() {
            log("mgvue style build css finish");
            clean_mgvue_style_concat();
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}


function createPlugins() {
    var alias, RELEASE = process.env.NODE_ENV == 'production';

    alias = extend({}, ALIAS);
    alias.vue = RELEASE ? "vue/dist/vue.min.js" : "vue/dist/vue.js";
    alias.vue = DIR.BASE+"/node_modules/"+alias.vue;

    return [
        rollupAlias(alias),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: RELEASE ? '"production"' : '"development"',
        }),
        rollupCommonjs(),
        rollupNodeResolve({ jsnext: true, main: true, browser: true }),
        (RELEASE && rollupUglify({ mangle: { except: ['MagicVue'] } })),
    ];
}

function createReplace() {
    var result = {}, RELEASE = process.env.NODE_ENV == 'production';

    result.old = RELEASE ? /(\w)(\.MagicVue=)(\w\(\))/
                         : /(\(global.MagicVue = factory\(\)\)\;)/;

    result.new = RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$$)$1.$$=$1.MagicVue;'+
                           'if("undefined"==typeof define&&!$1.$)$1.$=$1.MagicVue.Magic;'
                         : '$1\n\tif(typeof define === "undefined" && !global.$$) '+
                           'global.$$ = global.MagicVue;'+
                           '\n\tif(typeof define === "undefined" && !global.$) '+
                             'global.$ = global.MagicVue.Magic;';

    return result;
}

function task_mgvue_core_build() {
    var defer_build = Q.defer(), replaceStr = createReplace();

    rollup({
        entry: DIR.MGVUE+"core/build.js",
        format: 'umd', moduleName: "MagicVue",
        plugins: createPlugins(),
    })
    .pipe(source('mgvue.js'))
    .pipe(replace(replaceStr.old, replaceStr.new))
    .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
    .on("finish", function() {
        log("--- mgvue core build finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

function task_mgvue_uikit_build() {
    var defer_build = Q.defer(), replaceStr = createReplace();

    rollup({
        entry: DIR.MGVUE+"mui/build.js",
        format: 'umd', moduleName: "MagicVue",
        plugins: createPlugins(),
    })
    .pipe(source('mgvue.ui.js'))
    .pipe(replace(replaceStr.old, replaceStr.new))
    .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
    .on("finish", function() {
        log("--- mgvue uikit build finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

function task_mgvue_main_build() {
    var defer_build = Q.defer();

    Q.all([
        task_mgvue_core_build(),
        task_mgvue_uikit_build()
    ]).then(function() {
        log("mgvue task all finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}


module.exports = {
    clean: clean_mgvue_style_concat,

    build: task_mgvue_main_build,
    buildStyle: task_mgvue_style_build,
};

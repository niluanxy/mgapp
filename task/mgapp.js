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
    del                 = require("del"),
    concat              = require("gulp-concat"),
    px2rem              = require("gulp-px2rem"),
    gulpif              = require("gulp-if"),
    autoprefixer        = require("gulp-autoprefixer"),
    sass                = require("gulp-sass"),
    minifycss           = require("gulp-clean-css"),
    fs                  = require("fs"),
    webpack             = require("webpack"),
    webpackUglifyJS     = require('uglifyjs-webpack-plugin');


var DIR    = require("./base").DIR,
    ALIAS  = require("./base").ALIAS,
    CONCAT = require("./base").CONCAT,
    log    = require("./base").log,

    px2remConfig = require("./mixin").config,
    task_mgvue_style_concat = require("./mgvue").concat;

var HOT_KEY = '"__HOT_MG_VUE_HASH__"';

function task_mgapp_style_concat() {
    var defer_concat = Q.defer(), PATH = DIR.APP_PUBLIC+"style/";

    task_mgvue_style_concat().then(function() {
        gulp.src([DIR.CONCAT+CONCAT.MIXIN_CORE,
                  DIR.CONCAT+CONCAT.MIXIN_VARS,
                  DIR.CONCAT+CONCAT.MGVUE_STYLE_VARS,
            PATH+"style/varible/*.scss",
                  DIR.CONCAT+CONCAT.MIXIN_UIKIT,
                  DIR.CONCAT+CONCAT.MGVUE_STYLE_UIKIT,
            PATH+"style/component/*.scss"
        ])
        .pipe(concat("mixin.scss"))
        .pipe(gulp.dest(PATH))
        .on("finish", function() { defer_concat.resolve() })
    });

    return defer_concat.promise;
}

function task_mgapp_style_build() {
    var defer_build = Q.defer(), RELEASE;

    RELEASE = process.env.NODE_ENV == 'production';

    task_mgapp_style_concat().then(function() {
        log("--- task magic app style concat finish");

        gulp.src([DIR.APP_PUBLIC+"style/mixin.scss",
                  DIR.APP_PUBLIC+"main.scss"])
        .pipe(concat("main.scss"))
        .pipe(replace(/PUBLIC/g, DIR.APP_PUBLIC))
        .pipe(replace(/ASSETS/g, DIR.APP_ASSETS))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(px2rem(px2remConfig))
        .pipe(gulpif(RELEASE, minifycss()))
        .pipe(gulp.dest(DIR.APP_DIST+"assets/"))
        .on("finish", function() {
            log("magic app style build css finish");
            defer_build.resolve();
        });
    });

    return defer_build.promise;
}

function task_mgapp_assets_build() {
    var defer_all = Q.defer(), defer_assets = Q.defer(),
        defer_html = Q.defer(), hotScript, remScript;

    hotScript = fs.readFileSync("./template/hotSocket.js").toString();
    hotScript = hotScript.replace(/_SOCKET_HOST_/, "127.0.0.1");
    hotScript = hotScript.replace(/_HOT_KEY_/, HOT_KEY);

    remScript = fs.readFileSync("./template/remScript.js").toString();
    remScript = "</title>\n\n\t"+remScript+"\n";

    gulp.src(DIR.APP+"assets/**/*")
    .pipe(gulp.dest(DIR.APP_DIST+"assets/"))
    .on("finish", function() { defer_assets.resolve() })

    gulp.src(DIR.APP+"index.html")
    .pipe(replace(/\<\/title\>/, remScript))
    .pipe(replace(/\<\/body\>/,  hotScript))
    .pipe(gulp.dest(DIR.APP_DIST))
    .on("finish", function() { defer_html.resolve() })

    Q.all([defer_html.promise, defer_assets.promise])
    .then(function() {
        log("magic app assets task finish");
        defer_all.resolve();
    });

    return defer_all.promise;
}

function createConfig() {
    var plugins = [], alias = extend({}, ALIAS),
        RELEASE = process.env.NODE_ENV == 'production';

    alias.vue = RELEASE ? "vue/dist/vue.min.js" : "vue/dist/vue.js";

    if (RELEASE) {
        plugins.push(new webpackUglifyJS());
    } else {
        plugins.push(new webpack.HotModuleReplacementPlugin());
        plugins.push(new webpack.NamedModulesPlugin());
    }

    return {
        context: DIR.BASE,
        entry: RELEASE ? "./app/public/main.js" : [
            'webpack-dev-server/client?http://localhost:3000',
            'webpack/hot/only-dev-server',
            "./app/public/main.js"
        ],
        output: {
            publicPath: '/pages/', path: DIR_APP_DIST+"pages/",
            filename: '[name].js', library: 'MagicVue', libraryTarget: "umd",
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

function createReplace() {
    var result = {}, RELEASE = process.env.NODE_ENV == 'production';

    result.oldStr = RELEASE ? /(\w)(\.MagicVue=)(\w\(\))/
                            : /else\s*root\[\"MagicVue\"\] = factory\(\);/;
    result.newStr = RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$$)$1.$$=$1.MagicVue;'+
                              'if("undefined"==typeof define&&!$1.$)$1.$=$1.MagicVue.Magic;'
                            : 'else {\n\t\troot.MagicVue = root.$$$ = factory().default;'+
                              ' \n\t\troot.Magic = root.$ = root.MagicVue.Magic;\n\t}';

    result.oldHash = /var\shotCurrentHash\s\=\s(.{22});/;
    result.newHash = 'var hotCurrentHash = '+
                        'localStorage.getItem('+HOT_KEY+') || $1;'+
                        'localStorage.removeItem('+HOT_KEY+');';

    result.oldSet = "hotCurrentHash = hotUpdateNewHash;";
    result.newSet = 'window['+HOT_KEY+'] = hotCurrentHash = hotUpdateNewHash;';

    return result;
}

function task_mgapp_main_fix() {
    var defer_fix = Q.defer(), replaceStr = createReplace();

    gulp.src(DIR.APP_DIST+"pages/main*.js")
    .pipe(replace(replaceStr.oldStr,  replaceStr.newStr))
    .pipe(replace(replaceStr.oldSet,  replaceStr.newSet))
    .pipe(replace(replaceStr.oldHash, replaceStr.newHash))
    .pipe(gulp.dest(DIR.APP_DIST+"assets/"))
    .on("finish", function() {
        del(DIR.APP_DIST+"pages/main*.js");
        defer_fix.resolve();
    });

    return defer_fix.promise;
}

function webpackCallback(callback) {
    return function(err, stats) {
        var error = null;

        if (err) {
            log(err.stack || err, "error");
            if (err.details) log(err.details, "error");
            error = err.details || err.stack || err;
        } else if (stats.hasErrors() || stats.hasWarnings()) {
            var info = stats.toJson(), style;

            if (stats.hasErrors()) {
                log(info.errors, "error");
            } else {
                log(info.warnings, "warn");
            }

            error = info.errors || null;
        }

        if (typeof callback === "function") {
            callback(error);
        }
    }
}

function task_mgapp_main_build() {
    var defer_build = Q.defer();

    webpack(createConfig(), webpackCallback(function(error) {
        if (error) {
            log(error, "error"); defer_all.resolve();
        } else {
            log("--- magic app webpack build finish");

            task_mgapp_main_fix().then(function() {
                log("magic app all task build finish");
                defer_build.resolve();
            });
        }
    }));

    return defer_build.promise;
}

function clean_mgapp_dist() {
    return del([DIR.APP_DIST+"**/*"]);
}

function clean_mgapp_assets() {
    return del([DIR.APP_ASSETS+"debug"]);
}


module.exports = {
    cleanDist  : clean_mgapp_dist,
    cleanAssets: clean_mgapp_assets,

    fix     : task_mgapp_main_fix,
    config  : createConfig,
    callback: webpackCallback,

    buildMain  : task_mgapp_main_build,
    buildStyle : task_mgapp_style_build,
    buildAssets: task_mgapp_assets_build,
};

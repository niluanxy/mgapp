var gulp                = require("gulp-param")(require("gulp"), process.argv),
    extend              = require("extend"),
    Q                   = require("q"),
    extend              = require("extend"),
    source              = require("vinyl-source-stream"),
    rollup              = require("rollup-stream"),
    replace             = require("gulp-replace"),
    rollupReplace       = require("rollup-plugin-replace"),
    rollupAlias         = require("rollup-plugin-alias"),
    rollupUglify        = require("rollup-plugin-uglify");

var DIR    = require("./base").DIR,
    ALIAS  = require("./base").ALIAS,
    CONCAT = require("./base").CONCAT,
    log    = require("./base").log;

function createPlugins() {
    var RELEASE = process.env.NODE_ENV == 'production';

    return [
        rollupAlias(extend({}, ALIAS)),
        rollupReplace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (RELEASE && rollupUglify({ mangle: { except: ['Magic'] } })),
    ];
}

function createReplace() {
    var result = {}, RELEASE = process.env.NODE_ENV == 'production';

    result.old = RELEASE ? /(\w)(\.Magic=)(\w\(\))/
                         : /(\(global.Magic = factory\(\)\)\;)/;
    result.new = RELEASE ? '$1$2$3;if("undefined"==typeof define&&!$1.$)$1.$=$1.Magic;'
                         : '$1\n\tif(typeof define === "undefined" && !global.$) '+
                           'global.$ = global.Magic;';

    return result;
}

function task_magic_core_build() {
    var defer_build = Q.defer(), replaceStr = createReplace();

    rollup({
        entry: DIR.MAGIC+"core/build.js",
        format: 'umd', moduleName: "Magic",
        plugins: createPlugins(),
    })
    .pipe(source('magic.js'))
    .pipe(replace(replaceStr.old, replaceStr.new))
    .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
    .on("finish", function() {
        log("--- magic core build finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

function task_magic_uikit_build() {
    var defer_build = Q.defer(), replaceStr = createReplace();

    rollup({
        entry: DIR.MAGIC+"mui/build.js",
        format: 'umd', moduleName: "Magic",
        plugins: createPlugins(),
    })
    .pipe(source('magic.ui.js'))
    .pipe(replace(replaceStr.old, replaceStr.new))
    .pipe(gulp.dest(DIR.APP_ASSETS+"debug/"))
    .on("finish", function() {
        log("--- magic uikit build finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

function task_magic_build() {
    var defer_build = Q.defer();

    Q.all([
        task_magic_core_build(),
        task_magic_uikit_build()
    ]).then(function() {
        log("magic task all finish");
        defer_build.resolve();
    });

    return defer_build.promise;
}

module.exports = {
    build: task_magic_build,
};

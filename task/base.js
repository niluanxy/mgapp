var moment  = require("moment"),
    path    = require("path");


var DIR_BASE   = path.resolve(__dirname, "../")+"/",
    CONCAT_PRE = "_concat_";

var DIR = {
    BASE: DIR_BASE,
    TASK: DIR_BASE+"task/",

    APP : DIR_BASE + "app/",
    DEV : DIR_BASE + "dev/",

    MIXIN: DIR_BASE + "dev/mixin/",
    MINJS: DIR_BASE + "dev/minjs/",
    MAGIC: DIR_BASE + "dev/magic/",
    MGVUE: DIR_BASE + "dev/mgvue/",

    CONCAT: DIR_BASE + "dev/concat/",

    APP_PUBLIC: DIR_BASE + "app/public/",
    APP_ASSETS: DIR_BASE + "app/assets/",
    APP_MODULE: DIR_BASE + "app/module/",

    APP_DIST: DIR_BASE + "dist/",
};

var CONCAT = {
    MIXIN_CORE : CONCAT_PRE + "mixin-core.scss",
    MIXIN_VARS : CONCAT_PRE + "mixin-vars.scss",
    MIXIN_UIKIT: CONCAT_PRE + "minix-uikit.scss",
    MIXIN_BUILD: "mixin.scss",

    MAGIC_BASE : CONCAT_PRE + "magic.js",
    MAGIC_UIKIT: CONCAT_PRE + "magic.ui.js",

    MGVUE_STYLE_VARS : CONCAT_PRE + "mgvue-vars.scss",
    MGVUE_STYLE_UIKIT: CONCAT_PRE + "mgvue-uikit.scss",
    MGVUE_STYLE_BUILD: "mgvue.scss",

    MGVUE_BASE : CONCAT_PRE + "mgvue.js",
    MGVUE_UIKIT: CONCAT_PRE + "mgvue.ui.js",
};

var DIR_ALIAS = {
    LIB_MINJS: DIR.MINJS,

    MG_CORE  : DIR.MAGIC+"core",
    MG_UIKIT : DIR.MAGIC+"mui",
        MG_MAGIC : DIR.MAGIC+"core/magic",
        MG_MODULE: DIR.MAGIC+"core/module",
        MG_STATIC: DIR.MAGIC+"core/static",

    MV_CORE  : DIR.MGVUE+"core",
    MV_UIKIT : DIR.MGVUE+"mui",
        MV_MODULE: DIR.MGVUE+"core/module",

    // magic app 相关目录常量
    ASSETS: DIR.APP_ASSETS,
    PUBLIC: DIR.APP_PUBLIC,
    MODULE: DIR.APP_MODULE,
        STYLE: DIR.APP_MODULE+"style",
        STORE: DIR.APP_MODULE+"store",
        COMPONENT: DIR.APP_MODULE+"component",

    pages: DIR.APP+"pages",
};

var colors = require("colors");
colors.setTheme({ silly: 'rainbow', input: 'grey', verbose: 'cyan',
    prompt: 'red', info: 'green', data: 'blue', help: 'cyan',
    warn: 'yellow', debug: 'magenta', error: 'red', time: 'gray'
});

function log(str, style) {
    style = style || "info";

    var _time = moment().format("HH:mm:ss").time;

    console.log("["+_time+"] "+str.toString()[style]);
}

module.exports = { log: log, DIR: DIR, CONCAT: CONCAT, ALIAS: DIR_ALIAS };

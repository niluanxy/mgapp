import RootMagic from "MG_CORE/build.js";

import MagicVue from "MV_CORE/build.js";
import ConfigUI from "MV_UIKIT/base/config.js";

import "MG_UIKIT/gesture/main.js";

import "MV_UIKIT/header/main.js";
import "MV_UIKIT/navbar/main.js";

import "MV_UIKIT/page/main.js";
import "MV_UIKIT/router/main.js";
import "MV_UIKIT/scroll/main.js";
import "MV_UIKIT/content/main.js";
import "MV_UIKIT/refresh/main.js";
import "MV_UIKIT/footer/main.js";

import "MV_UIKIT/card/main.js";
import "MV_UIKIT/button/main.js";
import "MV_UIKIT/tabs/main.js";
import "MV_UIKIT/slider/main.js";
import "MV_UIKIT/list/main.js";
import "MV_UIKIT/counter/main.js";

import "MV_UIKIT/tip/main.js";

MagicVue.Magic = RootMagic;
MagicVue.config.ui = ConfigUI;

export default MagicVue;

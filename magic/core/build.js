import RootMagic from "CORE_MAGIC/main.js";

import "CORE_MODULE/dom/main.js";
import "CORE_MODULE/style/main.js";
import "CORE_MODULE/event/main.js";
import "CORE_MODULE/util/main.js";
import "CORE_STATIC/main.js";

try {
    if (typeof window === "object") {
        window.Magic = RootMagic;
        if (!window.$) window.$ = RootMagic;
    }
} catch(e) {};

RootMagic.version = "0.5.0";

export default RootMagic;
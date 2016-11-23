import RootMagic from "./magic/main.js";

import "./module/dom/main.js";
import "./module/style/main.js";

try {
    if (typeof window === "object") {
        window.Magic = RootMagic;
        if (!window.$) window.$ = RootMagic;
    }
} catch(e) {};

RootMagic.version = "0.5.0";

export default RootMagic;
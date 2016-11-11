import RootMagic from "./magic/main.js";

try {
    if (typeof window === "object") {
        window.Magic = RootMagic;
        if (!window.$) window.$ = RootMagic;
    }
} catch(e) {};

RootMagic.version = "0.5.0";

export default RootMagic;
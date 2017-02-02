import RootMagic from "MG_MAGIC/main.js";
import Gesture from "MG_UIKIT/gesture/core/main.js";
import "MG_UIKIT/gesture/tap/main.js";

RootMagic(function() { Gesture.init(); });
RootMagic.extend({gesture: Gesture});
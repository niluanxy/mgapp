import RootMagic from "CORE_MAGIC/main.js";
import Gesture from "./core/main.js";
import "./tap/main.js";

RootMagic(function() { Gesture.init(); });
RootMagic.extend({gesture: Gesture});
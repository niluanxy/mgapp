import RootMagic from "MG_MAGIC/main.js";

import "MG_MODULE/event/plugin/trans.js";
import {on, once, off, emit} from "MG_MODULE/event/core/main.js";

RootMagic.fn.extend({ on: on, once: once, off: off, emit: emit });

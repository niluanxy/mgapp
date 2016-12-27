import RootMagic from "CORE_MAGIC/main.js";

import * as util from "./util/main.js";
import * as http from "./http/main.js";
import * as platform from "./platform/main.js";

RootMagic.extend(util, http, platform);
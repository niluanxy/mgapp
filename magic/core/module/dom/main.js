import RootMagic from "../../magic/main.js";

import * as editer from "./editer/main.js";
import * as search from "./search/main.js";
import * as attrbute from "./attrbute/main.js";

console.log("has run 1 attrs");
RootMagic.fn.extend(attrbute, editer, search); 
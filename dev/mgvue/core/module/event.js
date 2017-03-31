import {each} from "LIB_MINJS/utils.js";

export default function bindEvents(self) {
    var arrs = self.$options;

    if ((arrs = arrs["events"])) {
        each(arrs, function(key, callback) {
            self.$on(key, callback);
        });
    }
}

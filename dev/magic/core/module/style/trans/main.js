import RootMagic from "MG_MAGIC/main.js";
import {element, each, trim} from "LIB_MINJS/utils.js";
import {allProxy} from "MG_MAGIC/proxy.js";

function firstUpperCase(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function setTrans(el, key, val) {
    var upKey = firstUpperCase(key);

    each(["webkit", "O", "ms", "Moz"], function(i, pre) {
        el.style[pre+upKey] = val;
    });

    el.style[key] = val;
}

function getTrans(el, key) {
    var upKey = firstUpperCase(key), result;

    each(["webkit", "O", "ms", "Moz"], function(i, pre) {
        result = el.style[pre+upKey];
        if (result !== undefined) return false;
    });

    return el.style[key] || result;
}

function setTransform(el, key, val) {
    var transform = getTrans(el, "transform"),
        clearKey, lastKey, index;

    if (key !== undefined && val != null) {
        if (key === null) {
            transform = val;
        } else {
            if (transform == "none") {
                transform = "";
            }

            clearKey = key.replace(/[A-Z]/, '');

            if (transform.match(clearKey)) {
                if (transform.match(key+"\\(")) {
                    transform = transform.replace(
                        new RegExp(key+"\\([^)]*\\)"), key+"("+val+")");
                } else if (lastKey = key.match(/[X-Z]/)) {
                    if (transform.match(clearKey+"[X-Z]")) {
                        transform += " "+key+"("+val+")";
                    } else {
                        index = "XYZ".search(lastKey[0]);

                        transform = transform.replace("("+key+"\\()"+"([^(]*)"+"(\\))",
                        function($0, $1, $2, $3) {
                            var arrs = $2.split(",");

                            arr[index] = val;
                            arr = arr.join(",");

                            return $1+arr+$3;
                        });
                    }
                } else if (val.match(",")) {
                    val = val.split(","); clearKey = "XYZ";

                    each(val, function(i, value) {
                        find = key+"XYZ"[i];

                        if (transform.match(find)) {
                            transform = transform.replace(
                                new RegExp(find+"\\([^)]*\\)"), find+"("+value+")");
                        } else {
                            transform += " "+find+"("+val+")";
                        }
                    })
                }
            } else {
                transform += " "+key+"("+val+")";
            }
        }

        setTrans(el, "transform", trim(transform));
    }
}

function getTransform(el, key) {
    var transform = getTrans(el, "transform"),
        clearKey, lastKey, index, find, result = "";

    if (key == null) {
        return transform;
    } else {
        clearKey = key.replace(/[A-Z]/, '');

        if (clearKey === key) {
            if (transform.match(key)) {
                if (find = transform.match(key+"\\([^(]*\\)")) {
                    result = find[0];
                } else {
                    find = transform.match(new RegExp(key+"[X-Z]\\([^(]*\\)", "g"));
                    result = [];

                    each(find, function(i, value) {
                        lastKey = value.match(key+"([X-Z])");
                        index = "XYZ".search(lastKey[1]);

                        result[index] = value.match("\\("+"([^)]*)"+"\\)")[1];
                    });

                    for(var i=0; i<result.length; i++) {
                        if (result[i] === undefined) {
                            result[i] = "auto";
                        }
                    }

                    result = result.join(",");
                }
            }
        } else {
            if (find = transform.match(key+"\\(([^)]*)")) {
                result = find[1];
            } else if (find = transform.match(clearKey+"\\([^)]*")) {
                result = find[0].split(",");
                lastKey = key.match("[A-Z]")[0];
                index = "XYZ".search(lastKey);

                result = result[index] || "auto";
            }
        }
    }

    return result;
}

function transformProxy(aKey, aVal) {
    var el = element(this);

    if (el) {
        if (aVal !== undefined) {
            setTransform(el, aKey, aVal);
        } else if (aKey === undefined) {
            return getTrans(el, "transform");
        } else {
            return getTransform(el, aKey);
        }
    }

    return this;
}

export function transform(aKey, aVal, setAll) {
    return allProxy.call(this, transformProxy, aKey, aVal, setAll);
}

function transitionProxy(aVal) {
    var el = element(this);

    if (el) {
        if (aVal !== undefined) {
            setTrans(el, "transition", aVal);
        } else {
            return getTrans(el, "transition");
        }
    }

    return this;
}

export function transition(aVal, setAll) {
    return allProxy.call(this, transitionProxy, aVal, setAll);
}

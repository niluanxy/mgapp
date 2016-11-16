import {tryKey} from "../../../function/tools.js";

export function html(html) {
    return tryKey.call(this, "innerHTML", html, true);
}

export function outerHTML(html) {
    return tryKey.call(this, "outerHTML", html, true);
}

export function text(text) {
    return tryKey.call(this, "innerText", text, true);
}
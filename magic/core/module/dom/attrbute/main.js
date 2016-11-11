import {tryKey} from "../../../function/tools.js";

function html(html) {
    return tryKey.call(this, "innerHTML", html, true);
}

function outerHTML(html) {
    return tryKey.call(this, "outerHTML", html, true);
}

function text(text) {
    return tryKey.call(this, "innerText", html, true);
}

export {html, outerHTML, text};
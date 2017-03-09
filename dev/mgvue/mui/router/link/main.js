import MagicVue from "MV_BASE/main.js";
import RootMagic from "MG_CORE/build.js";
import Ready from "LIB_MINJS/ready.js";
import "MG_UIKIT/gesture/tap/main.js";
import RootRouter from "MV_MODULE/router.js";

function findLink(target) {
    var find = target, tag, link;

    while(find) {
        tag = find.tagName;

        if (tag === "A" && (link = find.getAttribute("link"))) {
            return {el: find, link: link};
        }

        find = find.parentNode;
    };

    return null;
}

MagicVue.$bind(function() {
    RootMagic(document).on("tap", function(e) {
        var $link = findLink(e.target);

        if ($link && $link.link) {
            setTimeout(function() {
                RootRouter.go($link.link);
            }, 17);
        }
    });
});

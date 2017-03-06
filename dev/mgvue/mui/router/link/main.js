import RootMagic from "MG_CORE/build.js";
import Ready from "LIB_MINJS/ready.js";
import "MG_UIKIT/gesture/tap/main.js";
import RootRouter from "MV_MODULE/router.js";

function findLink(target) {
    var find = target, tag;

    while(find) {
        tag = find.tagName;

        if (tag === "A" && find.getAttribute("link")) {
            return find;
        }

        find = find.parentNode;
    };

    return null;
}

Ready(function() {
    RootMagic(document).on("tap", function(e) {
        var $link = findLink(e.target), link;

        if ($link && (link = $link.getAttribute("link"))) {
            RootRouter.go(link);
        }
    });
});

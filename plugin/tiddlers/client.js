/*\
title: $:/plugins/EvidentlyCube/SocketSync/client.js
type: application/javascript
module-type: startup

\*/

(async function() {

    /*jslint node: false, browser: true */
    /*global $tw: true */
    "use strict";

    function compareDates(left, right) {
        left = left && left.toString();
        right = right && right.toString();

        return left === right;
    }
    try {
        if (!$tw.browser) {
            return;
        }

        const webSocket = new WebSocket(`ws://${location.host}/socket-sync`);
        webSocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            for (const title of Object.keys(data)) {
                const tiddlerInfo = data[title];
                if (tiddlerInfo.deleted) {
                    $tw.wiki.deleteTiddler(title);
                } else if (tiddlerInfo.modified) {
                    const tiddler = $tw.wiki.getTiddler(title);
                    if (!tiddler || JSON.stringify(tiddler.fields) !== JSON.stringify(tiddlerInfo.tiddler.fields)) {
                        console.log("Updating tiddler");
                        $tw.wiki.addTiddler(new $tw.Tiddler(tiddlerInfo.tiddler.fields));
                    }
                }
            }

        }


    } catch (e) {
        console.log("Socket-sync client error: " + e);
    }
})();
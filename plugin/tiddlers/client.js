/*\
title: $:/plugins/EvidentlyCube/SocketSync/client.js
type: application/javascript
module-type: startup

\*/

(async function() {

    /*jslint node: false, browser: true */
    /*global $tw: true */
    "use strict";

    try {
        if (!$tw.browser) {
            return;
        }

        const webSocket = new WebSocket(`ws://${location.host}/socket-sync`);
        webSocket.onopen = () => {
            console.log("socket-sync client: open");
        };
        webSocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("socket-sync client: message, " + message);
            console.log(data);
            for (const title of Object.keys(data)) {
                const tiddlerInfo = data[title];
                if (tiddlerInfo.deleted) {
                    $tw.wiki.deleteTiddler(title);
                } else if (tiddlerInfo.modified) {
                    const tiddler = $tw.wiki.getTiddler(title);
                    if (!tiddler || tiddler.fields.modified !== tiddlerInfo.tiddler.fields.modified) {
                        console.log(tiddler.fields.modified, tiddlerInfo.tiddler.fields.modified);
                        $tw.wiki.addTiddler(new $tw.Tiddler(tiddler));
                    }
                }
            }

        }


    } catch (e) {
        console.log("Socket-sync client error: " + e);
    }
})();
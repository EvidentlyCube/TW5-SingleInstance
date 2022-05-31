/*\
title: $:/plugins/EvidentlyCube/SocketSync/server.js
type: application/javascript
module-type: startup

\*/

console.log("server-sync: server file loaded");

(async function() {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    console.log("server-sync: server file executing");

    try {
        if (!$tw.node) {
            console.log("server-sync: not node, skip");
            return;
        }

        console.log("socket-sync: Import WS");

        const ws = require('ws');
        console.log(ws);


    } catch (e) {
        console.log("`ws` is not installed so socket-sync plugin won't run: " + e);
    }
})();
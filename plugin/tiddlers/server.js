/*\
title: $:/plugins/EvidentlyCube/SocketSync/server.js
type: application/javascript
module-type: startup

\*/

(function() {

    /*jslint node: true, browser: false */
    /*global $tw: true */
    "use strict";

    const ignoredPatterns = [
        '$:/StoryList'
    ];

    function matchIgnoredPattern(tiddlerTitle) {
        for (const pattern of ignoredPatterns) {
            if (typeof pattern === 'string' && tiddlerTitle === pattern) {
                return true;
            } else if (pattern.test && pattern.test(tiddlerTitle)) {
                return true;
            }
        }

        return false;
    }

    $tw.hooks.addHook('th-server-command-post-start', (_, nodeServer) => {
        if (!$tw.node) {
            return;
        }


        const ws = require('ws');
        const url = require('url');
        const crypto = require('crypto');
        const wsServer = new ws.WebSocketServer({ noServer: true });
        const clients = [];
        const changedTiddlers = new Map();

        $tw.wiki.addEventListener("change",function(changes) {
            const message = {};
            const tiddlerTitles = Object.keys(changes);
            for (const tiddlerTitle of tiddlerTitles) {
                if (matchIgnoredPattern(tiddlerTitle)) {
                    continue;
                }

                const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
                const hash = tiddler
                    ? crypto.createHash('sha1').update(JSON.stringify(tiddler)).digest('base64')
                    : '<deleted>';

                if (changedTiddlers.get(tiddlerTitle) === hash) {
                    continue;
                }

                changedTiddlers.set(tiddlerTitle, hash);

                message[tiddlerTitle] = {
                    ...changes[tiddlerTitle],
                    tiddler
                };
            }

            const tiddlersJson = JSON.stringify(message);
            for (const client of clients) {
                client.send(tiddlersJson);
            }
        });

        wsServer.on('connection', function(ws) {
            console.log("Client connected");
            clients.push(ws);

            ws.on('close', () => {
                const index = clients.indexOf(ws);

                if (index !== -1) {
                    clients.splice(index, 1);
                }
            });

            ws.on('message', function message(data) {
              console.log('received: %s', data);
            });
        });

        nodeServer.on('upgrade', (request, socket, head) => {
            const { pathname } = url.parse(request.url);

            if (pathname === '/socket-sync') {
                wsServer.handleUpgrade(request, socket, head, (ws) => {
                    wsServer.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });
    });
})();
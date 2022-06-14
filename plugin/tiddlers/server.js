/*\
title: $:/plugins/EvidentlyCube/SingleInstance/server.js
type: application/javascript
module-type: startup

\*/

(function () {

	/*jslint node: true, browser: false */
	/*global $tw: true */
	"use strict";


	$tw.hooks.addHook('th-server-command-post-start', (_, nodeServer) => {
		if (!$tw.node) {
			return;
		}

		let idCounter = 0;
		let focusedClientId = null;
		let focusedClient = null;
		const ws = require('ws');
		const url = require('url');
		const wsServer = new ws.WebSocketServer({ noServer: true });

		wsServer.on('connection', function (socket) {
			if (focusedClient) {
				focusedClient.send(JSON.stringify({
					type: 'lose-focus',
					data: true
				}));
				focusedClient = null;
			}

			const connectionId = ++idCounter;
			focusedClientId = connectionId;
			focusedClient = socket;

			socket.send(JSON.stringify({
				type: 'gain-focus',
				data: connectionId
			}));

			socket.on('close', () => {
				if (focusedClientId === connectionId) {
					focusedClient = null;
					focusedClientId = null;
				}
			});

			socket.on('message', messageData => {
				const { type, data } = JSON.parse(messageData);
				switch (type) {
					case 'check-focus':
						if (parseInt(data) === focusedClientId) {
							break;
						}
						// fall through
					default:
						socket.send(JSON.stringify({
							type: 'lose-focus',
							data: true
						}));
						break;

				}
			})
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
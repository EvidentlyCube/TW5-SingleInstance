/*\
title: $:/plugins/EvidentlyCube/SingleInstance/client.js
type: application/javascript
module-type: startup

\*/

(async function () {

	/*jslint node: false, browser: true */
	/*global $tw: true */
	"use strict";

	if (!$tw.browser || $tw.wiki.getTiddler('$:/config/evidentlycube/SingleInstance/disable')) {
		return;
	}

	const coverDiv = document.createElement('div');
	coverDiv.id = 'ec-sinstance_cover';
	coverDiv.innerText = "Connecting to socket server, please wait.";
	document.querySelector('body').appendChild(coverDiv);

	let isGracefulDisconnect = false;
	let wasConnected = false;
	let isConnected = false;
	let connectionId = null;

	const connect = () => {
		const webSocket = new WebSocket(`ws://${location.host}/socket-sync`);

		const getFocus = () => {
			if (!wasConnected) {
				return;
			}

			if (isConnected || isGracefulDisconnect) {
				window.location.reload();
			} else {
				coverDiv.style.display = "none";
			}
		};

		const checkConnection = () => {
			if (webSocket.readyState === WebSocket.OPEN) {
				webSocket.send(JSON.stringify({
					type: 'check-focus',
					data: connectionId
				}));
			}
		};

		webSocket.onopen = () => {
			wasConnected = true;
			coverDiv.addEventListener('click', getFocus);
		};
		webSocket.onclose = () => {
			isConnected = false;
			coverDiv.style.display = 'flex';
			if (document.activeElement) {
				document.activeElement.blur();
			}
			if (!isGracefulDisconnect) {
				coverDiv.innerText = "Connection with the server lost. Click to close this dialog or refresh to attempt reconnecting."
			}
		};
		webSocket.onerror = () => {
			coverDiv.removeEventListener('click', getFocus);
			webSocket.close();
		}
		webSocket.onmessage = (message) => {
			const { type, data } = JSON.parse(message.data);
			switch (type) {
				case 'gain-focus':
					if (isConnected) {
						break;
					}

					isConnected = true;
					connectionId = data;
					coverDiv.style.display = 'none';
					setInterval(checkConnection, 10000);
					window.addEventListener('focus', checkConnection);
					window.addEventListener('blur', checkConnection);
					break;

				case 'lose-focus':
					isGracefulDisconnect = true;
					webSocket.close();
					coverDiv.innerText = "Another instance has a focus, click to take it over.";
					break;
			}
		};
	}

	try {
		connect();

	} catch (e) {
		console.log("Socket-sync client error: " + e);
	}
})();
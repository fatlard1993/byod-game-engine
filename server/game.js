const uuid = require('uuid').v4;
const log = new (require('log'))({ tag: 'byod-game-engine' });
const WebsocketServer = require('websocket-server');

class Game {
  constructor(rootFolder, port, homePath = '/lobby'){
		this.id = uuid();
		this.users = {};
		this.rooms = {};
		this.rootFolder = rootFolder;
		this.port = port;
		this.httpServer = require('http-server').init(port, rootFolder, homePath);
		this.sockets = new WebsocketServer({ server: this.httpServer.app.server });

		log(`[game] Started @ ${rootFolder} using port ${port}`);
	}

	stringToColor(str){
		if(str.length === 0) return 'hsl(0, 0, 100%)';

		var vowelKey = { a: 1, A: 1, e: 1, E: 1, i: 1, I: 1, o: 1, O: 1, u: 1, U: 1 };
		var ascenderKey = { t: 1, d: 1, b: 1, l: 1, f: 1, h: 1, k: 1 };
		var descenderKey = { q: 1, y: 1, p: 1, g: 1, j: 1 };
		var letters = str.replace(/[^a-z]/i, '').toLowerCase().split(''), letterCount = letters.length;

		var hue = Math.floor((letters[0].toLowerCase().charCodeAt() - 96) / 26 * 360), luminosity = 50;
		var consonantCount = 0, luminosityIncrement = 1 / letterCount * 50;

		for(var x = 0, ord; x < letterCount; ++x){
			ord = letters[x].charCodeAt();

			if((ord >= 65 && ord <= 90) || (ord >= 97 && ord <= 122)) hue += ord - 64;

			if(!vowelKey[letters[x]]) ++consonantCount;

			if(ascenderKey[letters[x]]) luminosity += luminosityIncrement;

			else if(descenderKey[letters[x]]) luminosity -= luminosityIncrement * 2;
		}

		return `hsl(${(hue %= 360)}, ${Math.min(100, consonantCount / letterCount / 0.95 * 100)}%, ${Math.min(100, luminosity)}%)`;
	}
}

module.exports = Game;
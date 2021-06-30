const { nanoid } = require('nanoid');
const log = new (require('log'))({ tag: 'byod-game-engine' });
const WebsocketServer = require('websocket-server');

class Game {
  constructor(rootFolder, port, homePath = '/lobby'){
		this.id = nanoid(7);
		this.rooms = {};
		this.rootFolder = rootFolder;
		this.port = port;
		this.httpServer = require('http-server').init(port, rootFolder, homePath);
		this.sockets = new WebsocketServer({ server: this.httpServer.app.server });

		log(`[game] Started @ ${rootFolder} using port ${port}`);
	}
}

module.exports = Game;
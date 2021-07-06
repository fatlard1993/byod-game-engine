const { nanoid } = require('nanoid');
const log = new (require('log'))({ tag: 'byod-game-engine', verbosity: 1 });
const WebsocketServer = require('websocket-server');

class Game {
	constructor({ rootFolder, port, verbosity, homePath = '/lobby', ...options }){
		this.id = nanoid(7);
		this.options = options;
		this.rooms = {};
		this.rootFolder = rootFolder;
		this.port = port;
		this.httpServer = require('http-server').init(port, rootFolder, homePath);
		this.sockets = new WebsocketServer({ server: this.httpServer.app.server });

		if (typeof verbosity !== 'undefined') log.options.verbosity = verbosity;

		log(`[game] Started ${rootFolder} using port ${port}`);
	}
}

module.exports = Game;
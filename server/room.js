const log = require('log');

class Room {
	constructor(options, game){
		this.game = game;
		this.options = options;
		this.name = options.name;
		this.players = {};
		this.playerNames = [];
		this.state = {};

		log(`[room - ${this.name}] Create`);
		log(1)(options);
	}

	addPlayer(player){
		log(`[room - ${this.name}] User "${player.name}" join`);

		player.state = 'joining';

		if(!this.players[player.name]) this.players[player.name] = player

		this.playerNames = Object.keys(this.players);
		this.playerCount = this.playerNames.length;

		return player;
	}

	removePlayer(player){
		if(!player || !player.name || !this.players[player.name]) return;

		log(`[room - ${this.name}] Player "${player.name}" leave`);

		this.players[player.name].state = 'inactive';
	}

	broadcast(type, payload){
		log('broadcast', type, payload);

		var message = JSON.stringify({ type, payload });

		this.playerNames.forEach((playerName) => {
			if(!this.players[playerName].socket && this.players[playerName].socket.readyState === 1) this.players[playerName].socket.send(message);
		});
	}
}

module.exports = Room;
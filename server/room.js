const { nanoid } = require('nanoid');
const log = new (require('log'))({ tag: 'byod-game-engine' });

class Room {
	constructor(options) {
		this.id = nanoid(7);
		this.options = options;
		this.name = options.name;
		this.players = {};
		this.playerIds = [];
		this.state = {};

		log(`[room - ${this.name}] Create`);
		log(1)(options);
	}

	addPlayer(player){
		log(`[room - ${this.name}] User "${player.name}" join`);

		player.state = 'joining';

		const existingPlayer = this.getPlayerByName(player.name);

		if (existingPlayer) {
			this.players[existingPlayer.id] = { ...existingPlayer, ...player };
		} else {
			player.id = nanoid(7);

			this.players[player.id] = player;
		}

		this.playerIds = Object.keys(this.players);
		this.playerCount = this.playerIds.length;

		return player;
	}

	getPlayerByName(name) {
		const playerId = this.playerIds.find(id => this.players[id].name === name);

		return playerId && this.players[playerId];
	}

	removePlayer(player){
		if(!player || !player.name || !this.players[player.name]) return;

		log(`[room - ${this.name}] Player "${player.name}" leave`);

		this.players[player.name].state = 'inactive';
	}

	broadcast(type, payload){
		log(1)('broadcast', type, payload, this.playerIds);

		var message = JSON.stringify({ type, payload });

		this.playerIds.forEach((id) => {
			const socket = this.players[id].socket;

			if(socket && socket.readyState === 1) socket.send(message);
		});
	}
}

module.exports = Room;
const { nanoid } = require('nanoid');
const log = new (require('log'))({ tag: 'byod-game-engine' });

class Room {
	constructor({ ...options, name }) {
		this.id = nanoid(7);
		this.options = options;
		this.name = name;
		this.players = {};
		this.playerIds = [];
		this.state = {};

		log(`Created Game Room "${this.name}"`);
		log(1)(options);
	}

	addPlayer(player){
		log(`[room - ${this.name}] Player "${player.name || player.id || 'anonymous'}" joining`);

		player.state = 'joining';

		const existingPlayer = (player.id && this.players[player.id]) || (player.name && this.getPlayerByName(player.name));

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
		if(!player || !player.id || !this.players[player.id]) return;

		log(`[room - ${this.name}] Player "${player.name || player.id || 'anonymous'}" leaving`);

		this.players[player.name].state = 'inactive';
	}

	broadcast(type, payload){
		log(1)(`[room - ${this.name}] broadcast`, type, payload, this.playerIds);

		const message = JSON.stringify({ type, payload });

		this.playerIds.forEach((id) => {
			const socket = this.players[id].socket;

			if(socket && socket.readyState === 1) socket.send(message);
		});
	}
}

module.exports = Room;